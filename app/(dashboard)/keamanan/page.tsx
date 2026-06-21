"use client";

import { useEffect, useState, useCallback } from "react";
import SectionDashboardCards, { DashboardCardConfig } from "@/components/SectionDashboardCards";
import { 
  ShieldAlert, Scan, ShieldCheck, Tag, AlertTriangle, 
  Plus, XCircle, Printer, QrCode, FileText, Loader2, Search, RefreshCw, Clock, CheckCircle
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { DataTable } from "@/components/DataTable";
import { API_BASE_URL } from "@/lib/config";
import SearchableSantriSelect from "@/components/SearchableSantriSelect";
import KeamananAset from "@/components/KeamananAset";

interface Santri {
  id: number;
  name: string;
  nisn: string;
  kelas: string;
  asrama: string;
}

interface Perizinan {
  id: number;
  santri_id: number;
  santri_name?: string;
  santri_nisn?: string;
  santri_kelas?: string;
  santri_asrama?: string;
  keperluan: string;
  tgl_mulai: string;
  tgl_kembali: string;
  status: "Diajukan" | "Disetujui" | "Keluar" | "Kembali" | "Terlambat" | "Ditolak";
  disetujui_oleh?: string;
  scan_keluar_at?: string;
  scan_kembali_at?: string;
}

interface SKKB {
  id: number;
  santri_id: number;
  santri_name?: string;
  santri_nisn?: string;
  santri_kelas?: string;
  keperluan: string;
  catatan?: string;
  petugas?: string;
  created_at?: string;
}

interface SantriAsset {
  id: number;
  santri_id: number;
  santri_name?: string;
  santri_kelas?: string;
  jenis_asset: string;
  merk_tipe: string;
  no_registrasi?: string;
  barcode_qr: string;
  status: "Aktif" | "Nonaktif";
}

interface Pelanggaran {
  id: number;
  santri_id: number;
  santri_name?: string;
  santri_kelas?: string;
  santri_asrama?: string;
  jenis: "Ringan" | "Sedang" | "Berat" | "Bullying";
  deskripsi: string;
  point: number;
  tindakan_diambil?: string;
  status: "Penyelidikan" | "Selesai";
  dilaporkan_oleh?: string;
  created_at?: string;
}

export default function KeamananPage() {
  const [activeTab, setActiveTab] = useState<"egate" | "skkb" | "assets" | "violations">("egate");
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Master santri for dropdown lists
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [perizinanList, setPerizinanList] = useState<Perizinan[]>([]);
  const [skkbList, setSkkbList] = useState<SKKB[]>([]);
  const [assetList, setAssetList] = useState<SantriAsset[]>([]);
  const [pelanggaranList, setPelanggaranList] = useState<Pelanggaran[]>([]);

  const [loading, setLoading] = useState(true);

  // Modals state
  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);
  const [isSkkbModalOpen, setIsSkkbModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isViolModalOpen, setIsViolModalOpen] = useState(false);
  const [selectedSkkbPrint, setSelectedSkkbPrint] = useState<SKKB | null>(null);

  // Form states
  const [permitForm, setPermitForm] = useState({ santri_id: "", keperluan: "", tgl_mulai: "", tgl_kembali: "" });
  const [skkbForm, setSkkbForm] = useState({ santri_id: "", keperluan: "", catatan: "" });
  const [assetForm, setAssetForm] = useState({ santri_id: "", jenis_asset: "Laptop", merk_tipe: "", no_registrasi: "" });
  const [violForm, setViolForm] = useState<{
    santri_id: string;
    jenis: "Ringan" | "Sedang" | "Berat" | "Bullying";
    deskripsi: string;
    point: number;
    tindakan_diambil: string;
  }>({
    santri_id: "",
    jenis: "Ringan",
    deskripsi: "",
    point: 5,
    tindakan_diambil: ""
  });

  // 1. Fetch Master Santri
  const fetchSantri = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/santri`);
      const json = await res.json() as { success: boolean; data: Santri[] };
      if (json.success) {
        setSantriList(json.data);
      }
    } catch {
      // Fallback local mock data
      setSantriList([
        { id: 1, name: "Ahmad Fauzi Rahman", nisn: "1122334455", kelas: "Ibtida' 1", asrama: "DS A 01" },
        { id: 2, name: "Fatimah Az-Zahra", nisn: "2122334456", kelas: "Tsanawiyyah 2", asrama: "DS B 05" },
        { id: 3, name: "Muhammad Rizki Pratama", nisn: "3122334457", kelas: "Ula 2", asrama: "DS A 03" },
        { id: 4, name: "Siti Aminah", nisn: "4122334458", kelas: "Wustho 1", asrama: "DS C 10" },
        { id: 5, name: "Zulfikar Ali", nisn: "5122334459", kelas: "Aliyyah 3", asrama: "DS A 15" }
      ]);
    }
  }, []);

  // 2. Fetch Keamanan Data
  const fetchKeamananData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, sRes, aRes, vRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/keamanan/perizinan`),
        fetch(`${API_BASE_URL}/api/keamanan/skkb`),
        fetch(`${API_BASE_URL}/api/keamanan/assets`),
        fetch(`${API_BASE_URL}/api/keamanan/pelanggaran`)
      ]);

      const pJson = await pRes.json() as { success: boolean; data: Perizinan[] };
      const sJson = await sRes.json() as { success: boolean; data: SKKB[] };
      const aJson = await aRes.json() as { success: boolean; data: SantriAsset[] };
      const vJson = await vRes.json() as { success: boolean; data: Pelanggaran[] };

      if (pJson.success) setPerizinanList(pJson.data);
      if (sJson.success) setSkkbList(sJson.data);
      if (aJson.success) setAssetList(aJson.data);
      if (vJson.success) setPelanggaranList(vJson.data);
    } catch {
      // Offline fallback dummy data
      setPerizinanList([
        { id: 1, santri_id: 1, santri_name: "Ahmad Fauzi Rahman", santri_nisn: "1122334455", santri_kelas: "Ibtida' 1", santri_asrama: "DS A 01", keperluan: "Sakit (Berobat ke RS Lirboyo)", tgl_mulai: "2026-06-18", tgl_kembali: "2026-06-20", status: "Keluar", disetujui_oleh: "Ustadz Hanif", scan_keluar_at: "2026-06-18 09:30:12" },
        { id: 2, santri_id: 3, santri_name: "Muhammad Rizki Pratama", santri_nisn: "3122334457", santri_kelas: "Ula 2", santri_asrama: "DS A 03", keperluan: "Takziyah keluarga wafat", tgl_mulai: "2026-06-19", tgl_kembali: "2026-06-21", status: "Diajukan", disetujui_oleh: "Ustadz Hanif" }
      ]);
      setSkkbList([
        { id: 1, santri_id: 5, santri_name: "Zulfikar Ali", santri_nisn: "5122334459", santri_kelas: "Aliyyah 3", keperluan: "Syarat daftar beasiswa eksternal", catatan: "Berkelakuan baik dan tidak pernah melanggar tata tertib berat", petugas: "Ustadz Hanif", created_at: "2026-06-17 14:22:00" }
      ]);
      setAssetList([
        { id: 1, santri_id: 1, santri_name: "Ahmad Fauzi Rahman", santri_kelas: "Ibtida' 1", jenis_asset: "Laptop", merk_tipe: "Lenovo ThinkPad X270", no_registrasi: "SN-982189832", barcode_qr: "QR-DS-1002", status: "Aktif" },
        { id: 2, santri_id: 2, santri_name: "Fatimah Az-Zahra", santri_kelas: "Tsanawiyyah 2", jenis_asset: "Motor", merk_tipe: "Honda Beat Hitam", no_registrasi: "AG 4182 XF", barcode_qr: "QR-DS-3221", status: "Aktif" }
      ]);
      setPelanggaranList([
        { id: 1, santri_id: 3, santri_name: "Muhammad Rizki Pratama", santri_kelas: "Ula 2", santri_asrama: "DS A 03", jenis: "Ringan", deskripsi: "Terlambat mengikuti kegiatan jamaah Isya", point: 5, tindakan_diambil: "Tazkiyah membaca Al-Quran 1 juz", status: "Selesai", dilaporkan_oleh: "Ustadz Hanif", created_at: "2026-06-19 05:22:00" }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSantri();
      fetchKeamananData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSantri, fetchKeamananData]);

  // Actions
  const handleUpdatePermitStatus = async (id: number, status: "Keluar" | "Kembali" | "Terlambat" | "Ditolak") => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/keamanan/perizinan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast(`Izin berhasil diperbarui ke ${status}`, "success");
        fetchKeamananData();
      }
    } catch {
      // Offline fallback modification
      setPerizinanList(prev => prev.map(p => p.id === id ? { ...p, status, scan_keluar_at: status === 'Keluar' ? new Date().toISOString() : p.scan_keluar_at, scan_kembali_at: status === 'Kembali' ? new Date().toISOString() : p.scan_kembali_at } : p));
      showToast(`Izin diperbarui ke ${status} (Lokal)`, "success");
    }
  };

  const handleCreatePermit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permitForm.santri_id || !permitForm.keperluan || !permitForm.tgl_mulai || !permitForm.tgl_kembali) {
      showToast("Harap isi semua kolom!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/keamanan/perizinan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          santri_id: parseInt(permitForm.santri_id),
          keperluan: permitForm.keperluan,
          tgl_mulai: permitForm.tgl_mulai,
          tgl_kembali: permitForm.tgl_kembali,
          disetujui_oleh: "Ustadz Hanif"
        })
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Perizinan berhasil diajukan!", "success");
        setIsPermitModalOpen(false);
        setPermitForm({ santri_id: "", keperluan: "", tgl_mulai: "", tgl_kembali: "" });
        fetchKeamananData();
      }
    } catch {
      // Offline fallback insert
      const matchSantri = santriList.find(s => s.id === parseInt(permitForm.santri_id));
      const newItem: Perizinan = {
        id: Date.now(),
        santri_id: parseInt(permitForm.santri_id),
        santri_name: matchSantri?.name || "Unknown",
        santri_kelas: matchSantri?.kelas || "",
        santri_asrama: matchSantri?.asrama || "",
        keperluan: permitForm.keperluan,
        tgl_mulai: permitForm.tgl_mulai,
        tgl_kembali: permitForm.tgl_kembali,
        status: "Diajukan",
        disetujui_oleh: "Ustadz Hanif"
      };
      setPerizinanList(prev => [newItem, ...prev]);
      showToast("Perizinan berhasil diajukan (Lokal)!", "success");
      setIsPermitModalOpen(false);
      setPermitForm({ santri_id: "", keperluan: "", tgl_mulai: "", tgl_kembali: "" });
    }
  };

  const handleCreateSkkb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skkbForm.santri_id || !skkbForm.keperluan) {
      showToast("Harap isi semua kolom wajib!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/keamanan/skkb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          santri_id: parseInt(skkbForm.santri_id),
          keperluan: skkbForm.keperluan,
          catatan: skkbForm.catatan,
          petugas: "Ustadz Hanif"
        })
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Dokumen SKKB berhasil dicatat!", "success");
        setIsSkkbModalOpen(false);
        setSkkbForm({ santri_id: "", keperluan: "", catatan: "" });
        fetchKeamananData();
      }
    } catch {
      const matchSantri = santriList.find(s => s.id === parseInt(skkbForm.santri_id));
      const newItem: SKKB = {
        id: Date.now(),
        santri_id: parseInt(skkbForm.santri_id),
        santri_name: matchSantri?.name || "Unknown",
        santri_nisn: matchSantri?.nisn || "",
        santri_kelas: matchSantri?.kelas || "",
        keperluan: skkbForm.keperluan,
        catatan: skkbForm.catatan,
        petugas: "Ustadz Hanif",
        created_at: new Date().toISOString()
      };
      setSkkbList(prev => [newItem, ...prev]);
      showToast("SKKB dicatat (Lokal)!", "success");
      setIsSkkbModalOpen(false);
      setSkkbForm({ santri_id: "", keperluan: "", catatan: "" });
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.santri_id || !assetForm.merk_tipe) {
      showToast("Data tidak lengkap!", "warning");
      return;
    }
    const generatedQr = `QR-DS-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const res = await fetch(`${API_BASE_URL}/api/keamanan/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          santri_id: parseInt(assetForm.santri_id),
          jenis_asset: assetForm.jenis_asset,
          merk_tipe: assetForm.merk_tipe,
          no_registrasi: assetForm.no_registrasi,
          barcode_qr: generatedQr
        })
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Aset berhasil didaftarkan!", "success");
        setIsAssetModalOpen(false);
        setAssetForm({ santri_id: "", jenis_asset: "Laptop", merk_tipe: "", no_registrasi: "" });
        fetchKeamananData();
      }
    } catch {
      const matchSantri = santriList.find(s => s.id === parseInt(assetForm.santri_id));
      const newItem: SantriAsset = {
        id: Date.now(),
        santri_id: parseInt(assetForm.santri_id),
        santri_name: matchSantri?.name || "Unknown",
        santri_kelas: matchSantri?.kelas || "",
        jenis_asset: assetForm.jenis_asset,
        merk_tipe: assetForm.merk_tipe,
        no_registrasi: assetForm.no_registrasi,
        barcode_qr: generatedQr,
        status: "Aktif"
      };
      setAssetList(prev => [newItem, ...prev]);
      showToast("Aset terdaftar (Lokal)!", "success");
      setIsAssetModalOpen(false);
      setAssetForm({ santri_id: "", jenis_asset: "Laptop", merk_tipe: "", no_registrasi: "" });
    }
  };

  const handleCreateViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!violForm.santri_id || !violForm.deskripsi) {
      showToast("Data tidak lengkap!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/keamanan/pelanggaran`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          santri_id: parseInt(violForm.santri_id),
          jenis: violForm.jenis,
          deskripsi: violForm.deskripsi,
          point: violForm.point,
          tindakan_diambil: violForm.tindakan_diambil,
          dilaporkan_oleh: "Ustadz Hanif"
        })
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Laporan pelanggaran dicatat!", "success");
        setIsViolModalOpen(false);
        setViolForm({ santri_id: "", jenis: "Ringan", deskripsi: "", point: 5, tindakan_diambil: "" });
        fetchKeamananData();
      }
    } catch {
      const matchSantri = santriList.find(s => s.id === parseInt(violForm.santri_id));
      const newItem: Pelanggaran = {
        id: Date.now(),
        santri_id: parseInt(violForm.santri_id),
        santri_name: matchSantri?.name || "Unknown",
        santri_kelas: matchSantri?.kelas || "",
        santri_asrama: matchSantri?.asrama || "",
        jenis: violForm.jenis,
        deskripsi: violForm.deskripsi,
        point: violForm.point,
        tindakan_diambil: violForm.tindakan_diambil,
        status: "Penyelidikan",
        dilaporkan_oleh: "Ustadz Hanif",
        created_at: new Date().toISOString()
      };
      setPelanggaranList(prev => [newItem, ...prev]);
      showToast("Laporan pelanggaran dicatat (Lokal)!", "success");
      setIsViolModalOpen(false);
      setViolForm({ santri_id: "", jenis: "Ringan", deskripsi: "", point: 5, tindakan_diambil: "" });
    }
  };

  const filteredPerizinanList = perizinanList.filter(p => 
    (p.santri_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.keperluan || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.status || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSkkbList = skkbList.filter(s => 
    (s.santri_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.keperluan || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAssetList = assetList.filter(a => 
    (a.santri_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.merk_tipe || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.barcode_qr || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPelanggaranList = pelanggaranList.filter(v => 
    (v.santri_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.deskripsi || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.jenis || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAddBtnConfig = () => {
    switch (activeTab) {
      case "egate":
        return { label: "Ajukan Izin Keluar", action: () => setIsPermitModalOpen(true), bg: "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20" };
      case "skkb":
        return { label: "Terbitkan SKKB Baru", action: () => setIsSkkbModalOpen(true), bg: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20" };
      case "assets":
        return { label: "Daftarkan Aset Baru", action: () => setIsAssetModalOpen(true), bg: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" };
      case "violations":
        return { label: "Laporkan Pelanggaran", action: () => setIsViolModalOpen(true), bg: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20" };
    }
  };

  const addBtn = getAddBtnConfig();

  const getCardsData = (): DashboardCardConfig[] => {
    switch (activeTab) {
      case "egate":
        return [
          { title: "Total Perizinan", value: perizinanList.length, description: "Seluruh Data", icon: <ShieldAlert className="w-6 h-6" />, colorTheme: "rose" },
          { title: "Menunggu / Terlambat", value: perizinanList.filter(p => p.status === 'Diajukan' || p.status === 'Terlambat').length, description: "Perlu Tindakan", icon: <Clock className="w-6 h-6" />, colorTheme: "amber" },
          { title: "Sudah Kembali", value: perizinanList.filter(p => p.status === 'Kembali').length, description: "Selesai", icon: <ShieldCheck className="w-6 h-6" />, colorTheme: "emerald" },
        ];
      case "skkb":
        return [
          { title: "Total SKKB", value: skkbList.length, description: "Dokumen Terbit", icon: <FileText className="w-6 h-6" />, colorTheme: "blue" },
          { title: "Bulan Ini", value: skkbList.filter(s => new Date(s.created_at || "").getMonth() === new Date().getMonth()).length, description: "SKKB Baru", icon: <Plus className="w-6 h-6" />, colorTheme: "indigo" },
          { title: "Terverifikasi", value: skkbList.length, description: "Dokumen Valid", icon: <CheckCircle className="w-6 h-6" />, colorTheme: "emerald" },
        ];
      case "assets":
        return [
          { title: "Total Aset", value: assetList.length, description: "Aset Terdaftar", icon: <Tag className="w-6 h-6" />, colorTheme: "emerald" },
          { title: "Laptop", value: assetList.filter(a => a.jenis_asset.toLowerCase() === 'laptop').length, description: "Perangkat Laptop", icon: <QrCode className="w-6 h-6" />, colorTheme: "blue" },
          { title: "Motor/Kendaraan", value: assetList.filter(a => a.jenis_asset.toLowerCase() === 'motor').length, description: "Kendaraan Pribadi", icon: <QrCode className="w-6 h-6" />, colorTheme: "indigo" },
        ];
      case "violations":
        return [
          { title: "Total Pelanggaran", value: pelanggaranList.length, description: "Seluruh Catatan", icon: <AlertTriangle className="w-6 h-6" />, colorTheme: "amber" },
          { title: "Kasus Aktif", value: pelanggaranList.filter(v => v.status === 'Penyelidikan').length, description: "Dalam Penyelidikan", icon: <Search className="w-6 h-6" />, colorTheme: "rose" },
          { title: "Selesai", value: pelanggaranList.filter(v => v.status === 'Selesai').length, description: "Sudah Ditangani", icon: <CheckCircle className="w-6 h-6" />, colorTheme: "emerald" },
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
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Seksi Keamanan & Ketertiban</h1>
              <p className="text-sm text-slate-500 font-medium">E-Gate Perizinan, Asset Registry, SKKB Generator, & Pelanggaran</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={fetchKeamananData}
              className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
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
            onClick={() => setActiveTab("egate")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "egate" 
                ? "bg-white text-rose-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            E-Gate Perizinan
          </button>
          <button
            onClick={() => setActiveTab("skkb")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "skkb" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            SKKB Generator
          </button>
          <button
            onClick={() => setActiveTab("assets")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "assets" 
                ? "bg-white text-emerald-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Asset Registry
          </button>
          <button
            onClick={() => setActiveTab("violations")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "violations" 
                ? "bg-white text-amber-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Pelanggaran & Bullying
          </button>
        </div>

        {/* Content Tabs */}
        {activeTab === "egate" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">Daftar Santri Keluar / Izin</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Cari data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin text-rose-600 mb-4" />
                  <p className="text-xs font-medium">Memuat data perizinan...</p>
                </div>
              ) : filteredPerizinanList.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Tidak ada data perizinan
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-xs text-slate-500 font-bold uppercase text-left">
                      <th className="px-6 py-4">Nama / Kelas</th>
                      <th className="px-6 py-4">Keperluan</th>
                      <th className="px-6 py-4">Durasi</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Scan Logger</th>
                      <th className="px-6 py-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPerizinanList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{p.santri_name}</div>
                          <div className="text-xs text-slate-400 mt-1">{p.santri_kelas} | {p.santri_asrama}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{p.keperluan}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <div>{p.tgl_mulai}</div>
                          <div className="text-xs text-rose-500 mt-0.5 font-semibold">s.d {p.tgl_kembali}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                            p.status === "Diajukan" ? "bg-amber-50 text-amber-600" :
                            p.status === "Disetujui" ? "bg-indigo-50 text-indigo-600" :
                            p.status === "Keluar" ? "bg-blue-50 text-blue-600" :
                            p.status === "Kembali" ? "bg-emerald-50 text-emerald-600" :
                            "bg-rose-50 text-rose-600"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {p.scan_keluar_at && <div>Out: {p.scan_keluar_at}</div>}
                          {p.scan_kembali_at && <div className="mt-1">In: {p.scan_kembali_at}</div>}
                          {!p.scan_keluar_at && <div>Belum Keluar Gerbang</div>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {p.status === "Diajukan" && (
                              <button onClick={() => handleUpdatePermitStatus(p.id, "Keluar")} className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-bold shadow-xs hover:bg-blue-700 transition-all flex items-center gap-1">
                                <Scan className="w-3.5 h-3.5" /> Checkout
                              </button>
                            )}
                            {p.status === "Keluar" && (
                              <button onClick={() => handleUpdatePermitStatus(p.id, "Kembali")} className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-bold shadow-xs hover:bg-emerald-700 transition-all flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" /> Checkin
                              </button>
                            )}
                            {p.status === "Diajukan" && (
                              <button onClick={() => handleUpdatePermitStatus(p.id, "Ditolak")} className="text-slate-400 hover:text-rose-600 p-1 rounded-lg">
                                <XCircle className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "skkb" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">Surat Keterangan Kelakuan Baik (SKKB)</h2>
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
                  <p className="text-xs font-medium">Memuat data SKKB...</p>
                </div>
              ) : filteredSkkbList.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Belum ada dokumen SKKB diterbitkan
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-xs text-slate-500 font-bold uppercase text-left">
                      <th className="px-6 py-4">Santri</th>
                      <th className="px-6 py-4">Keperluan SKKB</th>
                      <th className="px-6 py-4">Petugas Penerbit</th>
                      <th className="px-6 py-4">Catatan Perilaku</th>
                      <th className="px-6 py-4">Tanggal Terbit</th>
                      <th className="px-6 py-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSkkbList.map((skkb) => (
                      <tr key={skkb.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{skkb.santri_name}</div>
                          <div className="text-xs text-slate-400 mt-1">NISN: {skkb.santri_nisn} | {skkb.santri_kelas}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-semibold">{skkb.keperluan}</td>
                        <td className="px-6 py-4 text-slate-600">{skkb.petugas}</td>
                        <td className="px-6 py-4 text-slate-500 italic">&quot;{skkb.catatan || 'Nihil Pelanggaran Berat'}&quot;</td>
                        <td className="px-6 py-4 text-slate-500">{skkb.created_at?.split(" ")[0]}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => setSelectedSkkbPrint(skkb)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all rounded-lg text-xs font-bold">
                            <Printer className="w-3.5 h-3.5" /> Cetak Dokumen
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "assets" && (
          <KeamananAset />
        )}

        {activeTab === "violations" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">Log Pelanggaran Santri & Bullying</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Cari data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin text-amber-600 mb-4" />
                  <p className="text-xs font-medium">Memuat data pelanggaran...</p>
                </div>
              ) : filteredPelanggaranList.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Tidak ada catatan pelanggaran santri
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-xs text-slate-500 font-bold uppercase text-left">
                      <th className="px-6 py-4">Santri</th>
                      <th className="px-6 py-4">Tingkat Pelanggaran</th>
                      <th className="px-6 py-4">Deskripsi Kasus</th>
                      <th className="px-6 py-4">Point</th>
                      <th className="px-6 py-4">Tindakan / Hukuman</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPelanggaranList.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{v.santri_name}</div>
                          <div className="text-xs text-slate-400 mt-1">{v.santri_kelas} | {v.santri_asrama}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                            v.jenis === "Ringan" ? "bg-blue-50 text-blue-600" :
                            v.jenis === "Sedang" ? "bg-amber-50 text-amber-600" :
                            v.jenis === "Berat" ? "bg-orange-50 text-orange-600" :
                            "bg-rose-50 text-rose-600 animate-pulse"
                          }`}>
                            {v.jenis}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{v.deskripsi}</td>
                        <td className="px-6 py-4 text-rose-600 font-bold">+{v.point}</td>
                        <td className="px-6 py-4 text-slate-700">{v.tindakan_diambil || "-"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                            v.status === "Selesai" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                          }`}>
                            {v.status}
                          </span>
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

      {/* Permit Form Modal */}
      {isPermitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreatePermit} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-rose-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Buat Izin Keluar Santri</h3>
              <button type="button" onClick={() => setIsPermitModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Santri</label>
                <SearchableSantriSelect
                  santriList={santriList}
                  selectedId={permitForm.santri_id}
                  onChange={(id) => setPermitForm(prev => ({ ...prev, santri_id: id }))}
                  accentColor="rose"
                  placeholder="Cari & pilih santri..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keperluan</label>
                <input 
                  type="text" 
                  value={permitForm.keperluan}
                  onChange={(e) => setPermitForm(prev => ({ ...prev, keperluan: e.target.value }))}
                  placeholder="Contoh: Berobat, Takziyah, dll."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-rose-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Keluar</label>
                  <input 
                    type="date" 
                    value={permitForm.tgl_mulai}
                    onChange={(e) => setPermitForm(prev => ({ ...prev, tgl_mulai: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Batas Kembali</label>
                  <input 
                    type="date" 
                    value={permitForm.tgl_kembali}
                    onChange={(e) => setPermitForm(prev => ({ ...prev, tgl_kembali: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsPermitModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 text-xs">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* SKKB Form Modal */}
      {isSkkbModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateSkkb} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Terbitkan SKKB Baru</h3>
              <button type="button" onClick={() => setIsSkkbModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Santri</label>
                <SearchableSantriSelect
                  santriList={santriList}
                  selectedId={skkbForm.santri_id}
                  onChange={(id) => setSkkbForm(prev => ({ ...prev, santri_id: id }))}
                  accentColor="blue"
                  placeholder="Cari & pilih santri..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keperluan Pembuatan</label>
                <input 
                  type="text" 
                  value={skkbForm.keperluan}
                  onChange={(e) => setSkkbForm(prev => ({ ...prev, keperluan: e.target.value }))}
                  placeholder="Contoh: Daftar Kuliah, Melamar Kerja, dll."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan Tambahan</label>
                <textarea 
                  value={skkbForm.catatan}
                  onChange={(e) => setSkkbForm(prev => ({ ...prev, catatan: e.target.value }))}
                  placeholder="Catatan kebaikan / nihil pelanggaran"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden h-20"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsSkkbModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-xs">Terbitkan</button>
            </div>
          </form>
        </div>
      )}

      {/* Asset Form Modal */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateAsset} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-emerald-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Daftarkan Aset Santri</h3>
              <button type="button" onClick={() => setIsAssetModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Pemilik (Santri)</label>
                <SearchableSantriSelect
                  santriList={santriList}
                  selectedId={assetForm.santri_id}
                  onChange={(id) => setAssetForm(prev => ({ ...prev, santri_id: id }))}
                  accentColor="emerald"
                  placeholder="Cari & pilih santri..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jenis Aset</label>
                <select 
                  value={assetForm.jenis_asset}
                  onChange={(e) => setAssetForm(prev => ({ ...prev, jenis_asset: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="Laptop">Laptop</option>
                  <option value="Motor">Motor</option>
                  <option value="Smartphone">Smartphone</option>
                  <option value="Elektronik Lain">Elektronik Lain</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Merk / Tipe Barang</label>
                <input 
                  type="text" 
                  value={assetForm.merk_tipe}
                  onChange={(e) => setAssetForm(prev => ({ ...prev, merk_tipe: e.target.value }))}
                  placeholder="Contoh: Asus ROG, Honda Vario Merah"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nomor Registrasi / Plat / SN</label>
                <input 
                  type="text" 
                  value={assetForm.no_registrasi}
                  onChange={(e) => setAssetForm(prev => ({ ...prev, no_registrasi: e.target.value }))}
                  placeholder="Contoh: SN-821382173 atau AG 3218 AH"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsAssetModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 text-xs">Daftarkan Aset</button>
            </div>
          </form>
        </div>
      )}

      {/* Violation Form Modal */}
      {isViolModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateViolation} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-amber-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Laporkan Pelanggaran</h3>
              <button type="button" onClick={() => setIsViolModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Santri Terlapor</label>
                <SearchableSantriSelect
                  santriList={santriList}
                  selectedId={violForm.santri_id}
                  onChange={(id) => setViolForm(prev => ({ ...prev, santri_id: id }))}
                  accentColor="amber"
                  placeholder="Cari & pilih santri..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tingkat Kasus</label>
                <select 
                  value={violForm.jenis}
                  onChange={(e) => setViolForm(prev => ({ ...prev, jenis: e.target.value as "Ringan" | "Sedang" | "Berat" | "Bullying" }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="Ringan">Ringan (Point: 5)</option>
                  <option value="Sedang">Sedang (Point: 15)</option>
                  <option value="Berat">Berat (Point: 50)</option>
                  <option value="Bullying">Bullying (Point: 75)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Kejadian</label>
                <textarea 
                  value={violForm.deskripsi}
                  onChange={(e) => setViolForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                  placeholder="Detail kronologi pelanggaran..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden h-20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Point Hukuman</label>
                <input 
                  type="number" 
                  value={violForm.point}
                  onChange={(e) => setViolForm(prev => ({ ...prev, point: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tindakan / Hukuman Langsung</label>
                <input 
                  type="text" 
                  value={violForm.tindakan_diambil}
                  onChange={(e) => setViolForm(prev => ({ ...prev, tindakan_diambil: e.target.value }))}
                  placeholder="Contoh: Bersihkan masjid, ta'zir"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsViolModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 text-xs">Simpan Laporan</button>
            </div>
          </form>
        </div>
      )}

      {/* SKKB Print Layout Modal */}
      {selectedSkkbPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in duration-300">
            <div className="px-6 py-4 bg-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold">Preview Surat Keterangan Kelakuan Baik</h3>
              <button type="button" onClick={() => setSelectedSkkbPrint(null)} className="text-white font-bold text-xl hover:text-slate-200">&times;</button>
            </div>
            <div className="p-8 text-slate-900 max-h-[80vh] overflow-y-auto" id="printable-skkb">
              <div className="text-center border-b-4 border-double border-slate-800 pb-4 mb-6">
                <h4 className="text-xl font-bold uppercase tracking-wide">Pondok Pesantren Darussalam Lirboyo</h4>
                <p className="text-xs text-slate-500 mt-1">Mojoroto, Kota Kediri, Jawa Timur | Telp: (0354) 772124</p>
                <p className="text-[10px] text-slate-400">Website: www.darussalamlirboyo.org | Email: info@darussalamlirboyo.org</p>
              </div>

              <div className="text-center mb-6">
                <h5 className="font-extrabold text-base underline uppercase">Surat Keterangan Kelakuan Baik (SKKB)</h5>
                <p className="text-xs text-slate-500 mt-1">Nomor: SKKB/PPDS/{selectedSkkbPrint.id}/2026</p>
              </div>

              <p className="text-xs leading-relaxed text-slate-700 mb-4">
                Yang bertanda tangan di bawah ini, Kepala Seksi Keamanan & Ketertiban Pondok Pesantren Darussalam Lirboyo Kediri, dengan ini menerangkan bahwa santri:
              </p>

              <table className="w-full text-xs text-slate-800 mb-6 border-collapse ml-4">
                <tbody>
                  <tr className="h-7">
                    <td className="w-32 font-semibold">Nama Lengkap</td>
                    <td className="w-4">:</td>
                    <td className="font-bold">{selectedSkkbPrint.santri_name}</td>
                  </tr>
                  <tr className="h-7">
                    <td className="font-semibold">NISN</td>
                    <td>:</td>
                    <td>{selectedSkkbPrint.santri_nisn || "-"}</td>
                  </tr>
                  <tr className="h-7">
                    <td className="font-semibold">Pendidikan Madrasah</td>
                    <td>:</td>
                    <td>{selectedSkkbPrint.santri_kelas}</td>
                  </tr>
                </tbody>
              </table>

              <p className="text-xs leading-relaxed text-slate-700 mb-6">
                Berdasarkan data catatan kedisiplinan dan ketertiban santri, yang bersangkutan benar-benar berkelakuan baik, patuh pada peraturan pondok pesantren, dan 
                <strong> {selectedSkkbPrint.catatan || "TIDAK PERNAH melakukan pelanggaran berat"} </strong> selama menuntut ilmu di Pondok Pesantren Darussalam Lirboyo.
              </p>

              <p className="text-xs leading-relaxed text-slate-700 mb-12">
                Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya, yaitu untuk keperluan: <span className="font-bold underline">{selectedSkkbPrint.keperluan}</span>.
              </p>

              <div className="flex justify-between text-xs text-slate-800">
                <div></div>
                <div className="text-center mr-8">
                  <p>Kediri, {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="mt-1 font-semibold">Kepala Seksi Keamanan,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{selectedSkkbPrint.petugas || "Ustadz Hanif"}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setSelectedSkkbPrint(null)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-100">Tutup</button>
              <button onClick={() => {
                window.print();
              }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1">
                <Printer className="w-3.5 h-3.5" /> Cetak Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

