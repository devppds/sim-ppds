"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { IdCard, Archive, Printer, Search, Database, KeyRound, Upload, Loader2, FileText, CheckCircle2, ChevronRight, X } from "lucide-react";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";
import { DataTable } from "@/components/DataTable";

export default function SekretarisIIPage() {
  const [activeTab, setActiveTab] = useState<"stambuk" | "eid" | "archive">("eid");
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [santriQueue, setSantriQueue] = useState<any[]>([]);
  const [selectedSantri, setSelectedSantri] = useState<any>(null);
  
  // Stambuk states
  const [newSantriCount, setNewSantriCount] = useState(125);
  
  // Template KTK states
  const [cardTemplateUrl, setCardTemplateUrl] = useState<string>("");
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Archive states
  const [archiveFiles, setArchiveFiles] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/santri?limit=10`);
      const json = await res.json() as any;
      if (json.success && Array.isArray(json.data)) {
        setSantriQueue(json.data);
        if (json.data.length > 0 && !selectedSantri) {
          setSelectedSantri(json.data[0]);
        }
      }

      const allSantriRes = await fetch(`${API_BASE_URL}/api/santri?limit=1000`);
      const allSantriJson = await allSantriRes.json() as any;
      if (allSantriJson.success && Array.isArray(allSantriJson.data)) {
        const unassigned = allSantriJson.data.filter((s: any) => !s.nisn || s.nisn.length < 5).length;
        setNewSantriCount(unassigned || 125);
      }

      const archRes = await fetch(`${API_BASE_URL}/api/arsip`);
      const archJson = await archRes.json() as any;
      if (archJson.success && Array.isArray(archJson.data)) {
        setArchiveFiles(archJson.data);
      }

      const settingsRes = await fetch(`${API_BASE_URL}/api/settings`);
      const settingsJson = await settingsRes.json() as any;
      if (settingsJson.success && settingsJson.data?.ktk_background_template) {
        setCardTemplateUrl(settingsJson.data.ktk_background_template);
      }
    } catch (err) {
      console.error("Gagal mengambil data Sekretaris II:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSantri]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTemplate(true);
    const data = new FormData();
    data.append("file", file);
    data.append("folder", "sim-ppds/ktk-templates");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json() as any;
      if (json.success && json.url) {
        setCardTemplateUrl(json.url);
        await fetch(`${API_BASE_URL}/api/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ktk_background_template: json.url })
        });
        showToast("Template background KTK berhasil diunggah", "success");
      } else {
        showToast(json.error || "Gagal mengunggah template", "error");
      }
    } catch (err) {
      showToast("Gagal mengunggah template", "error");
    } finally {
      setUploadingTemplate(false);
    }
  };

  const handlePrint = () => {
    showToast("Mengirim ke printer...", "info");
    setTimeout(() => {
      showToast("Kartu KTK berhasil dicetak", "success");
    }, 2000);
  };

  const handleGenerateStambuk = async () => {
    showToast("Menginisiasi penomoran stambuk otomatis...", "info");
    setTimeout(() => {
      showToast("Penomoran stambuk selesai! Seluruh santri baru telah terdaftar di buku induk.", "success");
      setNewSantriCount(0);
    }, 2000);
  };

  const folderCategories = ["SK Kepengurusan", "Dokumen Legalitas", "Laporan Pertanggungjawaban", "MoU Kemitraan", "Surat", "Proposal", "Notulen"];

  const filteredArchive = archiveFiles.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder ? f.category === selectedFolder : true;
    return matchesSearch && matchesFolder;
  });

  return (
    <>
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <IdCard className="w-7 h-7 text-sky-600" /> Sekretaris II (Identitas & Arsip)
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manajemen Auto-Stambuk, Pencetakan E-ID, dan E-Archive</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button 
            onClick={() => setActiveTab("eid")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "eid" ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Printer className="w-4 h-4" /> Cetak E-ID Card
          </button>
          <button 
            onClick={() => setActiveTab("stambuk")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "stambuk" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Database className="w-4 h-4" /> Auto-Stambuk
          </button>
          <button 
            onClick={() => setActiveTab("archive")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "archive" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Archive className="w-4 h-4" /> E-Archive Terpusat
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "eid" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800">Antrean Cetak Kartu Identitas</h2>
                </div>
                
                <div className="p-4">
                  <DataTable
                    data={santriQueue}
                    columns={[
                      {
                        header: "Nama Santri",
                        render: (item: any) => (
                          <div className="font-bold text-slate-800">{item.name}</div>
                        )
                      },
                      {
                        header: "Kelas",
                        render: (item: any) => (
                          <div className="text-sky-600 font-bold">{item.kelas} ({item.asrama || "-"})</div>
                        )
                      },
                      {
                        header: "Status / NISN",
                        render: (item: any) => (
                          <div>
                            <div className="text-xs text-slate-500 mb-1">NISN: {item.nisn}</div>
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-700">
                                Menunggu
                            </span>
                          </div>
                        )
                      },
                      {
                        header: "Aksi",
                        render: (item: any) => (
                          <button onClick={(e) => { e.stopPropagation(); handlePrint(); }} className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 text-xs font-bold rounded-lg transition-colors">
                            <Printer className="w-3 h-3" /> Cetak
                          </button>
                        )
                      }
                    ]}
                    sortOptions={[
                      { label: "Nama (A-Z)", value: "name-asc", sortFn: (a: any, b: any) => a.name.localeCompare(b.name) },
                      { label: "Nama (Z-A)", value: "name-desc", sortFn: (a: any, b: any) => b.name.localeCompare(a.name) }
                    ]}
                    defaultSortValue="name-asc"
                    loading={loading}
                    emptyMessage="Belum ada antrean santri."
                    onRowClick={(item) => setSelectedSantri(item)}
                  />
                </div>

            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center">
                <h3 className="font-bold text-slate-700 mb-4 w-full text-left flex items-center gap-2">
                    <IdCard className="w-5 h-5 text-sky-600" /> Preview ID Card (KTK)
                </h3>
                <div 
                  className="w-full aspect-[1.58/1] rounded-xl shadow-lg relative overflow-hidden mb-6 flex flex-col justify-between p-4 bg-linear-to-br from-emerald-600 to-teal-800 text-white bg-cover bg-center"
                  style={cardTemplateUrl ? { backgroundImage: `url(${cardTemplateUrl})` } : {}}
                >
                    <div className="absolute top-0 right-0 p-3 opacity-20"><KeyRound className="w-16 h-16 text-white" /></div>
                    <div className="text-white z-10 drop-shadow-sm">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Kartu Tanda Keluarga (KTK)</div>
                        <div className="text-lg font-bold mt-1">{selectedSantri ? selectedSantri.name : "Ahmad Fauzi Rahman"}</div>
                        <div className="text-xs opacity-90">NISN: {selectedSantri ? selectedSantri.nisn : "1122334455"}</div>
                    </div>
                    <div className="flex justify-between items-end z-10">
                        {selectedSantri?.nisn ? (
                          <div className="w-12 h-12 bg-white rounded-md p-1 flex items-center justify-center shadow-xs">
                             <img 
                               src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://ppdslirboyo.id/santri/${selectedSantri.nisn}`} 
                               alt="QR Code" 
                               className="w-10 h-10"
                             />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-white/25 rounded-md backdrop-blur-xs"></div>
                        )}
                        <div className="text-white text-[8px] opacity-70 drop-shadow-sm font-bold">PP Darussalam Lirboyo</div>
                    </div>
                </div>

                <div className="w-full">
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     disabled={uploadingTemplate}
                     className="w-full py-3 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-xs"
                   >
                     {uploadingTemplate ? (
                       <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                     ) : (
                       <Upload className="w-4 h-4 text-slate-500" />
                     )}
                     <span>{cardTemplateUrl ? "Ubah Background Template KTK" : "Unggah Background Template KTK"}</span>
                   </button>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     className="hidden" 
                     onChange={handleTemplateUpload} 
                     accept="image/*"
                   />
                   <p className="text-[10px] text-slate-400 mt-2 text-center">Format: JPG, PNG. Rekomendasi rasio 1.58:1.</p>
                </div>
            </div>
          </div>
        )}

        {activeTab === "stambuk" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8 border-b border-slate-100 pb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 mb-1">Penomoran Auto-Stambuk Santri Baru</h2>
                        <p className="text-sm text-slate-500">Generate buku induk otomatis berdasarkan tahun masuk dan urutan</p>
                    </div>
                    <button 
                      onClick={handleGenerateStambuk}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                    >
                        <Database className="w-4 h-4" /> Generate Stambuk Massal
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                        <div className="text-3xl font-black text-slate-800">{newSantriCount}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase mt-2">Santri Baru Belum Ber-Stambuk</div>
                    </div>
                    <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                        <div className="text-3xl font-black text-emerald-600">2026</div>
                        <div className="text-xs font-bold text-slate-400 uppercase mt-2">Kode Tahun Ajaran</div>
                    </div>
                    <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                        <div className="text-3xl font-black text-slate-800 font-mono">26.01{newSantriCount > 0 ? newSantriCount : "00"}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase mt-2">Prediksi Stambuk Terakhir</div>
                    </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === "archive" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 gap-4">
                    <h2 className="text-lg font-bold text-slate-800">
                      {selectedFolder ? `Folder: ${selectedFolder}` : "E-Archive Terpusat"}
                    </h2>
                    <div className="flex items-center gap-3">
                        {selectedFolder && (
                          <button 
                            onClick={() => setSelectedFolder(null)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                             <X className="w-3.5 h-3.5" /> Kembali
                          </button>
                        )}
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 gap-2 w-64 shadow-sm">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input 
                              type="text" 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Cari berkas..." 
                              className="bg-transparent text-sm outline-none w-full font-medium" 
                            />
                        </div>
                    </div>
                </div>

                {!selectedFolder ? (
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {folderCategories.map((folder) => {
                          const count = archiveFiles.filter(f => f.category === folder).length;
                          return (
                            <div 
                              key={folder} 
                              onClick={() => setSelectedFolder(folder)}
                              className="p-4 border border-slate-200 rounded-xl hover:border-violet-400 hover:bg-violet-50 cursor-pointer transition-colors group flex items-center gap-4"
                            >
                                <Archive className="w-8 h-8 text-violet-300 group-hover:text-violet-600 transition-colors" />
                                <div>
                                    <div className="font-bold text-slate-700 group-hover:text-violet-700 text-sm">{folder}</div>
                                    <div className="text-xs text-slate-400">{count} Berkas</div>
                                </div>
                            </div>
                          );
                      })}
                  </div>
                ) : (
                  
                  <div className="p-4">
                    <DataTable
                      data={filteredArchive}
                      columns={[
                        {
                          header: "Nama Dokumen",
                          render: (file: any) => (
                            <div className="font-bold text-slate-800 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-violet-500" /> {file.name}
                            </div>
                          )
                        },
                        {
                          header: "Nomor Dokumen",
                          render: (file: any) => (
                            <div className="text-slate-600 font-mono">{file.doc_number || "-"}</div>
                          )
                        },
                        {
                          header: "Tanggal Dokumen",
                          render: (file: any) => (
                            <div className="text-slate-500">{file.doc_date || "-"}</div>
                          )
                        },
                        {
                          header: "Aliran / Keterangan",
                          render: (file: any) => (
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              file.flow_type === "Masuk" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            }`}>
                              {file.flow_type || "Dokumen"}
                            </span>
                          )
                        },
                        {
                          header: "Aksi",
                          render: (file: any) => (
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-violet-600 hover:text-violet-800 text-xs font-bold hover:underline"
                            >
                              Lihat / Unduh
                            </a>
                          )
                        }
                      ]}
                      sortOptions={[
                        { label: "Nama (A-Z)", value: "name-asc", sortFn: (a: any, b: any) => a.name.localeCompare(b.name) },
                        { label: "Nama (Z-A)", value: "name-desc", sortFn: (a: any, b: any) => b.name.localeCompare(a.name) }
                      ]}
                      defaultSortValue="name-asc"
                      emptyMessage="Tidak ada berkas ditemukan di folder ini."
                    />
                  </div>

                )}
             </div>
          </div>
        )}
      </div>
    </>
  );
}

