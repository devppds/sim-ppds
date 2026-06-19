"use client";

import { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "./Toast";
import { API_BASE_URL } from "@/lib/config";

interface ImportSantriModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportSantriModal({ isOpen, onClose, onSuccess }: ImportSantriModalProps) {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          showToast("File kosong atau format tidak valid", "error");
          return;
        }

        setPreviewData(data);
        showToast(`Berhasil membaca ${data.length} baris data`, "success");
      } catch (err) {
        showToast("Gagal membaca file Excel", "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadSample = () => {
    const sampleData = [
      {
        NISN: "0012345001",
        NIK: "3501010101010001",
        Nama: "Ahmad Santri Contoh",
        Madrasah: "MHM",
        Kelas: "Ibtida' 1",
        Asrama: "DS A 01",
        Asal: "Surabaya",
        "Wali WA": "081234567890",
        "Nama Wali": "Bpk. Abdullah"
      },
      {
        NISN: "0012345002",
        NIK: "3501010101010002",
        Nama: "Zaki Santri Contoh",
        Madrasah: "MIU",
        Kelas: "Ula 1",
        Asrama: "DS B 05",
        Asal: "Malang",
        "Wali WA": "081299998888",
        "Nama Wali": "Ibu Siti"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Import");
    XLSX.writeFile(wb, "Template_Import_Santri.xlsx");
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;

    setLoading(true);
    try {
      // Map keys to database format
      const formattedData = previewData.map(item => ({
        nisn: item.NISN?.toString() || "",
        nik: item.NIK?.toString() || "",
        name: item.Nama?.toString() || "",
        madrasah: item.Madrasah?.toString() || "",
        kelas: item.Kelas?.toString() || "",
        asrama: item.Asrama?.toString() || "",
        asal: item.Asal?.toString() || "",
        wali_wa: item["Wali WA"]?.toString() || "",
        wali_name: item["Nama Wali"]?.toString() || "",
        gender: "L" // Default
      }));

      const res = await fetch(`${API_BASE_URL}/api/santri/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData)
      });

      const json = await res.json() as any;
      if (json.success) {
        showToast(`Berhasil mengimport ${json.count} santri!`, "success");
        onSuccess();
        window.dispatchEvent(new CustomEvent('santri-updated'));
        onClose();
      } else {
        showToast(json.error || "Gagal mengimport data", "error");
      }
    } catch (e) {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden scale-in-center overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <Upload className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 tracking-tight">Import Data Santri</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Upload file Excel (.xlsx / .csv)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Dropzone / Upload area */}
          {!previewData.length ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-[32px] p-12 flex flex-col items-center justify-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:bg-white group-hover:text-indigo-500 shadow-sm transition-all duration-300">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-700">Pilih file Excel Anda</p>
                <p className="text-xs font-bold text-slate-400 mt-1">atau tarik file ke sini</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileChange} 
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-slate-700">Preview Data ({previewData.length} Baris)</p>
                <button 
                  onClick={() => {
                    setPreviewData([]);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs font-bold text-rose-500 hover:underline"
                >
                  Ganti File
                </button>
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-[10px] text-slate-600 text-left">
                  <thead className="sticky top-0 bg-white border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2 font-black">Nama</th>
                      <th className="px-4 py-2 font-black">NISN</th>
                      <th className="px-4 py-2 font-black">Kelas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 font-bold uppercase">{row.Nama || "-"}</td>
                        <td className="px-4 py-2 font-mono">{row.NISN || "-"}</td>
                        <td className="px-4 py-2">{row.Kelas || "-"}</td>
                      </tr>
                    ))}
                    {previewData.length > 10 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-center font-bold text-slate-400">... dan {previewData.length - 10} data lainnya</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex gap-4">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest mb-1">Panduan Import</p>
              <p className="text-xs font-bold text-amber-900/70 leading-relaxed">
                Gunakan template Excel yang sudah kami sediakan untuk memastikan format kolom (Nama, NISN, NIK, dll) sesuai dengan sistem.
              </p>
              <button 
                onClick={downloadSample}
                className="mt-3 flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download Template Contoh
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-4 pt-4 border-t border-slate-50">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button
              disabled={loading || !previewData.length}
              onClick={handleImport}
              className="flex-2 py-4 rounded-2xl bg-indigo-600 text-white text-sm font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 disabled:grayscale disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {loading ? "Sedang Import..." : "Import Sekarang"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
