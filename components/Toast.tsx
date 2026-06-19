"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
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

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto
              flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border
              animate-in slide-in-from-top-10 fade-in duration-300
              ${toast.type === "success" ? "bg-white border-emerald-100 text-emerald-800" : ""}
              ${toast.type === "error" ? "bg-white border-rose-100 text-rose-800" : ""}
              ${toast.type === "warning" ? "bg-white border-amber-100 text-amber-800" : ""}
              ${toast.type === "info" ? "bg-white border-indigo-100 text-indigo-800" : ""}
            `}
          >
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              ${toast.type === "success" ? "bg-emerald-50 text-emerald-500" : ""}
              ${toast.type === "error" ? "bg-rose-50 text-rose-500" : ""}
              ${toast.type === "warning" ? "bg-amber-50 text-amber-500" : ""}
              ${toast.type === "info" ? "bg-indigo-50 text-indigo-500" : ""}
            `}>
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === "error" && <XCircle className="w-5 h-5" />}
              {toast.type === "warning" && <AlertCircle className="w-5 h-5" />}
              {toast.type === "info" && <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-black tracking-tight">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"
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
