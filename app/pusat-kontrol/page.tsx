"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ShieldAlert, Users, Activity, HardDrive, 
  UserPlus, UserMinus, ShieldCheck, Database, 
  Trash2, RefreshCw, Download, Search, Settings,
  LogOut, ShieldX, Key, UserCheck, AlertTriangle, 
  Clock, Hash
} from "lucide-react";
import { useToast } from "@/components/Toast";

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
  const [activeTab, setActiveTab] = useState<"users" | "audit" | "system">("users");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [jabatanList, setJabatanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

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
  const [formData, setFormData] = useState({ username: "", name: "", role: "Sekretaris", password: "" });
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

  useEffect(() => {
    setLoading(true);
    fetchRoles();
    if (activeTab === "users") fetchUsers().finally(() => setLoading(false));
    else if (activeTab === "audit") fetchLogs().finally(() => setLoading(false));
    else setLoading(false);
  }, [activeTab, fetchRoles, fetchUsers, fetchLogs]);

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
        setFormData({ username: "", name: "", role: "Sekretaris", password: "" });
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

  return (
    <DashboardLayout>
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

          <div className="flex gap-2">
             <button
               onClick={() => setActiveTab("users")}
               className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase transition-all ${
                 activeTab === "users" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-white text-slate-400 hover:text-slate-600"
               }`}
             >
                <Users className="w-4 h-4" /> Manajemen User
             </button>
             <button
               onClick={() => setActiveTab("audit")}
               className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase transition-all ${
                 activeTab === "audit" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-white text-slate-400 hover:text-slate-600"
               }`}
             >
                <Activity className="w-4 h-4" /> Audit Logs
             </button>
             <button
               onClick={() => setActiveTab("system")}
               className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase transition-all ${
                 activeTab === "system" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-white text-slate-400 hover:text-slate-600"
               }`}
             >
                <Database className="w-4 h-4" /> Sistem & Backup
             </button>
          </div>
        </div>

        {/* Dynamic Content */}
        {activeTab === "users" && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">
              {/* Add User Section */}
              <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <UserPlus className="w-4 h-4 text-emerald-500" /> Tambah Personel
                    </h3>
                    <form onSubmit={handleAddUser} className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Username</label>
                          <input 
                            type="text" 
                            required
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold" 
                            placeholder="Contoh: ahmad_sim" 
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nama Lengkap</label>
                          <input 
                            type="text" 
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold" 
                            placeholder="Kiai Haji Ahmad" 
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Jabatan / Role</label>
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
                       <div className="space-y-1 pb-4">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password Awal</label>
                          <input 
                            type="password" 
                            required
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold" 
                            placeholder="••••••••" 
                          />
                       </div>
                       <button 
                         disabled={isSubmitting}
                         className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                       >
                          {isSubmitting ? "Memproses..." : "Daftarkan User"}
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
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                       <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">
                          Database Personel Sistem
                       </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                       <table className="w-full">
                          <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                             <tr>
                                <th className="px-8 py-5 text-left">Nama & Role</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-center">Login Terakhir</th>
                                <th className="px-8 py-5 text-right">Aksi</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50/50 group transition-colors">
                                   <td className="px-8 py-6">
                                      <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                                            {u.name.substring(0,2).toUpperCase()}
                                         </div>
                                         <div>
                                            <p className="text-xs font-black text-slate-800 uppercase">{u.name}</p>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase ${
                                              u.role === 'Pengasuh' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'
                                            }`}>{u.role}</span>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-8 py-6 text-center">
                                       <div className="flex items-center justify-center gap-1.5">
                                          {u.is_active === 1 && isUserOnline(u.last_login) && (
                                             <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                             </span>
                                          )}
                                          <span className={`px-3 py-1 text-[10px] font-black rounded-2xl uppercase border ${
                                            u.is_active === 1 
                                              ? (isUserOnline(u.last_login) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100') 
                                              : 'bg-rose-50 text-rose-500 border-rose-100'
                                          }`}>
                                             {u.is_active === 1 
                                               ? (isUserOnline(u.last_login) ? "Sedang Aktif" : "Aktif") 
                                               : "Nonaktif"
                                             }
                                          </span>
                                       </div>
                                    </td>
                                   <td className="px-8 py-6 text-center">
                                      <div className="flex flex-col items-center gap-1">
                                         <span className="text-[11px] font-bold text-slate-600">{u.last_login ? new Date(u.last_login).toLocaleDateString('id-ID') : 'Tidak Pernah'}</span>
                                         <span className="text-[9px] font-bold text-slate-400 uppercase">{u.last_login ? new Date(u.last_login).toLocaleTimeString('id-ID') : '-'}</span>
                                      </div>
                                   </td>
                                   <td className="px-8 py-6 text-right">
                                      <button 
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                      >
                                         <Trash2 className="w-4 h-4" />
                                      </button>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
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

        {activeTab === "system" && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-300">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                 <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase italic mb-2">Database Engine</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Cloudflare D1 SQL Server</p>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-[11px] font-bold py-2 border-b border-slate-50">
                          <span className="text-slate-500">Kapasitas</span>
                          <span className="text-slate-800">12.5 MB / 500 MB</span>
                       </div>
                       <div className="flex justify-between items-center text-[11px] font-bold py-2 border-b border-slate-50">
                          <span className="text-slate-500">Up-time</span>
                          <span className="text-emerald-500 uppercase">99.9% Lancar</span>
                       </div>
                    </div>
                 </div>
                 <button className="mt-8 w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                    <Settings className="w-3.5 h-3.5" /> Konfigurasi DB
                 </button>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
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

              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
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
    </DashboardLayout>
  );
}
