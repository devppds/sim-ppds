"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Users, Award, Plus, Loader2, ClipboardList, Search, RefreshCw
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";

interface Santri {
  id: number;
  name: string;
  nisn: string;
  kelas: string;
  asrama: string;
}

interface PresensiWajar {
  id: number;
  nama: string;
  peran: "Siswa" | "Asatidz";
  kelas: string;
  tanggal: string;
  status: "Hadir" | "Izin" | "Sakit" | "Alfa";
  keterangan?: string;
}

interface UbudiyyahRecord {
  id: number;
  santri_id: number;
  santri_name?: string;
  santri_kelas?: string;
  santri_asrama?: string;
  kegiatan: string;
  tanggal: string;
  status: "Hadir" | "Absen" | "Terlambat";
  keterangan?: string;
}

export default function WajarPage() {
  const [activeTab, setActiveTab] = useState<"presensi" | "ubudiyyah">("presensi");
  const { showToast } = useToast();

  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [presensiList, setPresensiList] = useState<PresensiWajar[]>([]);
  const [ubudiyyahList, setUbudiyyahList] = useState<UbudiyyahRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isPresensiModalOpen, setIsPresensiModalOpen] = useState(false);
  const [isUbudiyyahModalOpen, setIsUbudiyyahModalOpen] = useState(false);

  // Form states
  const [presensiForm, setPresensiForm] = useState<{
    nama: string;
    peran: "Siswa" | "Asatidz";
    kelas: string;
    tanggal: string;
    status: "Hadir" | "Izin" | "Sakit" | "Alfa";
    keterangan: string;
  }>({
    nama: "",
    peran: "Siswa",
    kelas: "",
    tanggal: "",
    status: "Hadir",
    keterangan: ""
  });
  const [ubudiyyahForm, setUbudiyyahForm] = useState<{
    santri_id: string;
    kegiatan: string;
    tanggal: string;
    status: "Hadir" | "Absen" | "Terlambat";
    keterangan: string;
  }>({
    santri_id: "",
    kegiatan: "Subuh Ceria",
    tanggal: "",
    status: "Hadir",
    keterangan: ""
  });

  const fetchSantri = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/santri`);
      const json = await res.json() as { success: boolean; data: Santri[] };
      if (json.success) {
        setSantriList(json.data);
      }
    } catch {
      setSantriList([
        { id: 1, name: "Ahmad Fauzi Rahman", nisn: "1122334455", kelas: "Ibtida' 1", asrama: "DS A 01" },
        { id: 2, name: "Fatimah Az-Zahra", nisn: "2122334456", kelas: "Tsanawiyyah 2", asrama: "DS B 05" },
        { id: 3, name: "Muhammad Rizki Pratama", nisn: "3122334457", kelas: "Ula 2", asrama: "DS A 03" },
        { id: 4, name: "Siti Aminah", nisn: "4122334458", kelas: "Wustho 1", asrama: "DS C 10" },
        { id: 5, name: "Zulfikar Ali", nisn: "5122334459", kelas: "Aliyyah 3", asrama: "DS A 15" }
      ]);
    }
  }, []);

  const fetchWajarData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, uRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/wajar/presensi`),
        fetch(`${API_BASE_URL}/api/wajar/ubudiyyah`)
      ]);

      const pJson = await pRes.json() as { success: boolean; data: PresensiWajar[] };
      const uJson = await uRes.json() as { success: boolean; data: UbudiyyahRecord[] };

      if (pJson.success) setPresensiList(pJson.data);
      if (uJson.success) setUbudiyyahList(uJson.data);
    } catch {
      // Fallback
      setPresensiList([
        { id: 1, nama: "Ustadz H. Sholahuddin", peran: "Asatidz", kelas: "Ibtida' 2", tanggal: "2026-06-19", status: "Hadir", keterangan: "Mengajar kitab Safinatun Najah" },
        { id: 2, nama: "Ahmad Fauzi Rahman", peran: "Siswa", kelas: "Ibtida' 1", tanggal: "2026-06-19", status: "Hadir" },
        { id: 3, nama: "Fatimah Az-Zahra", peran: "Siswa", kelas: "Tsanawiyyah 2", tanggal: "2026-06-19", status: "Izin", keterangan: "Sakit demam ringan" }
      ]);
      setUbudiyyahList([
        { id: 1, santri_id: 1, santri_name: "Ahmad Fauzi Rahman", santri_kelas: "Ibtida' 1", santri_asrama: "DS A 01", kegiatan: "Subuh Ceria", tanggal: "2026-06-19", status: "Hadir" },
        { id: 2, santri_id: 3, santri_name: "Muhammad Rizki Pratama", santri_kelas: "Ula 2", santri_asrama: "DS A 03", kegiatan: "Subuh Ceria", tanggal: "2026-06-19", status: "Terlambat", keterangan: "Bangun kesiangan 5 menit" }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSantri();
      fetchWajarData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSantri, fetchWajarData]);

  // Actions
  const handleCreatePresensi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presensiForm.nama || !presensiForm.kelas) {
      showToast("Harap isi semua kolom wajib!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/wajar/presensi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(presensiForm)
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Kehadiran berhasil dicatat!", "success");
        setIsPresensiModalOpen(false);
        setPresensiForm({ nama: "", peran: "Siswa", kelas: "", tanggal: "", status: "Hadir", keterangan: "" });
        fetchWajarData();
      }
    } catch {
      const newItem: PresensiWajar = {
        id: Date.now(),
        ...presensiForm,
        tanggal: presensiForm.tanggal || new Date().toISOString().split('T')[0]
      };
      setPresensiList(prev => [newItem, ...prev]);
      showToast("Kehadiran dicatat (Lokal)!", "success");
      setIsPresensiModalOpen(false);
      setPresensiForm({ nama: "", peran: "Siswa", kelas: "", tanggal: "", status: "Hadir", keterangan: "" });
    }
  };

  const handleCreateUbudiyyah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ubudiyyahForm.santri_id || !ubudiyyahForm.kegiatan) {
      showToast("Harap isi semua kolom wajib!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/wajar/ubudiyyah`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ubudiyyahForm)
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Tracker ubudiyyah berhasil disimpan!", "success");
        setIsUbudiyyahModalOpen(false);
        setUbudiyyahForm({ santri_id: "", kegiatan: "Subuh Ceria", tanggal: "", status: "Hadir", keterangan: "" });
        fetchWajarData();
      }
    } catch {
      const matchSantri = santriList.find(s => s.id === parseInt(ubudiyyahForm.santri_id));
      const newItem: UbudiyyahRecord = {
        id: Date.now(),
        santri_id: parseInt(ubudiyyahForm.santri_id),
        santri_name: matchSantri?.name || "Unknown",
        santri_kelas: matchSantri?.kelas || "",
        santri_asrama: matchSantri?.asrama || "",
        kegiatan: ubudiyyahForm.kegiatan,
        tanggal: ubudiyyahForm.tanggal || new Date().toISOString().split('T')[0],
        status: ubudiyyahForm.status,
        keterangan: ubudiyyahForm.keterangan
      };
      setUbudiyyahList(prev => [newItem, ...prev]);
      showToast("Tracker ubudiyyah disimpan (Lokal)!", "success");
      setIsUbudiyyahModalOpen(false);
      setUbudiyyahForm({ santri_id: "", kegiatan: "Subuh Ceria", tanggal: "", status: "Hadir", keterangan: "" });
    }
  };

  const filteredPresensiList = presensiList.filter(p => 
    p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUbudiyyahList = ubudiyyahList.filter(u => 
    (u.santri_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Seksi Wajib Belajar (Wajar)</h1>
              <p className="text-sm text-slate-500 font-medium">Presensi Digital Harian Asatidz/Siswa & Tracker Ubudiyyah Santri</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={fetchWajarData}
              className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => activeTab === "presensi" ? setIsPresensiModalOpen(true) : setIsUbudiyyahModalOpen(true)} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>{activeTab === "presensi" ? "Catat Presensi Baru" : "Catat Ubudiyyah"}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl max-w-fit">
          <button
            onClick={() => setActiveTab("presensi")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "presensi" 
                ? "bg-white text-emerald-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Presensi Madrasah Wajar
          </button>
          <button
            onClick={() => setActiveTab("ubudiyyah")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "ubudiyyah" 
                ? "bg-white text-emerald-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Tracker Ubudiyyah (Subuh Ceria)
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "presensi" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">Presensi Kehadiran Kelas (Madrasah Wajar)</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Cari data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
                  <p className="text-xs font-medium">Memuat presensi Wajar...</p>
                </div>
              ) : filteredPresensiList.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Tidak ada data presensi
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-xs text-slate-500 font-bold uppercase text-left">
                      <th className="px-6 py-4">Nama</th>
                      <th className="px-6 py-4">Peran</th>
                      <th className="px-6 py-4">Kelas</th>
                      <th className="px-6 py-4">Tanggal</th>
                      <th className="px-6 py-4">Status Kehadiran</th>
                      <th className="px-6 py-4">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPresensiList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{p.nama}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                            p.peran === "Asatidz" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                          }`}>
                            {p.peran}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{p.kelas}</td>
                        <td className="px-6 py-4 text-slate-500">{p.tanggal}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                            p.status === "Hadir" ? "bg-emerald-50 text-emerald-600" :
                            p.status === "Izin" ? "bg-blue-50 text-blue-600" :
                            p.status === "Sakit" ? "bg-amber-50 text-amber-600" :
                            "bg-rose-50 text-rose-600"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 italic">
                          {p.keterangan || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "ubudiyyah" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">Tracker Kegiatan Ubudiyyah Santri (Subuh Ceria)</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Cari data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-4" />
                  <p className="text-xs font-medium">Memuat tracker ubudiyyah...</p>
                </div>
              ) : filteredUbudiyyahList.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Tidak ada catatan ubudiyyah
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-xs text-slate-500 font-bold uppercase text-left">
                      <th className="px-6 py-4">Santri</th>
                      <th className="px-6 py-4">Kegiatan</th>
                      <th className="px-6 py-4">Tanggal</th>
                      <th className="px-6 py-4">Status Kehadiran</th>
                      <th className="px-6 py-4">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUbudiyyahList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{u.santri_name}</div>
                          <div className="text-xs text-slate-400 mt-1">{u.santri_kelas} | {u.santri_asrama}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-semibold">{u.kegiatan}</td>
                        <td className="px-6 py-4 text-slate-500">{u.tanggal}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                            u.status === "Hadir" ? "bg-emerald-50 text-emerald-600" :
                            u.status === "Terlambat" ? "bg-amber-50 text-amber-600" :
                            "bg-rose-50 text-rose-600"
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 italic">
                          {u.keterangan || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Presensi Form Modal */}
      {isPresensiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreatePresensi} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-emerald-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Catat Kehadiran Baru</h3>
              <button type="button" onClick={() => setIsPresensiModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={presensiForm.nama}
                  onChange={(e) => setPresensiForm(prev => ({ ...prev, nama: e.target.value }))}
                  placeholder="Contoh: Ustadz Ahmad, Rizki Pratama"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peran</label>
                  <select 
                    value={presensiForm.peran}
                    onChange={(e) => setPresensiForm(prev => ({ ...prev, peran: e.target.value as "Siswa" | "Asatidz" }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Siswa">Siswa</option>
                    <option value="Asatidz">Asatidz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kelas</label>
                  <input 
                    type="text" 
                    value={presensiForm.kelas}
                    onChange={(e) => setPresensiForm(prev => ({ ...prev, kelas: e.target.value }))}
                    placeholder="Contoh: Ibtida' 1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Kehadiran</label>
                  <select 
                    value={presensiForm.status}
                    onChange={(e) => setPresensiForm(prev => ({ ...prev, status: e.target.value as "Hadir" | "Izin" | "Sakit" | "Alfa" }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alfa">Alfa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                  <input 
                    type="date" 
                    value={presensiForm.tanggal}
                    onChange={(e) => setPresensiForm(prev => ({ ...prev, tanggal: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keterangan</label>
                <input 
                  type="text" 
                  value={presensiForm.keterangan}
                  onChange={(e) => setPresensiForm(prev => ({ ...prev, keterangan: e.target.value }))}
                  placeholder="Keterangan (opsional)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsPresensiModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 text-xs">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* Ubudiyyah Form Modal */}
      {isUbudiyyahModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateUbudiyyah} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-teal-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Catat Kegiatan Ubudiyyah</h3>
              <button type="button" onClick={() => setIsUbudiyyahModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Santri</label>
                <select 
                  value={ubudiyyahForm.santri_id}
                  onChange={(e) => setUbudiyyahForm(prev => ({ ...prev, santri_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="">-- Pilih Santri --</option>
                  {santriList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.kelas})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Kegiatan</label>
                <select 
                  value={ubudiyyahForm.kegiatan}
                  onChange={(e) => setUbudiyyahForm(prev => ({ ...prev, kegiatan: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="Subuh Ceria">Subuh Ceria</option>
                  <option value="Shalat Jamaah Maghrib">Shalat Jamaah Maghrib</option>
                  <option value="Shalat Jamaah Isya">Shalat Jamaah Isya</option>
                  <option value="Kajian Dzikir Harian">Kajian Dzikir Harian</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Kehadiran</label>
                  <select 
                    value={ubudiyyahForm.status}
                    onChange={(e) => setUbudiyyahForm(prev => ({ ...prev, status: e.target.value as "Hadir" | "Absen" | "Terlambat" }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Absen">Absen</option>
                    <option value="Terlambat">Terlambat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                  <input 
                    type="date" 
                    value={ubudiyyahForm.tanggal}
                    onChange={(e) => setUbudiyyahForm(prev => ({ ...prev, tanggal: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan / Keterangan</label>
                <input 
                  type="text" 
                  value={ubudiyyahForm.keterangan}
                  onChange={(e) => setUbudiyyahForm(prev => ({ ...prev, keterangan: e.target.value }))}
                  placeholder="Contoh: Terlambat masbuq 1 rakaat"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsUbudiyyahModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 text-xs">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
