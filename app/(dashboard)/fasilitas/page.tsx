"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Wrench, Calendar, Clock, MapPin, Plus, 
  CheckCircle2, XCircle, Loader2 
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";

interface Ticket {
  id: number;
  pelapor: string;
  lokasi: string;
  deskripsi: string;
  kategori: "Listrik" | "Air" | "Gedung" | "Lainnya";
  prioritas: "Rendah" | "Sedang" | "Tinggi";
  status: "Menunggu" | "Diproses" | "Selesai";
  petugas?: string;
  created_at?: string;
}

interface MasjidBooking {
  id: number;
  nama_kegiatan: string;
  pemohon: string;
  waktu_mulai: string;
  waktu_selesai: string;
  status: "Diajukan" | "Disetujui" | "Ditolak";
  keterangan?: string;
}

interface JadwalPetugas {
  id: number;
  hari: string;
  waktu: string;
  imam: string;
  muadzin: string;
  keterangan?: string;
}

export default function FasilitasPage() {
  const [activeTab, setActiveTab] = useState<"tickets" | "bookings" | "jadwal">("tickets");
  const { showToast } = useToast();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [bookings, setBookings] = useState<MasjidBooking[]>([]);
  const [jadwal, setJadwal] = useState<JadwalPetugas[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isJadwalModalOpen, setIsJadwalModalOpen] = useState(false);

  // Form states
  const [ticketForm, setTicketForm] = useState<{
    pelapor: string;
    lokasi: string;
    deskripsi: string;
    kategori: "Listrik" | "Air" | "Gedung" | "Lainnya";
    prioritas: "Rendah" | "Sedang" | "Tinggi";
  }>({
    pelapor: "",
    lokasi: "",
    deskripsi: "",
    kategori: "Lainnya",
    prioritas: "Sedang"
  });
  const [bookingForm, setBookingForm] = useState({ nama_kegiatan: "", pemohon: "", waktu_mulai: "", waktu_selesai: "", keterangan: "" });
  const [jadwalForm, setJadwalForm] = useState({ hari: "Senin", waktu: "Subuh", imam: "", muadzin: "", keterangan: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, bRes, jRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/fasilitas/tickets`),
        fetch(`${API_BASE_URL}/api/fasilitas/bookings`),
        fetch(`${API_BASE_URL}/api/fasilitas/jadwal`)
      ]);

      const tJson = await tRes.json() as { success: boolean; data: Ticket[] };
      const bJson = await bRes.json() as { success: boolean; data: MasjidBooking[] };
      const jJson = await jRes.json() as { success: boolean; data: JadwalPetugas[] };

      if (tJson.success) setTickets(tJson.data);
      if (bJson.success) setBookings(bJson.data);
      if (jJson.success) setJadwal(jJson.data);
    } catch {
      // Fallback
      setTickets([
        { id: 1, pelapor: "Mustahiq Blok A", lokasi: "Kamar Mandi Asrama A Lantai 1", deskripsi: "Keran air wastafel pecah, air meluap ke koridor", kategori: "Air", prioritas: "Tinggi", status: "Menunggu" },
        { id: 2, pelapor: "Ustadz Yusuf", lokasi: "Gedung Madrasah Kelas VII-B", deskripsi: "Kipas angin gantung korslet & berasap ketika dinyalakan", kategori: "Listrik", prioritas: "Tinggi", status: "Diproses", petugas: "Pak Sholeh PLP" },
        { id: 3, pelapor: "Takmir Masjid", lokasi: "Serambi Belakang Masjid", deskripsi: "Genteng bocor saat hujan deras", kategori: "Gedung", prioritas: "Sedang", status: "Selesai", petugas: "Pak Slamet PLP" }
      ]);
      setBookings([
        { id: 1, nama_kegiatan: "Manaqib Kubro Bulanan", pemohon: "Jam'iyyah Santri", waktu_mulai: "2026-06-25 19:30", waktu_selesai: "2026-06-25 22:30", status: "Disetujui", keterangan: "Estimasi 500 santri hadir" },
        { id: 2, nama_kegiatan: "Rapat Pleno Pengurus", pemohon: "Sekretaris I", waktu_mulai: "2026-06-28 09:00", waktu_selesai: "2026-06-28 12:00", status: "Diajukan" }
      ]);
      setJadwal([
        { id: 1, hari: "Jumat", waktu: "Jumat", imam: "KH. Anwar Manshur", muadzin: "Kang Ridho", keterangan: "Khotib: KH. Abdullah Kafabihi Mahrus" },
        { id: 2, hari: "Sabtu", waktu: "Maghrib", imam: "Ustadz H. Mahrus", muadzin: "Kang Thoha" }
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
  const handleUpdateTicket = async (id: number, status: "Diproses" | "Selesai", petugas: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/fasilitas/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, petugas })
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Status perbaikan diperbarui!", "success");
        fetchData();
      }
    } catch {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status, petugas } : t));
      showToast("Status tiket diperbarui (Lokal)!", "success");
    }
  };

  const handleUpdateBooking = async (id: number, status: "Disetujui" | "Ditolak") => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/fasilitas/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Booking masjid diperbarui!", "success");
        fetchData();
      }
    } catch {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      showToast("Booking diperbarui (Lokal)!", "success");
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.pelapor || !ticketForm.lokasi || !ticketForm.deskripsi) {
      showToast("Semua kolom wajib diisi!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/fasilitas/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketForm)
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Tiket kerusakan dilaporkan!", "success");
        setIsTicketModalOpen(false);
        setTicketForm({ pelapor: "", lokasi: "", deskripsi: "", kategori: "Lainnya", prioritas: "Sedang" });
        fetchData();
      }
    } catch {
      const newItem: Ticket = {
        id: Date.now(),
        ...ticketForm,
        status: "Menunggu"
      };
      setTickets(prev => [newItem, ...prev]);
      showToast("Laporan kerusakan dikirim (Lokal)!", "success");
      setIsTicketModalOpen(false);
      setTicketForm({ pelapor: "", lokasi: "", deskripsi: "", kategori: "Lainnya", prioritas: "Sedang" });
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.nama_kegiatan || !bookingForm.pemohon || !bookingForm.waktu_mulai || !bookingForm.waktu_selesai) {
      showToast("Data wajib diisi!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/fasilitas/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingForm)
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Booking masjid diajukan!", "success");
        setIsBookingModalOpen(false);
        setBookingForm({ nama_kegiatan: "", pemohon: "", waktu_mulai: "", waktu_selesai: "", keterangan: "" });
        fetchData();
      }
    } catch {
      const newItem: MasjidBooking = {
        id: Date.now(),
        ...bookingForm,
        status: "Diajukan"
      };
      setBookings(prev => [newItem, ...prev]);
      showToast("Booking diajukan (Lokal)!", "success");
      setIsBookingModalOpen(false);
      setBookingForm({ nama_kegiatan: "", pemohon: "", waktu_mulai: "", waktu_selesai: "", keterangan: "" });
    }
  };

  const handleCreateJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jadwalForm.imam || !jadwalForm.muadzin) {
      showToast("Data wajib diisi!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/fasilitas/jadwal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jadwalForm)
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Jadwal petugas disimpan!", "success");
        setIsJadwalModalOpen(false);
        setJadwalForm({ hari: "Senin", waktu: "Subuh", imam: "", muadzin: "", keterangan: "" });
        fetchData();
      }
    } catch {
      const newItem: JadwalPetugas = {
        id: Date.now(),
        ...jadwalForm
      };
      setJadwal(prev => [...prev, newItem]);
      showToast("Jadwal petugas disimpan (Lokal)!", "success");
      setIsJadwalModalOpen(false);
      setJadwalForm({ hari: "Senin", waktu: "Subuh", imam: "", muadzin: "", keterangan: "" });
    }
  };

  return (
    <>
      <div className="fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Wrench className="w-7 h-7 text-indigo-600" /> Fasilitas & Infrastruktur
            </h1>
            <p className="text-sm text-slate-500 mt-1">Ticketing Sarpras PLP, Booking Masjid, & Jadwal Petugas Takmir</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide border-b border-slate-200">
          <button 
            onClick={() => setActiveTab("tickets")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "tickets" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Wrench className="w-4 h-4" /> Tiket Perbaikan Sarpras
          </button>
          <button 
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "bookings" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Calendar className="w-4 h-4" /> E-Booking Masjid
          </button>
          <button 
            onClick={() => setActiveTab("jadwal")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "jadwal" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Clock className="w-4 h-4" /> Jadwal Petugas Masjid
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "tickets" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Tiket Pelaporan & Perbaikan</h2>
              <button onClick={() => setIsTicketModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-all">
                <Plus className="w-4 h-4" /> Laporkan Kerusakan
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                  <p className="text-xs font-medium">Memuat data sarpras...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Tidak ada tiket pelaporan
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-xs text-slate-500 font-bold uppercase text-left">
                      <th className="px-6 py-4">Pelapor / Lokasi</th>
                      <th className="px-6 py-4">Deskripsi Kerusakan</th>
                      <th className="px-6 py-4">Prioritas / Kategori</th>
                      <th className="px-6 py-4">Petugas</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tickets.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{t.pelapor}</div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-indigo-500" /> {t.lokasi}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 max-w-sm">{t.deskripsi}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              t.prioritas === "Tinggi" ? "bg-rose-50 text-rose-600" :
                              t.prioritas === "Sedang" ? "bg-amber-50 text-amber-600" :
                              "bg-slate-50 text-slate-600"
                            }`}>
                              {t.prioritas}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">{t.kategori}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{t.petugas || "Belum Ditugaskan"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                            t.status === "Menunggu" ? "bg-amber-50 text-amber-600" :
                            t.status === "Diproses" ? "bg-indigo-50 text-indigo-600 animate-pulse" :
                            "bg-emerald-50 text-emerald-600"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {t.status === "Menunggu" && (
                            <button onClick={() => handleUpdateTicket(t.id, "Diproses", "Petugas PLP")} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-indigo-700 transition-all">
                              Proses
                            </button>
                          )}
                          {t.status === "Diproses" && (
                            <button onClick={() => handleUpdateTicket(t.id, "Selesai", t.petugas || "Petugas PLP")} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-emerald-700 transition-all">
                              Selesai
                            </button>
                          )}
                          {t.status === "Selesai" && (
                            <span className="text-xs text-slate-400">Terselesaikan</span>
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

        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Booking / Penggunaan Aula Masjid</h2>
              <button onClick={() => setIsBookingModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-all">
                <Plus className="w-4 h-4" /> Ajukan Booking Masjid
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                  <p className="text-xs font-medium">Memuat data booking...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Tidak ada pengajuan booking masjid
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-xs text-slate-500 font-bold uppercase text-left">
                      <th className="px-6 py-4">Nama Kegiatan</th>
                      <th className="px-6 py-4">Pemohon</th>
                      <th className="px-6 py-4">Waktu Mulai - Selesai</th>
                      <th className="px-6 py-4">Keterangan</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{b.nama_kegiatan}</td>
                        <td className="px-6 py-4 text-slate-600">{b.pemohon}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <div>{b.waktu_mulai}</div>
                          <div className="text-xs text-indigo-500 font-semibold mt-0.5">s/d {b.waktu_selesai}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 italic">&quot;{b.keterangan || '-'}&quot;</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                            b.status === "Diajukan" ? "bg-amber-50 text-amber-600" :
                            b.status === "Disetujui" ? "bg-emerald-50 text-emerald-600" :
                            "bg-rose-50 text-rose-600"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {b.status === "Diajukan" && (
                            <div className="flex gap-2">
                              <button onClick={() => handleUpdateBooking(b.id, "Disetujui")} className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> ACC
                              </button>
                              <button onClick={() => handleUpdateBooking(b.id, "Ditolak")} className="px-2.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-all flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Tolak
                              </button>
                            </div>
                          )}
                          {b.status !== "Diajukan" && (
                            <span className="text-xs text-slate-400">Selesai Diproses</span>
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

        {activeTab === "jadwal" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Jadwal Imam & Muadzin Masjid Darussalam</h2>
              <button onClick={() => setIsJadwalModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition-all">
                <Plus className="w-4 h-4" /> Atur Jadwal Petugas
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white border border-slate-100 rounded-2xl">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
                <p className="text-xs font-medium">Memuat jadwal masjid...</p>
              </div>
            ) : jadwal.length === 0 ? (
              <div className="text-center py-20 text-slate-400 text-xs bg-white border border-slate-100 rounded-2xl">
                Belum ada jadwal petugas masjid
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jadwal.map((j) => (
                  <div key={j.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs relative hover:shadow-sm transition-all flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-md bg-emerald-50 text-emerald-600">
                        {j.hari}
                      </span>
                      <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                        Waktu: {j.waktu}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="text-sm font-bold text-slate-800">Imam: <span className="font-medium text-slate-600">{j.imam}</span></div>
                      <div className="text-sm font-bold text-slate-800">Muadzin: <span className="font-medium text-slate-600">{j.muadzin}</span></div>
                      <p className="text-xs text-slate-400 italic mt-2">&quot;{j.keterangan || '-'}&quot;</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ticket Form Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateTicket} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Laporkan Kerusakan</h3>
              <button type="button" onClick={() => setIsTicketModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Pelapor</label>
                <input 
                  type="text" 
                  value={ticketForm.pelapor}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, pelapor: e.target.value }))}
                  placeholder="Contoh: Pengurus Kamar A-2"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lokasi Detail</label>
                <input 
                  type="text" 
                  value={ticketForm.lokasi}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, lokasi: e.target.value }))}
                  placeholder="Contoh: Kamar Mandi Belakang Blok C"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Kerusakan</label>
                <textarea 
                  value={ticketForm.deskripsi}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                  placeholder="Jelaskan jenis kerusakan sarpras..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori</label>
                  <select 
                    value={ticketForm.kategori}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, kategori: e.target.value as "Listrik" | "Air" | "Gedung" | "Lainnya" }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Listrik">Listrik</option>
                    <option value="Air">Air</option>
                    <option value="Gedung">Gedung</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prioritas</label>
                  <select 
                    value={ticketForm.prioritas}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, prioritas: e.target.value as "Rendah" | "Sedang" | "Tinggi" }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Rendah">Rendah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Tinggi">Tinggi</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsTicketModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-xs">Laporkan</button>
            </div>
          </form>
        </div>
      )}

      {/* Booking Form Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateBooking} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Ajukan Booking Masjid</h3>
              <button type="button" onClick={() => setIsBookingModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Kegiatan</label>
                <input 
                  type="text" 
                  value={bookingForm.nama_kegiatan}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, nama_kegiatan: e.target.value }))}
                  placeholder="Contoh: Maulid Nabi & Sholawatan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pemohon (Seksi/Lembaga)</label>
                <input 
                  type="text" 
                  value={bookingForm.pemohon}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, pemohon: e.target.value }))}
                  placeholder="Contoh: Seksi Ubudiyyah"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Waktu Mulai</label>
                  <input 
                    type="datetime-local" 
                    value={bookingForm.waktu_mulai}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, waktu_mulai: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Waktu Selesai</label>
                  <input 
                    type="datetime-local" 
                    value={bookingForm.waktu_selesai}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, waktu_selesai: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keterangan</label>
                <input 
                  type="text" 
                  value={bookingForm.keterangan}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, keterangan: e.target.value }))}
                  placeholder="Keterangan singkat acara..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsBookingModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-xs">Ajukan</button>
            </div>
          </form>
        </div>
      )}

      {/* Jadwal Form Modal */}
      {isJadwalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateJadwal} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-emerald-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Atur Petugas Masjid</h3>
              <button type="button" onClick={() => setIsJadwalModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hari</label>
                  <select 
                    value={jadwalForm.hari}
                    onChange={(e) => setJadwalForm(prev => ({ ...prev, hari: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                    <option value="Ahad">Ahad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Waktu Shalat</label>
                  <select 
                    value={jadwalForm.waktu}
                    onChange={(e) => setJadwalForm(prev => ({ ...prev, waktu: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Subuh">Subuh</option>
                    <option value="Dzuhur">Dzuhur</option>
                    <option value="Ashar">Ashar</option>
                    <option value="Maghrib">Maghrib</option>
                    <option value="Isya">Isya</option>
                    <option value="Jumat">Jumat (Khotib)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Imam</label>
                <input 
                  type="text" 
                  value={jadwalForm.imam}
                  onChange={(e) => setJadwalForm(prev => ({ ...prev, imam: e.target.value }))}
                  placeholder="Nama Imam Shalat"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Muadzin</label>
                <input 
                  type="text" 
                  value={jadwalForm.muadzin}
                  onChange={(e) => setJadwalForm(prev => ({ ...prev, muadzin: e.target.value }))}
                  placeholder="Nama Muadzin Shalat"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keterangan</label>
                <input 
                  type="text" 
                  value={jadwalForm.keterangan}
                  onChange={(e) => setJadwalForm(prev => ({ ...prev, keterangan: e.target.value }))}
                  placeholder="Contoh: Khotib luar kota"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsJadwalModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 text-xs">Simpan Jadwal</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

