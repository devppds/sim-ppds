"use client";

import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/lib/config";
import { Plus, Search, RefreshCw, Trash2, CheckCircle2, AlertCircle, Music, Clock, Settings2, X } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/components/Toast";

export default function JamiyyahPage() {
  const [activeTab, setActiveTab] = useState<"grup" | "alat">("grup");
  const [dataGrup, setDataGrup] = useState<any[]>([]);
  const [dataAlat, setDataAlat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formGrup, setFormGrup] = useState({ nama_grup: "", deskripsi: "" });
  const [formAlat, setFormAlat] = useState({
    jenis_kepemilikan: "Pribadi",
    pemilik_id: "",
    nama_alat: "",
    jumlah: 1,
    tanggal_kadaluarsa: "Syawal"
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "grup") {
        const res = await fetch(`${API_BASE_URL}/api/jamiyyah/grup`);
        const json = await res.json() as any;
        if (json.success) setDataGrup(json.data);
      } else {
        const res = await fetch(`${API_BASE_URL}/api/jamiyyah/alat`);
        const json = await res.json() as any;
        if (json.success) setDataAlat(json.data);
      }
    } catch (e) {
      console.error(e);
      showToast("Gagal mengambil data", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === "grup" ? "/api/jamiyyah/grup" : "/api/jamiyyah/alat";
      const payload = activeTab === "grup" ? formGrup : { ...formAlat, pemilik_id: parseInt(formAlat.pemilik_id) };
      
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Data berhasil disimpan", "success");
        setIsModalOpen(false);
        setFormGrup({ nama_grup: "", deskripsi: "" });
        setFormAlat({ jenis_kepemilikan: "Pribadi", pemilik_id: "", nama_alat: "", jumlah: 1, tanggal_kadaluarsa: "Syawal" });
        fetchData();
      } else {
        showToast(json.error || "Gagal menyimpan", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan server", "error");
    }
  };

  return (
    <div className="fade-up space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 italic">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-indigo-200">
               <Music className="w-6 h-6 text-white -rotate-3" />
            </div>
            Seksi Jam&apos;iyyah
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-[0.2em] ml-14">
            Manajemen Grup & Inventaris Alat Hadroh
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("grup")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${activeTab === 'grup' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
          >
            Grup Jam&apos;iyyah
          </button>
          <button 
            onClick={() => setActiveTab("alat")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${activeTab === 'alat' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
          >
            Inventaris Alat
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Cari ${activeTab === 'grup' ? 'Grup' : 'Alat'}...`}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-bold transition-all shadow-inner"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={fetchData} className="p-3 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 shadow-sm transition-all">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-black hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Tambah Data
            </button>
          </div>
        </div>

        <div className="p-4 min-h-[400px]">
          {activeTab === "grup" ? (
            <DataTable 
              data={dataGrup}
              loading={loading}
              columns={[
                { header: "Nama Grup", render: (g: any) => <span className="font-black text-slate-800">{g.nama_grup}</span> },
                { header: "Deskripsi", render: (g: any) => <span className="text-xs font-medium text-slate-500">{g.deskripsi || '-'}</span> },
                { header: "Tanggal Dibuat", render: (g: any) => <span className="text-[10px] font-bold text-slate-400 px-3 py-1 bg-slate-100 rounded-lg">{new Date(g.created_at).toLocaleDateString('id-ID')}</span> }
              ]}
              emptyMessage="Belum ada grup jam&apos;iyyah"
            />
          ) : (
            <DataTable 
              data={dataAlat}
              loading={loading}
              columns={[
                { header: "Nama Alat", render: (a: any) => <span className="font-black text-slate-800 uppercase tracking-tight">{a.nama_alat}</span> },
                { header: "Kepemilikan", render: (a: any) => (
                  <div className="flex flex-col gap-1">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md w-fit ${a.jenis_kepemilikan === 'Pribadi' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {a.jenis_kepemilikan}
                    </span>
                    <span className="text-xs font-bold text-slate-600">{a.nama_pemilik || `ID: ${a.pemilik_id}`}</span>
                  </div>
                )},
                { header: "Jumlah", render: (a: any) => <span className="text-lg font-black text-slate-800">{a.jumlah}</span> },
                { header: "Kadaluarsa", render: (a: any) => <span className="text-[10px] font-bold text-rose-500 px-3 py-1 bg-rose-50 rounded-lg border border-rose-100">{a.tanggal_kadaluarsa}</span> }
              ]}
              emptyMessage="Belum ada alat yang diregistrasi"
            />
          )}
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-500" />
                Tambah {activeTab === "grup" ? "Grup" : "Alat"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {activeTab === "grup" ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Grup</label>
                    <input 
                      required type="text"
                      value={formGrup.nama_grup} onChange={e => setFormGrup({...formGrup, nama_grup: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold shadow-inner"
                      placeholder="Contoh: Syauqul Habib"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Deskripsi</label>
                    <textarea 
                      value={formGrup.deskripsi} onChange={e => setFormGrup({...formGrup, deskripsi: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold shadow-inner min-h-[100px]"
                      placeholder="Keterangan opsional..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kepemilikan</label>
                      <select 
                        value={formAlat.jenis_kepemilikan} onChange={e => setFormAlat({...formAlat, jenis_kepemilikan: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold shadow-inner"
                      >
                        <option value="Pribadi">Pribadi</option>
                        <option value="Jam'iyyah">Jam&apos;iyyah</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ID Pemilik</label>
                      <input 
                        required type="number"
                        value={formAlat.pemilik_id} onChange={e => setFormAlat({...formAlat, pemilik_id: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold shadow-inner"
                        placeholder="ID Santri / ID Grup"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Alat</label>
                    <input 
                      required type="text"
                      value={formAlat.nama_alat} onChange={e => setFormAlat({...formAlat, nama_alat: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold shadow-inner"
                      placeholder="Contoh: Darbuka"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Jumlah</label>
                      <input 
                        required type="number" min="1"
                        value={formAlat.jumlah} onChange={e => setFormAlat({...formAlat, jumlah: parseInt(e.target.value) || 1})}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold shadow-inner"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kadaluarsa</label>
                      <input 
                        required type="text" disabled
                        value={formAlat.tanggal_kadaluarsa}
                        className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-sm font-bold"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <button type="submit" className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                Simpan Data
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
