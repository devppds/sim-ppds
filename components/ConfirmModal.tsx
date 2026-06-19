"use client";

import { X, AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "warning" | "info";
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  type = "warning",
  loading = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 p-8 flex flex-col items-center text-center">
        <div className={`
          w-20 h-20 rounded-[28px] flex items-center justify-center mb-6
          ${type === "warning" ? "bg-amber-50 text-amber-500" : ""}
          ${type === "danger" ? "bg-rose-50 text-rose-500" : ""}
          ${type === "info" ? "bg-indigo-50 text-indigo-500" : ""}
        `}>
          <AlertTriangle className="w-10 h-10" />
        </div>
        
        <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">{title}</h3>
        <p className="text-sm font-bold text-slate-500 leading-relaxed mb-8">
          {message}
        </p>
        
        <div className="flex flex-col w-full gap-3">
          <button
            disabled={loading}
            onClick={onConfirm}
            className={`
              w-full py-4 rounded-2xl text-sm font-black transition-all active:scale-95 flex items-center justify-center gap-2
              ${type === "danger" ? "bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20" : ""}
              ${type === "warning" ? "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20" : ""}
              ${type === "info" ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20" : ""}
            `}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
