import { Context } from 'hono'
import { Env } from '../index'

export const getDashboardStats = async (c: Context<{ Bindings: Env }>) => {
  try {
    const activeSantriQuery = "SELECT COUNT(*) as count FROM santri WHERE status NOT IN ('Alumni', 'Keluar')"
    const santriCount = await c.env.DB.prepare(activeSantriQuery).first<number>("count") || 0
    const pengurusCount = await c.env.DB.prepare("SELECT COUNT(*) as count FROM ustadz WHERE status NOT IN ('Alumni', 'Keluar')").first<number>("count") || 0
    
    const month = new Date().getMonth() + 1
    let currentPeriod = 'Syawal'
    if (month >= 3 && month <= 6) currentPeriod = 'Maulid'
    else if (month >= 7 && month <= 10) currentPeriod = 'Rajab'
    const academicYear = "2025/2026"

    const incomeSPP = await c.env.DB.prepare(
      "SELECT SUM(amount) as total FROM spp_payments WHERE period = ? AND academic_year = ? AND status = 'Lunas'"
    ).bind(currentPeriod, academicYear).first<number>("total") || 0
    
    const paidSantriCount = await c.env.DB.prepare(
      "SELECT COUNT(DISTINCT santri_id) as count FROM spp_payments WHERE period = ? AND academic_year = ? AND status = 'Lunas'"
    ).bind(currentPeriod, academicYear).first<number>("count") || 0
    
    const tunggakan = Math.max(0, santriCount - paidSantriCount)
    const sppPersentase = santriCount > 0 ? Math.round((paidSantriCount / santriCount) * 100) : 0

    const { results: recentSantri } = await c.env.DB.prepare(
      "SELECT * FROM santri ORDER BY created_at DESC LIMIT 5"
    ).all() as any

    const { results: activities } = await c.env.DB.prepare(`
      SELECT 'Santri Baru' as type, name as boldText, created_at as time, 'emerald' as color FROM santri
      UNION ALL
      SELECT 'Pembayaran SPP' as type, description as boldText, created_at as time, 'blue' as color FROM transactions WHERE category='SPP'
      ORDER BY time DESC LIMIT 5
    `).all() as any

    const periods = ['Syawal', 'Maulid', 'Rajab']
    const chartData = await Promise.all(periods.map(async (p) => {
        const count = await c.env.DB.prepare(
            "SELECT COUNT(DISTINCT santri_id) as c FROM spp_payments WHERE period = ? AND academic_year = ? AND status = 'Lunas'"
        ).bind(p, academicYear).first<number>("c") || 0
        const pct = santriCount > 0 ? Math.round((count / santriCount) * 100) : 0
        return { label: p, value: pct }
    }))

    c.header('Cache-Control', 'public, max-age=15, s-maxage=15')
    return c.json({ 
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
    })
  } catch (error) {
    console.error("Dashboard Stats Error:", error)
    return c.json({ success: false, error: "Internal Server Error" }, 500)
  }
}

export const getMenuStats = async (c: Context<{ Bindings: Env }>) => {
  try {
    const santriAktif = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM santri WHERE status != 'Alumni'"
    ).first<number>("count") || 0

    const pengurusAktif = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM ustadz WHERE status = 'Aktif'"
    ).first<number>("count") || 0

    const alumniSantri = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM santri WHERE status = 'Alumni'"
    ).first<number>("count") || 0

    const alumniPengurus = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM ustadz WHERE status = 'Tidak Aktif'"
    ).first<number>("count") || 0

    c.header('Cache-Control', 'public, max-age=10, s-maxage=10')
    return c.json({
      success: true,
      data: {
        santri: santriAktif,
        pengurus: pengurusAktif,
        alumni_santri: alumniSantri,
        alumni_pengurus: alumniPengurus
      }
    })
  } catch (error) {
    console.error("Menu Stats Error:", error)
    return c.json({ success: false, error: "Gagal mengambil statistik menu" }, 500)
  }
}

export const getDevStats = async (c: Context<{ Bindings: Env }>) => {
  try {
    const tables = [
      'users', 'ustadz', 'santri', 'settings', 'transactions', 'notifications',
      'jamiyyah_events', 'jamiyyah_assets', 'kbr_hygiene_checks',
      'media_bookings', 'media_tickets', 'pembangunan_renovasi',
      'plp_meters', 'plp_tickets', 'takmir_schedules', 'takmir_bookings',
      'spp_payments', 'spp_config', 'presensi_wajar', 'ubudiyyah_tracker',
      'clearance_boyong', 'skkb', 'santri_assets', 'pelanggaran',
      'medical_records', 'surat_sakit', 'bump_inventory', 'bump_sales'
    ];

    const stats = await Promise.all(tables.map(async (table) => {
      try {
        const countRes = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM ${table}`).first() as any;
        return { table, count: countRes?.count ?? 0, status: 'OK' };
      } catch (err: any) {
        return { table, count: 0, status: 'Error', error: err.message };
      }
    }));

    return c.json({ success: true, tables: stats });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}
