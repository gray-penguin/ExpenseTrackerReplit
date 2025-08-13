export class InstallationCodeManager {
  private static readonly STORAGE_KEY = 'expense-tracker-installation-code';
  private static readonly APP_PREFIX = 'ET';

  /**
   * Generate a unique installation code for the PWA
   * Format: ET-YYYY-DEVICE-RANDOM
   */
  static async generateInstallationCode(): Promise<string> {
    try {
      // Get current year
      const year = new Date().getFullYear();
      
      // Generate device fingerprint
      const deviceHash = await this.generateDeviceFingerprint();
      
      // Generate cryptographically secure random string
      const randomPart = this.generateSecureRandom(6);
      
      // Combine into installation code
      const installationCode = `${this.APP_PREFIX}-${year}-${deviceHash}-${randomPart}`;
      
      return installationCode;
    } catch (error) {
      console.error('Error generating installation code:', error);
      // Fallback to timestamp-based code
      return this.generateFallbackCode();
    }
  }

  /**
   * Get or create installation code
   */
  static async getInstallationCode(): Promise<string> {
    try {
      // Check if code already exists in IndexedDB
      const existingCode = await this.getStoredCode();
      if (existingCode) {
        return existingCode;
      }

      // Generate new code
      const newCode = await this.generateInstallationCode();
      
      // Store the code in IndexedDB
      await this.storeCode(newCode);
      
      return newCode;
    } catch (error) {
      console.error('Error getting installation code:', error);
      return this.generateFallbackCode();
    }
  }

  /**
   * Get stored installation code from IndexedDB
   */
  private static async getStoredCode(): Promise<string | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('ExpenseTrackerDB', 4);
      
      request.onsuccess = () => {
        const db = request.result;
        try {
          const transaction = db.transaction(['keyValue'], 'readonly');
          const store = transaction.objectStore('keyValue');
          const getRequest = store.get(this.STORAGE_KEY);
          
          getRequest.onsuccess = () => {
            resolve(getRequest.result || null);
          };
          
          getRequest.onerror = () => {
            console.warn('Error reading installation code from IndexedDB');
            resolve(null);
          };
        } catch (error) {
          console.warn('Error accessing IndexedDB for installation code');
          resolve(null);
        }
      };
      
      request.onerror = () => {
        console.warn('Error opening IndexedDB for installation code');
        resolve(null);
      };
    });
  }

  /**
   * Store installation code in IndexedDB
   */
  private static async storeCode(code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ExpenseTrackerDB', 4);
      
      request.onsuccess = () => {
        const db = request.result;
        try {
          const transaction = db.transaction(['keyValue'], 'readwrite');
          const store = transaction.objectStore('keyValue');
          const putRequest = store.put(code, this.STORAGE_KEY);
          
          putRequest.onsuccess = () => {
            // Also store timestamp
            const timestampRequest = store.put(new Date().toISOString(), `${this.STORAGE_KEY}-timestamp`);
            timestampRequest.onsuccess = () => resolve();
            timestampRequest.onerror = () => resolve(); // Don't fail if timestamp storage fails
          };
          
          putRequest.onerror = () => {
            console.warn('Error storing installation code in IndexedDB');
            reject(putRequest.error);
          };
        } catch (error) {
          console.warn('Error accessing IndexedDB for storing installation code');
          reject(error);
        }
      };
      
      request.onerror = () => {
        console.warn('Error opening IndexedDB for storing installation code');
        reject(request.error);
      };
    });
  }

  /**
   * Generate device fingerprint based on browser/device characteristics
   */
  private static async generateDeviceFingerprint(): Promise<string> {
    const characteristics = [
      screen.width.toString(),
      screen.height.toString(),
      navigator.language,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.platform || 'unknown',
      (navigator.hardwareConcurrency || 4).toString()
    ];

    // Create a simple hash from characteristics
    const combined = characteristics.join('|');
    const hash = await this.simpleHash(combined);
    
    // Return first 4 characters as device fingerprint
    return hash.substring(0, 4).toUpperCase();
  }

  /**
   * Generate cryptographically secure random string
   */
  private static generateSecureRandom(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
    } else {
      // Fallback for older browsers
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    
    return result;
  }

  /**
   * Simple hash function for device fingerprinting
   */
  private static async simpleHash(str: string): Promise<string> {
    if (window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        console.warn('Crypto.subtle not available, using fallback hash');
      }
    }
    
    // Fallback hash for older browsers
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Fallback code generation for error cases
   */
  private static generateFallbackCode(): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return `${this.APP_PREFIX}-${year}-${timestamp}-${random}`;
  }

  /**
   * Get installation info including code and metadata
   */
  static async getInstallationInfo(): Promise<{
    code: string;
    generatedAt: string;
    deviceInfo: {
      platform: string;
      language: string;
      timezone: string;
      screenResolution: string;
      userAgent: string;
    };
  }> {
    const code = await this.getInstallationCode();
    
    // Check if we have stored generation time
    let generatedAt = localStorage.getItem(`${this.STORAGE_KEY}-timestamp`);
    if (!generatedAt) {
      generatedAt = new Date().toISOString();
      localStorage.setItem(`${this.STORAGE_KEY}-timestamp`, generatedAt);
    }

    return {
      code,
      generatedAt,
      deviceInfo: {
        platform: navigator.platform || 'Unknown',
        language: navigator.language || 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
        screenResolution: `${screen.width}x${screen.height}`,
        userAgent: navigator.userAgent
      }
    };
  }

  /**
   * Copy installation code to clipboard
   */
  static async copyToClipboard(code: string): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        return result;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}