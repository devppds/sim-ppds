"use client";

import {
  UserPlus,
  CreditCard,
  AlertTriangle,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

const activityIcons: Record<string, any> = {
  "Santri Baru": UserPlus,
  "Pembayaran SPP": CreditCard,
  "Tunggakan SPP": AlertTriangle,
  "Jadwal ujian": BookOpen,
  "Absensi": CheckCircle,
};

const activityVerbs: Record<string, string> = {
  "Santri Baru": "terdaftar",
  "Pembayaran SPP": "diterima",
  "Tunggakan SPP": "belum dibayar",
  "Jadwal ujian": "diperbarui",
  "Absensi": "selesai",
};

const colorMapping: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
};

export default function ActivityFeed({ activities = [] }: { activities?: any[] }) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} menit lalu`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return date.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
  };
  return (
    <div className="fade-up fade-up-6 bg-white rounded-xl border border-slate-100 p-4 sm:p-6">
      <h2 className="text-sm font-bold text-[#1e293b] mb-4">
        Aktivitas Terbaru
      </h2>
      <div className="space-y-4">
        {activities.map((activity, i) => {
          const Icon = activityIcons[activity.type] || BookOpen;
          const verb = activityVerbs[activity.type] ?? "";
          return (
            <div key={i} className="flex gap-3">
              <div
                className={`w-8 h-8 rounded-lg ${colorMapping[activity.color] || 'bg-slate-50'} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#1e293b] leading-relaxed">
                  {activity.type}{" "}
                  <strong className="font-semibold">{activity.boldText}</strong>{" "}
                  {verb}
                </p>
                <span className="text-[11px] text-[#64748b]">
                  {formatTime(activity.time)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
