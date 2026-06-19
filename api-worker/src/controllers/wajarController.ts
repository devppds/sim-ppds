import { Context } from 'hono'
import { Env } from '../index'

// --- Presensi Wajar (Siswa & Asatidz) ---
export const getPresensiWajar = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM presensi_wajar
      ORDER BY tanggal DESC, created_at DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getPresensiWajar:", error)
    return c.json({ success: false, error: "Gagal mengambil data presensi wajar" }, 500)
  }
}

export const createPresensiWajar = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { nama, peran, kelas, tanggal, status, keterangan } = body

    if (!nama || !peran || !kelas || !status) {
      return c.json({ success: false, error: "Data tidak lengkap" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO presensi_wajar (nama, peran, kelas, tanggal, status, keterangan)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      nama,
      peran,
      kelas,
      tanggal || new Date().toISOString().split('T')[0],
      status,
      keterangan || ''
    ).run()

    return c.json({ success: true, message: "Presensi berhasil dicatat" })
  } catch (error) {
    console.error("Error createPresensiWajar:", error)
    return c.json({ success: false, error: "Gagal mencatat presensi" }, 500)
  }
}

// --- Ubudiyyah Tracker (Subuh Ceria, Shalat Jamaah) ---
export const getUbudiyyahTracker = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT u.*, s.name as santri_name, s.nisn as santri_nisn, s.kelas as santri_kelas, s.asrama as santri_asrama
      FROM ubudiyyah_tracker u
      JOIN santri s ON u.santri_id = s.id
      ORDER BY u.tanggal DESC, u.created_at DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getUbudiyyahTracker:", error)
    return c.json({ success: false, error: "Gagal mengambil data tracker ubudiyyah" }, 500)
  }
}

export const createUbudiyyahTracker = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { santri_id, kegiatan, tanggal, status, keterangan } = body

    if (!santri_id || !kegiatan || !status) {
      return c.json({ success: false, error: "Data tidak lengkap" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO ubudiyyah_tracker (santri_id, kegiatan, tanggal, status, keterangan)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      santri_id,
      kegiatan,
      tanggal || new Date().toISOString().split('T')[0],
      status,
      keterangan || ''
    ).run()

    return c.json({ success: true, message: "Tracker ubudiyyah berhasil disimpan" })
  } catch (error) {
    console.error("Error createUbudiyyahTracker:", error)
    return c.json({ success: false, error: "Gagal menyimpan tracker ubudiyyah" }, 500)
  }
}
