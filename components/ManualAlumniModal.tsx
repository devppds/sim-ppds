"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, User, Phone, Camera, Loader2, MapPin, Calendar, Save } from "lucide-react";
import { useToast } from "./Toast";
import { API_BASE_URL } from "@/lib/config";

interface ManualAlumniModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: "santri" | "pengurus";
}

export default function ManualAlumniModal({ isOpen, onClose, onSuccess, type }: ManualAlumniModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nisn: "", // for santri
    nik: "",  // for both
    phone: "",
    tahun_lulus: "", // for santri
    tahun_purna: "", // for pengurus
    photo_url: "",
    street: "",
    rt_rw: "",
    province: "",
    city: "",
    district: "",
    village: "",
    postal_code: "",
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
        .then(res => res.json())
        .then(data => setProvinces(data as any[]))
        .catch(err => console.error("Gagal load provinsi:", err));

      const now = new Date();
      const currentYear = now.getMonth() >= 6 
        ? `${now.getFullYear()}/${now.getFullYear() + 1}`
        : `${now.getFullYear() - 1}/${now.getFullYear()}`;
      
      setFormData(prev => ({
        ...prev,
        tahun_lulus: currentYear,
        tahun_purna: currentYear
      }));
    }
  }, [isOpen]);

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
    setFormData(prev => ({ ...prev, city: "", district: "", village: "" }));
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
    setFormData(prev => ({ ...prev, district: "", village: "" }));
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
    setFormData(prev => ({ ...prev, village: "" }));
  }, [formData.district, districts]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("folder", "sim-ppds/alumni");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json() as any;
      if (json.success) {
        setFormData({ ...formData, photo_url: json.url });
        showToast("Foto berhasil diunggah", "success");
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

    try {
      const res = await fetch(`${API_BASE_URL}/api/alumni`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type }),
      });

      const json = await res.json() as any;
      if (json.success) {
        showToast("Data alumni berhasil ditambahkan", "success");
        onSuccess();
        onClose();
        // Reset
        setFormData({
            name: "", nisn: "", nik: "", phone: "",
            tahun_lulus: "", tahun_purna: "", photo_url: "",
            street: "", rt_rw: "", province: "", city: "", district: "", village: "", postal_code: ""
        });
      } else {
        showToast(json.error || "Gagal menyimpan data", "error");
      }
    } catch (err) {
      showToast("Kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden scale-in-center max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${type === 'santri' ? 'bg-indigo-600' : 'bg-emerald-600'} flex items-center justify-center text-white shadow-lg`}>
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">Input Alumni Manual</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Registrasi Data {type === 'santri' ? 'Santri' : 'Pengurus'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="flex flex-col items-center">
            <div 
              className="relative w-32 h-32 rounded-[40px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.photo_url ? (
                <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-300">
                  <Camera className="w-8 h-8 group-hover:text-indigo-500 transition-colors" />
                  <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Upload Foto</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input required type="text" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="Nama Lengkap" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{type === 'santri' ? 'NISN' : 'NIK'}</label>
                <input required type="text" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm" value={type === 'santri' ? formData.nisn : formData.nik} onChange={(e) => setFormData({ ...formData, [type === 'santri' ? 'nisn' : 'nik']: e.target.value })} />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tahun Ajar (Purna)</label>
                <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                    <input required type="text" placeholder="2025/2026" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-amber-500 outline-none transition-all shadow-sm" value={type === 'santri' ? formData.tahun_lulus : formData.tahun_purna} onChange={(e) => setFormData({ ...formData, [type === 'santri' ? 'tahun_lulus' : 'tahun_purna']: e.target.value })} />
                </div>
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nomor WhatsApp</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input required type="text" placeholder="08xx..." className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-sm" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>

            <div className="col-span-2 p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <MapPin className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Alamat Lengkap</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Jalan / Dusun</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm font-bold" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">RT / RW</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm font-bold" value={formData.rt_rw} onChange={(e) => setFormData({ ...formData, rt_rw: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Provinsi</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm font-bold appearance-none cursor-pointer" value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })}>
                    <option value="">Pilih Provinsi</option>
                    {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kota / Kab</label>
                  <select disabled={!formData.province} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm font-bold disabled:opacity-50 appearance-none cursor-pointer" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}>
                    <option value="">Pilih Kota/Kab</option>
                    {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kecamatan</label>
                  <select disabled={!formData.city} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm font-bold disabled:opacity-50 appearance-none cursor-pointer" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })}>
                    <option value="">Pilih Kecamatan</option>
                    {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Desa</label>
                  <select disabled={!formData.district} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm font-bold disabled:opacity-50 appearance-none cursor-pointer" value={formData.village} onChange={(e) => setFormData({ ...formData, village: e.target.value })}>
                    <option value="">Pilih Desa</option>
                    {villages.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kode Pos</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm font-bold" value={formData.postal_code} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full py-4.5 bg-slate-900 text-white rounded-3xl text-sm font-black shadow-2xl shadow-slate-900/20 hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Simpan Data Alumni
          </button>
        </form>
      </div>
    </div>
  );
}
