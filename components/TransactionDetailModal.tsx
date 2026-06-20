"use client";
import { API_BASE_URL } from "@/lib/config";

import { useState, useEffect } from "react";
import { 
  X, 
  Trash2, 
  RefreshCcw, 
  Calendar, 
  Tag, 
  FileText, 
  Banknote,
  AlertCircle,
  Save,
  Loader2,
  ExternalLink
} from "lucide-react";

interface Transaction {
  id: number;
  type: "Pemasukan" | "Pengeluaran";
  category: string;
  amount: number;
  description: string;
  date: string;
  proof_url?: string;
  santri_id?: number | null;
  santri_name?: string;
  santri_nisn?: string;
}

interface Props {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: (id: number) => void;
  onRestore?: (id: number) => void;
  isTrashed?: boolean;
}

export default function TransactionDetailModal({ 
  transaction, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete, 
  onRestore,
  isTrashed = false 
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Transaction | null>(null);

  useEffect(() => {
    if (transaction) {
      setFormData(transaction);
      setIsEditing(false);
    }
  }, [transaction]);

  if (!isOpen || !formData) return null;

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/keuangan/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        onUpdate();
        setIsEditing(false);
      } else {
        alert(json.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
    <div className="fixed inset-0 z-250 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden scale-in-center border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-6 flex items-center justify-between text-white shrink-0 ${
          formData.type === 'Pemasukan' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Banknote className="w-5 h-5 text-white" />
             </div>
             <div>
                <h3 className="text-lg font-black tracking-tight">{isEditing ? 'Edit Transaksi' : 'Detail Transaksi'}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">ID: #{formData.id}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90">
             <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
           {isEditing ? (
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tipe</label>
                      <select 
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      >
                         <option value="Pemasukan">Pemasukan</option>
                         <option value="Pengeluaran">Pengeluaran</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tanggal</label>
                      <input 
                        type="date"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                   </div>
                </div>
                
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kategori</label>
                   <input 
                     type="text"
                     className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold"
                     value={formData.category}
                     onChange={(e) => setFormData({...formData, category: e.target.value})}
                   />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Jumlah (IDR)</label>
                   <input 
                     type="number"
                     className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold"
                     value={formData.amount}
                     onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                   />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Keterangan</label>
                   <textarea 
                     className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold h-24"
                     value={formData.description}
                     onChange={(e) => setFormData({...formData, description: e.target.value})}
                   />
                </div>
             </div>
           ) : (
             <div className="space-y-6">
                {/* Visual Amount */}
                <div className={`p-6 rounded-[24px] text-center border-2 border-dashed ${
                   formData.type === 'Pemasukan' ? 'border-emerald-100 bg-emerald-50/30' : 'border-rose-100 bg-rose-50/30'
                }`}>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Nilai Transaksi</p>
                   <h2 className={`text-3xl font-black ${
                      formData.type === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                   }`}>
                      {formData.type === 'Pemasukan' ? '+' : '-'} {formatIDR(formData.amount)}
                   </h2>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400">
                         <Calendar className="w-3 h-3" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Tanggal</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700">{new Date(formData.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400">
                         <Tag className="w-3 h-3" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Kategori</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700">{formData.category}</p>
                   </div>
                </div>

                {formData.santri_name && (
                   <div className="space-y-1 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                      <div className="flex items-center gap-2 text-indigo-500">
                         <span className="text-[10px] font-black uppercase tracking-widest">Terhubung ke Santri</span>
                      </div>
                      <p className="text-sm font-bold text-indigo-700 mt-1">
                         {formData.santri_name} ({formData.santri_nisn})
                      </p>
                   </div>
                 )}

                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-slate-400">
                      <FileText className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Keterangan</span>
                   </div>
                   <p className="text-sm font-bold text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {formData.description || 'Tidak ada keterangan'}
                   </p>
                </div>

                {/* Proof Section */}
                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-slate-400">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Bukti Transaksi</span>
                   </div>
                   {formData.proof_url ? (
                      <div className="group relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                         <img src={formData.proof_url} alt="Bukti" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <a 
                              href={formData.proof_url} 
                              target="_blank" 
                              className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-black flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform"
                            >
                               Lihat Full <ExternalLink className="w-3 h-3" />
                            </a>
                         </div>
                      </div>
                   ) : (
                      <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-2xl text-xs font-bold text-slate-300 italic">
                         Belum ada bukti yang dilampirkan
                      </div>
                   )}
                </div>
             </div>
           )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex gap-3 shrink-0">
           {isTrashed ? (
              <>
                 <button 
                   onClick={() => onRestore && onRestore(formData.id)}
                   disabled={loading}
                   className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95"
                 >
                    <RefreshCcw className="w-4 h-4" /> Pulihkan
                 </button>
                 <button 
                   onClick={() => onDelete(formData.id)}
                   disabled={loading}
                   className="px-6 py-3.5 bg-rose-50 text-rose-600 rounded-2xl text-xs font-black flex items-center justify-center gap-2 hover:bg-rose-100 transition-all"
                 >
                    <Trash2 className="w-4 h-4" /> Hapus Permanen
                 </button>
              </>
           ) : (
             <>
                {isEditing ? (
                   <button 
                     onClick={handleUpdate}
                     disabled={loading}
                     className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95"
                   >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan Perubahan
                   </button>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-black shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
                  >
                     Edit Transaksi
                  </button>
                )}
                
                <button 
                  onClick={() => onDelete(formData.id)}
                  disabled={loading}
                  className="px-6 py-3.5 bg-rose-50 text-rose-600 rounded-2xl text-xs font-black flex items-center justify-center gap-2 hover:bg-rose-100 transition-all"
                >
                   <Trash2 className="w-4 h-4" /> Hapus
                </button>
             </>
           )}
        </div>
      </div>
    </div>
  );
}
