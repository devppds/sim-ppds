"use client";

import { useEffect, useState, useCallback } from "react";
import SectionDashboardCards, { DashboardCardConfig } from "@/components/SectionDashboardCards";
import { 
  BookOpen, UserCheck, Plus, CheckCircle, 
  XCircle, MessageSquare, GraduationCap, Clock, Loader2, Search, RefreshCw 
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";
import { DataTable } from "@/components/DataTable";
import SearchableSantriSelect from "@/components/SearchableSantriSelect";

interface Santri {
  id: number;
  name: string;
  nisn: string;
  kelas: string;
  asrama: string;
}

interface JadwalPengajian {
  id: number;
  kitab: string;
  ustadz: string;
  hari: string;
  waktu: string;
  lokasi?: string;
  keterangan?: string;
}

interface IzinSekolah {
  id: number;
  santri_id: number;
  santri_name?: string;
  santri_nisn?: string;
  santri_kelas?: string;
  santri_asrama?: string;
  keperluan: string; // "Sekolah: SMA Lirboyo (Ujian Nasional)"
  tgl_mulai: string;
  tgl_kembali: string;
  status: "Diajukan" | "Disetujui" | "Keluar" | "Kembali" | "Terlambat" | "Ditolak";
}

interface BimbinganLog {
  id: number;
  santri_id: number;
  santri_name?: string;
  santri_kelas?: string;
  santri_asrama?: string;
  keluhan: string;
  solusi?: string;
  pembimbing: string;
  tanggal: string;
}

export default function PendidikanPage() {
  const [activeTab, setActiveTab] = useState<"jadwal" | "izin" | "bk" | "pulang">("jadwal");
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [jadwalList, setJadwalList] = useState<JadwalPengajian[]>([]);
  const [izinList, setIzinList] = useState<IzinSekolah[]>([]);
  const [bkList, setBkList] = useState<BimbinganLog[]>([]);

  const [izinPulangList, setIzinPulangList] = useState<any[]>([]);
  const [loadingPulang, setLoadingPulang] = useState(false);

  const [loading, setLoading] = useState(true);

  // Modals state
  const [isJadwalModalOpen, setIsJadwalModalOpen] = useState(false);
  const [isIzinModalOpen, setIsIzinModalOpen] = useState(false);
  const [isBkModalOpen, setIsBkModalOpen] = useState(false);

  // Form states
  const [jadwalForm, setJadwalForm] = useState({ kitab: "", ustadz: "", hari: "Senin", waktu: "", lokasi: "", keterangan: "" });
  const [izinForm, setIzinForm] = useState({ santri_id: "", sekolah_nama: "", alasan: "", tgl_mulai: "", tgl_kembali: "" });
  const [bkForm, setBkForm] = useState({ santri_id: "", keluhan: "", solusi: "", pembimbing: "", tanggal: "" });

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

  const fetchPendidikanData = useCallback(async () => {
    setLoading(true);
    try {
      const [jRes, iRes, bRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/pendidikan/jadwal`),
        fetch(`${API_BASE_URL}/api/pendidikan/izin-sekolah`),
        fetch(`${API_BASE_URL}/api/pendidikan/bimbingan`)
      ]);

      const jJson = await jRes.json() as { success: boolean; data: JadwalPengajian[] };
      const iJson = await iRes.json() as { success: boolean; data: IzinSekolah[] };
      const bJson = await bRes.json() as { success: boolean; data: BimbinganLog[] };

      if (jJson.success) setJadwalList(jJson.data);
      if (iJson.success) setIzinList(iJson.data);
      if (bJson.success) setBkList(bJson.data);
    } catch {
      // Fallback
      setJadwalList([
        { id: 1, kitab: "Fathul Qorib", ustadz: "Ustadz H. Mahrus", hari: "Senin", waktu: "08:00 - 09:30", lokasi: "Masjid Utama Lirboyo", keterangan: "Kajian fiqih ibadah dasar" },
        { id: 2, kitab: "Tafsir Jalalain", ustadz: "KH. Abdullah Kafabihi Mahrus", hari: "Selasa", waktu: "13:00 - 14:30", lokasi: "Aula Muktamar", keterangan: "Kajian tafsir Al-Quran" },
        { id: 3, kitab: "Alfiyah Ibnu Malik", ustadz: "Ustadz H. Anwar Manshur", hari: "Kamis", waktu: "10:00 - 11:30", lokasi: "Gedung MHM", keterangan: "Kajian nahwu tingkat lanjut" }
      ]);
      setIzinList([
        { id: 1, santri_id: 1, santri_name: "Ahmad Fauzi Rahman", santri_nisn: "1122334455", santri_kelas: "Ibtida' 1", santri_asrama: "DS A 01", keperluan: "Sekolah: MAN 3 Kediri (Ujian Semester)", tgl_mulai: "2026-06-20", tgl_kembali: "2026-06-25", status: "Diajukan" }
      ]);
      setBkList([
        { id: 1, santri_id: 3, santri_name: "Muhammad Rizki Pratama", santri_kelas: "Ula 2", santri_asrama: "DS A 03", keluhan: "Mengalami kesulitan menghafal bait Alfiyah Ibnu Malik", solusi: "Diberikan metode setoran bertahap (3 bait per hari) dan pendampingan mustahiq kelas", pembimbing: "Ustadz Lukman Hakim", tanggal: "2026-06-19" }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIzinPulangData = useCallback(async () => {
    setLoadingPulang(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/keamanan/perizinan`);
      const json = await res.json() as any;
      if (json.success) {
        setIzinPulangList(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data santri pulang di Pendidikan:", err);
    } finally {
      setLoadingPulang(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSantri();
      fetchPendidikanData();
      fetchIzinPulangData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSantri, fetchPendidikanData, fetchIzinPulangData]);

  // Actions
  const handleUpdateIzinStatus = async (id: number, status: "Disetujui" | "Ditolak") => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pendidikan/izin-sekolah/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast(`Status izin berhasil diperbarui menjadi ${status}`, "success");
        fetchPendidikanData();
      }
    } catch {
      setIzinList(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      showToast(`Status izin diperbarui menjadi ${status} (Lokal)`, "success");
    }
  };

  const handleCreateJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jadwalForm.kitab || !jadwalForm.ustadz || !jadwalForm.waktu) {
      showToast("Harap isi semua kolom wajib!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/pendidikan/jadwal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jadwalForm)
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Jadwal pengajian berhasil ditambahkan!", "success");
        setIsJadwalModalOpen(false);
        setJadwalForm({ kitab: "", ustadz: "", hari: "Senin", waktu: "", lokasi: "", keterangan: "" });
        fetchPendidikanData();
      }
    } catch {
      const newItem: JadwalPengajian = {
        id: Date.now(),
        ...jadwalForm
      };
      setJadwalList(prev => [...prev, newItem]);
      showToast("Jadwal pengajian ditambahkan (Lokal)!", "success");
      setIsJadwalModalOpen(false);
      setJadwalForm({ kitab: "", ustadz: "", hari: "Senin", waktu: "", lokasi: "", keterangan: "" });
    }
  };

  const handleCreateIzin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!izinForm.santri_id || !izinForm.sekolah_nama || !izinForm.alasan || !izinForm.tgl_mulai || !izinForm.tgl_kembali) {
      showToast("Harap isi semua kolom!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/pendidikan/izin-sekolah`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(izinForm)
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Pengajuan izin sekolah berhasil dikirim!", "success");
        setIsIzinModalOpen(false);
        setIzinForm({ santri_id: "", sekolah_nama: "", alasan: "", tgl_mulai: "", tgl_kembali: "" });
        fetchPendidikanData();
      }
    } catch {
      const matchSantri = santriList.find(s => s.id === parseInt(izinForm.santri_id));
      const newItem: IzinSekolah = {
        id: Date.now(),
        santri_id: parseInt(izinForm.santri_id),
        santri_name: matchSantri?.name || "Unknown",
        santri_kelas: matchSantri?.kelas || "",
        santri_asrama: matchSantri?.asrama || "",
        keperluan: `Sekolah: ${izinForm.sekolah_nama} (${izinForm.alasan})`,
        tgl_mulai: izinForm.tgl_mulai,
        tgl_kembali: izinForm.tgl_kembali,
        status: "Diajukan"
      };
      setIzinList(prev => [newItem, ...prev]);
      showToast("Pengajuan izin dikirim (Lokal)!", "success");
      setIsIzinModalOpen(false);
      setIzinForm({ santri_id: "", sekolah_nama: "", alasan: "", tgl_mulai: "", tgl_kembali: "" });
    }
  };

  const handleCreateBk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bkForm.santri_id || !bkForm.keluhan || !bkForm.pembimbing) {
      showToast("Harap isi semua kolom wajib!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/pendidikan/bimbingan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bkForm)
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Log bimbingan konseling berhasil disimpan!", "success");
        setIsBkModalOpen(false);
        setBkForm({ santri_id: "", keluhan: "", solusi: "", pembimbing: "", tanggal: "" });
        fetchPendidikanData();
      }
    } catch {
      const matchSantri = santriList.find(s => s.id === parseInt(bkForm.santri_id));
      const newItem: BimbinganLog = {
        id: Date.now(),
        santri_id: parseInt(bkForm.santri_id),
        santri_name: matchSantri?.name || "Unknown",
        santri_kelas: matchSantri?.kelas || "",
        santri_asrama: matchSantri?.asrama || "",
        keluhan: bkForm.keluhan,
        solusi: bkForm.solusi,
        pembimbing: bkForm.pembimbing,
        tanggal: bkForm.tanggal || new Date().toISOString().split('T')[0]
      };
      setBkList(prev => [newItem, ...prev]);
      showToast("Log bimbingan disimpan (Lokal)!", "success");
      setIsBkModalOpen(false);
      setBkForm({ santri_id: "", keluhan: "", solusi: "", pembimbing: "", tanggal: "" });
    }
  };

  const filteredJadwalList = jadwalList.filter(j => 
    j.kitab.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.ustadz.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.hari.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIzinList = izinList.filter(i => 
    (i.santri_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.keperluan || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.status || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBkList = bkList.filter(b => 
    (b.santri_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.keluhan || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.solusi || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIzinPulangList = izinPulangList.filter(p => 
    (p.santri_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.keperluan || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.santri_asrama || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAddBtnConfig = () => {
    switch (activeTab) {
      case "jadwal":
        return { label: "Tambah Jadwal Baru", action: () => setIsJadwalModalOpen(true), bg: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20" };
      case "izin":
        return { label: "Ajukan Izin Baru", action: () => setIsIzinModalOpen(true), bg: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20" };
      case "bk":
        return { label: "Catat Bimbingan Baru", action: () => setIsBkModalOpen(true), bg: "bg-violet-600 hover:bg-violet-700 shadow-violet-500/20" };
      default:
        return null;
    }
  };

  const addBtn = getAddBtnConfig();

  const getCardsData = (): DashboardCardConfig[] => {
    switch (activeTab) {
      case "jadwal":
        return [
          { title: "Total Jadwal", value: jadwalList.length, description: "Jadwal Aktif", icon: <BookOpen className="w-6 h-6" />, colorTheme: "indigo" },
          { title: "Kelas Pagi", value: jadwalList.filter(j => j.waktu.includes("07") || j.waktu.includes("08") || j.waktu.includes("09") || j.waktu.includes("10")).length, description: "Sesi Pagi", icon: <Clock className="w-6 h-6" />, colorTheme: "blue" },
          { title: "Kelas Siang/Sore", value: jadwalList.filter(j => j.waktu.includes("13") || j.waktu.includes("14") || j.waktu.includes("15") || j.waktu.includes("16")).length, description: "Sesi Siang/Sore", icon: <Clock className="w-6 h-6" />, colorTheme: "emerald" },
        ];
      case "izin":
        return [
          { title: "Total Pengajuan", value: izinList.length, description: "Seluruh Data Izin", icon: <UserCheck className="w-6 h-6" />, colorTheme: "blue" },
          { title: "Menunggu Persetujuan", value: izinList.filter(i => i.status === 'Diajukan').length, description: "Perlu Tindakan", icon: <Clock className="w-6 h-6" />, colorTheme: "amber" },
          { title: "Disetujui", value: izinList.filter(i => i.status === 'Disetujui' || i.status === 'Kembali').length, description: "Selesai", icon: <CheckCircle className="w-6 h-6" />, colorTheme: "emerald" },
        ];
      case "bk":
        return [
          { title: "Total Bimbingan", value: bkList.length, description: "Catatan BK", icon: <MessageSquare className="w-6 h-6" />, colorTheme: "violet" },
          { title: "Kasus Aktif", value: bkList.filter(b => !b.solusi).length, description: "Belum Terselesaikan", icon: <Clock className="w-6 h-6" />, colorTheme: "amber" },
          { title: "Selesai Ditangani", value: bkList.filter(b => !!b.solusi).length, description: "Diberikan Solusi", icon: <CheckCircle className="w-6 h-6" />, colorTheme: "emerald" },
        ];
      case "pulang":
        return [
          { title: "Total Santri Pulang", value: izinPulangList.length, description: "Seluruh Laporan", icon: <UserCheck className="w-6 h-6" />, colorTheme: "indigo" },
          { title: "Sedang Pulang", value: izinPulangList.filter(p => p.status === 'Keluar').length, description: "Belum Kembali", icon: <Clock className="w-6 h-6" />, colorTheme: "rose" },
          { title: "Sudah Kembali", value: izinPulangList.filter(p => p.status === 'Kembali').length, description: "Di Pondok", icon: <CheckCircle className="w-6 h-6" />, colorTheme: "emerald" },
        ];
      default:
        return [];
    }
  };

  return (
    <>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto relative">
        <SectionDashboardCards cards={getCardsData()} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Seksi Pendidikan Pondok</h1>
              <p className="text-sm text-slate-500 font-medium">Jadwal Pengajian Kitab Kuning, Izin Sekolah, & Log Bimbingan BK</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => { fetchPendidikanData(); fetchIzinPulangData(); }}
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${(loading || loadingPulang) ? 'animate-spin' : ''}`} />
            </button>
            {addBtn && (
              <button 
                onClick={addBtn.action} 
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-95 ${addBtn.bg}`}
              >
                <Plus className="w-5 h-5" />
                <span>{addBtn.label}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl max-w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab("jadwal")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "jadwal" 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Jadwal Pengajian Kitab
          </button>
          <button
            onClick={() => setActiveTab("izin")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "izin" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Izin Sekolah & Musyawarah
          </button>
          <button
            onClick={() => setActiveTab("bk")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "bk" 
                ? "bg-white text-violet-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Bimbingan Konseling (BK)
          </button>
          <button
            onClick={() => setActiveTab("pulang")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "pulang" 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Laporan Santri Pulang
          </button>
        </div>

        {/* Content Tabs */}
        {activeTab === "jadwal" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                <h2 className="font-bold text-slate-800 text-lg">Jadwal Pengajian Kitab Kuning</h2>
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

              <div className="p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                    <p className="text-xs font-medium">Memuat jadwal pengajian...</p>
                  </div>
                ) : filteredJadwalList.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 text-xs">
                    Belum ada jadwal pengajian
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredJadwalList.map((j) => (
                      <div key={j.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs relative hover:shadow-sm transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-md bg-indigo-50 text-indigo-600">
                              {j.hari}
                            </span>
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> {j.waktu}
                            </span>
                          </div>
                          <div className="mt-4">
                            <h3 className="font-extrabold text-slate-800 text-base">{j.kitab}</h3>
                            <p className="text-xs text-slate-500 mt-1 font-bold">Ustadz: <span className="text-slate-600 font-medium">{j.ustadz}</span></p>
                            <p className="text-xs text-slate-400 mt-2 italic">&quot;{j.keterangan || '-'}&quot;</p>
                          </div>
                        </div>
                        <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400">
                          <span>Lokasi: <strong className="text-slate-600">{j.lokasi || "Masjid"}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "izin" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">Persetujuan Izin Sekolah / Musyawarah Luar</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Cari data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                  <p className="text-xs font-medium">Memuat data izin...</p>
                </div>
              ) : filteredIzinList.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Tidak ada data izin sekolah
                </div>
              ) : (
                <DataTable
                  data={filteredIzinList}
                  columns={[
                    {
                      header: "Santri",
                      render: (izin: IzinSekolah) => (
                        <div>
                          <div className="font-bold text-slate-800">{izin.santri_name}</div>
                          <div className="text-xs text-slate-400 mt-1">NISN: {izin.santri_nisn} | {izin.santri_kelas}</div>
                        </div>
                      )
                    },
                    {
                      header: "Madrasah & Keperluan",
                      render: (izin: IzinSekolah) => (
                        <div className="text-slate-700 font-semibold">{izin.keperluan}</div>
                      )
                    },
                    {
                      header: "Durasi Tanggal",
                      render: (izin: IzinSekolah) => (
                        <div className="text-slate-600">
                          <div>Mulai: {izin.tgl_mulai}</div>
                          <div className="text-xs text-rose-500 font-semibold mt-0.5">Hingga: {izin.tgl_kembali}</div>
                        </div>
                      )
                    },
                    {
                      header: "Status",
                      render: (izin: IzinSekolah) => (
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                          izin.status === "Diajukan" ? "bg-amber-50 text-amber-600" :
                          izin.status === "Disetujui" ? "bg-emerald-50 text-emerald-600" :
                          "bg-rose-50 text-rose-600"
                        }`}>
                          {izin.status}
                        </span>
                      )
                    },
                    {
                      header: "Aksi Persetujuan",
                      render: (izin: IzinSekolah) => (
                        <>
                          {izin.status === "Diajukan" && (
                            <div className="flex gap-2">
                              <button onClick={() => handleUpdateIzinStatus(izin.id, "Disetujui")} className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-emerald-700 transition-all flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Setujui
                              </button>
                              <button onClick={() => handleUpdateIzinStatus(izin.id, "Ditolak")} className="px-2.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-rose-700 transition-all flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Tolak
                              </button>
                            </div>
                          )}
                          {izin.status !== "Diajukan" && (
                            <span className="text-xs text-slate-400">Sudah Diproses</span>
                          )}
                        </>
                      )
                    }
                  ]}
                  sortOptions={[
                    { label: "Mulai (Terdekat)", value: "mulai-asc", sortFn: (a: IzinSekolah, b: IzinSekolah) => new Date(a.tgl_mulai).getTime() - new Date(b.tgl_mulai).getTime() },
                    { label: "Mulai (Terjauh)", value: "mulai-desc", sortFn: (a: IzinSekolah, b: IzinSekolah) => new Date(b.tgl_mulai).getTime() - new Date(a.tgl_mulai).getTime() }
                  ]}
                  defaultSortValue="mulai-asc"
                  loading={loading}
                  emptyMessage="Tidak ada data izin sekolah"
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "bk" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">Catatan Bimbingan Konseling (BK) & Mental Santri</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Cari data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white border border-slate-100 rounded-2xl">
                  <Loader2 className="w-10 h-10 animate-spin text-violet-600 mb-4" />
                  <p className="text-xs font-medium">Memuat catatan BK...</p>
                </div>
              ) : filteredBkList.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Belum ada catatan bimbingan konseling
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBkList.map((bk) => (
                    <div key={bk.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs relative hover:shadow-sm transition-all flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-bold">{bk.tanggal}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-50 text-violet-600">BK Record</span>
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-base">Bimbingan: {bk.santri_name}</h3>
                        <p className="text-xs text-slate-400">Pendidikan: <span className="text-slate-600 font-medium">{bk.santri_kelas}</span> | Asrama: <span className="text-slate-600 font-medium">{bk.santri_asrama}</span></p>
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Masalah / Keluhan</h4>
                          <p className="text-xs text-slate-700">{bk.keluhan}</p>
                        </div>
                        {bk.solusi && (
                          <div className="p-3 bg-violet-50/50 rounded-lg border border-violet-100/50">
                            <h4 className="text-xs font-bold text-violet-500 uppercase mb-1">Solusi / Arahan Maslahat</h4>
                            <p className="text-xs text-slate-700">{bk.solusi}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-end text-xs text-slate-400 min-w-40 text-left md:text-right">
                        <p>Pembimbing Konseling:</p>
                        <p className="font-bold text-slate-700 mt-1">{bk.pembimbing}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "pulang" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">Laporan Santri Pulang / Keluar (Seksi Keamanan)</h2>
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
              {loadingPulang ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                  <p className="text-xs font-medium">Memuat data santri pulang...</p>
                </div>
              ) : filteredIzinPulangList.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs font-semibold italic">
                  Tidak ada data santri pulang
                </div>
              ) : (
                <DataTable
                  data={filteredIzinPulangList}
                  columns={[
                    {
                      header: "Nama / Kelas",
                      render: (p: any) => (
                        <div>
                          <div className="font-bold text-slate-800">{p.santri_name}</div>
                          <div className="text-xs text-slate-400 mt-1">{p.santri_kelas}</div>
                        </div>
                      )
                    },
                    {
                      header: "Asrama",
                      render: (p: any) => (
                        <div className="text-slate-700 font-semibold">{p.santri_asrama || "-"}</div>
                      )
                    },
                    {
                      header: "Keperluan",
                      render: (p: any) => (
                        <div className="text-slate-600">{p.keperluan}</div>
                      )
                    },
                    {
                      header: "Tanggal Mulai",
                      render: (p: any) => (
                        <div className="text-slate-500">{p.tgl_mulai}</div>
                      )
                    },
                    {
                      header: "Batas Kembali",
                      render: (p: any) => (
                        <div className="font-semibold text-rose-500">{p.tgl_kembali}</div>
                      )
                    },
                    {
                      header: "Status",
                      render: (p: any) => (
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                          p.status === "Keluar" ? "bg-rose-50 text-rose-600" :
                          p.status === "Kembali" ? "bg-emerald-50 text-emerald-600" :
                          "bg-slate-100 text-slate-500"
                        }`}>
                          {p.status === "Keluar" ? "Sedang Pulang" : p.status}
                        </span>
                      )
                    }
                  ]}
                  sortOptions={[
                    { label: "Mulai (Terdekat)", value: "mulai-asc", sortFn: (a: any, b: any) => new Date(a.tgl_mulai).getTime() - new Date(b.tgl_mulai).getTime() },
                    { label: "Mulai (Terjauh)", value: "mulai-desc", sortFn: (a: any, b: any) => new Date(b.tgl_mulai).getTime() - new Date(a.tgl_mulai).getTime() }
                  ]}
                  defaultSortValue="mulai-asc"
                  loading={loadingPulang}
                  emptyMessage="Tidak ada data santri pulang"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Jadwal Form Modal */}
      {isJadwalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateJadwal} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Tambah Jadwal Pengajian</h3>
              <button type="button" onClick={() => setIsJadwalModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Kitab</label>
                <input 
                  type="text" 
                  value={jadwalForm.kitab}
                  onChange={(e) => setJadwalForm(prev => ({ ...prev, kitab: e.target.value }))}
                  placeholder="Contoh: Fathul Mu'in"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Ustadz / Pengajar</label>
                <input 
                  type="text" 
                  value={jadwalForm.ustadz}
                  onChange={(e) => setJadwalForm(prev => ({ ...prev, ustadz: e.target.value }))}
                  placeholder="Nama Lengkap Ustadz"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
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
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Waktu</label>
                  <input 
                    type="text" 
                    value={jadwalForm.waktu}
                    onChange={(e) => setJadwalForm(prev => ({ ...prev, waktu: e.target.value }))}
                    placeholder="Contoh: 08:00 - 10:00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lokasi Pengajian</label>
                <input 
                  type="text" 
                  value={jadwalForm.lokasi}
                  onChange={(e) => setJadwalForm(prev => ({ ...prev, lokasi: e.target.value }))}
                  placeholder="Contoh: Masjid Lantai 2"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keterangan Tambahan</label>
                <input 
                  type="text" 
                  value={jadwalForm.keterangan}
                  onChange={(e) => setJadwalForm(prev => ({ ...prev, keterangan: e.target.value }))}
                  placeholder="Keterangan singkat"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsJadwalModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-xs">Tambah</button>
            </div>
          </form>
        </div>
      )}

      {/* Izin Form Modal */}
      {isIzinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateIzin} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Ajukan Izin Sekolah/Luar</h3>
              <button type="button" onClick={() => setIsIzinModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Santri</label>
                <SearchableSantriSelect
                  santriList={santriList}
                  selectedId={izinForm.santri_id}
                  onChange={(id) => setIzinForm(prev => ({ ...prev, santri_id: id }))}
                  accentColor="blue"
                  placeholder="Cari & pilih santri..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lembaga / Sekolah</label>
                <input 
                  type="text" 
                  value={izinForm.sekolah_nama}
                  onChange={(e) => setIzinForm(prev => ({ ...prev, sekolah_nama: e.target.value }))}
                  placeholder="Contoh: MAN 3 Kediri, SMA Lirboyo"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alasan / Keperluan Utama</label>
                <input 
                  type="text" 
                  value={izinForm.alasan}
                  onChange={(e) => setIzinForm(prev => ({ ...prev, alasan: e.target.value }))}
                  placeholder="Contoh: Ujian Akhir, Musyawarah Daerah, dll."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Mulai</label>
                  <input 
                    type="date" 
                    value={izinForm.tgl_mulai}
                    onChange={(e) => setIzinForm(prev => ({ ...prev, tgl_mulai: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Batas Kembali</label>
                  <input 
                    type="date" 
                    value={izinForm.tgl_kembali}
                    onChange={(e) => setIzinForm(prev => ({ ...prev, tgl_kembali: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsIzinModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-xs">Kirim Pengajuan</button>
            </div>
          </form>
        </div>
      )}

      {/* BK Form Modal */}
      {isBkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateBk} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-violet-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Catat Log Konseling (BK)</h3>
              <button type="button" onClick={() => setIsBkModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Santri</label>
                <SearchableSantriSelect
                  santriList={santriList}
                  selectedId={bkForm.santri_id}
                  onChange={(id) => setBkForm(prev => ({ ...prev, santri_id: id }))}
                  accentColor="violet"
                  placeholder="Cari & pilih santri..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Masalah / Keluhan Santri</label>
                <textarea 
                  value={bkForm.keluhan}
                  onChange={(e) => setBkForm(prev => ({ ...prev, keluhan: e.target.value }))}
                  placeholder="Jelaskan kendala, keluhan belajar, atau kesehatan mental santri..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden h-20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Solusi / Arahan Maslahat</label>
                <textarea 
                  value={bkForm.solusi}
                  onChange={(e) => setBkForm(prev => ({ ...prev, solusi: e.target.value }))}
                  placeholder="Rekomendasi solusi, pembinaan, atau ta'zir mendidik..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pembimbing (Mustahiq)</label>
                  <input 
                    type="text" 
                    value={bkForm.pembimbing}
                    onChange={(e) => setBkForm(prev => ({ ...prev, pembimbing: e.target.value }))}
                    placeholder="Nama Pembimbing"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Konseling</label>
                  <input 
                    type="date" 
                    value={bkForm.tanggal}
                    onChange={(e) => setBkForm(prev => ({ ...prev, tanggal: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsBkModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 text-xs">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

