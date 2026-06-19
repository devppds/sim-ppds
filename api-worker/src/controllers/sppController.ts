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
