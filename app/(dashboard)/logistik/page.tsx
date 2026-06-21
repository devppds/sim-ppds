"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Package, CheckSquare, Plus, Loader2, RefreshCw, Search 
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";

interface EquipmentBooking {
  id: number;
  nama_kegiatan: string;
  perlengkapan: string;
  peminjam: string;
  tgl_pinjam: string;
  tgl_kembali: string;
  status: "Diajukan" | "Disetujui" | "Selesai";
}

interface HygieneChecklist {
  id: number;
  area: string;
  petugas: string;
  status_kebersihan: "Bersih" | "Kotor" | "Sangat Kotor";
  tanggal: string;
  catatan?: string;
}

export default function LogistikPage() {
  const [activeTab, setActiveTab] = useState<"bookings" | "hygiene">("bookings");
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const [bookings, setBookings] = useState<EquipmentBooking[]>([]);
  const [checklist, setChecklist] = useState<HygieneChecklist[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isHygieneModalOpen, setIsHygieneModalOpen] = useState(false);

  // Form states
  const [bookingForm, setBookingForm] = useState({ nama_kegiatan: "", perlengkapan: "", peminjam: "", tgl_pinjam: "", tgl_kembali: "" });
  const [hygieneForm, setHygieneForm] = useState<{
    area: string;
    petugas: string;
    status_kebersihan: "Bersih" | "Kotor" | "Sangat Kotor";
    tanggal: string;
    catatan: string;
  }>({
    area: "Masjid Utama",
    petugas: "",
    status_kebersihan: "Bersih",
    tanggal: "",
    catatan: ""
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, hRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/logistik/bookings`),
        fetch(`${API_BASE_URL}/api/logistik/kebersihan`)
      ]);

      const bJson = await bRes.json() as { success: boolean; data: EquipmentBooking[] };
      const hJson = await hRes.json() as { success: boolean; data: HygieneChecklist[] };

      if (bJson.success) setBookings(bJson.data);
      if (hJson.success) setChecklist(hJson.data);
    } catch {
      // Fallback
      setBookings([
        { id: 1, nama_kegiatan: "Seminar Kebangsaan", perlengkapan: "Sound System Portabel, 3 Mic, 100 Kursi Lipat, LCD Proyektor", peminjam: "Seksi Humasy", tgl_pinjam: "2026-06-21", tgl_kembali: "2026-06-22", status: "Disetujui" },
        { id: 2, nama_kegiatan: "Kajian Rutin Malam Jumat", perlengkapan: "Karpet Merah 5 Roll, Sound System Masjid, 2 Mic", peminjam: "Seksi Jam'iyyah", tgl_pinjam: "2026-06-24", tgl_kembali: "2026-06-25", status: "Diajukan" }
      ]);
      setChecklist([
        { id: 1, area: "Masjid Utama", petugas: "Kang Ahmad Kebersihan", status_kebersihan: "Bersih", tanggal: "2026-06-19", catatan: "Kaca jendela depan dibersihkan" },
        { id: 2, area: "Kamar Mandi Asrama B", petugas: "Kang Thohir Kebersihan", status_kebersihan: "Kotor", tanggal: "2026-06-19", catatan: "Saluran air tersumbat plastik" }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // Actions
  const handleUpdateBookingStatus = async (id: number, status: "Disetujui" | "Selesai") => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logistik/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Status pinjaman diperbarui!", "success");
        fetchData();
      }
    } catch {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      showToast("Booking diperbarui (Lokal)!", "success");
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.nama_kegiatan || !bookingForm.perlengkapan || !bookingForm.peminjam || !bookingForm.tgl_pinjam || !bookingForm.tgl_kembali) {
      showToast("Harap isi semua kolom!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/logistik/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingForm)
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Booking perlengkapan berhasil diajukan!", "success");
        setIsBookingModalOpen(false);
        setBookingForm({ nama_kegiatan: "", perlengkapan: "", peminjam: "", tgl_pinjam: "", tgl_kembali: "" });
        fetchData();
      }
    } catch {
      const newItem: EquipmentBooking = {
        id: Date.now(),
        ...bookingForm,
        status: "Diajukan"
      };
      setBookings(prev => [newItem, ...prev]);
      showToast("Booking perlengkapan diajukan (Lokal)!", "success");
      setIsBookingModalOpen(false);
      setBookingForm({ nama_kegiatan: "", perlengkapan: "", peminjam: "", tgl_pinjam: "", tgl_kembali: "" });
    }
  };

  const handleCreateHygiene = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hygieneForm.petugas || !hygieneForm.area) {
      showToast("Petugas wajib diisi!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/logistik/kebersihan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hygieneForm)
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Audit kebersihan berhasil dicatat!", "success");
        setIsHygieneModalOpen(false);
        setHygieneForm({ area: "Masjid", petugas: "", status_kebersihan: "Bersih", tanggal: "", catatan: "" });
        fetchData();
      }
    } catch {
      const newItem: HygieneChecklist = {
        id: Date.now(),
        ...hygieneForm,
        tanggal: hygieneForm.tanggal || new Date().toISOString().split('T')[0]
      };
      setChecklist(prev => [newItem, ...prev]);
      showToast("Audit kebersihan dicatat (Lokal)!", "success");
      setIsHygieneModalOpen(false);
      setHygieneForm({ area: "Masjid", petugas: "", status_kebersihan: "Bersih", tanggal: "", catatan: "" });
    }
  };

  const getAddBtnConfig = () => {
    switch (activeTab) {
      case "bookings":
        return { label: "Pinjam Barang", action: () => setIsBookingModalOpen(true), bg: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20" };
      case "hygiene":
        return { label: "Catat Audit Baru", action: () => setIsHygieneModalOpen(true), bg: "bg-teal-600 hover:bg-teal-700 shadow-teal-500/20" };
    }
  };

  const addBtn = getAddBtnConfig();

  const filteredBookings = bookings.filter(b => 
    (b.nama_kegiatan || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.perlengkapan || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.peminjam || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.status || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChecklist = checklist.filter(c => 
    (c.area || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.petugas || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.catatan || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.status_kebersihan || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Logistik & Kebersihan</h1>
              <p className="text-sm text-slate-500 font-medium">Booking Perlengkapan Kegiatan Pondok & Checklist Kebersihan Harian</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={fetchData}
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={addBtn.action} 
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-95 ${addBtn.bg}`}
            >
              <Plus className="w-5 h-5" />
              <span>{addBtn.label}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl max-w-fit overflow-x-auto">
          <button
            onClick={() => { setActiveTab("bookings"); setSearchQuery(""); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "bookings" 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Booking Perlengkapan
          </button>
          <button
            onClick={() => { setActiveTab("hygiene"); setSearchQuery(""); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "hygiene" 
                ? "bg-white text-teal-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Hygiene Tracker
          </button>
        </div>

        {/* Contents */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">Pinjam Perlengkapan / Inventaris</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Cari data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                  <p className="text-xs font-medium">Memuat data booking logistik...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Tidak ada booking perlengkapan
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-xs text-slate-500 font-bold uppercase text-left">
                      <th className="px-6 py-4">Nama Kegiatan / Peminjam</th>
                      <th className="px-6 py-4">Perlengkapan yang Dipinjam</th>
                      <th className="px-6 py-4">Durasi Pinjam</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{b.nama_kegiatan}</div>
                          <div className="text-xs text-slate-400 mt-1">Oleh: {b.peminjam}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 max-w-md">{b.perlengkapan}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <div>Pinjam: {b.tgl_pinjam}</div>
                          <div className="text-xs text-rose-500 font-semibold mt-0.5">Kembali: {b.tgl_kembali}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                            b.status === "Diajukan" ? "bg-amber-50 text-amber-600" :
                            b.status === "Disetujui" ? "bg-blue-50 text-blue-600" :
                            "bg-emerald-50 text-emerald-600"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {b.status === "Diajukan" && (
                            <button onClick={() => handleUpdateBookingStatus(b.id, "Disetujui")} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1 shadow-xs">
                              Setujui
                            </button>
                          )}
                          {b.status === "Disetujui" && (
                            <button onClick={() => handleUpdateBookingStatus(b.id, "Selesai")} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1 shadow-xs">
                              Kembali
                            </button>
                          )}
                          {b.status === "Selesai" && (
                            <span className="text-xs text-slate-400">Telah Kembali</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "hygiene" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">Checklist Kebersihan & Hygiene Pondok</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Cari data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-4" />
                  <p className="text-xs font-medium">Memuat audit kebersihan...</p>
                </div>
              ) : filteredChecklist.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Belum ada audit kebersihan tercatat
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-xs text-slate-500 font-bold uppercase text-left">
                      <th className="px-6 py-4">Area Audit</th>
                      <th className="px-6 py-4">Petugas Kebersihan</th>
                      <th className="px-6 py-4">Tanggal Audit</th>
                      <th className="px-6 py-4">Status Kebersihan</th>
                      <th className="px-6 py-4">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredChecklist.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{c.area}</td>
                        <td className="px-6 py-4 text-slate-600">{c.petugas}</td>
                        <td className="px-6 py-4 text-slate-500">{c.tanggal}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                            c.status_kebersihan === "Bersih" ? "bg-emerald-50 text-emerald-600" :
                            c.status_kebersihan === "Kotor" ? "bg-amber-50 text-amber-600" :
                            "bg-rose-50 text-rose-600 animate-pulse"
                          }`}>
                            {c.status_kebersihan}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 italic">&quot;{c.catatan || '-'}&quot;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateBooking} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Pinjam Perlengkapan</h3>
              <button type="button" onClick={() => setIsBookingModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Kegiatan</label>
                <input 
                  type="text" 
                  value={bookingForm.nama_kegiatan}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, nama_kegiatan: e.target.value }))}
                  placeholder="Contoh: Maulid Akbar Masjid"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">List Perlengkapan</label>
                <textarea 
                  value={bookingForm.perlengkapan}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, perlengkapan: e.target.value }))}
                  placeholder="Masukkan list barang (contoh: 2 sound system, 50 kursi, LCD)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden h-20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Peminjam / Seksi</label>
                <input 
                  type="text" 
                  value={bookingForm.peminjam}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, peminjam: e.target.value }))}
                  placeholder="Contoh: Seksi Keamanan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Pinjam</label>
                  <input 
                    type="date" 
                    value={bookingForm.tgl_pinjam}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, tgl_pinjam: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Kembali</label>
                  <input 
                    type="date" 
                    value={bookingForm.tgl_kembali}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, tgl_kembali: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsBookingModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-xs">Ajukan Pinjam</button>
            </div>
          </form>
        </div>
      )}

      {/* Hygiene Form Modal */}
      {isHygieneModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateHygiene} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-teal-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Catat Audit Kebersihan</h3>
              <button type="button" onClick={() => setIsHygieneModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Area Audit</label>
                <select 
                  value={hygieneForm.area}
                  onChange={(e) => setHygieneForm(prev => ({ ...prev, area: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="Masjid Utama">Masjid Utama</option>
                  <option value="Kamar Mandi Asrama A">Kamar Mandi Asrama A</option>
                  <option value="Kamar Mandi Asrama B">Kamar Mandi Asrama B</option>
                  <option value="Dapur Umum">Dapur Umum</option>
                  <option value="Halaman Depan">Halaman Depan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Petugas Pemeriksa</label>
                <input 
                  type="text" 
                  value={hygieneForm.petugas}
                  onChange={(e) => setHygieneForm(prev => ({ ...prev, petugas: e.target.value }))}
                  placeholder="Contoh: Kang Sholeh Kebersihan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Kebersihan</label>
                  <select 
                    value={hygieneForm.status_kebersihan}
                    onChange={(e) => setHygieneForm(prev => ({ ...prev, status_kebersihan: e.target.value as "Bersih" | "Kotor" | "Sangat Kotor" }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Bersih">Bersih</option>
                    <option value="Kotor">Kotor</option>
                    <option value="Sangat Kotor">Sangat Kotor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Audit</label>
                  <input 
                    type="date" 
                    value={hygieneForm.tanggal}
                    onChange={(e) => setHygieneForm(prev => ({ ...prev, tanggal: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan Kebersihan</label>
                <input 
                  type="text" 
                  value={hygieneForm.catatan}
                  onChange={(e) => setHygieneForm(prev => ({ ...prev, catatan: e.target.value }))}
                  placeholder="Keterangan kondisi toilet, sampah, dll."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsHygieneModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 text-xs">Simpan Audit</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

