"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Settings, Save, Plus, Trash2, Calendar, 
  UserPlus, GraduationCap, ChevronLeft, Receipt, 
  ArrowLeft, Info, Loader2, List, School
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";

interface SppConfig {
  id: number;
  status: string;
  madrasah: string;
  kelas_name: string;
  period_name: string;
  amount: number;
  entry_month: number | null;
  is_new_student: number;
  description: string;
}

export default function SppConfigPage() {
  const [configs, setConfigs] = useState<SppConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    status: "Biasa",
    madrasah: "MHM",
    kelas_name: "",
    period_name: "Semua",
    amount: 1000000,
    entry_month: "",
    is_new_student: false,
    description: "",
  });

  const [classQuery, setClassQuery] = useState("");
  const [showClassSuggestions, setShowClassSuggestions] = useState(false);

  const MADRASAH_OPTIONS = ["MHM", "MIU"];
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
      "SP 1", "SP 2", "SP 3",
    ]
  };

  const filteredClasses = (formData.madrasah ? CLASS_MAPPING[formData.madrasah] : []).filter(c => 
    c.toLowerCase().includes(classQuery.toLowerCase())
  ).slice(0, 8);

  const fetchAllConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/spp/config?all=true`);
      const json = await res.json() as any;
      if (json.success) setConfigs(json.data);
    } catch (err) {
      showToast("Gagal memuat konfigurasi", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAllConfigs();
  }, [fetchAllConfigs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/spp/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           ...formData,
           entry_month: formData.entry_month ? parseInt(formData.entry_month) : null
        }),
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Konfigurasi disimpan!", "success");
        fetchAllConfigs();
        setFormData({
            status: "Biasa",
            madrasah: "MHM",
            kelas_name: "Ibtida",
            period_name: "Semua",
            amount: 1000000,
            entry_month: "",
            is_new_student: false,
            description: "",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <>
      <div className="fade-up space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex items-center gap-4 mb-2">
            <Link href="/spp" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400">
               <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
               <h1 className="text-xl font-black text-slate-800 tracking-tight">Pengaturan Biaya Syahriah</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Konfigurasi Tarif per Periode & Santri Baru</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Form Section */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 sticky top-4">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                       <Plus className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 italic text-lg tracking-tighter">Tambah Tarif Baru</h3>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Status Santri</label>
                       <select 
                         className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none text-sm font-bold appearance-none cursor-pointer shadow-inner"
                         value={formData.status}
                         onChange={(e) => setFormData({...formData, status: e.target.value})}
                       >
                         {["Biasa", "Ndalem 50%", "Ndalem 100%", "PKJ 50%", "PKJ 100%", "Nduduk", "Dzuriyyah"].map(s => (
                           <option key={s} value={s}>{s}</option>
                         ))}
                       </select>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Madrasah</label>
                       <div className="grid grid-cols-2 gap-2">
                          {MADRASAH_OPTIONS.map(m => (
                            <button 
                              key={m} 
                              type="button"
                              onClick={() => {
                                 setFormData({...formData, madrasah: m, kelas_name: ""});
                                 setClassQuery("");
                              }}
                              className={`py-2 rounded-xl text-xs font-black transition-all border-2 ${
                                formData.madrasah === m 
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                  : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                              }`}
                            >
                               {m}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-1.5 relative">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Jenjang/Kelas</label>
                       <div className="relative group">
                          <input 
                            required
                            type="text" 
                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none text-sm font-bold shadow-inner"
                            placeholder="Cari kelas (misal: Ibtida' 1)"
                            value={classQuery}
                            onChange={(e) => {
                               const val = e.target.value;
                               setClassQuery(val);
                               setFormData({...formData, kelas_name: val});
                               setShowClassSuggestions(true);
                            }}
                            onFocus={() => setShowClassSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowClassSuggestions(false), 200)}
                          />
                          <List className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                       </div>
                       
                       {showClassSuggestions && filteredClasses.length > 0 && (
                          <div className="absolute z-110 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-48 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                             {filteredClasses.map(c => (
                                <button 
                                  key={c} 
                                  type="button" 
                                  className="w-full px-4 py-3 text-left text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-b border-slate-50 last:border-0"
                                  onClick={() => {
                                     setFormData({...formData, kelas_name: c});
                                     setClassQuery(c);
                                     setShowClassSuggestions(false);
                                  }}
                                >
                                   {c}
                                </button>
                             ))}
                          </div>
                       )}
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Periode Pembayaran</label>
                       <select 
                         className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none text-sm font-bold appearance-none cursor-pointer shadow-inner"
                         value={formData.period_name}
                         onChange={(e) => setFormData({...formData, period_name: e.target.value})}
                       >
                         <option value="Semua">Semua Periode</option>
                         <option value="Syawal">Syawal</option>
                         <option value="Maulid">Maulid</option>
                         <option value="Rajab">Rajab</option>
                       </select>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Besar Biaya (IDR)</label>
                       <input 
                         type="number" 
                         className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 outline-none text-sm font-bold shadow-inner"
                         value={formData.amount}
                         placeholder="1000000"
                         onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                       />
                    </div>

                    {/* New Student Specific Toggle */}
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <UserPlus className="w-4 h-4 text-indigo-600" />
                             <span className="text-xs font-black text-indigo-700">Khusus Santri Baru?</span>
                          </div>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 accent-indigo-600"
                            checked={formData.is_new_student}
                            onChange={(e) => setFormData({...formData, is_new_student: e.target.checked})}
                          />
                       </div>
                       
                       {formData.is_new_student && (
                         <div className="space-y-1 mt-2">
                           <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Bulan Masuk (1-12)</label>
                           <input 
                              type="number" 
                              min="1" max="12"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-100 text-xs font-bold"
                              placeholder="Contoh: 7 (Juli)"
                              value={formData.entry_month}
                              onChange={(e) => setFormData({...formData, entry_month: e.target.value})}
                           />
                         </div>
                       )}
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Simpan Konfigurasi
                    </button>
                 </form>
              </div>
           </div>

           {/* Table Section */}
           <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden min-h-[600px]">
                 <div className="p-8 border-b border-slate-50 bg-slate-50/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Receipt className="w-5 h-5" />
                       </div>
                       <h3 className="font-extrabold text-slate-800 italic uppercase tracking-tighter">Daftar Tarif Aktif</h3>
                    </div>
                 </div>

                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                       <thead>
                          <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 whitespace-nowrap">
                             <th className="px-8 py-4 text-left">Madrasah & Status</th>
                             <th className="px-8 py-4 text-left">Jenjang</th>
                             <th className="px-8 py-4 text-left">Periode</th>
                             <th className="px-8 py-4 text-right">Tarif</th>
                             <th className="px-8 py-4 text-center">Aksi</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {loading ? (
                             Array(6).fill(0).map((_, i) => (
                               <tr key={i} className="animate-pulse">
                                 <td colSpan={5} className="px-8 py-8"><div className="h-10 bg-slate-50 rounded-xl w-full" /></td>
                               </tr>
                             ))
                          ) : configs.length === 0 ? (
                             <tr>
                               <td colSpan={5} className="px-8 py-32 text-center">
                                  <Info className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                                  <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">Belum ada konfigurasi tarif</p>
                               </td>
                             </tr>
                          ) : (
                             configs.map(c => (
                               <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                       <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                                          c.madrasah === 'MHM' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                                       }`}>
                                          {c.madrasah}
                                       </span>
                                       <span className="font-black text-slate-700 uppercase tracking-tighter">{c.status}</span>
                                    </div>
                                    {c.is_new_student && <span className="text-[9px] font-black text-amber-500 ml-12 italic px-1.5 bg-amber-50 rounded inline-block mt-1">Masuk Bulan {c.entry_month}</span>}
                                 </td>
                                 <td className="px-8 py-6 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase">
                                       <GraduationCap className="w-4 h-4 opacity-30" /> {c.kelas_name}
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                       c.period_name === 'Semua' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600'
                                    }`}>
                                       {c.period_name}
                                    </span>
                                 </td>
                                 <td className="px-8 py-6 text-right whitespace-nowrap">
                                    <span className="font-black text-slate-800 text-sm tracking-tighter">{formatIDR(c.amount)}</span>
                                 </td>
                                 <td className="px-8 py-6 text-center">
                                    <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors bg-white border border-slate-100 rounded-xl shadow-sm hover:border-rose-100">
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </td>
                               </tr>
                             ))
                          )}
                       </tbody>
                    </table>
                 </div>

                 <div className="p-6 bg-slate-50/10 border-t border-slate-50 rounded-b-[2.5rem]">
                    <div className="flex items-start gap-3 text-slate-400">
                       <Info className="w-4 h-4 mt-0.5 shrink-0" />
                       <div className="text-[10px] font-bold leading-relaxed">
                          Sistem akan memprioritaskan tarif berdasarkan **Madrasah**, **Jenjang**, dan **Status**. Santri baru akan dicek berdasarkan bulan masuknya.
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </>
  );
}

