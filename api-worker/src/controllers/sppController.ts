import { Context } from 'hono'
import { Env } from '../index'

export const paySPP = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { santri_id, amount, period, academic_year, status } = body

    if (!santri_id || !amount || !period || !academic_year) {
      return c.json({ success: false, error: "Data tidak lengkap" }, 400)
    }

    // 1. Ambil nama dan kelas santri untuk deskripsi mutasi transaksi
    const santriRes = await c.env.DB.prepare("SELECT name, kelas FROM santri WHERE id = ?").bind(santri_id).first()
    const santriName = santriRes ? `${santriRes.name} (${santriRes.kelas})` : 'Santri Tidak Diketahui'

    const dateStr = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const description = `Syahriah ${period} ${academic_year} - ${santriName}`

    // 2. D1 Batch Transaction: Pastikan masuk ke SPP dan Laporan Keuangan sekaligus
    await c.env.DB.batch([
      // Insert ke pencatatan SPP
      c.env.DB.prepare(`
        INSERT INTO spp_payments (santri_id, amount, period, academic_year, status, paid_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).bind(santri_id, amount, period, academic_year, status),
      
      // Insert ke laporan transaksi keuangan (Pemasukan)
      c.env.DB.prepare(`
        INSERT INTO transactions (type, category, amount, description, date)
        VALUES ('Pemasukan', 'SPP', ?, ?, ?)
      `).bind(amount, description, dateStr)
    ])

    return c.json({ success: true, message: "Pembayaran berhasil dicatat & masuk laporan keuangan!" })
  } catch (error) {
    console.error("Error paying SPP:", error)
    return c.json({ success: false, error: "Gagal mencatat pembayaran" }, 500)
  }
}

export const getSPP = async (c: Context<{ Bindings: Env }>) => {
  try {
    const period = c.req.query('period') || 'Syawal';
    const academic_year = c.req.query('academic_year');

    if (!academic_year) {
      return c.json({ success: false, error: "Tahun ajaran diperlukan" }, 400);
    }

    const { results } = await c.env.DB.prepare(`
      SELECT 
        s.id, 
        s.nisn, 
        s.name, 
        s.kelas, 
        s.madrasah, 
        s.status as santri_status, 
        s.tahun_masuk,
        p.id as payment_id, 
        p.amount, 
        p.status as payment_status, 
        p.paid_at, 
        p.period
      FROM santri s
      LEFT JOIN spp_payments p 
        ON s.id = p.santri_id 
        AND p.period = ? 
        AND p.academic_year = ?
      ORDER BY s.name ASC
    `).bind(period, academic_year).all();

    let paid_count = 0;
    let total_amount = 0;

    results.forEach((row: any) => {
      if (row.payment_status === 'Lunas') {
        paid_count++;
        total_amount += (row.amount || 0);
      }
    });

    const summary = {
      paid_count,
      total_count: results.length,
      total_amount
    };

    return c.json({ success: true, data: results, summary });
  } catch (error) {
    console.error("Error fetching SPP data:", error);
    return c.json({ success: false, error: "Gagal mengambil data SPP" }, 500);
  }
}

export const getSPPConfig = async (c: Context<{ Bindings: Env }>) => {
  try {
    const status = c.req.query("status") || "Biasa"
    const kelas = c.req.query("kelas") || ""
    const madrasah = c.req.query("madrasah") || "MHM"
    const period = c.req.query("period") || "Syawal"
    const all = c.req.query("all")

    if (all === "true") {
      const { results } = await c.env.DB.prepare(
        "SELECT * FROM spp_config ORDER BY status ASC, amount ASC"
      ).all()
      c.header('Cache-Control', 'public, max-age=10, s-maxage=10')
      return c.json({ success: true, data: results })
    }

    // Attempt to find specific config
    const config = await c.env.DB.prepare(`
      SELECT amount FROM spp_config
      WHERE status = ? AND kelas_name = ? AND madrasah = ? AND period_name = ?
    `).bind(status, kelas, madrasah, period).first() as any

    if (config && config.amount !== undefined) {
      return c.json({ success: true, amount: config.amount })
    }

    // Default amount if not found
    let baseAmount = 1000000
    if (status === "Biasa") baseAmount = 1500000
    if (status === "Ndalem 100%" || status === "PKJ 100%" || status === "Dzuriyyah") baseAmount = 0
    if (status === "Ndalem 50%" || status === "PKJ 50%") baseAmount = 750000

    return c.json({ success: true, amount: baseAmount })
  } catch (error) {
    console.error("Error fetching spp config:", error)
    return c.json({ success: false, amount: 1000000 }) // Default fallback
  }
}

export const addSPPConfig = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { status, madrasah, kelas_name, period_name, amount, entry_month, is_new_student, description } = body

    if (!status || !madrasah || !kelas_name || !period_name || amount === undefined) {
      return c.json({ success: false, error: "Data tidak lengkap" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO spp_config (status, madrasah, kelas_name, period_name, amount, entry_month, is_new_student, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      status, madrasah, kelas_name, period_name, amount, 
      entry_month || null, is_new_student ? 1 : 0, description || ""
    ).run()

    return c.json({ success: true, message: "Konfigurasi SPP berhasil disimpan" })
  } catch (error) {
    console.error("Error adding spp config:", error)
    return c.json({ success: false, error: "Gagal menyimpan konfigurasi" }, 500)
  }
}

export const deleteSPPConfig = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    if (!id) {
      return c.json({ success: false, error: "ID tidak valid" }, 400)
    }

    await c.env.DB.prepare("DELETE FROM spp_config WHERE id = ?").bind(id).run()
    return c.json({ success: true, message: "Konfigurasi berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting spp config:", error)
    return c.json({ success: false, error: "Gagal menghapus konfigurasi" }, 500)
  }
}
