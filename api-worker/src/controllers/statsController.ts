import { Context } from 'hono';
import { Env } from '../../index';
 from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";

"edge";

// GET /api/stats - dashboard data riil lengkap
export async function GET() {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };

    // 1. Statistik Utama
    const activeSantriQuery = "SELECT COUNT(*) as count FROM santri WHERE status NOT IN ('Alumni', 'Keluar')";
    const santriCount = await env.DB.prepare(activeSantriQuery).first<number>("count") || 0;
    const pengurusCount = await env.DB.prepare("SELECT COUNT(*) as count FROM ustadz WHERE status NOT IN ('Alumni', 'Keluar')").first<number>("count") || 0;
    
    const month = new Date().getMonth() + 1;
    let currentPeriod = 'Syawal';
    if (month >= 3 && month <= 6) currentPeriod = 'Maulid';
    else if (month >= 7 && month <= 10) currentPeriod = 'Rajab';
    const academicYear = "2025/2026";

    const incomeSPP = await env.DB.prepare(
      "SELECT SUM(amount) as total FROM spp_payments WHERE period = ? AND academic_year = ? AND status = 'Lunas'"
    ).bind(currentPeriod, academicYear).first<number>("total") || 0;
    
    const paidSantriCount = await env.DB.prepare(
      "SELECT COUNT(DISTINCT santri_id) as count FROM spp_payments WHERE period = ? AND academic_year = ? AND status = 'Lunas'"
    ).bind(currentPeriod, academicYear).first<number>("count") || 0;
    
    const tunggakan = Math.max(0, santriCount - paidSantriCount);
    const sppPersentase = santriCount > 0 ? Math.round((paidSantriCount / santriCount) * 100) : 0;

    // 2. Santri Terbaru (Data Riil)
    const { results: recentSantri } = await env.DB.prepare(
      "SELECT * FROM santri ORDER BY created_at DESC LIMIT 5"
    ).all() as any;

    // 3. Aktivitas Terbaru (Gabungan Registrasi & Pembayaran)
    // Kita simulasi dengan UNION ALL
    const { results: activities } = await env.DB.prepare(`
      SELECT 'Santri Baru' as type, name as boldText, created_at as time, 'emerald' as color FROM santri
      UNION ALL
      SELECT 'Pembayaran SPP' as type, description as boldText, created_at as time, 'blue' as color FROM transactions WHERE category='SPP'
      ORDER BY time DESC LIMIT 5
    `).all() as any;

    // 4. Data Grafik (3 Periode)
    const periods = ['Syawal', 'Maulid', 'Rajab'];
    const chartData = await Promise.all(periods.map(async (p) => {
        const count = await env.DB.prepare(
            "SELECT COUNT(DISTINCT santri_id) as c FROM spp_payments WHERE period = ? AND academic_year = ? AND status = 'Lunas'"
        ).bind(p, academicYear).first<number>("c") || 0;
        const pct = santriCount > 0 ? Math.round((count / santriCount) * 100) : 0;
        return { label: p, value: pct };
    }));

    return NextResponse.json({ 
      success: true, 
      data: {
        stats: {
          santri_aktif: santriCount,
          tenaga_pengurus: pengurusCount,
          spp_terkumpul: incomeSPP,
          tunggakan_spp: tunggakan,
          spp_persentase: sppPersentase,
          current_period: currentPeriod
        },
        recent_santri: recentSantri,
        activities: activities,
        chart_data: chartData
      }
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return c.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
