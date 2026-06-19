"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  CreditCard, Search, Filter, Calendar, CheckCircle2, 
  AlertCircle, Wallet, TrendingUp, User, ArrowRight, 
  Loader2, Receipt, Download, Settings, ChevronDown, Check
} from "lucide-react";
import { useToast } from "@/components/Toast";
import Link from "next/link";

interface SantriSPP {
  id: number;
  nisn: string;
  name: string;
  kelas: string;
  madrasah: string;
  santri_status: string;
  tahun_masuk: string;
  payment_id: number | null;
  amount: number | null;
  payment_status: string | null;
  paid_at: string | null;
  period: string | null;
}

export default function SPPPage() {
  const [data, setData] = useState<SantriSPP[]>([]);
  const [summary, setSummary] = useState({ paid_count: 0, total_count: 0, total_amount: 0 });
  const [loading, setLoading] = useState(true);
  
  // Period Logic: Syawal, Maulid, Rajab
  const PERIODS = ["Syawal", "Maulid", "Rajab"];
  const [selectedPeriod, setSelectedPeriod] = useState("Syawal");

  // Dynamic Academic Year Logic (Auto-switch on Syawal)
  const currentAutoYear = useMemo(() => {
    try {
      const now = new Date();
      const hjFormatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic', { month: 'numeric' });
      const hjMonth = parseInt(hjFormatter.format(now));
      const year = now.getFullYear();
      if (hjMonth >= 10) return `${year}/${year + 1}`;
      return `${year - 1}/${year}`;
    } catch (e) { return "2025/2026"; }
  }, []);

  const [academicYear, setAcademicYear] = useState(currentAutoYear);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  // Generate Year List (History + Current + Next)
  const ACADEMIC_YEARS = useMemo(() => {
    const startYear = parseInt(currentAutoYear.split("/")[0]);
    return [`${startYear - 1}/${startYear}`, currentAutoYear, `${startYear + 1}/${startYear + 2}`];
  }, [currentAutoYear]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const { showToast } = useToast();

  const fetchSPPData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://api-worker.ppdslirboyo.workers.dev/api/spp?period=${selectedPeriod}&academic_year=${academicYear}`);
      const json = await res.json() as any;
      if (json.success) {
        setData(json.data);
        setSummary(json.summary);
      }
    } catch (err) {
      showToast("Gagal memuat data SPP", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSPPData();
  }, [selectedPeriod, academicYear]);

  const handlePay = async (santri: SantriSPP) => {
    setIsProcessing(santri.id);
    try {
      // 1. Get amount based on period and entry month logic
      // Untuk santri baru, cek bulan masuk (tahun_masuk)
      // Kita asumsikan entry_month diambil dari bulan tahun_masuk (YYYY-MM-DD)
      let entryMonth: number | undefined;
      if (santri.santri_status === 'Baru' && santri.tahun_masuk) {
          entryMonth = new Date(santri.tahun_masuk).getMonth() + 1;
      }

      const configRes = await fetch(`https://api-worker.ppdslirboyo.workers.dev/api/spp/config?status=${encodeURIComponent(santri.santri_status)}&kelas=${encodeURIComponent(santri.kelas)}&madrasah=${santri.madrasah || 'MHM'}&period=${selectedPeriod}${entryMonth ? `&entry_month=${entryMonth}` : ''}`);
      const configJson = await configRes.json() as any;
      const amount = configJson.amount || 1000000;

      // 2. Perform payment
      const res = await fetch("https://api-worker.ppdslirboyo.workers.dev/api/spp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          santri_id: santri.id,
          amount: amount,
          period: selectedPeriod,
          academic_year: academicYear,
          status: "Lunas"
        }),
      });

      const json = await res.json() as any;
      if (json.success) {
        showToast(`Syahriah ${santri.name} (${selectedPeriod}) berhasil!`, "success");
        fetchSPPData();
      } else {
        showToast(json.error || "Gagal mencatat pembayaran", "error");
      }
    } catch (err) {
      showToast("Gagal memproses pembayaran", "error");
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return data.filter(s => s.name.toLowerCase().includes(q) || s.nisn.includes(q));
  }, [data, searchQuery]);

  // Global Formatting
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", maximumFractionDigits: 0,
    }).format(val);
  };


  const handleExport = () => {
    const headers = ["Nama", "NISN", "Kelas", "Madrasah", "Status Santri", "Status Bayar", "Jumlah"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(s => [
        s.name, s.nisn, s.kelas, s.madrasah, s.santri_status, s.payment_status || "Belum Bayar", s.amount || 0
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_SPP_${selectedPeriod}_${academicYear.replace('/','-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Laporan Berhasil Diekspor", "success");
  };

  const handleWAReminder = () => {
    const unpaid = data.filter(s => s.payment_status !== 'Lunas');
    if (unpaid.length === 0) {
      showToast("Semua santri sudah lunas!", "success");
      return;
    }
    
    // Simulasikan pengiriman ke santri pertama yang belum bayar atau list
    const message = `Assalamualaikum, menginformasikan bahwa pembayaran Syahriah ${selectedPeriod} untuk santri di Pondok Pesantren Darussalam belum tercatat. Mohon segera melunasi. Terima kasih.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="fade-up space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 italic">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-indigo-200">
                 <CreditCard className="w-6 h-6 text-white -rotate-3" />
              </div>
              Syahriah Pesantren
            </h1>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-[0.2em] ml-14">
              Pembayaran Triwulan & Khusus Santri Baru
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             {/* Period Selector */}
             <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
               {PERIODS.map(p => (
                 <button
                   key={p}
                   onClick={() => setSelectedPeriod(p)}
                   className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                     selectedPeriod === p 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                   }`}
                 >
                   {p}
                 </button>
               ))}
             </div>

             <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

             <Link 
               href="/spp/config" 
               className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
             >
               <Settings className="w-3.5 h-3.5" /> Pengaturan Biaya
             </Link>
          </div>
        </div>

        {/* Global Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Wallet className="w-32 h-32" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Total Terkumpul ({selectedPeriod})</p>
               <h3 className="text-3xl font-black mt-2">{loading ? "..." : formatIDR(summary.total_amount)}</h3>
               <div className="mt-4 flex items-center gap-2 text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full w-fit backdrop-blur-md">
                 <TrendingUp className="w-3 h-3" /> Target: {formatIDR(summary.total_count * 1000000)} {/* Placeholder average */}
               </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Siswa Lunas</p>
                  <h3 className="text-3xl font-black text-slate-800 mt-2">{loading ? "..." : `${summary.paid_count} / ${summary.total_count}`}</h3>
               </div>
               <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-1000" 
                    style={{ width: `${(summary.paid_count / summary.total_count) * 100 || 0}%` }}
                  />
               </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Belum Bayar</p>
               <h3 className="text-3xl font-black text-rose-500 mt-2">{loading ? "..." : summary.total_count - summary.paid_count}</h3>
               <button 
                 onClick={handleWAReminder}
                 className="mt-4 text-[11px] font-black text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 transition-all"
               >
                 Kirim Pengingat WA <ArrowRight className="w-3 h-3" />
               </button>
               <div className="absolute right-6 top-6 opacity-5">
                  <AlertCircle className="w-12 h-12 text-rose-500" />
               </div>
            </div>
        </div>

        {/* List Data */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-6 bg-slate-50/10">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari Santri atau NISN..." 
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 focus:border-indigo-500 outline-none text-sm font-bold shadow-inner transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3 relative">
                 <div className="relative">
                    <button 
                      onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                      className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all"
                    >
                       <Calendar className="w-4 h-4 text-indigo-500" />
                       <span className="text-xs font-black text-slate-600">{academicYear}</span>
                       <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isYearDropdownOpen && (
                      <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-50 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                        {ACADEMIC_YEARS.map(year => (
                          <button
                            key={year}
                            onClick={() => {
                              setAcademicYear(year);
                              setIsYearDropdownOpen(false);
                            }}
                            className={`w-full text-left px-5 py-2.5 text-xs font-bold transition-colors ${
                              year === academicYear ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    )}
                 </div>
                 
                 <button 
                   onClick={handleExport}
                   className="p-3.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all group"
                 >
                    <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full">
                <thead>
                   <tr className="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="px-8 py-5 text-left">Foto & Profil</th>
                      <th className="px-8 py-5 text-left">Status & Madrasah</th>
                      <th className="px-8 py-5 text-center">Periode {selectedPeriod}</th>
                      <th className="px-8 py-5 text-right">Aksi Pembayaran</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="px-8 py-10"><div className="h-12 bg-slate-50 rounded-2xl w-full" /></td>
                        </tr>
                      ))
                   ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-32 text-center">
                           <Receipt className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                           <p className="text-slate-400 font-bold">Data tidak ditemukan</p>
                        </td>
                      </tr>
                   ) : (
                      filteredData.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs shadow-inner">
                                    <User className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase">{s.name}</p>
                                    <p className="text-[10px] font-mono text-slate-400 mt-1">{s.nisn}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                 <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg w-fit ${
                                   s.santri_status === 'Biasa' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-600'
                                 }`}>
                                   {s.santri_status}
                                 </span>
                                 <span className="text-xs font-bold text-slate-600">{s.kelas}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex justify-center">
                                 {s.payment_status === 'Lunas' ? (
                                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-100 animate-in zoom-in-95">
                                       <Check className="w-3.5 h-3.5" />
                                       <div className="flex flex-col">
                                          <span className="text-[10px] font-black uppercase">LUNAS</span>
                                          <span className="text-[8px] font-bold opacity-70">
                                            {formatIDR(s.amount!)} • {new Date(s.paid_at!).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}
                                          </span>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="flex items-center gap-2 bg-rose-50 text-rose-500 px-4 py-1.5 rounded-full border border-rose-100">
                                       <AlertCircle className="w-3.5 h-3.5" />
                                       <span className="text-[10px] font-black uppercase tracking-wider">BELUM BAYAR</span>
                                    </div>
                                 )}
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              {s.payment_status === 'Lunas' ? (
                                 <button disabled className="p-3 bg-slate-50 text-slate-300 rounded-2xl cursor-not-allowed border border-slate-100">
                                    <Receipt className="w-5 h-5" />
                                 </button>
                              ) : (
                                 <button
                                   onClick={() => handlePay(s)}
                                   disabled={isProcessing === s.id}
                                   className="relative px-6 py-2.5 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-2xl text-xs font-black transition-all group overflow-hidden active:scale-95 shadow-lg shadow-indigo-100"
                                 >
                                   {isProcessing === s.id ? (
                                     <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                   ) : (
                                     <span className="flex items-center gap-2">Bayar Sekarang <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></span>
                                   )}
                                 </button>
                              )}
                           </td>
                        </tr>
                      ))
                   )}
                </tbody>
             </table>
           </div>
           
           <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-[11px] font-bold text-slate-400 italic text-center">
              Total {filteredData.length} santri aktif terdaftar untuk tahun ajaran {academicYear}
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
