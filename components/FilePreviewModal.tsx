"use client";

import { X, Download, Printer, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    name: string;
    url: string;
    type: string;
  } | null;
}

export default function FilePreviewModal({ isOpen, onClose, file }: FilePreviewModalProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) setLoading(true);
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(file.type.toLowerCase());
  const isPDF = file.type.toLowerCase() === "pdf";
  const isOffice = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(file.type.toLowerCase());

  // Use Google Docs Viewer for Office files to avoid download
  const previewUrl = isOffice 
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`
    : file.url;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative scale-in-center">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <X className="w-5 h-5 rotate-45" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 tracking-tight line-clamp-1">{file.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pratinjau Dokumen • {file.type}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href={file.url} 
              download
              className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            <button 
              onClick={() => window.open(file.url, '_blank')}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95"
              title="Cetak"
            >
              <Printer className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <button 
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-100/50 relative overflow-hidden flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Membuka Dokumen...</p>
            </div>
          )}

          {isImage ? (
            <img 
              src={file.url} 
              alt={file.name} 
              className="max-w-full max-h-full object-contain p-8 drop-shadow-2xl"
              onLoad={() => setLoading(false)}
            />
          ) : (
            <iframe
              src={previewUrl}
              className="w-full h-full border-none"
              onLoad={() => setLoading(false)}
              title="File Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}
