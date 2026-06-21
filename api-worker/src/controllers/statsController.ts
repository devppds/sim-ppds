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

    const incompleteQuery = `
      FROM santri 
      WHERE status NOT IN ('Alumni', 'Keluar') 
        AND (nik IS NULL OR nik = '' OR birth_date IS NULL OR birth_place IS NULL OR birth_place = '' OR wali_name IS NULL OR wali_name = '' OR wali_phone IS NULL OR wali_phone = '')
    `;
    const incompleteSantriCount = await c.env.DB.prepare(`SELECT COUNT(*) as count ${incompleteQuery}`).first<number>("count") || 0;
    const { results: incompleteSantriList } = await c.env.DB.prepare(`
      SELECT id, name, kelas, asrama ${incompleteQuery} ORDER BY created_at DESC LIMIT 5
    `).all() as any;

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
        chart_data: chartData,
        incomplete_santri: {
          total: incompleteSantriCount,
          list: incompleteSantriList
        }
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

export const getSeksiStats = async (c: Context<{ Bindings: Env }>) => {
  try {
    const role = c.req.query("role") || "";
    const roleLower = role.toLowerCase();
    
    let membersPattern = "";
    let stats: Record<string, any> = {};
    let recentActivities: any[] = [];
    
    if (roleLower === 'keamanan') {
      membersPattern = 'Seksi Keamanan%';
      
      const activePermits = await c.env.DB.prepare("SELECT COUNT(*) as count FROM perizinan WHERE status = 'Keluar'").first<number>("count") || 0;
      const totalSkkb = await c.env.DB.prepare("SELECT COUNT(*) as count FROM skkb").first<number>("count") || 0;
      const totalAssets = await c.env.DB.prepare("SELECT COUNT(*) as count FROM santri_assets").first<number>("count") || 0;
      const totalViolations = await c.env.DB.prepare("SELECT COUNT(*) as count FROM pelanggaran").first<number>("count") || 0;
      
      stats = {
        active_permits: activePermits,
        total_skkb: totalSkkb,
        total_assets: totalAssets,
        total_violations: totalViolations
      };
      
      const { results } = await c.env.DB.prepare(`
        SELECT 'Perizinan' as type, s.name || ' izin: ' || p.keperluan as description, p.created_at as time
        FROM perizinan p
        JOIN santri s ON p.santri_id = s.id
        UNION ALL
        SELECT 'Pelanggaran' as type, s.name || ' melanggar: ' || l.deskripsi as description, l.created_at as time
        FROM pelanggaran l
        JOIN santri s ON l.santri_id = s.id
        ORDER BY time DESC LIMIT 5
      `).all();
      recentActivities = results || [];
      
    } else if (roleLower === 'pendidikan') {
      membersPattern = 'Seksi Pendidikan%';
      
      const totalClasses = await c.env.DB.prepare("SELECT COUNT(*) as count FROM jadwal_pengajian").first<number>("count") || 0;
      const totalBk = await c.env.DB.prepare("SELECT COUNT(*) as count FROM bimbingan_log").first<number>("count") || 0;
      const totalIzinSekolah = await c.env.DB.prepare("SELECT COUNT(*) as count FROM perizinan WHERE keperluan LIKE 'Sekolah%' OR keperluan LIKE 'Musyawarah%'").first<number>("count") || 0;
      const pendingIzin = await c.env.DB.prepare("SELECT COUNT(*) as count FROM perizinan WHERE (keperluan LIKE 'Sekolah%' OR keperluan LIKE 'Musyawarah%') AND status = 'Diajukan'").first<number>("count") || 0;
      
      stats = {
        total_classes: totalClasses,
        total_bk: totalBk,
        total_izin_sekolah: totalIzinSekolah,
        pending_izin_sekolah: pendingIzin
      };
      
      const { results } = await c.env.DB.prepare(`
        SELECT 'Bimbingan BK' as type, s.name || ' konseling: ' || b.keluhan as description, b.created_at as time
        FROM bimbingan_log b
        JOIN santri s ON b.santri_id = s.id
        UNION ALL
        SELECT 'Izin Sekolah' as type, s.name || ' mengajukan: ' || p.keperluan as description, p.created_at as time
        FROM perizinan p
        JOIN santri s ON p.santri_id = s.id
        WHERE p.keperluan LIKE 'Sekolah%' OR p.keperluan LIKE 'Musyawarah%'
        ORDER BY time DESC LIMIT 5
      `).all();
      recentActivities = results || [];
      
    } else if (roleLower === 'bendahara' || roleLower === 'keuangan' || roleLower === 'seksi keuangan') {
      membersPattern = 'Seksi Keuangan%';
      
      const totalIncome = await c.env.DB.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'Pemasukan' AND deleted_at IS NULL").first<number>("total") || 0;
      const totalExpense = await c.env.DB.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'Pengeluaran' AND deleted_at IS NULL").first<number>("total") || 0;
      const totalPayments = await c.env.DB.prepare("SELECT COUNT(*) as count FROM spp_payments WHERE status = 'Lunas'").first<number>("count") || 0;
      
      stats = {
        total_income: totalIncome,
        total_expense: totalExpense,
        total_payments: totalPayments,
        balance: totalIncome - totalExpense
      };
      
      const { results } = await c.env.DB.prepare(`
        SELECT 'Transaksi' as type, description || ' (' || type || ')' as description, created_at as time
        FROM transactions
        WHERE deleted_at IS NULL
        ORDER BY time DESC LIMIT 5
      `).all();
      recentActivities = results || [];
      
    } else {
      if (roleLower === 'plp') membersPattern = 'Seksi PLP%';
      else if (roleLower === 'kbr') membersPattern = 'Seksi Kebersihan%';
      else if (roleLower === 'media') membersPattern = 'Seksi Dokumentasi%';
      else if (roleLower === 'takmir') membersPattern = 'Takmir%';
      else if (roleLower === 'jamiyyah' || roleLower === 'jam\'iyyah') membersPattern = 'Seksi Jam%';
      else if (roleLower === 'pembangunan') membersPattern = 'Seksi Pembangunan%';
      else if (roleLower === 'bump') membersPattern = 'Seksi BUMP%';
      else if (roleLower === 'klinik' || roleLower === 'kesehatan') membersPattern = 'Seksi Kesehatan%';
      else if (roleLower === 'logistik' || roleLower === 'humasy') membersPattern = 'Seksi Humasy%';
      else if (roleLower === 'fasilitas') membersPattern = 'Seksi Fasilitas%';
      else membersPattern = `%${role}%`;
      
      let customCount = 0;
      try {
        if (roleLower === 'plp') {
          customCount = await c.env.DB.prepare("SELECT COUNT(*) as count FROM plp_meters").first<number>("count") || 0;
        } else if (roleLower === 'kbr') {
          customCount = await c.env.DB.prepare("SELECT COUNT(*) as count FROM kbr_hygiene_checks").first<number>("count") || 0;
        } else if (roleLower === 'media') {
          customCount = await c.env.DB.prepare("SELECT COUNT(*) as count FROM media_bookings").first<number>("count") || 0;
        } else if (roleLower === 'takmir') {
          customCount = await c.env.DB.prepare("SELECT COUNT(*) as count FROM takmir_schedules").first<number>("count") || 0;
        } else if (roleLower === 'pembangunan') {
          customCount = await c.env.DB.prepare("SELECT COUNT(*) as count FROM pembangunan_renovasi").first<number>("count") || 0;
        }
      } catch (e) {}

      stats = {
        custom_records: customCount
      };
      
      recentActivities = [];
    }

    let members: any[] = [];
    if (membersPattern) {
      const { results } = await c.env.DB.prepare(
        "SELECT id, name, phone, (CASE WHEN sub_jabatan IS NULL OR sub_jabatan = '' THEN jabatan WHEN jabatan IN ('Ketua', 'Sekretaris', 'Bendahara') THEN sub_jabatan ELSE jabatan || ' (' || sub_jabatan || ')' END) as jabatan, kamar, photo_url, status FROM ustadz WHERE (jabatan LIKE ? OR jabatan_tambahan LIKE ?) AND status = 'Aktif' ORDER BY name ASC"
      ).bind(membersPattern, membersPattern).all();
      members = results || [];
    }
    
    return c.json({
      success: true,
      section: role,
      stats,
      members,
      activities: recentActivities
    });
    
  } catch (error: any) {
    console.error("Seksi Stats Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
}
