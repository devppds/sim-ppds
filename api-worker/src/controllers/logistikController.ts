import { Context } from 'hono'
import { Env } from '../index'

// --- Booking Perlengkapan & Logistik ---
export const getBookingPerlengkapan = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM booking_perlengkapan ORDER BY tgl_pinjam DESC").all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getBookingPerlengkapan:", error)
    return c.json({ success: false, error: "Gagal mengambil data booking perlengkapan" }, 500)
  }
}

export const createBookingPerlengkapan = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { nama_kegiatan, perlengkapan, peminjam, tgl_pinjam, tgl_kembali } = body

    if (!nama_kegiatan || !perlengkapan || !peminjam || !tgl_pinjam || !tgl_kembali) {
      return c.json({ success: false, error: "Data wajib diisi" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO booking_perlengkapan (nama_kegiatan, perlengkapan, peminjam, tgl_pinjam, tgl_kembali, status)
      VALUES (?, ?, ?, ?, ?, 'Diajukan')
    `).bind(nama_kegiatan, perlengkapan, peminjam, tgl_pinjam, tgl_kembali).run()

    return c.json({ success: true, message: "Booking perlengkapan berhasil diajukan" })
  } catch (error) {
    console.error("Error createBookingPerlengkapan:", error)
    return c.json({ success: false, error: "Gagal mengajukan booking perlengkapan" }, 500)
  }
}

export const updateBookingPerlengkapanStatus = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { status } = body

    if (!id || !status) {
      return c.json({ success: false, error: "ID dan status wajib ada" }, 400)
    }

    await c.env.DB.prepare(`
      UPDATE booking_perlengkapan SET status = ? WHERE id = ?
    `).bind(status, id).run()

    return c.json({ success: true, message: "Status booking perlengkapan berhasil diperbarui" })
  } catch (error) {
    console.error("Error updateBookingPerlengkapanStatus:", error)
    return c.json({ success: false, error: "Gagal memperbarui booking perlengkapan" }, 500)
  }
}

// --- Checklist Kebersihan ---
export const getChecklistKebersihan = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM kebersihan_checklist ORDER BY tanggal DESC, created_at DESC").all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getChecklistKebersihan:", error)
    return c.json({ success: false, error: "Gagal mengambil data checklist" }, 500)
  }
}

export const createChecklistKebersihan = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { area, petugas, status_kebersihan, tanggal, catatan } = body

    if (!area || !petugas || !status_kebersihan) {
      return c.json({ success: false, error: "Data wajib diisi" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO kebersihan_checklist (area, petugas, status_kebersihan, tanggal, catatan)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      area,
      petugas,
      status_kebersihan,
      tanggal || new Date().toISOString().split('T')[0],
      catatan || ''
    ).run()

    return c.json({ success: true, message: "Checklist kebersihan berhasil dicatat" })
  } catch (error) {
    console.error("Error createChecklistKebersihan:", error)
    return c.json({ success: false, error: "Gagal mencatat checklist" }, 500)
  }
}
