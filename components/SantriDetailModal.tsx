"use client";

import { useState } from "react";
import { 
  X, 
  User, 
  MapPin, 
  Home, 
  GraduationCap, 
  Phone,
  Edit3, 
  Archive, 
  Trash2
} from "lucide-react";
import { useToast } from "./Toast";
import ConfirmModal from "./ConfirmModal";
import EditSantriModal from "./EditSantriModal";
import PromoteToPengurusModal from "./PromoteToPengurusModal";

interface Santri {
  id: number;
  nisn: string;
  nik?: string;
  name: string;
  kelas: string;
  asrama: string;
  asal: string;
  madrasah: string;
  wali_name?: string;
  wali_wa?: string;
  photo_url?: string;
  status: string;
}

interface SantriDetailModalProps {
  santri: Santri | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function SantriDetailModal({ santri, isOpen, onClose, onUpdate }: SantriDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirmAlumni, setShowConfirmAlumni] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { showToast } = useToast();

  if (!isOpen || !santri) return null;

  const openWhatsApp = () => {
    if (!santri.wali_wa) {
      showToast("Nomor WA Wali tidak tersedia", "warning");
      return;
    }
    
    // Format nomor (hapus karakter selain angka, ganti 0 di depan jadi 62)
    let phone = santri.wali_wa.replace(/\D/g, '');
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

      const res = await fetch(`/api/santri/${santri?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "Alumni",
          tahun_lulus: currentYear 
        })
      });
      const json = (await res.json()) as any;
      if (json.success) {
        showToast(`Berhasil memindahkan ${santri?.name} ke Data Alumni`, "success");
        onUpdate();
        window.dispatchEvent(new CustomEvent('santri-updated'));
        onClose();
      } else {
        showToast(json.error || "Gagal memproses data", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setLoading(false);
      setShowConfirmAlumni(false);
    }
  }

  async function handleDeletePermanen() {
    setLoading(true);
    try {
      const res = await fetch(`/api/santri/${santri?.id}`, {
        method: "DELETE"
      });
      const json = (await res.json()) as any;
      if (json.success) {
        showToast(`Data ${santri?.name} berhasil dihapus permanen`, "success");
        onUpdate();
        window.dispatchEvent(new CustomEvent('santri-updated'));
        onClose();
      } else {
        showToast(json.error || "Gagal menghapus data", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setLoading(false);
      setShowConfirmDelete(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className="relative bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          {/* Header Profile */}
          <div className="relative h-32 bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="absolute -bottom-12 left-8">
              <div className="w-28 h-28 rounded-[32px] bg-white p-2 shadow-2xl">
                {santri.photo_url ? (
                  <img src={santri.photo_url} alt={santri.name} className="w-full h-full object-cover rounded-[24px]" />
                ) : (
                  <div className="w-full h-full bg-slate-100 rounded-[24px] flex items-center justify-center text-slate-400">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{santri.name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="px-2 py-0.5 bg-indigo-50 text-[10px] font-black text-indigo-600 rounded-md uppercase tracking-wider">NISN: {santri.nisn || "-"}</div>
                    {santri.nik && <div className="px-2 py-0.5 bg-slate-100 text-[10px] font-black text-slate-500 rounded-md uppercase tracking-wider">NIK: {santri.nik}</div>}
                </div>
              </div>
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                santri.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {santri.status}
              </span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-[24px] border border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kelas</p>
                  <p className="text-sm font-black text-slate-700">{santri.kelas}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-[24px] border border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <Home className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asrama</p>
                  <p className="text-sm font-black text-slate-700">{santri.asrama || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-[24px] border border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <MapPin className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daerah Asal</p>
                  <p className="text-sm font-black text-slate-700">{santri.asal || "-"}</p>
                </div>
              </div>
              <div 
                onClick={openWhatsApp}
                className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-[24px] border border-emerald-100 col-span-2 cursor-pointer hover:bg-emerald-100/50 transition-all group/wa"
              >
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover/wa:scale-110 transition-transform">
                  <Phone className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi Wali (Klik untuk WA)</p>
                  <p className="text-sm font-black text-slate-700 truncate max-w-[200px]">{santri.wali_name || "Nama Wali -"}</p>
                  <p className="text-[11px] font-bold text-emerald-600 mt-0.5">{santri.wali_wa || "WA Belum Ada"}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover/wa:translate-x-1 transition-transform">
                    <Phone className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`mt-8 flex flex-col gap-4`}>
              <div className={`grid gap-4 ${santri.status === 'Alumni' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-3xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                >
                  <Edit3 className="w-4 h-4 text-indigo-500" /> Edit Data
                </button>
                {santri.status !== 'Alumni' && (
                  <button 
                    onClick={() => setShowConfirmAlumni(true)}
                    className="flex items-center justify-center gap-2 py-4 bg-amber-500 text-white rounded-3xl text-sm font-black hover:bg-amber-600 transition-all active:scale-95 shadow-xl shadow-amber-500/10"
                  >
                    <Archive className="w-4 h-4" /> Pindah Alumni
                  </button>
                )}
              </div>
              
              {santri.status !== 'Alumni' && (
                <button 
                  onClick={() => setShowPromoteModal(true)}
                  className="w-full flex items-center justify-center gap-3 py-4.5 bg-slate-900 text-white rounded-[28px] text-sm font-black hover:bg-black transition-all active:scale-95 shadow-2xl shadow-slate-900/20 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-5 h-5 text-amber-400" />
                  </div>
                  Khidmah (Lulus & Jadi Pengurus)
                </button>
              )}
            </div>
            
            <button 
              onClick={() => setShowConfirmDelete(true)}
              className="w-full mt-6 flex items-center justify-center gap-2 py-2 text-[11px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-[0.2em] opacity-40 hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" /> Hapus Data Permanen
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmAlumni}
        onClose={() => setShowConfirmAlumni(false)}
        onConfirm={handleMoveToAlumni}
        loading={loading}
        title="Pindah Jadi Alumni?"
        message={`Apakah Anda yakin ingin menonaktifkan status ${santri.name} dan memindahkannya ke arsip alumni saja?`}
        confirmLabel="Ya, Pindahkan"
        type="warning"
      />

      <PromoteToPengurusModal
        isOpen={showPromoteModal}
        onClose={() => setShowPromoteModal(false)}
        santri={santri}
        onSuccess={() => {
            onUpdate();
            onClose();
        }}
      />

      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDeletePermanen}
        loading={loading}
        title="Hapus Permanen?"
        message={`Perhatian! Tindakan ini akan menghapus data ${santri.name} selamanya dari database.`}
        confirmLabel="Ya, Hapus Selamanya"
        type="danger"
      />

      <EditSantriModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={onUpdate}
        santri={santri}
      />
    </>
  );
}
