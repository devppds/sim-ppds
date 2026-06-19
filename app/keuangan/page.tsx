"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2,
  History,
  PieChart,
  Plus,
  Download,
  CheckCircle
} from "lucide-react";
import AddTransactionModal from "@/components/AddTransactionModal";
import TransactionDetailModal from "@/components/TransactionDetailModal";
import { API_BASE_URL } from "@/lib/config";

interface Transaction {
  id: number;
  type: "Pemasukan" | "Pengeluaran";
  category: string;
  amount: number;
  description: string;
  date: string;
  proof_url?: string;
  deleted_at?: string;
}

export default function KeuanganPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTrashed, setShowTrashed] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<"ledger" | "budgeting" | "neraca">("ledger");

  const fetchFinance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/keuangan?trashed=${showTrashed}`);
      const json = await res.json() as { success: boolean, data: Transaction[], summary: { total_income: number, total_expense: number } };
      if (json.success) {
        setData(json.data);
        setSummary(json.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [showTrashed]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFinance();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchFinance]);

  const handleDelete = async (id: number) => {
    const isPermanent = showTrashed;
    if (!confirm(isPermanent ? "Hapus permanen transaksi ini?" : "Pindah transaksi ini ke Recycle Bin?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/keuangan/${id}?permanent=${isPermanent}`, { method: "DELETE" });
      const json = await res.json() as { success: boolean, error?: string };
      if (json.success) {
        fetchFinance();
        setSelectedTx(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/keuangan/restore?id=${id}`, { method: "POST" });
      const json = await res.json() as { success: boolean, error?: string };
      if (json.success) {
        fetchFinance();
        setSelectedTx(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <DashboardLayout>
      <div className="fade-up fade-up-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-indigo-600" /> Bendahara Umum (Master Finance)
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manajemen Ledger, E-Budgeting, dan Laporan Neraca Keuangan
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveTab("ledger")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "ledger" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Receipt className="w-4 h-4" /> Ledger Utama
          </button>
          <button 
            onClick={() => setActiveTab("budgeting")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "budgeting" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Wallet className="w-4 h-4" /> E-Budgeting (Pencairan)
          </button>
          <button 
            onClick={() => setActiveTab("neraca")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "neraca" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <PieChart className="w-4 h-4" /> Laporan Neraca
          </button>
        </div>

        {activeTab === "ledger" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Highlight Cards */}
            {!showTrashed && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-12 h-12 text-emerald-600" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Pemasukan</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{loading ? "..." : formatIDR(summary.total_income)}</h3>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" /> +8.2% bln ini
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingDown className="w-12 h-12 text-rose-600" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Pengeluaran</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">{loading ? "..." : formatIDR(summary.total_expense)}</h3>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 w-fit px-2 py-0.5 rounded-full">
                    <ArrowDownRight className="w-3 h-3" /> -2.4% bln ini
                  </div>
                </div>

                <div className="bg-indigo-600 p-5 rounded-2xl shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform">
                    <Wallet className="w-12 h-12" />
                  </div>
                  <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest opacity-80">Saldo Kas Sekarang</p>
                  <h3 className="text-2xl font-black mt-1">{loading ? "..." : formatIDR(summary.total_income - summary.total_expense)}</h3>
                  <div className="mt-3 text-[11px] font-medium text-indigo-100 opacity-70">Terakhir update: Hari ini</div>
                </div>
              </div>
            )}

            {/* Transaction Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-slate-800 text-sm tracking-tight">
                    {showTrashed ? 'Recycle Bin Transaksi' : 'Buku Besar (Ledger)'}
                  </h3>
                </div>
                <div className="flex gap-2">
                    {!showTrashed && (
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm"
                      >
                        <Plus className="w-3 h-3" /> Catat Transaksi
                      </button>
                    )}
                    <button 
                      onClick={() => setShowTrashed(!showTrashed)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        showTrashed 
                        ? 'bg-slate-800 text-white border-slate-800' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {showTrashed ? <History className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                      {showTrashed ? 'Kembali' : 'Trash'}
                    </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4 text-left">Tanggal</th>
                      <th className="px-6 py-4 text-left">Kategori</th>
                      <th className="px-6 py-4 text-left w-1/3">Keterangan</th>
                      <th className="px-6 py-4 text-center">Bukti</th>
                      <th className="px-6 py-4 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-slate-50 rounded w-full"></div></td>
                        </tr>
                      ))
                    ) : data.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                          {showTrashed ? 'Recycle Bin Kosong' : 'Belum ada transaksi'}
                        </td>
                      </tr>
                    ) : (
                      data.map((t) => (
                        <tr 
                          key={t.id} 
                          onClick={() => setSelectedTx(t)}
                          className="group hover:bg-indigo-50/50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 text-slate-500 font-bold whitespace-nowrap">
                            {new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                              t.type === 'Pemasukan' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {t.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                              <span className="text-sm font-bold text-slate-700">{t.description}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {t.proof_url ? (
                               <div className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                 Ada Bukti
                               </div>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-300">N/A</span>
                            )}
                          </td>
                          <td className={`px-6 py-4 text-right font-black tabular-nums ${
                            t.type === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {t.type === 'Pemasukan' ? '+' : '-'} {formatIDR(t.amount).replace("Rp", "").trim()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "budgeting" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Sistem Pencairan Anggaran (E-Budgeting)</h2>
                        <p className="text-sm text-slate-500">Daftar proposal yang telah disetujui Ketua Umum dan siap dicairkan</p>
                    </div>
                </div>
                <table className="w-full text-sm">
                 <thead className="bg-slate-50 border-b border-slate-100">
                   <tr className="text-xs text-slate-500 font-bold uppercase tracking-wider text-left">
                     <th className="px-6 py-4">Seksi Pengaju</th>
                     <th className="px-6 py-4">Keperluan / Judul</th>
                     <th className="px-6 py-4">Anggaran</th>
                     <th className="px-6 py-4">Status Approval</th>
                     <th className="px-6 py-4">Aksi</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {[
                     { by: "Seksi PLP", title: "Perbaikan Instalasi Air Blok A", budget: "Rp 3.500.000", status: "Disetujui Ketua" },
                     { by: "Seksi Keamanan", title: "Pembelian CCTV Tambahan", budget: "Rp 5.000.000", status: "Disetujui Ketua" },
                   ].map((item, i) => (
                     <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-4 font-bold text-slate-800">{item.by}</td>
                       <td className="px-6 py-4 text-slate-600">{item.title}</td>
                       <td className="px-6 py-4 font-mono font-bold text-slate-700">{item.budget}</td>
                       <td className="px-6 py-4">
                           <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase bg-emerald-50 text-emerald-600">
                             <CheckCircle className="w-3 h-3" /> {item.status}
                           </span>
                       </td>
                       <td className="px-6 py-4">
                         <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm">
                             Cairkan Dana
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === "neraca" && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-center">
                 <h2 className="text-xl font-black text-slate-800 mb-2">Laporan Neraca Keuangan Otomatis</h2>
                 <p className="text-slate-500 mb-6">Rekapitulasi otomatis dari seluruh jurnal pemasukan dan pengeluaran pondok.</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
                     <div className="border border-slate-200 rounded-xl p-6 bg-slate-50">
                         <h3 className="font-bold text-emerald-700 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                             <TrendingUp className="w-5 h-5" /> Aktiva (Pemasukan)
                         </h3>
                         <div className="space-y-3 text-sm">
                             <div className="flex justify-between"><span>Penerimaan Syahriyah SPP</span><span className="font-mono font-bold">Rp 145.000.000</span></div>
                             <div className="flex justify-between"><span>Setoran BUMP</span><span className="font-mono font-bold">Rp 12.500.000</span></div>
                             <div className="flex justify-between"><span>Donasi / Infaq</span><span className="font-mono font-bold">Rp 5.000.000</span></div>
                             <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-emerald-800">
                                 <span>Total Pemasukan</span><span className="font-mono">Rp 162.500.000</span>
                             </div>
                         </div>
                     </div>
                     <div className="border border-slate-200 rounded-xl p-6 bg-slate-50">
                         <h3 className="font-bold text-rose-700 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                             <TrendingDown className="w-5 h-5" /> Pasiva (Pengeluaran)
                         </h3>
                         <div className="space-y-3 text-sm">
                             <div className="flex justify-between"><span>Biaya Operasional</span><span className="font-mono font-bold">Rp 25.000.000</span></div>
                             <div className="flex justify-between"><span>Biaya Gaji & Honor</span><span className="font-mono font-bold">Rp 45.000.000</span></div>
                             <div className="flex justify-between"><span>Pencairan Anggaran (E-Budgeting)</span><span className="font-mono font-bold">Rp 15.000.000</span></div>
                             <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-rose-800">
                                 <span>Total Pengeluaran</span><span className="font-mono">Rp 85.000.000</span>
                             </div>
                         </div>
                     </div>
                 </div>
                 
                 <div className="mt-8 max-w-4xl mx-auto p-6 bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-center">
                     <span className="font-bold text-indigo-800 text-lg">Saldo Kas Bersih (Surplus)</span>
                     <span className="font-black text-2xl text-indigo-700 font-mono">Rp 77.500.000</span>
                 </div>
             </div>
           </div>
        )}

      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchFinance()} 
      />

      <TransactionDetailModal 
        isOpen={!!selectedTx}
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onUpdate={() => fetchFinance()}
        onDelete={handleDelete}
        onRestore={handleRestore}
        isTrashed={showTrashed}
      />
    </DashboardLayout>
  );
}
