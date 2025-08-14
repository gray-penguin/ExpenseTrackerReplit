import { useState, useEffect } from 'react';

export interface PWAStatus {
  isInstalled: boolean;
  isInstallable: boolean;
  displayMode: 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen';
  installPrompt: any;
}

export function usePWADetection() {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstalled: false,
    isInstallable: false,
    displayMode: 'browser',
    installPrompt: null
  });

  useEffect(() => {
    // Check if app is running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true ||
                        document.referrer.includes('android-app://');

    // Get display mode
    const getDisplayMode = (): PWAStatus['displayMode'] => {
      if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
      if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
      if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
      return 'browser';
    };

    // Initial status
    setPwaStatus(prev => ({
      ...prev,
      isInstalled: isStandalone,
      displayMode: getDisplayMode()
    }));

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPwaStatus(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: e
      }));
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setPwaStatus(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null
      }));
    };

    // Listen for display mode changes
    const handleDisplayModeChange = () => {
      setPwaStatus(prev => ({
        ...prev,
        displayMode: getDisplayMode(),
        isInstalled: getDisplayMode() !== 'browser'
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Listen for display mode changes
    const mediaQueries = [
      window.matchMedia('(display-mode: standalone)'),
      window.matchMedia('(display-mode: minimal-ui)'),
      window.matchMedia('(display-mode: fullscreen)')
    ];

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', handleDisplayModeChange);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', handleDisplayModeChange);
      });
    };
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (!pwaStatus.installPrompt) return false;

    try {
      pwaStatus.installPrompt.prompt();
      const { outcome } = await pwaStatus.installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setPwaStatus(prev => ({
          ...prev,
          isInstallable: false,
          installPrompt: null
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error triggering PWA install:', error);
      return false;
    }
  };

  const getStatusText = (): string => {
    if (pwaStatus.isInstalled) {
      return 'Installed as PWA';
    } else if (pwaStatus.isInstallable) {
      return 'Available for Installation';
    } else {
      return 'Running in Browser';
    }
  };

  const getStatusColor = (): string => {
    if (pwaStatus.isInstalled) {
      return 'text-green-600';
    } else if (pwaStatus.isInstallable) {
      return 'text-blue-600';
    } else {
      return 'text-slate-600';
    }
  };

  const getDisplayModeText = (): string => {
    switch (pwaStatus.displayMode) {
      case 'standalone': return 'Standalone App';
      case 'minimal-ui': return 'Minimal UI';
      case 'fullscreen': return 'Fullscreen';
      default: return 'Browser Tab';
    }
  };

  return {
    ...pwaStatus,
    triggerInstall,
    getStatusText,
    getStatusColor,
    getDisplayModeText
  };
}