"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import SPPChart from "@/components/SPPChart";
import ActivityFeed from "@/components/ActivityFeed";
import SantriTable from "@/components/SantriTable";

// SVG paths for Lucide icons (inner paths only)
const ICONS = {
  users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`,
  userCheck: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline>`,
  wallet: `<path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path>`,
  alertCircle: `<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>`,
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData() {
      try {
        const res = await fetch("/api/stats");
        const json = (await res.json()) as any;
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Gagal ambil dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);

  const stats = data?.stats || {
    santri_aktif: 0,
    tenaga_pengurus: 0,
    spp_terkumpul: 0,
    tunggakan_spp: 0,
    spp_persentase: 0
  };

  function formatCurrency(val: number) {
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(0)}jt`;
    return `Rp ${val.toLocaleString()}`;
  }

  return (
    <DashboardLayout>
      {/* Stats Grid */}
      <section
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
        aria-label="Statistik Utama"
      >
        <StatCard
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          iconSvgPath={ICONS.users}
          badge="+12%"
          badgeColor="text-emerald-600 bg-emerald-50"
          value={loading ? "..." : stats.santri_aktif.toString()}
          label="Total Santri Aktif"
          delay={1}
        />
        <StatCard
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          iconSvgPath={ICONS.userCheck}
          badge="+3"
          badgeColor="text-blue-600 bg-blue-50"
          value={loading ? "..." : stats.tenaga_pengurus.toString()}
          label="Tenaga Pengurus"
          delay={2}
        />
        <StatCard
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          iconSvgPath={ICONS.wallet}
          badge={`${stats.spp_persentase}%`}
          badgeColor="text-amber-600 bg-amber-50"
          value={loading ? "..." : formatCurrency(stats.spp_terkumpul)}
          label="SPP Terkumpul"
          delay={3}
        />
        <StatCard
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          iconSvgPath={ICONS.alertCircle}
          badge="Urgent"
          badgeColor="text-rose-600 bg-rose-50"
          value={loading ? "..." : stats.tunggakan_spp.toString()}
          label="Tunggakan SPP"
          delay={4}
        />
      </section>

      {/* Charts + Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
        <SPPChart data={data?.chart_data} />
        <ActivityFeed activities={data?.activities} />
      </section>

      {/* Santri Table */}
      <SantriTable data={data?.recent_santri} />
    </DashboardLayout>
  );
}
