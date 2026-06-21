"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from "react";
import { CheckCircle2, XCircle, Info, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-9999 flex flex-col items-center gap-3 pointer-events-none w-full max-w-sm px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto
              flex items-center gap-4 px-5 py-4 rounded-2xl border w-full
              animate-in slide-in-from-top-10 fade-in duration-300
              ${toast.type === "success" ? "bg-[#022c22]/95 border-t-2 border-t-emerald-400 border-b-4 border-b-emerald-950 border-x border-x-emerald-400/20 text-white shadow-[0_15px_30px_-5px_rgba(16,185,129,0.35)]" : ""}
              ${toast.type === "error" ? "bg-[#270c15]/95 border-t-2 border-t-rose-400 border-b-4 border-b-rose-950 border-x border-x-rose-400/20 text-white shadow-[0_15px_30px_-5px_rgba(244,63,94,0.35)]" : ""}
              ${toast.type === "warning" ? "bg-[#2d1a0c]/95 border-t-2 border-t-amber-400 border-b-4 border-b-amber-950 border-x border-x-amber-400/20 text-white shadow-[0_15px_30px_-5px_rgba(245,158,11,0.35)]" : ""}
              ${toast.type === "info" ? "bg-[#0c1020]/95 border-t-2 border-t-indigo-400 border-b-4 border-b-indigo-950 border-x border-x-indigo-400/20 text-white shadow-[0_15px_30px_-5px_rgba(99,102,241,0.35)]" : ""}
            `}
          >
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner border
              ${toast.type === "success" ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300" : ""}
              ${toast.type === "error" ? "bg-rose-500/20 border-rose-400/30 text-rose-300" : ""}
              ${toast.type === "warning" ? "bg-amber-500/20 border-amber-400/30 text-amber-300" : ""}
              ${toast.type === "info" ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300" : ""}
            `}>
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === "error" && <XCircle className="w-5 h-5" />}
              {toast.type === "warning" && <AlertCircle className="w-5 h-5" />}
              {toast.type === "info" && <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black tracking-wide leading-snug">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1.5 hover:bg-white/10 active:scale-90 rounded-lg text-white/40 hover:text-white transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
