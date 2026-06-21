"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ShieldAlert, Users, Activity, HardDrive, 
  UserPlus, UserMinus, ShieldCheck, Database, 
  Trash2, RefreshCw, Download, Search, Settings,
  LogOut, ShieldX, Key, UserCheck, AlertTriangle, 
  Clock, Hash, Home, Bell
} from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { useToast } from "@/components/Toast";
import { API_BASE_URL } from "@/lib/config";

interface UserProfile {
  id: number;
  username: string;
  name: string;
  role: string;
  is_active: number;
  last_login: string | null;
}

interface AuditLog {
  id: number;
  table_name: string;
  action: string;
  changed_by: string;
  created_at: string;
  new_data: string;
}

export default function PusatKontrolPage() {
  const [activeTab, setActiveTab] = useState<string>("users");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [jabatanList, setJabatanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const { showToast } = useToast();

  const [pondokProfile, setPondokProfile] = useState({
    pondok_name: "",
    pondok_address: "",
    pondok_phone: "",
    pondok_email: "",
    pondok_head: "",
    academic_year: "",
    spp_due_day: "10",
    cashless_enabled: "1",
    notify_wa_active: "1",
    notify_email_active: "1"
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const isUserOnline = (lastLogin: string | null) => {
    if (!lastLogin) return false;
    try {
      const loginTime = new Date(lastLogin).getTime();
      const now = new Date().getTime();
      return (now - loginTime) < 15 * 60 * 1000;
    } catch (e) {
      return false;
    }
  };

  // Form State
  const [formData, setFormData] = useState({ name: "", role: "Sekretaris", sub_role: "Anggota" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json() as any;
      if (json.success) setUsers(json.data);
    } catch (e) { showToast("Gagal muat user", "error"); }
  }, [showToast]);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/audit");
      const json = await res.json() as any;
      if (json.success) setLogs(json.data);
    } catch (e) { showToast("Gagal muat log", "error"); }
  }, [showToast]);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const json = await res.json() as any;
      if (json.success) setJabatanList(json.data);
    } catch (e) { showToast("Gagal muat jabatan", "error"); }
  }, [showToast]);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`);
      const json = await res.json() as any;
      if (json.success) {
        setPondokProfile({
          pondok_name: json.data.pondok_name || "",
          pondok_address: json.data.pondok_address || "",
          pondok_phone: json.data.pondok_phone || "",
          pondok_email: json.data.pondok_email || "",
          pondok_head: json.data.pondok_head || "",
          academic_year: json.data.academic_year || "",
          spp_due_day: json.data.spp_due_day || "10",
          cashless_enabled: json.data.cashless_enabled || "1",
          notify_wa_active: json.data.notify_wa_active || "1",
          notify_email_active: json.data.notify_email_active || "1"
        });
      } else {
        showToast(json.error || "Gagal memuat profil pesantren", "error");
      }
    } catch (e) {
      showToast("Koneksi gagal ke API", "error");
    } finally {
      setLoadingProfile(false);
    }
  }, [showToast]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/auth/session")
      .then(res => res.json() as Promise<{ success: boolean; session?: any }>)
      .then((data) => {
        if (data.success && data.session) {
          setSession(data.session);
        }
      })
      .catch(e => console.error("Session fetch error", e));
      
    fetchRoles();
    fetchProfile();
    if (activeTab === "users") fetchUsers().finally(() => setLoading(false));
    else if (activeTab === "audit") fetchLogs().finally(() => setLoading(false));
    else setLoading(false);
  }, [activeTab, fetchRoles, fetchUsers, fetchLogs, fetchProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pondokProfile)
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Pengaturan berhasil disimpan!", "success");
      } else {
        showToast(json.error || "Gagal menyimpan profil", "error");
      }
    } catch (e) {
      showToast("Koneksi gagal", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Personel baru terdaftar", "success");
        setFormData({ name: "", role: "Sekretaris", sub_role: "Anggota" });
        fetchUsers();
      } else {
        showToast(json.error || "Gagal daftar user", "error");
      }
    } catch (e) { showToast("Error koneksi server", "error"); }
    finally { setIsSubmitting(false); }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Yakin hapus personel ini? Akses akan dicabut selamanya.")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Personel dihapus", "success");
        fetchUsers();
      }
    } catch (e) { showToast("Gagal hapus", "error"); }
  }

  const handleToggleUserStatus = async (userId: number, currentStatus: number) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          is_active: currentStatus === 1 ? false : true
        })
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast(json.message || "Status pengguna diperbarui", "success");
        fetchUsers();
      } else {
        showToast(json.error || "Gagal mengubah status", "error");
      }
    } catch (e) {
      showToast("Gagal terhubung ke server", "error");
    }
  };

  const handleResetPassword = async (userId: number, targetName: string) => {
    if (!confirm(`Reset kata sandi ${targetName} ke password default (123456)?`)) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          reset_password: true
        })
      });
      const json = await res.json() as any;
      if (json.success) {
        showToast("Kata sandi berhasil di-reset ke 123456", "success");
      } else {
        showToast(json.error || "Gagal me-reset kata sandi", "error");
      }
    } catch (e) {
      showToast("Gagal terhubung ke server", "error");
    }
  };

  return (
    <>
      <div className="fade-up space-y-6">
        {/* Header with Command Center Vibe */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-slate-900 rounded-4xl border border-white/5 flex items-center justify-center shadow-2xl relative">
                <ShieldAlert className="w-7 h-7 text-rose-500" />
                <div className="absolute inset-0 bg-rose-500/10 rounded-4xl animate-pulse" />
             </div>
             <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic flex items-center gap-2">
                   Pusat Kontrol <span className="text-rose-500">Core</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                   Status Keamanan: <span className="text-emerald-500">OPTIMAL</span> • Protokol CIA Aktif
                </p>
             </div>
          </div>

          <div className="flex flex-wrap gap-2">
             <button
               onClick={() => setActiveTab("users")}
               className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase transition-all ${
                 activeTab === "users" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-white text-slate-400 hover:text-slate-600"
               }`}
             >
                <Users className="w-4 h-4" /> Manajemen User
             </button>
             <button
               onClick={() => setActiveTab("profile")}
               className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase transition-all ${
                 activeTab === "profile" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-white text-slate-400 hover:text-slate-600"
               }`}
             >
                <Home className="w-4 h-4" /> Pesantren
             </button>
             <button
               onClick={() => setActiveTab("app_settings")}
               className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase transition-all ${
                 activeTab === "app_settings" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-white text-slate-400 hover:text-slate-600"
               }`}
             >
                <Settings className="w-4 h-4" /> Notifikasi & App
             </button>
             <button
               onClick={() => setActiveTab("audit")}
               className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase transition-all ${
                 activeTab === "audit" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-white text-slate-400 hover:text-slate-600"
               }`}
             >
                <Activity className="w-4 h-4" /> Audit Logs
             </button>
             {session?.role?.toUpperCase() === 'DEVELOPER' && (
               <button
                 onClick={() => setActiveTab("system")}
                 className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase transition-all ${
                   activeTab === "system" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-white text-slate-400 hover:text-slate-600"
                 }`}
               >
                  <Database className="w-4 h-4" /> Sistem & Backup
               </button>
             )}
          </div>
        </div>

        {/* Dynamic Content */}
        {activeTab === "users" && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">
              {/* Add User Section */}
              <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <UserPlus className="w-4 h-4 text-emerald-500" /> Tambah Personel
                    </h3>
                    <form onSubmit={handleAddUser} className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Lengkap / Panggilan</label>
                          <input 
                            type="text" 
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold" 
                            placeholder="Contoh: Ilham" 
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jabatan Utama</label>
                          <select 
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold outline-none"
                          >
                             {jabatanList.map((j: any) => (
                               <option key={j.id} value={j.nama}>{j.nama}</option>
                             ))}
                          </select>
                       </div>
                       {formData.role && (
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sub-Jabatan</label>
                          <select 
                            value={formData.sub_role || "Anggota"}
                            onChange={e => setFormData({...formData, sub_role: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold outline-none"
                          >
                             <option value="Ketua">Ketua</option>
                             <option value="Wakil Ketua">Wakil Ketua</option>
                             <option value="Sekretaris">Sekretaris</option>
                             <option value="Bendahara">Bendahara</option>
                             <option value="Anggota">Anggota</option>
                          </select>
                       </div>
                       )}
                       <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 mt-2">
                          <p className="text-[9px] font-black text-amber-700 uppercase italic flex items-center gap-1.5"><Key className="w-3 h-3"/> Info Pembuatan Akun</p>
                          <p className="text-[9px] text-amber-600 mt-1 font-medium leading-relaxed">
                            Username akan dibuat otomatis (contoh: <b>keamanan.ilham</b>) berdasarkan kata pertama nama. 
                            Password default adalah <b>123456</b>. Personel wajib mengganti sandi ini saat pertama login!
                          </p>
                       </div>
                       <button 
                         disabled={isSubmitting}
                         className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-4"
                       >
                          {isSubmitting ? "Memproses..." : "Daftarkan Personel"}
                       </button>
                    </form>
                 </div>

                 {/* System Alert Card */}
                 <div className="bg-linear-to-br from-rose-500 to-rose-600 p-8 rounded-4xl text-white shadow-xl shadow-rose-100">
                    <ShieldAlert className="w-10 h-10 mb-4 opacity-50" />
                    <h4 className="text-sm font-black uppercase italic mb-2">Peringatan Keamanan</h4>
                    <p className="text-[11px] font-medium opacity-80 leading-relaxed mb-6">
                       Setiap penambahan atau penghapusan user dicatat permanen dalam Audit log. Pastikan personil telah diverifikasi.
                    </p>
                    <div className="flex items-center gap-2 bg-black/10 px-3 py-2 rounded-xl w-fit">
                       <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                       <span className="text-[9px] font-black uppercase">Monitor Aktif</span>
                    </div>
                 </div>
              </div>

              {/* User List Table */}
              <div className="lg:col-span-2">
                 <div className="bg-white rounded-4xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden h-full">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                       <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">
                          Database Personel Sistem
                       </h3>
                    </div>
                    
                    <div className="p-4">
                       <DataTable
                         data={users}
                         columns={[
                           {
                             header: "Nama & Role",
                             render: (u: any) => (
                                      <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                                            {u.name.substring(0,2).toUpperCase()}
                                         </div>
                                         <div>
                                            <p className="text-xs font-black text-slate-800 uppercase">{u.name}</p>
                                            <p className="text-[9px] text-slate-400 font-bold tracking-wider mb-1">@{u.username}</p>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase ${
                                              u.role === 'Pengasuh' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'
                                            }`}>{u.role}{u.sub_role ? ` - ${u.sub_role}` : ''}</span>
                                         </div>
                                      </div>
                             )
                           },
                           {
                             header: <div className="text-center">Status</div>,
                             render: (u: any) => (
                                     <div className="flex flex-col items-center gap-2">
                                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black rounded-2xl uppercase border ${
                                         u.is_active === 1 
                                           ? (isUserOnline(u.last_login) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100') 
                                           : 'bg-rose-50 text-rose-500 border-rose-100'
                                       }`}>
                                         {u.is_active === 1 && isUserOnline(u.last_login) && (
                                           <span className="relative flex h-2 w-2 shrink-0">
                                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                             <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                           </span>
                                         )}
                                         {u.is_active === 1 
                                           ? (isUserOnline(u.last_login) ? "Sedang Aktif" : "Aktif") 
                                           : "Nonaktif"
                                         }
                                       </span>
                                       <label className="relative inline-flex items-center cursor-pointer" title="Ubah Status Aktif/Nonaktif">
                                         <input 
                                           type="checkbox" 
                                           checked={u.is_active === 1}
                                           onChange={() => handleToggleUserStatus(u.id, u.is_active)}
                                           className="sr-only peer"
                                         />
                                         <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                                       </label>
                                     </div>
                             )
                           },
                           {
                             header: <div className="text-center">Login Terakhir</div>,
                             render: (u: any) => (
                                      <div className="flex flex-col items-center gap-1">
                                         <span className="text-[11px] font-bold text-slate-600">{u.last_login ? new Date(u.last_login).toLocaleDateString('id-ID') : 'Tidak Pernah'}</span>
                                         <span className="text-[9px] font-bold text-slate-400 uppercase">{u.last_login ? new Date(u.last_login).toLocaleTimeString('id-ID') : '-'}</span>
                                      </div>
                             )
                           },
                           {
                             header: <div className="text-right">Aksi</div>,
                             render: (u: any) => (
                                      <div className="flex items-center justify-end gap-2">
                                        <button 
                                          onClick={() => handleResetPassword(u.id, u.name)}
                                          className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors"
                                          title="Reset Password ke 123456"
                                        >
                                           <Key className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteUser(u.id)}
                                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                          title="Hapus Akun"
                                        >
                                           <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                             )
                           }
                         ]}
                         loading={loading}
                         emptyMessage="Tidak ada personel terdaftar."
                       />
                    </div>
                 </div>
              </div>
           </div>
        )}

         {activeTab === "audit" && (
            <div className="bg-white rounded-4xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in duration-300">
               <div className="p-8 border-b border-slate-100 bg-slate-50/10 flex items-center justify-between">
                  <div>
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest italic flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" /> System Tracer & Audit Log
                     </h3>
                     <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Pelacakan Perubahan Data Berbasis Trigger</p>
                  </div>
               </div>

               <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto">
                  {logs.map(l => (
                     <div key={l.id} className="flex items-start gap-6 group hover:bg-slate-50/50 p-4 rounded-3xl transition-colors relative">
                        <div className="absolute left-[38px] top-14 bottom-0 w-0.5 bg-slate-100 hidden group-last:hidden sm:block" />
                        <div className="w-20 pt-1 text-right shrink-0 hidden sm:block">
                           <p className="text-[10px] font-black text-slate-400 uppercase">{new Date(l.created_at).toLocaleTimeString('id-ID')}</p>
                           <p className="text-[9px] font-bold text-slate-300">{new Date(l.created_at).toLocaleDateString('id-ID', {month: 'short', day: 'numeric'})}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm border ${
                          l.action === 'INSERT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          l.action === 'DELETE' ? 'bg-rose-50 text-rose-500 border-rose-100' : 
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                           <RefreshCw className={`w-4 h-4 ${l.action === 'INSERT' ? '' : 'rotate-45'}`} />
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center justify-between gap-4 mb-2">
                              <h4 className="text-xs font-black text-slate-800 uppercase italic">{l.action} <span className="text-indigo-600">{l.table_name}</span></h4>
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-500 uppercase">Operator: {l.changed_by}</span>
                           </div>
                           <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[10px] text-emerald-400/80 leading-relaxed shadow-inner border border-white/5 whitespace-pre-wrap overflow-x-auto">
                              {l.new_data || l.action}
                           </div>
                        </div>
                     </div>
                  ))}
                  {logs.length === 0 && <p className="text-center py-20 text-slate-400 font-bold">Log kosong.</p>}
               </div>
            </div>
         )}

         {activeTab === "profile" && (
          <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-xl shadow-slate-200/40 w-full animate-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Home className="w-4 h-4 text-indigo-500" /> Identitas Lembaga Pesantren
            </h3>
            
            {loadingProfile ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Memuat profil...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Pesantren</label>
                    <input 
                      type="text" 
                      required
                      value={pondokProfile.pondok_name}
                      onChange={e => setPondokProfile({...pondokProfile, pondok_name: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kiai Pengasuh</label>
                    <input 
                      type="text" 
                      required
                      value={pondokProfile.pondok_head}
                      onChange={e => setPondokProfile({...pondokProfile, pondok_head: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Alamat Lembaga</label>
                  <input 
                    type="text" 
                    required
                    value={pondokProfile.pondok_address}
                    onChange={e => setPondokProfile({...pondokProfile, pondok_address: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nomor Telepon/WA</label>
                    <input 
                      type="text" 
                      required
                      value={pondokProfile.pondok_phone}
                      onChange={e => setPondokProfile({...pondokProfile, pondok_phone: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Lembaga</label>
                    <input 
                      type="email" 
                      required
                      value={pondokProfile.pondok_email}
                      onChange={e => setPondokProfile({...pondokProfile, pondok_email: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSavingProfile}
                  className="mt-4 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  {isSavingProfile ? "Menyimpan..." : "Simpan Identitas Pesantren"}
                </button>
              </form>
            )}
          </div>
         )}

         {activeTab === "app_settings" && (
          <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-xl shadow-slate-200/40 w-full animate-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-500" /> Konfigurasi Aplikasi & Notifikasi Real-time
            </h3>

            {loadingProfile ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Memuat pengaturan...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tahun Ajaran</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: 2025/2026"
                      value={pondokProfile.academic_year}
                      onChange={e => setPondokProfile({...pondokProfile, academic_year: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jatuh Tempo SPP (Tanggal)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="31"
                      required
                      value={pondokProfile.spp_due_day}
                      onChange={e => setPondokProfile({...pondokProfile, spp_due_day: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Status Cashless BUMP</label>
                    <select 
                      value={pondokProfile.cashless_enabled}
                      onChange={e => setPondokProfile({...pondokProfile, cashless_enabled: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="1">Aktif / Diaktifkan</option>
                      <option value="0">Nonaktif / Dibatasi</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-indigo-500" /> Saluran Notifikasi Tagihan
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-xs font-black text-slate-800">Notifikasi WhatsApp Otomatis</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Kirim pesan WhatsApp gateway tagihan SPP bulanan ke wali santri</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={pondokProfile.notify_wa_active === "1"}
                          onChange={e => setPondokProfile({...pondokProfile, notify_wa_active: e.target.checked ? "1" : "0"})}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-xs font-black text-slate-800">Notifikasi Email Tagihan</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Kirim email pengingat bulanan ke email pengguna / pengurus</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={pondokProfile.notify_email_active === "1"}
                          onChange={e => setPondokProfile({...pondokProfile, notify_email_active: e.target.checked ? "1" : "0"})}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSavingProfile}
                  className="mt-4 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  {isSavingProfile ? "Menyimpan..." : "Simpan Konfigurasi Aplikasi & Notifikasi"}
                </button>
              </form>
            )}
          </div>
         )}

        {activeTab === "system" && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-300">
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                 <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase italic mb-2">Database Engine</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Cloudflare D1 SQL Server</p>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-[11px] font-bold py-2 border-b border-slate-100">
                          <span className="text-slate-500">Kapasitas</span>
                          <span className="text-slate-800">12.5 MB / 500 MB</span>
                       </div>
                       <div className="flex justify-between items-center text-[11px] font-bold py-2 border-b border-slate-100">
                          <span className="text-slate-500">Up-time</span>
                          <span className="text-emerald-500 uppercase">99.9% Lancar</span>
                       </div>
                    </div>
                 </div>
                 <button className="mt-8 w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                    <Settings className="w-3.5 h-3.5" /> Konfigurasi DB
                 </button>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                 <h3 className="text-sm font-black text-slate-800 uppercase italic mb-2">Manual Backup</h3>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8">Arsip Data Seluruh Pesantren</p>
                 <div className="grid grid-cols-2 gap-3 mb-8">
                    <button className="flex flex-col items-center justify-center gap-2 p-6 bg-slate-50 rounded-3xl hover:bg-indigo-50 transition-all group border border-transparent hover:border-indigo-100">
                       <Download className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                       <span className="text-[10px] font-black uppercase group-hover:text-indigo-600">EKSPOR JSON</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-6 bg-slate-50 rounded-3xl hover:bg-emerald-50 transition-all group border border-transparent hover:border-emerald-100">
                       <HardDrive className="w-6 h-6 text-slate-400 group-hover:text-emerald-600" />
                       <span className="text-[10px] font-black uppercase group-hover:text-emerald-600">SINKRONISASI CSV</span>
                    </button>
                 </div>
                 <p className="text-[9px] font-medium text-slate-400 text-center italic">
                    Pencadangan data membantu ketersediaan (A) dalam CIA Triad jika terjadi kegagalan sistem.
                 </p>
              </div>

              <div className="bg-slate-900 p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden group">
                 <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-32 h-32 text-indigo-500" />
                 </div>
                 <h3 className="text-sm font-black text-white uppercase italic mb-4">Reset Keamanan Total</h3>
                 <p className="text-[11px] font-medium text-slate-400 mb-8 leading-relaxed">
                    Tindakan ini akan memblokir semua akses login kecuali Super Admin dan mengatur ulang semua protokol keamanan.
                 </p>
                 <button className="w-full py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-rose-900/40 relative z-10 hover:bg-rose-500 transition-all">
                    Inisiasi Reset Keamanan
                 </button>
              </div>
           </div>
        )}
      </div>
    </>
  );
}

