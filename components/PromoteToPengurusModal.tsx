"use client";

import { useState, useEffect, useRef } from "react";
import { X, User, Phone, Briefcase, Camera, Loader2, Home, Sparkles } from "lucide-react";
import { useToast } from "./Toast";
import { API_BASE_URL } from "@/lib/config";

interface PromoteToPengurusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  santri: {
    id: number;
    name: string;
    nik?: string;
    photo_url?: string;
  } | null;
}

const JABATAN_LIST = [
  "Ketua Pondok", "Sekretaris Pondok", "Bendahara Pondok", "Pendidikan Pondok", 
  "Murottil Pondok", "Keamanan Pondok", "Kesehatan Pondok", "PLP Pondok", 
  "BUMP Pondok", "Ketua Blok Pondok", "Media & Laboratorium Pondok"
];

const ROOMS = [
  ...Array.from({ length: 15 }, (_, i) => `DS A ${(i + 1).toString().padStart(2, "0")}`),
  ...Array.from({ length: 12 }, (_, i) => `DS B ${(i + 1).toString().padStart(2, "0")}`),
  ...Array.from({ length: 15 }, (_, i) => `DS C ${(i + 1).toString().padStart(2, "0")}`),
];

export default function PromoteToPengurusModal({ isOpen, onClose, onSuccess, santri }: PromoteToPengurusModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nik: "",
    jabatan: JABATAN_LIST[0],
    jabatan_tambahan: "",
    phone: "",
    kamar: ROOMS[0],
    photo_url: "",
    gender: "L"
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (santri) {
      setFormData(prev => ({
        ...prev,
        name: santri.name,
        nik: santri.nik || "",
        photo_url: santri.photo_url || ""
      }));
    }
  }, [santri, isOpen]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("folder", "sim-ppds/pengurus");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json() as any;
      if (json.success) {
        setFormData({ ...formData, photo_url: json.url });
        showToast("Foto berhasil diperbarui", "success");
      }
    } catch (err) {
      showToast("Gagal upload foto", "error");
    } finally {
      setUploading(false);
    }
  }

  if (!isOpen || !santri) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Add as Pengurus
      const resPengurus = await fetch(`${API_BASE_URL}/api/pengurus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const jsonPengurus = await resPengurus.json() as any;
      
      if (jsonPengurus.success) {
        // Calculate academic year
        const now = new Date();
        const currentYear = now.getMonth() >= 6
          ? `${now.getFullYear()}/${now.getFullYear() + 1}`
          : `${now.getFullYear() - 1}/${now.getFullYear()}`;

        // Mark santri as alumni with current academic year
        await fetch(`${API_BASE_URL}/api/santri/${santri.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            status: "Alumni",
            tahun_lulus: currentYear
          }),
        });

        showToast(`${santri.name} berhasil diangkat menjadi Pengurus (Khidmah)`, "success");
        onSuccess();
        window.dispatchEvent(new CustomEvent('santri-updated'));
        window.dispatchEvent(new CustomEvent('pengurus-updated'));
        onClose();
      } else {
        showToast(jsonPengurus.error || "Gagal memproses data", "error");
      }
    } catch (err) {
      showToast("Kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden scale-in-center max-h-[90vh] overflow-y-auto relative">
        {/* Header Decor */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-br from-indigo-600 to-violet-700 z-0 opacity-5"></div>
        
        <div className="p-8 border-b border-slate-100 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 translate-y-[-2px]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Angkat Jadi Pengurus</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Transmisi Data Santri ke Khidmah</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-slate-100 text-slate-400 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 relative z-10">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center">
            <div 
              className="relative w-32 h-32 rounded-[40px] bg-slate-50 border-2 border-dashed border-slate-200 p-1.5 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group shadow-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-full h-full rounded-[32px] overflow-hidden bg-white">
                {formData.photo_url ? (
                  <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-[40px]">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-center">Nama Calon Pengurus</label>
              <p className="text-center text-lg font-black text-slate-800">{formData.name}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nomor WhatsApp Personal</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  required
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-sm"
                  placeholder="08xx..."
                />
              </div>
              <p className="text-[9px] text-slate-400 italic px-1">*HP milik santri sendiri, bukan wali</p>
            </div>

            <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">NIK (KTP/KK)</label>
                <input
                    required
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm"
                    placeholder="NIK"
                />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Jabatan Utama</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <select
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold appearance-none focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm"
                >
                  {JABATAN_LIST.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Jabatan Tambahan</label>
              <input
                type="text"
                value={formData.jabatan_tambahan}
                onChange={(e) => setFormData({ ...formData, jabatan_tambahan: e.target.value })}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm"
                placeholder="Misal: Wali Kamar..."
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kamar (Penempatan Pengurus)</label>
              <div className="relative group">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <select
                  value={formData.kamar}
                  onChange={(e) => setFormData({ ...formData, kamar: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold appearance-none focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm"
                >
                  {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4.5 rounded-[24px] border border-slate-200 text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
            >
                Batal
            </button>
            <button
                type="submit"
                disabled={loading || uploading}
                className="flex-2 py-4.5 bg-slate-900 text-white rounded-[24px] text-sm font-black shadow-2xl shadow-slate-900/20 hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-400" />}
                Konfirmasi & Aktifkan Pengurus
            </button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        </form>
      </div>
    </div>
  );
}
