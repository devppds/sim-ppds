"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { X, Save, Edit3, Loader2, Camera, Search, Check, Plus, GraduationCap, MapPin } from "lucide-react";
import { useToast } from "./Toast";
import { API_BASE_URL } from "@/lib/config";

interface Santri {
  id: number;
  nisn: string;
  nik?: string;
  name: string;
  madrasah: string;
  kelas: string;
  asrama: string;
  asal: string;
  street?: string;
  rt_rw?: string;
  province?: string;
  city?: string;
  district?: string;
  village?: string;
  postal_code?: string;
  wali_name?: string;
  wali_wa?: string;
  photo_url?: string;
  status: string;
}

interface EditSantriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  santri: Santri | null;
}

const ROOMS = [
  ...Array.from({ length: 15 }, (_, i) => `DS A ${(i + 1).toString().padStart(2, "0")}`),
  ...Array.from({ length: 12 }, (_, i) => `DS B ${(i + 1).toString().padStart(2, "0")}`),
  ...Array.from({ length: 15 }, (_, i) => `DS C ${(i + 1).toString().padStart(2, "0")}`),
];

const CLASS_MAPPING: Record<string, string[]> = {
  MHM: [
    ...Array.from({ length: 6 }, (_, i) => `Ibtida' ${i + 1}`),
    ...Array.from({ length: 3 }, (_, i) => `Tsanawiyyah ${i + 1}`),
    ...Array.from({ length: 3 }, (_, i) => `Aliyyah ${i + 1}`),
    "Ma'had Aly 1", "Ma'had Aly 2",
    ...Array.from({ length: 3 }, (_, i) => `SP ${i + 1}`),
  ],
  MIU: [
    ...Array.from({ length: 3 }, (_, i) => `Ula ${i + 1}`),
    ...Array.from({ length: 3 }, (_, i) => `Wustho ${i + 1}`),
    ...Array.from({ length: 3 }, (_, i) => `Ulya ${i + 1}`),
    "SP",
  ]
};

export default function EditSantriModal({ isOpen, onClose, onSuccess, santri }: EditSantriModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nisn: "",
    nik: "",
    name: "",
    madrasah: "" as "MHM" | "MIU" | "",
    kelas: "",
    asrama: "",
    asal: "",
    street: "",
    rt_rw: "",
    province: "",
    city: "",
    district: "",
    village: "",
    postal_code: "",
    wali_name: "",
    wali_wa: "",
    photo_url: "",
    status: "",
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  const [roomQuery, setRoomQuery] = useState("");
  const [showRoomSuggestions, setShowRoomSuggestions] = useState(false);
  const [classQuery, setClassQuery] = useState("");
  const [showClassSuggestions, setShowClassSuggestions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
        .then(res => res.json())
        .then(data => setProvinces(data as any[]));
    }
  }, [isOpen]);

  useEffect(() => {
    if (santri) {
      setFormData({
        nisn: santri.nisn || "",
        nik: santri.nik || "",
        name: santri.name || "",
        madrasah: (santri.madrasah as any) || "",
        kelas: santri.kelas || "",
        asrama: santri.asrama || "",
        asal: santri.asal || "",
        street: santri.street || "",
        rt_rw: santri.rt_rw || "",
        province: santri.province || "",
        city: santri.city || "",
        district: santri.district || "",
        village: santri.village || "",
        postal_code: santri.postal_code || "",
        wali_name: santri.wali_name || "",
        wali_wa: santri.wali_wa || "",
        photo_url: santri.photo_url || "",
        status: santri.status || "Aktif",
      });
      setRoomQuery(santri.asrama || "");
      setClassQuery(santri.kelas || "");
    }
  }, [santri, isOpen]);

  // Fetch subordinate regions when province/city/district changes
  useEffect(() => {
    if (formData.province) {
      const p = provinces.find(prov => prov.name === formData.province);
      if (p) fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${p.id}.json`).then(r => r.json()).then(data => setCities(data as any[]));
    }
  }, [formData.province, provinces]);

  useEffect(() => {
    if (formData.city && cities.length > 0) {
      const c = cities.find(city => city.name === formData.city);
      if (c) fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${c.id}.json`).then(r => r.json()).then(data => setDistricts(data as any[]));
    }
  }, [formData.city, cities]);

  useEffect(() => {
    if (formData.district && districts.length > 0) {
      const d = districts.find(dist => dist.name === formData.district);
      if (d) fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${d.id}.json`).then(r => r.json()).then(data => setVillages(data as any[]));
    }
  }, [formData.district, districts]);

  const filteredRooms = useMemo(() => {
    const q = roomQuery.toLowerCase();
    if (!q) return [];
    return ROOMS.filter(r => r.toLowerCase().includes(q)).slice(0, 5);
  }, [roomQuery]);

  const filteredClasses = useMemo(() => {
    if (!formData.madrasah) return [];
    const classes = CLASS_MAPPING[formData.madrasah] || [];
    const q = classQuery.toLowerCase();
    return classes.filter(c => c.toLowerCase().includes(q)).slice(0, 6);
  }, [formData.madrasah, classQuery]);

  if (!isOpen || !santri) return null;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("folder", "sim-ppds/santri");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json() as any;
      if (json.success) {
        setFormData({ ...formData, photo_url: json.url });
        showToast("Foto diperbarui", "success");
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/santri/${santri?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Data santri diperbarui", "success");
        onSuccess();
        onClose();
      } else {
        showToast(json.error || "Gagal memperbarui", "error");
      }
    } catch (err) {
      showToast("Kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden scale-in-center overflow-y-auto max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-indigo-600" />
             </div>
             <div>
                <h3 className="font-black text-slate-800 tracking-tight">Edit Data Santri</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Biodata Lengkap</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4 flex flex-col items-center">
                 <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-4xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-400">
                       {formData.photo_url ? <img src={formData.photo_url} alt="Santri" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-slate-300" />}
                       {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>}
                    </div>
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                 
                 <div className="mt-6 w-full space-y-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">NISN</label>
                       <input readOnly value={formData.nisn} className="w-full px-4 py-2.5 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 text-xs font-bold outline-none cursor-not-allowed" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">NIK (KTP/KK)</label>
                       <input value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold outline-none focus:border-indigo-500 transition-all" />
                    </div>
                 </div>
              </div>

              <div className="md:col-span-8 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                       <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none focus:border-indigo-500 transition-all" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Madrasah</label>
                       <select value={formData.madrasah} onChange={e => setFormData({...formData, madrasah: e.target.value as any, kelas: ""})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none appearance-none cursor-pointer">
                          <option value="">Pilih</option>
                          <option value="MHM">MHM</option>
                          <option value="MIU">MIU</option>
                       </select>
                    </div>
                    <div className="space-y-1 relative">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Kelas</label>
                       <input value={classQuery} onChange={e => {setClassQuery(e.target.value); setFormData({...formData, kelas: ""}); setShowClassSuggestions(true)}} onFocus={() => setShowClassSuggestions(true)} onBlur={() => setTimeout(() => setShowClassSuggestions(false), 200)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none" placeholder="Cari..." />
                       {showClassSuggestions && filteredClasses.length > 0 && (
                          <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                             {filteredClasses.map(c => <button key={c} type="button" onClick={() => {setFormData({...formData, kelas: c}); setClassQuery(c); setShowClassSuggestions(false)}} className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50">{c}</button>)}
                          </div>
                       )}
                    </div>
                 </div>

                 <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                       <MapPin className="w-4 h-4" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Alamat Lengkap</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Jalan / Dusun</label>
                          <input value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Provinsi</label>
                          <select value={formData.province} onChange={e => setFormData({...formData, province: e.target.value, city: "", district: "", village: ""})} className="w-full px-2 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-bold">
                             <option value="">Pilih</option>
                             {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Kota/Kab</label>
                          <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value, district: "", village: ""})} className="w-full px-2 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-bold">
                             <option value="">Pilih</option>
                             {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Wali</label>
                       <input value={formData.wali_name} onChange={e => setFormData({...formData, wali_name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">WA Wali</label>
                       <input value={formData.wali_wa} onChange={e => setFormData({...formData, wali_wa: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold" />
                    </div>
                    <div className="col-span-2 space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Status / Kategori SPP</label>
                       <select 
                          value={formData.status} 
                          onChange={e => setFormData({...formData, status: e.target.value})} 
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none appearance-none cursor-pointer focus:border-indigo-500 transition-all shadow-sm"
                       >
                          {["Biasa", "Ndalem 50%", "Ndalem 100%", "PKJ 50%", "PKJ 100%", "Nduduk", "Dzuriyyah", "Alumni", "Keluar"].map(s => (
                             <option key={s} value={s}>{s}</option>
                          ))}
                       </select>
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-6 flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-4 rounded-3xl border border-slate-200 text-sm font-black text-slate-400 transition-all">Batal</button>
              <button type="submit" disabled={loading || uploading} className="flex-2 py-4 rounded-3xl bg-indigo-600 text-white text-sm font-black shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2">
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                 Simpan Perubahan
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
