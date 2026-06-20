"use client";

import { useEffect, useState } from "react";
import { WifiOff, Loader2, CheckCircle2 } from "lucide-react";
import { getMutationQueue } from "@/lib/offline-db";
import { useToast } from "./Toast";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<{
    syncing: boolean;
    total: number;
    current: number;
  }>({ syncing: false, total: 0, current: 0 });
  const [showSyncedSuccess, setShowSyncedSuccess] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    // Fetch initial queue count
    getMutationQueue().then(queue => setPendingCount(queue.length));

    const handleStatusChange = (e: any) => {
      const online = e.detail.online;
      setIsOnline(online);
      if (!online) {
        showToast("Koneksi terputus. Anda beralih ke mode offline.", "warning");
      }
    };

    const handleQueueChange = () => {
      getMutationQueue().then(queue => setPendingCount(queue.length));
    };

    const handleSyncStatus = (e: any) => {
      setSyncStatus(e.detail);
      if (!e.detail.syncing && e.detail.total > 0 && e.detail.current === e.detail.total) {
        // Just finished syncing
        setPendingCount(0);
        setShowSyncedSuccess(true);
        setTimeout(() => setShowSyncedSuccess(false), 5000);
      }
    };

    window.addEventListener("offline-status-changed", handleStatusChange);
    window.addEventListener("offline-sync-queue-changed", handleQueueChange);
    window.addEventListener("offline-sync-status", handleSyncStatus);

    return () => {
      window.removeEventListener("offline-status-changed", handleStatusChange);
      window.removeEventListener("offline-sync-queue-changed", handleQueueChange);
      window.removeEventListener("offline-sync-status", handleSyncStatus);
    };
  }, [showToast]);

  if (isOnline && pendingCount === 0 && !syncStatus.syncing && !showSyncedSuccess) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-auto">
      {/* Offline Status Panel */}
      {!isOnline && (
        <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border bg-[#2d1a0c]/95 backdrop-blur-md border-t-2 border-t-amber-400 border-b-4 border-b-amber-950 border-x border-x-amber-400/20 text-white shadow-lg animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner border bg-amber-500/20 border-amber-400/30 text-amber-300">
            <WifiOff className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black tracking-wide leading-snug">Mode Offline Aktif</p>
            <p className="text-xs text-amber-200/70 font-semibold leading-normal mt-0.5">
              {pendingCount > 0 
                ? `${pendingCount} perubahan disimpan lokal.` 
                : "Menggunakan data cache browser."}
            </p>
          </div>
        </div>
      )}

      {/* Syncing Panel */}
      {syncStatus.syncing && (
        <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border bg-[#0c1020]/95 backdrop-blur-md border-t-2 border-t-indigo-400 border-b-4 border-b-indigo-950 border-x border-x-indigo-400/20 text-white shadow-lg animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner border bg-indigo-500/20 border-indigo-400/30 text-indigo-300">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black tracking-wide leading-snug">Sinkronisasi Data...</p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-indigo-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(syncStatus.current / syncStatus.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-indigo-200/70 font-semibold mt-1">
              Memproses {syncStatus.current + 1} dari {syncStatus.total} item
            </p>
          </div>
        </div>
      )}

      {/* Synced Success Panel */}
      {showSyncedSuccess && isOnline && (
        <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border bg-[#022c22]/95 backdrop-blur-md border-t-2 border-t-emerald-400 border-b-4 border-b-emerald-950 border-x border-x-emerald-400/20 text-white shadow-lg animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner border bg-emerald-500/20 border-emerald-400/30 text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black tracking-wide leading-snug">Sinkronisasi Selesai</p>
            <p className="text-xs text-emerald-200/70 font-semibold leading-normal mt-0.5">
              Semua perubahan telah terunggah ke server.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
