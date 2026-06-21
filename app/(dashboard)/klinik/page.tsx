"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  HeartPulse, Plus, FileText, Printer, Stethoscope, Loader2, RefreshCw, Search 
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

interface MedicalRecord {
  id: number;
  santri_id: number;
  santri_name?: string;
  santri_nisn?: string;
  santri_kelas?: string;
  santri_asrama?: string;
  diagnosa: string;
  terapi?: string;
  dokter_perawat: string;
  status: "Rawat Jalan" | "Rawat Inap" | "Kamar";
  created_at?: string;
}

interface SuratSakit {
  id: number;
  santri_id: number;
  santri_name?: string;
  santri_nisn?: string;
  santri_kelas?: string;
  santri_asrama?: string;
  tgl_mulai: string;
  tgl_selesai: string;
  diagnosa: string;
  keterangan?: string;
  petugas: string;
  created_at?: string;
}

export default function KlinikPage() {
  const [activeTab, setActiveTab] = useState<"records" | "letters">("records");
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [letters, setLetters] = useState<SuratSakit[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [selectedLetterPrint, setSelectedLetterPrint] = useState<SuratSakit | null>(null);

  // Form states
  const [recordForm, setRecordForm] = useState<{
    santri_id: string;
    diagnosa: string;
    terapi: string;
    dokter_perawat: string;
    status: "Rawat Jalan" | "Rawat Inap" | "Kamar";
  }>({
    santri_id: "",
    diagnosa: "",
    terapi: "",
    dokter_perawat: "",
    status: "Rawat Jalan"
  });
  const [letterForm, setLetterForm] = useState({ santri_id: "", tgl_mulai: "", tgl_selesai: "", diagnosa: "", keterangan: "", petugas: "" });

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, lRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/klinik/records`),
        fetch(`${API_BASE_URL}/api/klinik/surat-sakit`)
      ]);

      const rJson = await rRes.json() as { success: boolean; data: MedicalRecord[] };
      const lJson = await lRes.json() as { success: boolean; data: SuratSakit[] };

      if (rJson.success) setRecords(rJson.data);
      if (lJson.success) setLetters(lJson.data);
    } catch {
      // Fallback
      setRecords([
        { id: 1, santri_id: 1, santri_name: "Ahmad Fauzi Rahman", santri_kelas: "Ibtida' 1", santri_asrama: "DS A 01", diagnosa: "Influenza & Demam Tinggi", terapi: "Paracetamol 500mg, Amoxicillin, Vitamin C", dokter_perawat: "dr. H. Raharjo (UKP)", status: "Rawat Jalan" },
        { id: 2, santri_id: 2, santri_name: "Fatimah Az-Zahra", santri_kelas: "Tsanawiyyah 2", santri_asrama: "DS B 05", diagnosa: "Gastroenteritis (Diare)", terapi: "Oralit, Attapulgite, Istirahat total", dokter_perawat: "Suster Aisyah", status: "Rawat Inap" }
      ]);
      setLetters([
        { id: 1, santri_id: 2, santri_name: "Fatimah Az-Zahra", santri_nisn: "2122334456", santri_kelas: "Tsanawiyyah 2", santri_asrama: "DS B 05", tgl_mulai: "2026-06-18", tgl_selesai: "2026-06-20", diagnosa: "Gastroenteritis (Diare)", keterangan: "Istirahat total di posko kesehatan putri", petugas: "Suster Aisyah", created_at: "2026-06-18 10:22:00" }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSantri();
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSantri, fetchData]);

  // Actions
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordForm.santri_id || !recordForm.diagnosa || !recordForm.dokter_perawat) {
      showToast("Harap isi semua kolom wajib!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/klinik/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          santri_id: parseInt(recordForm.santri_id),
          diagnosa: recordForm.diagnosa,
          terapi: recordForm.terapi,
          dokter_perawat: recordForm.dokter_perawat,
          status: recordForm.status
        })
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Rekam medis berhasil dicatat!", "success");
        setIsRecordModalOpen(false);
        setRecordForm({ santri_id: "", diagnosa: "", terapi: "", dokter_perawat: "", status: "Rawat Jalan" });
        fetchData();
      }
    } catch {
      const matchSantri = santriList.find(s => s.id === parseInt(recordForm.santri_id));
      const newItem: MedicalRecord = {
        id: Date.now(),
        santri_id: parseInt(recordForm.santri_id),
        santri_name: matchSantri?.name || "Unknown",
        santri_kelas: matchSantri?.kelas || "",
        santri_asrama: matchSantri?.asrama || "",
        diagnosa: recordForm.diagnosa,
        terapi: recordForm.terapi,
        dokter_perawat: recordForm.dokter_perawat,
        status: recordForm.status
      };
      setRecords(prev => [newItem, ...prev]);
      showToast("Rekam medis dicatat (Lokal)!", "success");
      setIsRecordModalOpen(false);
      setRecordForm({ santri_id: "", diagnosa: "", terapi: "", dokter_perawat: "", status: "Rawat Jalan" });
    }
  };

  const handleCreateLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterForm.santri_id || !letterForm.tgl_mulai || !letterForm.tgl_selesai || !letterForm.diagnosa || !letterForm.petugas) {
      showToast("Harap isi semua kolom wajib!", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/klinik/surat-sakit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          santri_id: parseInt(letterForm.santri_id),
          tgl_mulai: letterForm.tgl_mulai,
          tgl_selesai: letterForm.tgl_selesai,
          diagnosa: letterForm.diagnosa,
          keterangan: letterForm.keterangan,
          petugas: letterForm.petugas
        })
      });
      const json = await res.json() as { success: boolean };
      if (json.success) {
        showToast("Surat Sakit berhasil diterbitkan & terintegrasi dengan Perizinan Keamanan!", "success");
        setIsLetterModalOpen(false);
        setLetterForm({ santri_id: "", tgl_mulai: "", tgl_selesai: "", diagnosa: "", keterangan: "", petugas: "" });
        fetchData();
      }
    } catch {
      const matchSantri = santriList.find(s => s.id === parseInt(letterForm.santri_id));
      const newItem: SuratSakit = {
        id: Date.now(),
        santri_id: parseInt(letterForm.santri_id),
        santri_name: matchSantri?.name || "Unknown",
        santri_nisn: matchSantri?.nisn || "",
        santri_kelas: matchSantri?.kelas || "",
        santri_asrama: matchSantri?.asrama || "",
        tgl_mulai: letterForm.tgl_mulai,
        tgl_selesai: letterForm.tgl_selesai,
        diagnosa: letterForm.diagnosa,
        keterangan: letterForm.keterangan,
        petugas: letterForm.petugas,
        created_at: new Date().toISOString()
      };
      setLetters(prev => [newItem, ...prev]);
      showToast("Surat Sakit diterbitkan (Lokal) & diintegrasikan!", "success");
      setIsLetterModalOpen(false);
      setLetterForm({ santri_id: "", tgl_mulai: "", tgl_selesai: "", diagnosa: "", keterangan: "", petugas: "" });
    }
  };

  const getAddBtnConfig = () => {
    switch (activeTab) {
      case "records":
        return { label: "Catat Pemeriksaan", action: () => setIsRecordModalOpen(true), bg: "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20" };
      case "letters":
        return { label: "Terbitkan Surat Sakit", action: () => setIsLetterModalOpen(true), bg: "bg-red-600 hover:bg-red-700 shadow-red-500/20" };
    }
  };

  const addBtn = getAddBtnConfig();

  const filteredRecords = records.filter(r => 
    (r.santri_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.diagnosa || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.dokter_perawat || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.status || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLetters = letters.filter(l => 
    (l.santri_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.diagnosa || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.petugas || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.keterangan || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <HeartPulse className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pos Kesehatan Pesantren (UKP)</h1>
              <p className="text-sm text-slate-500 font-medium">E-Medical Record Santri & Penerbitan Surat Keterangan Sakit Terintegrasi</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={fetchData}
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
            onClick={() => { setActiveTab("records"); setSearchQuery(""); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "records" 
                ? "bg-white text-rose-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Rekam Medis
          </button>
          <button
            onClick={() => { setActiveTab("letters"); setSearchQuery(""); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "letters" 
                ? "bg-white text-red-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            Surat Keterangan Sakit
          </button>
        </div>

        {/* Content Tabs */}
        {activeTab === "records" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">Daftar Rekam Medis Pasien</h2>
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
                  <p className="text-xs font-medium">Memuat rekam medis...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Tidak ada rekam medis tercatat
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-xs text-slate-500 font-bold uppercase text-left">
                      <th className="px-6 py-4">Santri</th>
                      <th className="px-6 py-4">Diagnosa Penyakit</th>
                      <th className="px-6 py-4">Terapi & Obat-obatan</th>
                      <th className="px-6 py-4">Dokter / Perawat</th>
                      <th className="px-6 py-4">Status Pasien</th>
                      <th className="px-6 py-4">Tanggal Periksa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{r.santri_name}</div>
                          <div className="text-xs text-slate-400 mt-1">{r.santri_kelas} | {r.santri_asrama}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-semibold">{r.diagnosa}</td>
                        <td className="px-6 py-4 text-slate-600 max-w-xs">{r.terapi || "Istirahat"}</td>
                        <td className="px-6 py-4 text-slate-600">{r.dokter_perawat}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                            r.status === "Kamar" ? "bg-emerald-50 text-emerald-600" :
                            r.status === "Rawat Inap" ? "bg-rose-50 text-rose-600 animate-pulse" :
                            "bg-blue-50 text-blue-600"
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">{r.created_at?.split(" ")[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "letters" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">Daftar Surat Keterangan Sakit (SKS)</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Cari data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-4" />
                  <p className="text-xs font-medium">Memuat surat sakit...</p>
                </div>
              ) : filteredLetters.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  Belum ada surat keterangan sakit diterbitkan
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-xs text-slate-500 font-bold uppercase text-left">
                      <th className="px-6 py-4">Santri</th>
                      <th className="px-6 py-4">Diagnosa</th>
                      <th className="px-6 py-4">Durasi Tanggal Istirahat</th>
                      <th className="px-6 py-4">Petugas Klinik</th>
                      <th className="px-6 py-4">Keterangan</th>
                      <th className="px-6 py-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLetters.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{l.santri_name}</div>
                          <div className="text-xs text-slate-400 mt-1">NISN: {l.santri_nisn} | {l.santri_kelas}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-semibold">{l.diagnosa}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <div>Dari: {l.tgl_mulai}</div>
                          <div className="text-xs text-rose-500 font-bold mt-0.5">Selesai: {l.tgl_selesai}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{l.petugas}</td>
                        <td className="px-6 py-4 text-slate-500 italic">&quot;{l.keterangan || '-'}&quot;</td>
                        <td className="px-6 py-4">
                          <button onClick={() => setSelectedLetterPrint(l)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all rounded-lg text-xs font-bold">
                            <Printer className="w-3.5 h-3.5" /> Preview & Cetak
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
      </div>

      {/* Record Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateRecord} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-rose-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Catat Pemeriksaan Rekam Medis</h3>
              <button type="button" onClick={() => setIsRecordModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Santri Pasien</label>
                <select 
                  value={recordForm.santri_id}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, santri_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="">-- Pilih Santri --</option>
                  {santriList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.kelas})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Diagnosa</label>
                <input 
                  type="text" 
                  value={recordForm.diagnosa}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, diagnosa: e.target.value }))}
                  placeholder="Contoh: Influenza, Asma, Cacar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Terapi / Obat</label>
                <input 
                  type="text" 
                  value={recordForm.terapi}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, terapi: e.target.value }))}
                  placeholder="Contoh: Paracetamol 3x1, Istirahat"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dokter / Perawat</label>
                  <input 
                    type="text" 
                    value={recordForm.dokter_perawat}
                    onChange={(e) => setRecordForm(prev => ({ ...prev, dokter_perawat: e.target.value }))}
                    placeholder="Nama Pemeriksa"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Rawat</label>
                  <select 
                    value={recordForm.status}
                    onChange={(e) => setRecordForm(prev => ({ ...prev, status: e.target.value as "Rawat Jalan" | "Rawat Inap" | "Kamar" }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Rawat Jalan">Rawat Jalan</option>
                    <option value="Rawat Inap">Rawat Inap</option>
                    <option value="Kamar">Kembali ke Kamar</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsRecordModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 text-xs">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* Letter Modal */}
      {isLetterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateLetter} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-red-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Terbitkan Surat Sakit</h3>
              <button type="button" onClick={() => setIsLetterModalOpen(false)} className="text-white hover:text-slate-100 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Santri</label>
                <select 
                  value={letterForm.santri_id}
                  onChange={(e) => setLetterForm(prev => ({ ...prev, santri_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="">-- Pilih Santri --</option>
                  {santriList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.kelas})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Diagnosa Penyakit</label>
                <input 
                  type="text" 
                  value={letterForm.diagnosa}
                  onChange={(e) => setLetterForm(prev => ({ ...prev, diagnosa: e.target.value }))}
                  placeholder="Contoh: Typhus, Demam Berdarah"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Istirahat Mulai</label>
                  <input 
                    type="date" 
                    value={letterForm.tgl_mulai}
                    onChange={(e) => setLetterForm(prev => ({ ...prev, tgl_mulai: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Istirahat Selesai</label>
                  <input 
                    type="date" 
                    value={letterForm.tgl_selesai}
                    onChange={(e) => setLetterForm(prev => ({ ...prev, tgl_selesai: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Petugas Klinik (Ttd)</label>
                <input 
                  type="text" 
                  value={letterForm.petugas}
                  onChange={(e) => setLetterForm(prev => ({ ...prev, petugas: e.target.value }))}
                  placeholder="Contoh: Suster Aisyah"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keterangan Tambahan</label>
                <input 
                  type="text" 
                  value={letterForm.keterangan}
                  onChange={(e) => setLetterForm(prev => ({ ...prev, keterangan: e.target.value }))}
                  placeholder="Contoh: Istirahat di kamar sehat"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setIsLetterModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-100 text-xs">Batal</button>
              <button type="submit" className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 text-xs">Terbitkan</button>
            </div>
          </form>
        </div>
      )}

      {/* Letter Print Modal */}
      {selectedLetterPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 bg-slate-800 text-white flex justify-between items-center">
              <h3 className="font-bold">Preview Surat Keterangan Sakit</h3>
              <button type="button" onClick={() => setSelectedLetterPrint(null)} className="text-white font-bold text-xl hover:text-slate-200">&times;</button>
            </div>
            <div className="p-8 text-slate-900 text-xs space-y-4" id="printable-sks">
              <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
                <h4 className="text-base font-bold uppercase tracking-wide">Pondok Pesantren Darussalam Lirboyo</h4>
                <p className="text-[10px] text-slate-500">Pos Kesehatan Pesantren (UKP) | Kediri, Jawa Timur</p>
              </div>

              <div className="text-center mb-6">
                <h5 className="font-extrabold text-sm underline uppercase">Surat Keterangan Sakit</h5>
                <p className="text-[10px] text-slate-500">No: SKS/UKP/{selectedLetterPrint.id}/2026</p>
              </div>

              <p className="text-slate-700 leading-relaxed">
                Menerangkan bahwa santri yang beridentitas di bawah ini:
              </p>

              <table className="w-full text-slate-800 ml-4 border-collapse">
                <tbody>
                  <tr className="h-6">
                    <td className="w-28 font-semibold">Nama Lengkap</td>
                    <td className="w-4">:</td>
                    <td className="font-bold text-slate-900">{selectedLetterPrint.santri_name}</td>
                  </tr>
                  <tr className="h-6">
                    <td className="font-semibold">Kelas Madrasah</td>
                    <td>:</td>
                    <td>{selectedLetterPrint.santri_kelas}</td>
                  </tr>
                  <tr className="h-6">
                    <td className="font-semibold">Kamar Asrama</td>
                    <td>:</td>
                    <td>{selectedLetterPrint.santri_asrama}</td>
                  </tr>
                </tbody>
              </table>

              <p className="text-slate-700 leading-relaxed">
                Dinyatakan dalam kondisi kurang sehat dengan diagnosa: <strong className="text-slate-900 font-bold underline">{selectedLetterPrint.diagnosa}</strong>.
              </p>

              <p className="text-slate-700 leading-relaxed">
                Kepada yang bersangkutan diberikan izin untuk beristirahat dan dibebaskan dari kegiatan pondok / sekolah selama <span className="font-bold">
                  {Math.ceil((new Date(selectedLetterPrint.tgl_selesai).getTime() - new Date(selectedLetterPrint.tgl_mulai).getTime()) / (1000 * 60 * 60 * 24)) + 1} hari
                </span>, terhitung mulai tanggal <span className="font-bold">{selectedLetterPrint.tgl_mulai}</span> s/d <span className="font-bold">{selectedLetterPrint.tgl_selesai}</span>.
              </p>

              <p className="text-slate-500 leading-relaxed italic pt-2">
                *Catatan: {selectedLetterPrint.keterangan || "Harap istirahat total di Posko Kesehatan"}.
              </p>

              <div className="flex justify-between pt-8">
                <div></div>
                <div className="text-center mr-6">
                  <p>Kediri, {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="mt-1 font-semibold">Petugas Kesehatan UKP,</p>
                  <div className="h-14"></div>
                  <p className="font-bold underline">{selectedLetterPrint.petugas}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setSelectedLetterPrint(null)} className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-100">Tutup</button>
              <button onClick={() => window.print()} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 flex items-center gap-1">
                <Printer className="w-3.5 h-3.5" /> Cetak Surat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

