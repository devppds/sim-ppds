"use client";

import { useEffect, useState } from "react";
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Clock, 
  CheckCheck,
  Loader2,
  Trash2
} from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  is_read: number;
  created_at: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRead?: () => void;
}

export default function NotificationModal({ isOpen, onClose, onRead }: NotificationModalProps) {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      const json = (await res.json()) as any;
      if (json.success) {
        setNotifs(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const markAsRead = async (id: number | 'all') => {
    try {
      const res = await fetch(`/api/notifications?id=${id}`, { method: "PUT" });
      const json = (await res.json()) as any;
      if (json.success) {
        if (id === 'all') {
          setNotifs(notifs.map(n => ({ ...n, is_read: 1 })));
        } else {
          setNotifs(notifs.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        }
        if (onRead) onRead();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'danger': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      default: return <Info className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getTimeAgo = (dateStr: string) => {
     const date = new Date(dateStr);
     const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
     if (seconds < 60) return 'Baru saja';
     const minutes = Math.floor(seconds / 60);
     if (minutes < 60) return `${minutes} menit lalu`;
     const hours = Math.floor(minutes / 60);
     if (hours < 24) return `${hours} jam lalu`;
     return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden scale-in-center border border-slate-100 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/30">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/20">
                 <Bell className="w-7 h-7" />
              </div>
              <div>
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Notifikasi Sistem</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Informasi Aktivitas Terbaru</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white text-slate-400 transition-all border border-transparent hover:border-slate-100 hover:shadow-sm">
             <X className="w-6 h-6" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
           {!loading && notifs.length > 0 && (
              <div className="flex justify-between items-center mb-4 px-2">
                 <button 
                   onClick={() => markAsRead('all')}
                   className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
                 >
                    <CheckCheck className="w-3 h-3" /> Tandai Semua Dibaca
                 </button>
              </div>
           )}

           {loading ? (
             <div className="flex flex-col items-center justify-center py-20 opacity-30">
               <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest">Sinkronisasi Notifikasi...</p>
             </div>
           ) : notifs.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20">
               <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                  <Bell className="w-10 h-10 text-slate-200" />
               </div>
               <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Belum Ada Notifikasi</p>
               <p className="text-[10px] font-bold text-slate-300 mt-2">Semua aktivitas sistem akan muncul di sini</p>
             </div>
           ) : (
             <div className="space-y-3">
                {notifs.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={`group relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex gap-4 ${
                      n.is_read ? 'bg-white border-slate-50 opacity-60' : 'bg-white border-indigo-100 shadow-lg shadow-indigo-600/5 hover:border-indigo-300'
                    }`}
                  >
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 transition-all ${
                       n.is_read ? 'bg-slate-50' : 'bg-indigo-50 group-hover:scale-110'
                     }`}>
                        {getIcon(n.type)}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                           <h4 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                              {n.title}
                              {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                           </h4>
                           <span className="text-[9px] font-black text-slate-300 uppercase flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> {getTimeAgo(n.created_at)}
                           </span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed truncate group-hover:text-slate-700 transition-colors">
                           {n.message}
                        </p>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-50 bg-slate-50/50 shrink-0">
           <button 
             onClick={onClose}
             className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-black shadow-sm transition-all hover:bg-slate-50 active:scale-95 uppercase tracking-widest"
           >
             Tutup Notifikasi
           </button>
        </div>
      </div>
    </div>
  );
}
