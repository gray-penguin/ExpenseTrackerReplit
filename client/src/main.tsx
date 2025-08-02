import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { queryClient } from './lib/queryClient';
import './index.css';

// PWA Installation Logic
let deferredPrompt: any;

// Debug logging for PWA
console.log('PWA: Script loaded');

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA: beforeinstallprompt event fired');
  e.preventDefault();
  deferredPrompt = e;
  
  // Show custom install button or banner
  showInstallPrompt();
});

// Also listen for appinstalled event
window.addEventListener('appinstalled', () => {
  console.log('PWA: App was installed');
  deferredPrompt = null;
});

function showInstallPrompt() {
  console.log('PWA: showInstallPrompt called');
  
  // Don't show install prompt if already dismissed this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    console.log('PWA: Install prompt dismissed this session');
    return;
  }
  
  console.log('PWA: Creating install banner');
  
  // Create install banner
  const installBanner = document.createElement('div');
  installBanner.id = 'pwa-install-banner';
  installBanner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 12px 16px;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        ">💰</div>
        <div>
          <div style="font-weight: 600; font-size: 14px;">Install Expense Tracker</div>
          <div style="font-size: 12px; opacity: 0.9;">Add to your home screen for quick access</div>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="pwa-install-btn" style="
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        ">Install</button>
        <button id="pwa-dismiss-btn" style="
          background: transparent;
          border: none;
          color: white;
          padding: 8px;
          border-radius: 6px;
          font-size: 18px;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
        ">×</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(installBanner);
  
  // Add event listeners
  document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      deferredPrompt = null;
      document.getElementById('pwa-install-banner')?.remove();
    }
  });
  
  document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
    document.getElementById('pwa-install-banner')?.remove();
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  });
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    document.getElementById('pwa-install-banner')?.remove();
  }, 10000);
}

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, prompt user to refresh
                if (confirm('New version available! Refresh to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);