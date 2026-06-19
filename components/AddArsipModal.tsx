"use client";

import { useState, useRef } from "react";
import { X, Plus, FileText, Calendar, Hash, ArrowUpRight, ArrowDownLeft, Upload, Loader2 } from "lucide-react";
import { useToast } from "./Toast";
import { API_BASE_URL } from "@/lib/config";

interface AddArsipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = ["Surat", "Proposal", "Dokumen"];

export default function AddArsipModal({ isOpen, onClose, onSuccess }: AddArsipModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: CATEGORIES[0],
    doc_date: new Date().toISOString().split('T')[0],
    doc_number: "",
    flow_type: "Masuk" as "Masuk" | "Keluar",
    sender_receiver: "",
    url: "",
    type: "",
    size: ""
  });

  if (!isOpen) return null;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("folder", "sim-ppds/arsip");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json() as any;
      if (json.success) {
        setFormData({ 
          ...formData, 
          url: json.url, 
          type: json.format || file.name.split('.').pop() || "",
          size: (file.size / 1024).toFixed(2) + " KB",
          name: formData.name || file.name.split('.')[0]
        });
        showToast("Dokumen berhasil diunggah", "success");
      } else {
        showToast(json.error || "Gagal upload document", "error");
      }
    } catch (err) {
      showToast("Gagal upload document", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.url) {
      showToast("Silakan upload dokumen terlebih dahulu", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/arsip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json() as any;
      if (json.success) {
        showToast("Arsip berhasil disimpan", "success");
        onSuccess();
        onClose();
        setFormData({
          name: "",
          category: CATEGORIES[0],
          doc_date: new Date().toISOString().split('T')[0],
          doc_number: "",
          flow_type: "Masuk",
          sender_receiver: "",
          url: "",
          type: "",
          size: ""
        });
      } else {
        showToast(json.error || "Gagal menyimpan arsip", "error");
      }
    } catch (err) {
      showToast("Kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden scale-in-center max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Tambah Arsip Baru</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Input Detail Dokumentasi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-5">
            {/* Kategori */}
            <div className="col-span-2 space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kategori Arsip</label>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`py-3 rounded-2xl border-2 font-black text-xs transition-all ${
                      formData.category === cat 
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]" 
                        : "bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Nama File */}
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nama / Judul Arsip</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                  placeholder="Misal: Surat Undangan Rapat..."
                />
              </div>
            </div>

            {/* Tanggal & Nomor */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Tanggal Dokumen</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  required
                  type="date"
                  value={formData.doc_date}
                  onChange={(e) => setFormData({ ...formData, doc_date: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nomor Dokumen</label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  value={formData.doc_number}
                  onChange={(e) => setFormData({ ...formData, doc_number: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                  placeholder="No/PPDS/..."
                />
              </div>
            </div>

            {/* Keluar / Masuk */}
            <div className="col-span-2 space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tipe Aliran</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "Masuk", icon: ArrowDownLeft, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { id: "Keluar", icon: ArrowUpRight, color: "text-rose-500", bg: "bg-rose-50" }
                ].map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, flow_type: type.id as any })}
                      className={`flex items-center justify-center gap-3 py-3 rounded-2xl border-2 font-black text-xs transition-all ${
                        formData.flow_type === type.id 
                          ? `border-${type.id === 'Masuk' ? 'emerald' : 'rose'}-500 ${type.bg} ${type.color} shadow-lg scale-[1.02]` 
                          : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {type.id === 'Masuk' ? 'Surat Masuk' : 'Surat Keluar'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                {formData.flow_type === "Masuk" ? "Diterima Dari (Asal)" : "Ditujukan Kepada (Tujuan)"}
              </label>
              <input
                required
                type="text"
                value={formData.sender_receiver}
                onChange={(e) => setFormData({ ...formData, sender_receiver: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                placeholder={formData.flow_type === "Masuk" ? "Instansi / Nama Pengirim" : "Instansi / Nama Penerima"}
              />
            </div>

            {/* File Upload */}
            <div className="col-span-2 space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Unggah Dokumen (PDF/Gambar/Doc)</label>
              <div 
                className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  formData.url 
                    ? "bg-emerald-50/50 border-emerald-200" 
                    : "bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-slate-100/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-sm font-bold text-slate-500">Mengunggah file...</p>
                  </div>
                ) : formData.url ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-emerald-700">File Terpilih: {formData.type.toUpperCase()}</p>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Klik untuk mengganti</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-1">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-600">Klik atau seret file ke sini</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Maksimal 10MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-4 h-4" />}
            Simpan Arsip
          </button>
        </form>
      </div>
    </div>
  );
}
