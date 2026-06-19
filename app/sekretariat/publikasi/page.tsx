"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Megaphone, Award, Send, FileCode2, CheckCircle, Download, FileText, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";

export default function SekretariatPublikasiPage() {
  const [activeTab, setActiveTab] = useState<"certificate" | "proposal" | "broadcast">("certificate");
  const { showToast } = useToast();

  // E-Sertifikat states
  const [certName, setCertName] = useState("");
  const [certDesc, setCertDesc] = useState("");
  const [certTemplate, setCertTemplate] = useState("Sertifikat Khidmah Pengurus (Emas)");
  const [generatingCert, setGeneratingCert] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  // E-Proposal states
  const [proposals, setProposals] = useState<any[]>([]);
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalBy, setProposalBy] = useState("Seksi Jam'iyyah");
  const [proposalBudget, setProposalBudget] = useState("");
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Broadcast states
  const [broadcastTarget, setBroadcastTarget] = useState("Seluruh Wali Santri");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/arsip`);
      const json = await res.json() as any;
      if (json.success && Array.isArray(json.data)) {
        const certs = json.data.filter((d: any) => d.category === "Sertifikat");
        setCertificates(certs);
        if (certs.length > 0 && !selectedCert) {
          setSelectedCert(certs[0]);
        }

        const props = json.data.filter((d: any) => d.category === "Proposal");
        setProposals(props);
      }
    } catch (err) {
      console.error("Gagal mengambil data arsip:", err);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`);
      const json = await res.json() as any;
      if (json.success && Array.isArray(json.data)) {
        setBroadcastHistory(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil riwayat broadcast:", err);
    }
  }, [selectedCert]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateCertificate = async () => {
    if (!certName || !certDesc) {
      showToast("Nama dan keterangan wajib diisi", "error");
      return;
    }
    setGeneratingCert(true);
    showToast("Mempersiapkan template sertifikat...", "info");
    try {
      const docName = `${certTemplate} - ${certName}`;
      const res = await fetch(`${API_BASE_URL}/api/arsip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: docName,
          category: "Sertifikat",
          url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
          type: "PDF",
          size: "245.8 KB",
          doc_date: new Date().toISOString().split('T')[0],
          doc_number: `CERT/${Date.now().toString().slice(-6)}`,
          flow_type: "Keluar",
          sender_receiver: certName
        })
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Sertifikat berhasil di-generate. Siap diunduh.", "success");
        setCertName("");
        setCertDesc("");
        fetchData();
      } else {
        showToast(json.error || "Gagal membuat sertifikat", "error");
      }
    } catch (err) {
      showToast("Kesalahan jaringan", "error");
    } finally {
      setGeneratingCert(false);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalTitle || !proposalBudget) {
      showToast("Judul dan Anggaran wajib diisi", "error");
      return;
    }
    setSubmittingProposal(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/arsip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: proposalTitle,
          category: "Proposal",
          url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
          type: "PDF",
          size: "1.2 MB",
          doc_date: new Date().toISOString().split('T')[0],
          doc_number: `Rp ${Number(proposalBudget).toLocaleString("id-ID")}`,
          flow_type: "Diajukan",
          sender_receiver: proposalBy
        })
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Proposal berhasil diajukan!", "success");
        setProposalTitle("");
        setProposalBudget("");
        fetchData();
      } else {
        showToast(json.error || "Gagal mengajukan proposal", "error");
      }
    } catch (err) {
      showToast("Kesalahan jaringan", "error");
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) {
      showToast("Judul dan isi pesan wajib diisi", "error");
      return;
    }
    setSendingBroadcast(true);
    try {
      const fullMessage = `[Tujuan: ${broadcastTarget}] ${broadcastMessage}`;
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle,
          message: fullMessage,
          type: "warning"
        })
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Broadcast berhasil dikirim!", "success");
        setBroadcastTitle("");
        setBroadcastMessage("");
        fetchData();
      } else {
        showToast(json.error || "Gagal mengirim broadcast", "error");
      }
    } catch (err) {
      showToast("Kesalahan jaringan", "error");
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Megaphone className="w-7 h-7 text-indigo-600" /> Sekretaris I (Publikasi)
            </h1>
            <p className="text-sm text-slate-500 mt-1">Sertifikasi, E-Proposal, dan Manajemen Pengumuman (Broadcast)</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button 
            onClick={() => setActiveTab("certificate")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "certificate" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Award className="w-4 h-4" /> E-Sertifikat
          </button>
          <button 
            onClick={() => setActiveTab("proposal")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "proposal" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <FileCode2 className="w-4 h-4" /> E-Proposal
          </button>
          <button 
            onClick={() => setActiveTab("broadcast")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "broadcast" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"}`}
          >
            <Send className="w-4 h-4" /> Sistem Broadcast
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "certificate" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Buat E-Sertifikat Pengurus</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Santri / Pengurus</label>
                    <input 
                      type="text" 
                      value={certName}
                      onChange={(e) => setCertName(e.target.value)}
                      className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold" 
                      placeholder="Masukkan nama..." 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Keterangan / Jabatan</label>
                    <input 
                      type="text" 
                      value={certDesc}
                      onChange={(e) => setCertDesc(e.target.value)}
                      className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold" 
                      placeholder="Cth: Pengurus Asrama Al-Ghazali 2025/2026" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pilih Template</label>
                    <select 
                      value={certTemplate}
                      onChange={(e) => setCertTemplate(e.target.value)}
                      className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                    >
                        <option value="Sertifikat Khidmah Pengurus (Emas)">Sertifikat Khidmah Pengurus (Emas)</option>
                        <option value="Sertifikat Kehadiran Rapat / Seminar">Sertifikat Kehadiran Rapat / Seminar</option>
                        <option value="Sertifikat Penghargaan Khusus">Sertifikat Penghargaan Khusus</option>
                    </select>
                  </div>
                  <button 
                    onClick={handleGenerateCertificate} 
                    disabled={generatingCert}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    {generatingCert ? "Memproses..." : "Buat Sertifikat"}
                  </button>
                </div>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center justify-center text-center">
                <div className="w-full max-w-sm aspect-[1.4/1] bg-white border border-slate-300 shadow-sm rounded-lg mb-4 flex flex-col items-center justify-center p-6 relative">
                    {selectedCert ? (
                      <div className="border-4 border-double border-amber-600 w-full h-full flex flex-col justify-between p-4 bg-amber-50/20 text-slate-800">
                        <div className="text-center font-serif text-lg font-black text-amber-700">SERTIFIKAT</div>
                        <div className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-black">Diberikan Kepada:</div>
                        <div className="text-center text-base font-black text-slate-800 underline tracking-wide">{selectedCert.sender_receiver}</div>
                        <div className="text-[8px] text-center text-slate-500 italic max-w-xs mx-auto">{selectedCert.name.split(" - ")[0]}</div>
                        <div className="text-[6px] text-center font-mono text-slate-400 mt-2">No: {selectedCert.doc_number}</div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 mb-2 text-slate-400" />
                        <p className="text-xs font-medium text-slate-400">Preview Sertifikat</p>
                      </>
                    )}
                </div>
                {selectedCert?.url && (
                  <a 
                    href={selectedCert.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 shadow-xs"
                  >
                      <Download className="w-4 h-4" /> Unduh PDF
                  </a>
                )}
            </div>

            <div className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mt-4">
               <h3 className="font-bold text-slate-800 mb-4">Riwayat E-Sertifikat Terbuat</h3>
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                     <thead className="bg-slate-50 border-b border-slate-100">
                        <tr className="text-xs text-slate-500 font-bold uppercase tracking-wider text-left">
                           <th className="px-4 py-3">Nama Sertifikat</th>
                           <th className="px-4 py-3">Penerima</th>
                           <th className="px-4 py-3">Nomor</th>
                           <th className="px-4 py-3">Tanggal Buat</th>
                           <th className="px-4 py-3">Aksi</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {certificates.length === 0 ? (
                           <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-bold">Belum ada sertifikat terbuat.</td>
                           </tr>
                        ) : (
                           certificates.map((cert) => (
                              <tr key={cert.id} onClick={() => setSelectedCert(cert)} className={`cursor-pointer hover:bg-slate-50/50 transition-colors ${selectedCert?.id === cert.id ? 'bg-indigo-50/50' : ''}`}>
                                 <td className="px-4 py-3 font-bold text-slate-800">{cert.name}</td>
                                 <td className="px-4 py-3 text-slate-600">{cert.sender_receiver}</td>
                                 <td className="px-4 py-3 text-slate-500 font-mono">{cert.doc_number}</td>
                                 <td className="px-4 py-3 text-slate-500">{cert.doc_date}</td>
                                 <td className="px-4 py-3">
                                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-xs font-bold hover:underline" onClick={(e) => e.stopPropagation()}>Unduh PDF</a>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === "proposal" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h2 className="text-lg font-bold text-slate-800">Daftar Pengajuan Proposal</h2>
                    <p className="text-sm text-slate-500">Persetujuan terintegrasi dari Ketua Umum dan pencairan via Bendahara</p>
                 </div>
               </div>
               <table className="w-full text-sm">
                 <thead className="bg-slate-50 border-b border-slate-100">
                   <tr className="text-xs text-slate-500 font-bold uppercase tracking-wider text-left">
                     <th className="px-6 py-4">Judul Proposal</th>
                     <th className="px-6 py-4">Pengaju (Seksi)</th>
                     <th className="px-6 py-4">Anggaran</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Aksi</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {proposals.length === 0 ? (
                     <tr>
                       <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-bold">
                         Belum ada pengajuan proposal.
                       </td>
                     </tr>
                   ) : (
                     proposals.map((item) => (
                       <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                           <FileText className="w-4 h-4 text-slate-400" /> {item.name}
                         </td>
                         <td className="px-6 py-4 text-slate-600">{item.sender_receiver}</td>
                         <td className="px-6 py-4 font-mono font-bold text-slate-700">{item.doc_number}</td>
                         <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                              item.flow_type === 'Diajukan' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {item.flow_type}
                            </span>
                         </td>
                         <td className="px-6 py-4">
                           {item.url && (
                             <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-xs font-bold hover:underline">
                               Unduh Berkas
                             </a>
                           )}
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm self-start">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <FileCode2 className="w-5 h-5 text-emerald-600" /> Buat Pengajuan Proposal
               </h3>
               <form onSubmit={handleCreateProposal} className="space-y-4">
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Judul Proposal</label>
                   <input 
                     type="text" 
                     required
                     value={proposalTitle}
                     onChange={(e) => setProposalTitle(e.target.value)}
                     className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold" 
                     placeholder="Cth: Kegiatan PHBI Maulid Nabi..." 
                   />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Seksi Pengaju</label>
                   <select 
                     value={proposalBy}
                     onChange={(e) => setProposalBy(e.target.value)}
                     className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-slate-700"
                   >
                     <option value="Seksi Jam'iyyah">Seksi Jam&apos;iyyah</option>
                     <option value="Seksi PLP">Seksi PLP</option>
                     <option value="Seksi Keamanan">Seksi Keamanan</option>
                     <option value="Seksi Pembangunan">Seksi Pembangunan</option>
                     <option value="Seksi Media">Seksi Media</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Estimasi Anggaran (Rupiah)</label>
                   <input 
                     type="number" 
                     required
                     value={proposalBudget}
                     onChange={(e) => setProposalBudget(e.target.value)}
                     className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold" 
                     placeholder="Cth: 15000000" 
                   />
                 </div>
                 <button 
                   type="submit" 
                   disabled={submittingProposal}
                   className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                 >
                   {submittingProposal ? "Mengajukan..." : "Ajukan Proposal"}
                 </button>
               </form>
            </div>
          </div>
        )}

        {activeTab === "broadcast" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-1">Buat Pengumuman Baru</h2>
                <p className="text-sm text-slate-500 mb-6">Pesan akan disiarkan melalui notifikasi aplikasi secara real-time</p>
                
                <form onSubmit={handleSendBroadcast} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tujuan (Penerima)</label>
                    <select 
                      value={broadcastTarget}
                      onChange={(e) => setBroadcastTarget(e.target.value)}
                      className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-bold text-slate-700"
                    >
                        <option value="Seluruh Wali Santri">Seluruh Wali Santri</option>
                        <option value="Seluruh Pengurus Pondok">Seluruh Pengurus Pondok</option>
                        <option value="Wali Santri Tunggakan SPP">Wali Santri Tunggakan SPP</option>
                        <option value="Santri Kelas Aliyyah">Santri Kelas Aliyyah</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Judul Pengumuman</label>
                    <input 
                      type="text" 
                      required
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-bold" 
                      placeholder="Penting: Libur Maulid Nabi..." 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Isi Pesan</label>
                    <textarea 
                      rows={4} 
                      required
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="mt-1 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 resize-none font-medium" 
                      placeholder="Assalamu'alaikum Wr. Wb. Diberitahukan kepada..."
                    ></textarea>
                  </div>
                  
                  <div className="flex gap-4 pt-2">
                      <button 
                        type="submit" 
                        disabled={sendingBroadcast}
                        className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" /> {sendingBroadcast ? "Mengirim..." : "Kirim Sekarang"}
                      </button>
                  </div>
                </form>
             </div>
             
             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-start max-h-[550px] overflow-y-auto">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" /> Riwayat Broadcast
                </h3>
                <div className="space-y-3">
                    {broadcastHistory.length === 0 ? (
                      <p className="text-sm text-slate-400 font-bold text-center py-6">Belum ada riwayat broadcast.</p>
                    ) : (
                      broadcastHistory.map((item) => (
                        <div key={item.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  item.is_read ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {item.is_read ? 'Sudah Dibaca' : 'Berhasil Dikirim'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">
                                  {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "Baru"}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 mb-1">{item.title}</p>
                            <p className="text-xs text-slate-500 font-medium line-clamp-3">{item.message}</p>
                        </div>
                      ))
                    )}
                </div>
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
