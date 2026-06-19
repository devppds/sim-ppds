"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Download,
  Plus,
  FileText,
  ExternalLink,
  Trash2,
  RefreshCcw,
  History
} from "lucide-react";
import AddTransactionModal from "@/components/AddTransactionModal";
import TransactionDetailModal from "@/components/TransactionDetailModal";

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

  const fetchFinance = async (isTrashed = showTrashed) => {
    try {
      setLoading(true);
      const res = await fetch(`https://api-worker.ppdslirboyo.workers.dev/api/keuangan?trashed=${isTrashed}`);
      const json = (await res.json()) as any;
      if (json.success) {
        setData(json.data);
        setSummary(json.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, [showTrashed]);

  const handleDelete = async (id: number) => {
    const isPermanent = showTrashed;
    if (!confirm(isPermanent ? "Hapus permanen transaksi ini?" : "Pindah transaksi ini ke Recycle Bin?")) return;
    
    try {
      const res = await fetch(`https://api-worker.ppdslirboyo.workers.dev/api/keuangan/${id}?permanent=${isPermanent}`, { method: "DELETE" });
      const json = (await res.json()) as any;
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
      const res = await fetch(`https://api-worker.ppdslirboyo.workers.dev/api/keuangan/restore?id=${id}`, { method: "POST" });
      const json = (await res.json()) as any;
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
            <h1 className="text-xl font-extrabold text-[#1e293b] flex items-center gap-2">
              <Receipt className="w-6 h-6 text-indigo-600" /> {showTrashed ? 'Recycle Bin Keuangan' : 'Laporan Keuangan'}
            </h1>
            <p className="text-sm text-[#64748b] mt-1">
              {showTrashed ? 'Data transaksi yang dihapus sementara' : 'Rekapitulasi pemasukan SPP dan pengeluaran operasional'}
            </p>
          </div>
          <div className="flex gap-2">
            {!showTrashed && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
              >
                <Plus className="w-3.5 h-3.5" /> Catat Transaksi
              </button>
            )}
            <button 
              onClick={() => setShowTrashed(!showTrashed)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                showTrashed 
                ? 'bg-slate-800 text-white border-slate-800' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {showTrashed ? <History className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
              {showTrashed ? 'Kembali' : 'Recycle Bin'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
          </div>
        </div>

        {/* Highlight Cards - Only show on main list */}
        {!showTrashed && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-500">
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
        <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-700">
          <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-3">
               <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${showTrashed ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {showTrashed ? <Trash2 className="w-4 h-4" /> : <History className="w-4 h-4" />}
               </div>
               <h3 className="font-black text-slate-800 text-sm tracking-tight">
                 {showTrashed ? 'Data Terhapus' : 'Riwayat Transaksi Terakhir'}
               </h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] text-slate-400 font-black uppercase tracking-[0.15em]">
                  <th className="px-8 py-5 text-left">Tanggal</th>
                  <th className="px-8 py-5 text-left">Kategori</th>
                  <th className="px-8 py-5 text-left w-1/3">Keterangan</th>
                  <th className="px-8 py-5 text-center">Bukti</th>
                  <th className="px-8 py-5 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-5"><div className="h-4 bg-slate-50 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                       <div className="flex flex-col items-center gap-3 opacity-30">
                          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                             <FileText className="w-8 h-8" />
                          </div>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                            {showTrashed ? 'Recycle Bin Kosong' : 'Belum ada transaksi'}
                          </p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  data.map((t) => (
                    <tr 
                      key={t.id} 
                      onClick={() => setSelectedTx(t)}
                      className="group hover:bg-indigo-50/30 transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-500"
                    >
                      <td className="px-8 py-5 text-slate-500 font-bold whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          t.type === 'Pemasukan' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {t.category}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-700 leading-tight group-hover:text-indigo-700 transition-colors">{t.description}</span>
                            {showTrashed && <span className="text-[9px] text-rose-400 font-bold mt-1 uppercase">Dihapus pada: {t.deleted_at}</span>}
                         </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        {t.proof_url ? (
                           <div className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                             <ExternalLink className="w-3 h-3" /> Ada Bukti
                           </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">N/A</span>
                        )}
                      </td>
                      <td className={`px-8 py-5 text-right font-black text-base tabular-nums ${
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
