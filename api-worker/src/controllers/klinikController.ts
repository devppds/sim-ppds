import { Context } from 'hono'
import { Env } from '../index'

// --- Rekam Medis ---
export const getMedicalRecords = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT m.*, s.name as santri_name, s.nisn as santri_nisn, s.kelas as santri_kelas, s.asrama as santri_asrama
      FROM medical_records m
      JOIN santri s ON m.santri_id = s.id
      ORDER BY m.created_at DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getMedicalRecords:", error)
    return c.json({ success: false, error: "Gagal mengambil rekam medis" }, 500)
  }
}

export const createMedicalRecord = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { santri_id, diagnosa, terapi, dokter_perawat, status } = body

    if (!santri_id || !diagnosa || !dokter_perawat) {
      return c.json({ success: false, error: "Data wajib diisi" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO medical_records (santri_id, diagnosa, terapi, dokter_perawat, status)
      VALUES (?, ?, ?, ?, ?)
    `).bind(santri_id, diagnosa, terapi || '', dokter_perawat, status || 'Rawat Jalan').run()

    return c.json({ success: true, message: "Rekam medis berhasil dicatat" })
  } catch (error) {
    console.error("Error createMedicalRecord:", error)
    return c.json({ success: false, error: "Gagal mencatat rekam medis" }, 500)
  }
}

// --- Surat Keterangan Sakit ---
export const getSuratSakit = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT u.*, s.name as santri_name, s.nisn as santri_nisn, s.kelas as santri_kelas, s.asrama as santri_asrama
      FROM surat_sakit u
      JOIN santri s ON u.santri_id = s.id
      ORDER BY u.created_at DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getSuratSakit:", error)
    return c.json({ success: false, error: "Gagal mengambil data surat sakit" }, 500)
  }
}

export const createSuratSakit = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { santri_id, tgl_mulai, tgl_selesai, diagnosa, keterangan, petugas } = body

    if (!santri_id || !tgl_mulai || !tgl_selesai || !diagnosa || !petugas) {
      return c.json({ success: false, error: "Data wajib diisi" }, 400)
    }

    // D1 Batch: 
    // 1. Simpan ke surat_sakit
    // 2. Insert ke perizinan otomatis (untuk perizinan E-Gate)
    // 3. Insert ke notifications
    const descPerizinan = `Sakit (UKP Lirboyo): ${diagnosa}`
    await c.env.DB.batch([
      c.env.DB.prepare(`
        INSERT INTO surat_sakit (santri_id, tgl_mulai, tgl_selesai, diagnosa, keterangan, petugas)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(santri_id, tgl_mulai, tgl_selesai, diagnosa, keterangan || '', petugas),
      
      c.env.DB.prepare(`
        INSERT INTO perizinan (santri_id, keperluan, tgl_mulai, tgl_kembali, status, disetujui_oleh)
        VALUES (?, ?, ?, ?, 'Disetujui', ?)
      `).bind(santri_id, descPerizinan, tgl_mulai, tgl_selesai, petugas),

      c.env.DB.prepare(`
        INSERT INTO notifications (title, message, type)
        SELECT 'Santri Sakit', 'Santri ' || name || ' diterbitkan surat sakit s.d ' || ? || '.', 'warning'
        FROM santri WHERE id = ?
      `).bind(tgl_selesai, santri_id)
    ])

    return c.json({ success: true, message: "Surat keterangan sakit berhasil dibuat & terintegrasi dengan Keamanan" })
  } catch (error) {
    console.error("Error createSuratSakit:", error)
    return c.json({ success: false, error: "Gagal membuat surat sakit" }, 500)
  }
}
