"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, User, Phone, Briefcase, Camera, Loader2, Home } from "lucide-react";
import { useToast } from "./Toast";
import { API_BASE_URL } from "@/lib/config";

interface Pengurus {
  id: number;
  nik: string;
  name: string;
  jabatan: string;
  jabatan_tambahan?: string;
  kamar?: string;
  phone: string;
  status: string;
  photo_url?: string;
  gender: string;
}

interface EditPengurusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pengurus: Pengurus;
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

export default function EditPengurusModal({ isOpen, onClose, onSuccess, pengurus }: EditPengurusModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Pengurus>>({});
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pengurus) {
      const isPenasehat = pengurus.jabatan_tambahan?.startsWith("Penasehat Kamar");
      setFormData({
        name: pengurus.name,
        nik: pengurus.nik,
        jabatan: pengurus.jabatan,
        jabatan_tambahan: isPenasehat ? "Penasehat Kamar" : "",
        kamar: pengurus.kamar || ROOMS[0],
        phone: pengurus.phone,
        photo_url: pengurus.photo_url,
        gender: pengurus.gender || "L",
        status: pengurus.status
      });
    }
  }, [pengurus, isOpen]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("folder", "pengurus_photos");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json() as any;
      if (json.success) {
        setFormData(prev => ({ ...prev, photo_url: json.url }));
        showToast("Foto berhasil diunggah", "success");
      } else {
        showToast(json.error || "Gagal upload foto", "error");
      }
    } catch (err) {
      showToast("Gagal upload foto", "error");
    } finally {
      setUploading(false);
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      kamar: formData.jabatan_tambahan === "Penasehat Kamar" ? formData.kamar : ""
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/pengurus/${pengurus.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json() as any;
      if (json.success) {
        showToast("Data pengurus berhasil diperbarui", "success");
        onSuccess();
        window.dispatchEvent(new CustomEvent('pengurus-updated'));
        onClose();
      } else {
        showToast(json.error || "Gagal memperbarui data", "error");
      }
    } catch (err) {
      showToast("Kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 text-[#1e293b]">
      <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden scale-in-center max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Edit Profil Pengurus</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pembaruan Data Ustadz/Staf</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div 
              className="relative w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.photo_url ? (
                <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-300 group-hover:text-indigo-500">
                  <Camera className="w-8 h-8" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Ganti Foto</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nama Lengkap</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  required
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                  placeholder="Nama Lengkap"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">NIK (Nomor Induk)</label>
              <input
                required
                type="text"
                value={formData.nik || ""}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                placeholder="NIK"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">No. WhatsApp</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  required
                  type="text"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all"
                  placeholder="08xx..."
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Jabatan Utama</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <select
                  value={formData.jabatan || ""}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold appearance-none focus:bg-white focus:border-indigo-500 outline-none transition-all"
                >
                  {JABATAN_LIST.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Jabatan Tambahan</label>
              <select
                value={formData.jabatan_tambahan === "Penasehat Kamar" ? "Penasehat Kamar" : "Tidak ada"}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    jabatan_tambahan: val === "Penasehat Kamar" ? "Penasehat Kamar" : "",
                    kamar: val === "Penasehat Kamar" ? prev.kamar || ROOMS[0] : ""
                  }));
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
              >
                <option value="Tidak ada">Tidak ada</option>
                <option value="Penasehat Kamar">Penasehat Kamar</option>
              </select>
            </div>

            {formData.jabatan_tambahan === "Penasehat Kamar" && (
              <div className="col-span-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Kamar yang Dinaungi</label>
                <div className="relative group">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <select
                    value={formData.kamar || ROOMS[0]}
                    onChange={(e) => setFormData({ ...formData, kamar: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold appearance-none focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  >
                    {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}
