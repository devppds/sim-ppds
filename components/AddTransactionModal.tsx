"use client";

import { useState, useRef, useEffect } from "react";
import { X, Save, Plus, Camera, Loader2, ArrowUpCircle, ArrowDownCircle, Calendar, Wallet } from "lucide-react";
import { useToast } from "./Toast";
import { API_BASE_URL } from "@/lib/config";
import SearchableSantriSelect from "./SearchableSantriSelect";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = {
  Pemasukan: ["SPP", "Donasi", "Infaq", "Lain-lain"],
  Pengeluaran: ["Operasional", "Listrik", "Konsumsi", "Gaji Pengurus", "Pemeliharaan", "Atas Nama Pondok", "Lain-lain"]
};

export default function AddTransactionModal({ isOpen, onClose, onSuccess }: AddTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    type: "Pemasukan" as "Pemasukan" | "Pengeluaran",
    category: "SPP",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    proof_url: "",
    santri_id: ""
  });

  const [santriList, setSantriList] = useState<any[]>([]);
  const [showSantriSelect, setShowSantriSelect] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_BASE_URL}/api/santri`)
        .then(res => res.json())
        .then((json: any) => {
          if (json.success) {
            setSantriList(json.data);
          }
        })
        .catch(err => console.error("Error fetching santri in AddTransactionModal:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("folder", "sim-ppds/keuangan");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json() as any;
      if (json.success) {
        setFormData({ ...formData, proof_url: json.url });
        showToast("Bukti transaksi berhasil diunggah", "success");
      } else {
        showToast(json.error || "Gagal upload bukti", "error");
      }
    } catch (err) {
      showToast("Gagal upload bukti", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.amount || parseInt(formData.amount) <= 0) {
      showToast("Jumlah harus valid", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/keuangan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          amount: parseInt(formData.amount),
          santri_id: formData.santri_id ? parseInt(formData.santri_id) : null
        }),
      });

      const json = await res.json() as any;
      if (json.success) {
        showToast("Transaksi berhasil disimpan!", "success");
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          type: "Pemasukan",
          category: "SPP",
          amount: "",
          description: "",
          date: new Date().toISOString().split('T')[0],
          proof_url: "",
          santri_id: ""
        });
        setShowSantriSelect(false);
      } else {
        showToast(json.error || "Gagal menyimpan data", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden scale-in-center">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              formData.type === 'Pemasukan' ? 'bg-emerald-100' : 'bg-rose-100'
            }`}>
              {formData.type === 'Pemasukan' ? (
                <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <ArrowDownCircle className="w-5 h-5 text-rose-600" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 tracking-tight text-lg">Catat Transaksi Baru</h3>
              <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Input data pemasukan atau pengeluaran kas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Transaction Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            {(["Pemasukan", "Pengeluaran"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, type, category: CATEGORIES[type][0] })}
                className={`py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  formData.type === type 
                  ? (type === 'Pemasukan' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-rose-600 text-white shadow-lg')
                  : 'text-slate-500 hover:bg-white/50'
                }`}
              >
                {type === 'Pemasukan' ? <Plus className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 rotate-45" />}
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tanggal</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required 
                  type="date" 
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700" 
                  value={formData.date} 
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kategori</label>
              <select 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES[formData.type].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Jumlah (Rp)</label>
            <div className="relative">
              <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required 
                type="number" 
                placeholder="0"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700" 
                value={formData.amount} 
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Keterangan / Deskripsi</label>
            <textarea 
              rows={2}
              placeholder="Contoh: Belanja dapur pondok seminggu"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700 resize-none" 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            />
          </div>

          <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hubungkan ke Santri</label>
              <input 
                type="checkbox" 
                checked={showSantriSelect}
                onChange={(e) => {
                  setShowSantriSelect(e.target.checked);
                  if (!e.target.checked) {
                    setFormData(prev => ({ ...prev, santri_id: "" }));
                  }
                }}
                className="w-4 h-4 text-indigo-650 focus:ring-indigo-500 rounded border-slate-300 cursor-pointer"
              />
            </div>
            {showSantriSelect && (
              <div className="mt-2.5">
                <SearchableSantriSelect
                  santriList={santriList}
                  selectedId={formData.santri_id}
                  onChange={(id) => setFormData(prev => ({ ...prev, santri_id: id }))}
                  placeholder="Cari nama atau NISN santri..."
                  accentColor={formData.type === 'Pemasukan' ? 'emerald' : 'rose'}
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bukti Transaksi (Opsional)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex flex-col items-center gap-2 relative"
            >
              {formData.proof_url ? (
                <div className="w-full aspect-video rounded-xl overflow-hidden">
                  <img src={formData.proof_url} alt="Proof" className="w-full h-full object-cover" />
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Camera className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-bold text-slate-600">Klik untuk upload bukti</p>
                    <p className="text-[10px] text-slate-400">JPG, PNG, atau PDF</p>
                  </div>
                </>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all">Batal</button>
            <button 
              type="submit" 
              disabled={loading || uploading} 
              className={`flex-2 py-4 rounded-2xl text-white text-sm font-black shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:grayscale ${
                formData.type === 'Pemasukan' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-600 shadow-rose-500/20'
              }`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {loading ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
