"use client";

import { useEffect } from 'react';
import { initOfflineSync } from '@/lib/sync-engine';
import { OfflineIndicator } from './OfflineIndicator';

export function PwaRegistry() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Register Service Worker
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js').then(
            function(registration) {
              console.log('ServiceWorker registration successful with scope: ', registration.scope);
            },
            function(err) {
              console.log('ServiceWorker registration failed: ', err);
            }
          );
        });
      }

      // Initialize Offline Sync Engine
      initOfflineSync();
    }
  }, []);

  return <OfflineIndicator />;
}

