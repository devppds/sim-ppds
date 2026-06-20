"use client";

import { useEffect, useState } from 'react';
import { initOfflineSync } from '@/lib/sync-engine';
import { OfflineIndicator } from './OfflineIndicator';

export function PwaRegistry() {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize Offline Sync Engine
    initOfflineSync();

    // Register Service Worker and track updates
    if ('serviceWorker' in navigator) {
      const trackInstalling = (worker: ServiceWorker) => {
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(worker);
            setShowUpdateModal(true);
          }
        });
      };

      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('ServiceWorker registration successful with scope: ', reg.scope);

        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setShowUpdateModal(true);
          return;
        }

        if (reg.installing) {
          trackInstalling(reg.installing);
          return;
        }

        reg.addEventListener('updatefound', () => {
          if (reg.installing) {
            trackInstalling(reg.installing);
          }
        });
      }).catch((err) => {
        console.error('ServiceWorker registration failed: ', err);
      });

      // Reload page when new worker takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  return (
    <>
      <OfflineIndicator />
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#021c14]/75 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-linear-to-b from-[#064e3b] to-[#022c22] border-t-2 border-t-amber-400 border-x border-x-amber-400/20 border-b-8 border-b-amber-950 w-full max-w-sm rounded-[32px] p-6 text-center shadow-[0_30px_70px_-15px_rgba(245,158,11,0.3)] animate-in zoom-in-95 duration-300 relative overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Spin Icon */}
            <div className="w-16 h-16 mx-auto mb-5 bg-[#021c14] border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-lg text-amber-400">
              <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>

            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1">Pembaruan Sistem</h3>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Versi Baru Tersedia</p>
            
            <p className="text-sm text-emerald-100/70 leading-relaxed font-medium mb-6">
              SIM-PPDS versi terbaru telah siap dipasang. Perbarui sekarang untuk mengaktifkan fitur dan stabilitas terbaru secara realtime.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
                  setShowUpdateModal(false);
                }}
                className="w-full py-4 text-[#021c14] font-black text-sm rounded-2xl uppercase tracking-widest bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer shadow-md active:scale-95"
              >
                Perbarui Sekarang
              </button>
              <button 
                onClick={() => setShowUpdateModal(false)}
                className="w-full py-4 text-emerald-100/80 font-black text-sm rounded-2xl uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-[#10b981]/10 active:scale-95"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

