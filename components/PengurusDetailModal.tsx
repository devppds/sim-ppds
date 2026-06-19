"use client";

import { useState } from "react";
import { X, User, Phone, Mail, Shield, Trash2, Edit3, LogOut, Home, Star, CheckCircle2 } from "lucide-react";
import { useToast } from "./Toast";
import { API_BASE_URL } from "@/lib/config";
import EditPengurusModal from "./EditPengurusModal";
import ConfirmModal from "./ConfirmModal";

interface Pengurus {
  id: number;
  nik: string;
  name: string;
  jabatan: string;
  jabatan_tambahan?: string;
  kamar?: string;
  phone: string;
  status: string;
  photo_url?: string;
  gender: string;
}

interface PengurusDetailModalProps {
  pengurus: Pengurus | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PengurusDetailModal({ pengurus, isOpen, onClose, onUpdate }: PengurusDetailModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAlumniConfirmOpen, setIsAlumniConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen || !pengurus) return null;

  const openWhatsApp = () => {
    if (!pengurus.phone) {
      showToast("Nomor WA tidak tersedia", "warning");
      return;
    }
    
    let phone = pengurus.phone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    } else if (phone.startsWith('8')) {
        phone = '62' + phone;
    }
    
    const message = encodeURIComponent(`Assalamu'alaikum Wr. Wb. Kami dari Pengurus Pondok Pesantren Darussalam.......`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  async function handleMoveToAlumni() {
    setLoading(true);
    try {
      // Get current academic year
      const now = new Date();
      const currentYear = now.getMonth() >= 6 
        ? `${now.getFullYear()}/${now.getFullYear() + 1}`
        : `${now.getFullYear() - 1}/${now.getFullYear()}`;

      const res = await fetch(`${API_BASE_URL}/api/pengurus/${pengurus!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "Tidak Aktif",
          tahun_purna: currentYear
        }),
      });
      if (res.ok) {
        showToast("Pengurus berhasil dinonaktifkan", "success");
        onUpdate();
        window.dispatchEvent(new CustomEvent('pengurus-updated'));
        onClose();
      }
    } catch (err) {
      showToast("Gagal memproses data", "error");
    } finally {
      setLoading(false);
      setIsAlumniConfirmOpen(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/pengurus/${pengurus!.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Data pengurus berhasil dihapus permanen", "success");
        onUpdate();
        window.dispatchEvent(new CustomEvent('pengurus-updated'));
        onClose();
      }
    } catch (err) {
        showToast("Gagal menghapus data", "error");
    } finally {
        setLoading(false);
        setIsDeleteConfirmOpen(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 text-[#1e293b]">
        <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden scale-in-center relative">
          {/* Header Section */}
          <div className="relative h-44 bg-indigo-600">
            {/* Pattern Backdrop */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.15)_1px,_transparent_0)] bg-[size:20px_20px]"></div>
            
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-8 right-8 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20 backdrop-blur-md border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Status Badge Over Header */}
            <div className={`absolute top-8 left-8 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/20 transition-all ${
              pengurus.status === 'Aktif' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {pengurus.status}
            </div>
          </div>

          {/* Photo Container - Moved OUT of overflow-hidden header to prevent clipping */}
          <div className="absolute top-[110px] left-1/2 -translate-x-1/2 z-10 transition-transform hover:scale-105 duration-300">
            <div className="w-32 h-32 rounded-[40px] bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
              <div className="w-full h-full rounded-[32px] overflow-hidden bg-slate-100 border-2 border-slate-50 relative group">
                {pengurus.photo_url ? (
                  <img src={pengurus.photo_url} alt={pengurus.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <User className="w-14 h-14" />
                  </div>
                )}
                {pengurus.status === 'Aktif' && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="pt-24 pb-10 px-8 flex flex-col items-center">
            {/* Name and Basic Titles */}
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{pengurus.name}</h3>
              <div className="flex items-center justify-center gap-2">
                <span className="px-3 py-1 bg-indigo-50 text-[10px] font-black text-indigo-600 rounded-lg uppercase tracking-wider">{pengurus.jabatan}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NIK: {pengurus.nik}</span>
              </div>
            </div>

            {/* Info Cards Grid */}
            <div className="w-full space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center p-4 bg-slate-50/50 rounded-[32px] border border-slate-100/80 transition-all hover:bg-white hover:shadow-md">
                    <Star className="w-5 h-5 text-amber-500 mb-2" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Jabatan Tambahan</p>
                    <p className="text-xs font-black text-slate-700">{pengurus.jabatan_tambahan || "-"}</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-slate-50/50 rounded-[32px] border border-slate-100/80 transition-all hover:bg-white hover:shadow-md">
                    <Home className="w-5 h-5 text-indigo-500 mb-2" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Kamar Asrama</p>
                    <p className="text-xs font-black text-slate-700">{pengurus.kamar || "-"}</p>
                </div>
              </div>

              {/* Actionable Cards */}
              <div 
                onClick={openWhatsApp}
                className="flex items-center gap-4 p-5 bg-emerald-50/30 rounded-[32px] border border-emerald-100/50 cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-emerald-500/10 transition-all group/wa"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover/wa:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Personal</p>
                  <p className="text-sm font-black text-slate-700">{pengurus.phone || "Tidak ada nomor"}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover/wa:translate-x-1 transition-all">
                    <Phone className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-slate-50/30 rounded-[32px] border border-slate-100/50 opacity-60">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <Mail className="w-6 h-6 text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Terdaftar</p>
                  <p className="text-sm font-black text-slate-500 truncate">{pengurus.name.toLowerCase().replace(/\s+/g, '.')}@pesantren.com</p>
                </div>
              </div>
            </div>

            {/* Bottom Footer Actions */}
            <div className="w-full mt-10 space-y-4">
              <div className={`grid gap-4 ${pengurus.status === 'Tidak Aktif' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 py-4.5 bg-white border border-slate-200 text-slate-600 rounded-[28px] text-sm font-black hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                >
                  <Edit3 className="w-4 h-4 text-indigo-500" /> Edit Detail
                </button>
                {pengurus.status !== 'Tidak Aktif' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAlumniConfirmOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 py-4.5 bg-slate-900 text-white rounded-[28px] text-sm font-black hover:bg-slate-800 transition-all active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
                  >
                    <LogOut className="w-4 h-4 text-amber-400" /> Non-Aktif
                  </button>
                )}
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteConfirmOpen(true);
                }}
                className="w-full py-2 text-[10px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Data Permanen
              </button>
            </div>
          </div>
        </div>
      </div>

      <EditPengurusModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={onUpdate}
        pengurus={pengurus}
      />

      <ConfirmModal
        isOpen={isAlumniConfirmOpen}
        onClose={() => setIsAlumniConfirmOpen(false)}
        onConfirm={handleMoveToAlumni}
        loading={loading}
        title="Non-Aktifkan Pengurus?"
        message={`Apakah Anda yakin ingin menonaktifkan akun ${pengurus.name}? Pengurus tidak lagi memiliki akses aktif ke jabatan saat ini.`}
        type="warning"
        confirmLabel="Ya, Non-Aktifkan"
      />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={loading}
        title="Hapus Permanen?"
        message="Segala data terkait pengurus ini akan dihapus dari server selamanya. Tindakan ini tidak dapat dibatalkan."
        type="danger"
        confirmLabel="Ya, Hapus"
      />
    </>
  );
}
