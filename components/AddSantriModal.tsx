"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { X, Save, UserPlus, Loader2, Camera, Search, Check, Plus, GraduationCap, MapPin } from "lucide-react";
import { useToast } from "./Toast";

interface AddSantriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialStatus?: "Aktif" | "Baru";
}

// Data Mapping for Rooms & Classes
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
    ...Array.from({ length: 6 }, (_, i) => `Ma'had Aly I Sem ${i + 1}`),
    "Ma'had Aly I Sem 7 (Khidmah)",
    "Ma'had Aly I Sem 8 (Khidmah)",
    ...Array.from({ length: 3 }, (_, i) => `SP ${i + 1}`),
  ],
  MIU: [
    ...Array.from({ length: 3 }, (_, i) => `Ula ${i + 1}`),
    ...Array.from({ length: 3 }, (_, i) => `Wustho ${i + 1}`),
    ...Array.from({ length: 3 }, (_, i) => `Ulya ${i + 1}`),
    "SP",
  ]
};

export default function AddSantriModal({ isOpen, onClose, onSuccess, initialStatus = "Aktif" }: AddSantriModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    nisn: "",
    nik: "",
    name: "",
    madrasah: "" as "MHM" | "MIU" | "",
    kelas: "",
    asrama: "",
    asal: "", // Combined display name
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
    status: "Biasa",
  });

  // Region Data States
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  // Autocomplete States
  const [roomQuery, setRoomQuery] = useState("");
  const [showRoomSuggestions, setShowRoomSuggestions] = useState(false);
  
  const [classQuery, setClassQuery] = useState("");
  const [showClassSuggestions, setShowClassSuggestions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Fetch Provinces on Load
  useEffect(() => {
    if (isOpen) {
      fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
        .then(res => res.json())
        .then(data => setProvinces(data as any[]))
        .catch(err => console.error("Gagal load provinsi:", err));
    }
  }, [isOpen]);

  // Dependent Fetches
  useEffect(() => {
    if (formData.province) {
      const provId = provinces.find(p => p.name === formData.province)?.id;
      if (provId) {
        fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provId}.json`)
          .then(res => res.json())
          .then(data => setCities(data as any[]));
      }
    } else {
      setCities([]);
    }
    setFormData(prev => ({ ...prev, city: "", district: "", village: "", postal_code: "" }));
  }, [formData.province, provinces]);

  useEffect(() => {
    if (formData.city) {
      const cityId = cities.find(c => c.name === formData.city)?.id;
      if (cityId) {
        fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${cityId}.json`)
          .then(res => res.json())
          .then(data => setDistricts(data as any[]));
      }
    } else {
      setDistricts([]);
    }
    setFormData(prev => ({ ...prev, district: "", village: "", postal_code: "" }));
  }, [formData.city, cities]);

  useEffect(() => {
    if (formData.district) {
      const distId = districts.find(d => d.name === formData.district)?.id;
      if (distId) {
        fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${distId}.json`)
          .then(res => res.json())
          .then(data => setVillages(data as any[]));
      }
    } else {
      setVillages([]);
    }
    setFormData(prev => ({ ...prev, village: "", postal_code: "" }));
  }, [formData.district, districts]);

  // Update Combined "Asal" field when regions change
  useEffect(() => {
    if (formData.city && formData.province) {
      setFormData(prev => ({ ...prev, asal: `${formData.city}, ${formData.province}` }));
    }
  }, [formData.city, formData.province]);

  // Memoized Filters
  const filteredRooms = useMemo(() => {
    const q = roomQuery.toLowerCase();
    if (!q) return [];
    return ROOMS.filter(r => r.toLowerCase().includes(q)).slice(0, 5);
  }, [roomQuery]);

  const filteredClasses = useMemo(() => {
    if (!formData.madrasah) return [];
    const classes = CLASS_MAPPING[formData.madrasah] || [];
    const q = classQuery.toLowerCase();
    if (!q) return classes.slice(0, 6);
    return classes.filter(c => c.toLowerCase().includes(q)).slice(0, 6);
  }, [formData.madrasah, classQuery]);

  useEffect(() => {
    if (formData.asrama) setRoomQuery(formData.asrama);
    if (formData.kelas) setClassQuery(formData.kelas);
  }, [formData.asrama, formData.kelas]);

  if (!isOpen) return null;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("folder", "santri_photos");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json() as any;
      if (json.success) {
        setFormData({ ...formData, photo_url: json.url });
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.madrasah || !formData.kelas) {
      setError("Silakan pilih Madrasah dan Kelas");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/santri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: formData.status || "Biasa" }),
      });

      const json = await res.json() as any;
      if (json.success) {
        showToast("Data santri berhasil disimpan!", "success");
        onSuccess();
        window.dispatchEvent(new CustomEvent('santri-updated'));
        onClose();
        // Reset form
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden scale-in-center overflow-y-auto max-h-[95vh]">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 tracking-tight text-lg">Tambah Santri Baru</h3>
              <p className="text-[11px] text-slate-400 font-medium">Lengkapi biodata santri sesuai identitas resmi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Photo & Basic Info */}
            <div className="md:col-span-4 flex flex-col items-center space-y-6">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-40 h-40 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-400 group-hover:bg-emerald-50/30">
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-10 h-10 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center justify-center border-4 border-white">
                  <Plus className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Foto Santri</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              
              <div className="w-full space-y-4 pt-4 border-t border-slate-50">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">NISN</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700" value={formData.nisn} onChange={(e) => setFormData({ ...formData, nisn: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">NIK (KTP/KK)</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700" value={formData.nik} onChange={(e) => setFormData({ ...formData, nik: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Right Column: Educational & Address Info */}
            <div className="md:col-span-8 space-y-6">
              {/* Education Section */}
              <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-2 text-emerald-600">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Pendidikan & Asrama</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                    <input required type="text" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Madrasah</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["MHM", "MIU"].map((m) => (
                        <button key={m} type="button" onClick={() => setFormData({ ...formData, madrasah: m as any, kelas: "" })} className={`py-2.5 rounded-xl border-2 font-black text-xs transition-all ${formData.madrasah === m ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20" : "bg-white border-slate-200 text-slate-400"}`}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kelas</label>
                    <input type="text" disabled={!formData.madrasah} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700 disabled:opacity-50" value={classQuery} onChange={(e) => { setClassQuery(e.target.value); setFormData({ ...formData, kelas: "" }); setShowClassSuggestions(true); }} onFocus={() => setShowClassSuggestions(true)} onBlur={() => setTimeout(() => setShowClassSuggestions(false), 200)} />
                    {showClassSuggestions && formData.madrasah && filteredClasses.length > 0 && (
                      <div className="absolute z-30 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                        {filteredClasses.map(c => (
                          <button key={c} type="button" className="w-full px-4 py-2 text-left text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => { setFormData({ ...formData, kelas: c }); setClassQuery(c); setShowClassSuggestions(false); }}>{c}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kamar Asrama</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700" value={roomQuery} onChange={(e) => { setRoomQuery(e.target.value); setFormData({ ...formData, asrama: "" }); setShowRoomSuggestions(true); }} onFocus={() => setShowRoomSuggestions(true)} onBlur={() => setTimeout(() => setShowRoomSuggestions(false), 200)} />
                    {showRoomSuggestions && filteredRooms.length > 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl">
                        {filteredRooms.map(room => (
                          <button key={room} type="button" className="w-full px-4 py-2 text-left text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => { setFormData({ ...formData, asrama: room }); setRoomQuery(room); setShowRoomSuggestions(false); }}>{room}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Kategori SPP</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      {["Biasa", "Ndalem 50%", "Ndalem 100%", "PKJ 50%", "PKJ 100%", "Nduduk", "Dzuriyyah"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Enhanced Address Section */}
              <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Alamat Lengkap Sesuai KTP</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jalan / No. Rumah / Dusun</label>
                    <input type="text" placeholder="Jl. Raya No. 12 / Dusun Krajan" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RT / RW</label>
                    <input type="text" placeholder="02 / 05" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700" value={formData.rt_rw} onChange={(e) => setFormData({ ...formData, rt_rw: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provinsi</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none bg-no-repeat bg-[right_1rem_center] cursor-pointer" value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })}>
                      <option value="">Pilih Provinsi</option>
                      {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kota / Kabupaten</label>
                    <select disabled={!formData.province} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700 disabled:opacity-50 appearance-none cursor-pointer" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}>
                      <option value="">Pilih Kota/Kab</option>
                      {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kecamatan</label>
                    <select disabled={!formData.city} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700 disabled:opacity-50 appearance-none cursor-pointer" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })}>
                      <option value="">Pilih Kecamatan</option>
                      {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desa / Kelurahan</label>
                    <select disabled={!formData.district} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700 disabled:opacity-50 appearance-none cursor-pointer" value={formData.village} onChange={(e) => setFormData({ ...formData, village: e.target.value })}>
                      <option value="">Pilih Desa</option>
                      {villages.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kode Pos</label>
                    <input type="text" placeholder="64123" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700" value={formData.postal_code} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Wali Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Wali</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700" value={formData.wali_name} onChange={(e) => setFormData({ ...formData, wali_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor WA Wali</label>
                  <input type="text" placeholder="0812..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700" value={formData.wali_wa} onChange={(e) => setFormData({ ...formData, wali_wa: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all">Batal</button>
            <button type="submit" disabled={loading || uploading} className="flex-[2] py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:grayscale">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {loading ? "Menyimpan..." : "Simpan Santri"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
