"use client";

import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/lib/config";
import { Plus, Search, RefreshCw, Smartphone, Car, Flame, CheckCircle, PackageSearch } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/components/Toast";

export default function KeamananAset() {
  const [activeTab, setActiveTab] = useState<"kendaraan" | "elektronik" | "kompor" | "transaksi">("kendaraan");
  const [dataKendaraan, setDataKendaraan] = useState<any[]>([]);
  const [dataElektronik, setDataElektronik] = useState<any[]>([]);
  const [dataKompor, setDataKompor] = useState<any[]>([]);
  const [dataTransaksi, setDataTransaksi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Forms
  const [formKendaraan, setFormKendaraan] = useState({ santri_id: "", jenis: "Motor", merk: "", plat_nomor: "", warna: "", petugas: "Admin" });
  const [formElektronik, setFormElektronik] = useState({ santri_id: "", jenis: "Laptop", detail_jenis: "", kelengkapan: "", merk: "", warna: "", petugas: "Admin" });
  const [formKompor, setFormKompor] = useState({ nama_pendaftar: "", kamar: "", merk: "", jenis_tabung: "Satu Tungku", warna: "", penempatan: "", tanggal_kadaluarsa: "Syawal", petugas: "Admin" });
  const [formTransaksi, setFormTransaksi] = useState({ item_type: "Kendaraan", item_id: "", petugas: "Admin" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/keamanan/${activeTab}`);
      const json = await res.json() as any;
      if (json.success) {
        if (activeTab === "kendaraan") setDataKendaraan(json.data);
        else if (activeTab === "elektronik") setDataElektronik(json.data);
        else if (activeTab === "kompor") setDataKompor(json.data);
        else if (activeTab === "transaksi") setDataTransaksi(json.data);
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
    let payload: any = {};
    try {
      if (activeTab === "kendaraan") payload = { ...formKendaraan, santri_id: parseInt(formKendaraan.santri_id) };
      else if (activeTab === "elektronik") payload = { ...formElektronik, santri_id: parseInt(formElektronik.santri_id) };
      else if (activeTab === "kompor") payload = formKompor;
      else if (activeTab === "transaksi") payload = { ...formTransaksi, item_id: parseInt(formTransaksi.item_id) };

      const res = await fetch(`${API_BASE_URL}/api/keamanan/${activeTab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Data berhasil disimpan", "success");
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast(json.error || "Gagal menyimpan", "error");
      }
    } catch (err) {
      let newItem: any = { id: Date.now(), ...payload };
      if (activeTab === "kendaraan") {
        newItem = { ...newItem, santri_name: "Santri (Offline)", kelas: "-" };
        setDataKendaraan((prev) => [newItem, ...prev]);
      } else if (activeTab === "elektronik") {
        newItem = { ...newItem, santri_name: "Santri (Offline)", kelas: "-" };
        setDataElektronik((prev) => [newItem, ...prev]);
      } else if (activeTab === "kompor") {
        setDataKompor((prev) => [newItem, ...prev]);
      } else if (activeTab === "transaksi") {
        newItem = { ...newItem, waktu_pengambilan: new Date().toISOString(), status: "Dipinjam" };
        setDataTransaksi((prev) => [newItem, ...prev]);
      }
      showToast(`Data disimpan (Lokal)`, "success");
      setIsModalOpen(false);
      
      setFormKendaraan({ santri_id: "", jenis: "Motor", merk: "", plat_nomor: "", warna: "", petugas: "Admin" });
      setFormElektronik({ santri_id: "", jenis: "Laptop", detail_jenis: "", kelengkapan: "", merk: "", warna: "", petugas: "Admin" });
      setFormKompor({ nama_pendaftar: "", kamar: "", merk: "", jenis_tabung: "Satu Tungku", warna: "", penempatan: "", tanggal_kadaluarsa: "Syawal", petugas: "Admin" });
      setFormTransaksi({ item_type: "Kendaraan", item_id: "", petugas: "Admin" });
    }
  };

  const handleReturn = async (id: number) => {
    if(!confirm("Proses pengembalian aset?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/keamanan/transaksi`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, petugas: "Admin" })
      });
      const json = await res.json() as any;
      if(json.success) {
        showToast("Aset dikembalikan", "success");
        fetchData();
      }
    } catch {
      setDataTransaksi(prev => prev.map(t => t.id === id ? { ...t, status: 'Dikembalikan', waktu_pengembalian: new Date().toISOString(), petugas_pengembali: 'Admin' } : t));
      showToast("Aset dikembalikan (Lokal)", "success");
    }
  }

  return (
    <div className="space-y-4 fade-up">
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "kendaraan", label: "Kendaraan", icon: Car },
          { id: "elektronik", label: "Elektronik", icon: Smartphone },
          { id: "kompor", label: "Kompor", icon: Flame },
          { id: "transaksi", label: "Log Pengambilan", icon: PackageSearch }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === t.id ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
         <div className="relative w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input type="text" placeholder="Pencarian..." className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-sm" />
         </div>
         <div className="flex gap-2">
           <button onClick={fetchData} className="p-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50"><RefreshCw className="w-4 h-4" /></button>
           <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">
             <Plus className="w-4 h-4" /> Tambah Data
           </button>
         </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
         {activeTab === "kendaraan" && (
           <DataTable 
             data={dataKendaraan} loading={loading}
             columns={[
               { header: "Santri", render: (k: any) => <div><div className="font-bold">{k.santri_name}</div><div className="text-xs text-slate-500">{k.kelas}</div></div> },
               { header: "Kendaraan", render: (k: any) => <div><div className="font-bold">{k.jenis} - {k.merk}</div><div className="text-xs text-slate-500">{k.warna}</div></div> },
               { header: "Plat Nomor", render: (k: any) => <div className="font-mono text-sm">{k.plat_nomor || '-'}</div> },
               { header: "Tgl Registrasi", render: (k: any) => <div className="text-xs">{new Date(k.tanggal_registrasi).toLocaleDateString('id-ID')}</div> }
             ]}
           />
         )}
         {activeTab === "elektronik" && (
           <DataTable 
             data={dataElektronik} loading={loading}
             columns={[
               { header: "Santri", render: (e: any) => <div><div className="font-bold">{e.santri_name}</div><div className="text-xs text-slate-500">{e.kelas}</div></div> },
               { header: "Elektronik", render: (e: any) => <div><div className="font-bold">{e.jenis === 'Lainnya' ? e.detail_jenis : e.jenis} - {e.merk}</div><div className="text-xs text-slate-500">{e.warna}</div></div> },
               { header: "Kelengkapan", render: (e: any) => <div className="text-xs">{e.kelengkapan || '-'}</div> },
               { header: "Tgl Registrasi", render: (e: any) => <div className="text-xs">{new Date(e.tanggal_registrasi).toLocaleDateString('id-ID')}</div> }
             ]}
           />
         )}
         {activeTab === "kompor" && (
           <DataTable 
             data={dataKompor} loading={loading}
             columns={[
               { header: "Kamar", render: (k: any) => <div className="font-bold text-indigo-600">{k.kamar}</div> },
               { header: "Pendaftar", render: (k: any) => <div className="font-bold">{k.nama_pendaftar}</div> },
               { header: "Detail Kompor", render: (k: any) => <div><div className="text-sm font-medium">{k.merk} ({k.jenis_tabung})</div><div className="text-xs text-slate-500">Warna: {k.warna} | Penempatan: {k.penempatan}</div></div> },
               { header: "Kadaluarsa", render: (k: any) => <div className="text-xs font-bold text-rose-500">{k.tanggal_kadaluarsa}</div> }
             ]}
           />
         )}
         {activeTab === "transaksi" && (
           <DataTable 
             data={dataTransaksi} loading={loading}
             columns={[
               { header: "Aset", render: (t: any) => <div><div className="font-bold">{t.item_type}</div><div className="text-xs text-slate-500">ID: {t.item_id}</div></div> },
               { header: "Pengambilan", render: (t: any) => <div><div className="text-xs">{new Date(t.waktu_pengambilan).toLocaleString('id-ID')}</div><div className="text-xs text-slate-500">Petugas: {t.petugas_pengambil}</div></div> },
               { header: "Pengembalian", render: (t: any) => t.status === 'Dikembalikan' ? <div><div className="text-xs">{new Date(t.waktu_pengembalian).toLocaleString('id-ID')}</div><div className="text-xs text-slate-500">Petugas: {t.petugas_pengembali}</div></div> : <div className="text-amber-500 text-xs font-bold px-2 py-1 bg-amber-50 rounded w-fit">Belum Dikembalikan</div> },
               { header: "Aksi", render: (t: any) => t.status === 'Dipinjam' ? <button onClick={() => handleReturn(t.id)} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded text-xs font-bold hover:bg-indigo-100">Selesaikan</button> : <CheckCircle className="w-5 h-5 text-emerald-500" /> }
             ]}
           />
         )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="font-bold">Tambah Registrasi {activeTab}</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
               {activeTab === "kendaraan" && (
                 <>
                   <input required type="number" placeholder="ID Santri" className="w-full p-2 border rounded" value={formKendaraan.santri_id} onChange={e => setFormKendaraan({...formKendaraan, santri_id: e.target.value})} />
                   <select className="w-full p-2 border rounded" value={formKendaraan.jenis} onChange={e => setFormKendaraan({...formKendaraan, jenis: e.target.value})}>
                     <option value="Motor">Motor</option>
                     <option value="Sepeda">Sepeda</option>
                   </select>
                   <input required type="text" placeholder="Merk Kendaraan" className="w-full p-2 border rounded" value={formKendaraan.merk} onChange={e => setFormKendaraan({...formKendaraan, merk: e.target.value})} />
                   {formKendaraan.jenis === "Motor" && (
                     <input required type="text" placeholder="Plat Nomor" className="w-full p-2 border rounded" value={formKendaraan.plat_nomor} onChange={e => setFormKendaraan({...formKendaraan, plat_nomor: e.target.value})} />
                   )}
                   <input required type="text" placeholder="Warna" className="w-full p-2 border rounded" value={formKendaraan.warna} onChange={e => setFormKendaraan({...formKendaraan, warna: e.target.value})} />
                 </>
               )}
               {activeTab === "elektronik" && (
                 <>
                   <input required type="number" placeholder="ID Santri" className="w-full p-2 border rounded" value={formElektronik.santri_id} onChange={e => setFormElektronik({...formElektronik, santri_id: e.target.value})} />
                   <select className="w-full p-2 border rounded" value={formElektronik.jenis} onChange={e => setFormElektronik({...formElektronik, jenis: e.target.value})}>
                     <option value="Laptop">Laptop</option>
                     <option value="HP">HP</option>
                     <option value="Flashdisk">Flashdisk</option>
                     <option value="Lainnya">Lainnya</option>
                   </select>
                   {formElektronik.jenis === "Lainnya" && (
                     <input required type="text" placeholder="Jenis Lainnya" className="w-full p-2 border rounded" value={formElektronik.detail_jenis} onChange={e => setFormElektronik({...formElektronik, detail_jenis: e.target.value})} />
                   )}
                   <input required type="text" placeholder="Merk" className="w-full p-2 border rounded" value={formElektronik.merk} onChange={e => setFormElektronik({...formElektronik, merk: e.target.value})} />
                   <input required type="text" placeholder="Kelengkapan (charger, tas, dll)" className="w-full p-2 border rounded" value={formElektronik.kelengkapan} onChange={e => setFormElektronik({...formElektronik, kelengkapan: e.target.value})} />
                   <input required type="text" placeholder="Warna" className="w-full p-2 border rounded" value={formElektronik.warna} onChange={e => setFormElektronik({...formElektronik, warna: e.target.value})} />
                 </>
               )}
               {activeTab === "kompor" && (
                 <>
                   <input required type="text" placeholder="Nama Pendaftar" className="w-full p-2 border rounded" value={formKompor.nama_pendaftar} onChange={e => setFormKompor({...formKompor, nama_pendaftar: e.target.value})} />
                   <input required type="text" placeholder="Kamar (Misal: DS A 01)" className="w-full p-2 border rounded" value={formKompor.kamar} onChange={e => setFormKompor({...formKompor, kamar: e.target.value})} />
                   <input required type="text" placeholder="Merk Kompor" className="w-full p-2 border rounded" value={formKompor.merk} onChange={e => setFormKompor({...formKompor, merk: e.target.value})} />
                   <select className="w-full p-2 border rounded" value={formKompor.jenis_tabung} onChange={e => setFormKompor({...formKompor, jenis_tabung: e.target.value})}>
                     <option value="Satu Tungku">Satu Tungku</option>
                     <option value="Dua Tungku">Dua Tungku</option>
                   </select>
                   <input required type="text" placeholder="Penempatan Area" className="w-full p-2 border rounded" value={formKompor.penempatan} onChange={e => setFormKompor({...formKompor, penempatan: e.target.value})} />
                   <input required type="text" placeholder="Warna" className="w-full p-2 border rounded" value={formKompor.warna} onChange={e => setFormKompor({...formKompor, warna: e.target.value})} />
                 </>
               )}
               {activeTab === "transaksi" && (
                 <>
                   <select className="w-full p-2 border rounded" value={formTransaksi.item_type} onChange={e => setFormTransaksi({...formTransaksi, item_type: e.target.value})}>
                     <option value="Kendaraan">Kendaraan</option>
                     <option value="Elektronik">Elektronik</option>
                   </select>
                   <input required type="number" placeholder="ID Item" className="w-full p-2 border rounded" value={formTransaksi.item_id} onChange={e => setFormTransaksi({...formTransaksi, item_id: e.target.value})} />
                 </>
               )}
               <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded mt-2 font-bold hover:bg-indigo-700">Simpan Registrasi</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
