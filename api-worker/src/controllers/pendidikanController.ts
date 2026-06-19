import { Context } from 'hono'
import { Env } from '../index'

// --- Jadwal Pengajian Kitab ---
export const getJadwalPengajian = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM jadwal_pengajian
      ORDER BY 
        CASE hari
          WHEN 'Senin' THEN 1
          WHEN 'Selasa' THEN 2
          WHEN 'Rabu' THEN 3
          WHEN 'Kamis' THEN 4
          WHEN 'Jumat' THEN 5
          WHEN 'Sabtu' THEN 6
          WHEN 'Ahad' THEN 7
          ELSE 8
        END, waktu ASC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getJadwalPengajian:", error)
    return c.json({ success: false, error: "Gagal mengambil jadwal pengajian" }, 500)
  }
}

export const createJadwalPengajian = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { kitab, ustadz, hari, waktu, lokasi, keterangan } = body

    if (!kitab || !ustadz || !hari || !waktu) {
      return c.json({ success: false, error: "Data wajib diisi" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO jadwal_pengajian (kitab, ustadz, hari, waktu, lokasi, keterangan)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(kitab, ustadz, hari, waktu, lokasi || '', keterangan || '').run()

    return c.json({ success: true, message: "Jadwal pengajian berhasil ditambahkan" })
  } catch (error) {
    console.error("Error createJadwalPengajian:", error)
    return c.json({ success: false, error: "Gagal menambahkan jadwal pengajian" }, 500)
  }
}

// --- Izin Sekolah / Musyawarah ---
export const getIzinSekolah = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT i.*, s.name as santri_name, s.nisn as santri_nisn, s.kelas as santri_kelas, s.asrama as santri_asrama
      FROM perizinan i
      JOIN santri s ON i.santri_id = s.id
      WHERE i.keperluan LIKE 'Sekolah%' OR i.keperluan LIKE 'Musyawarah%' OR i.keperluan LIKE 'Izin Akademik%'
      ORDER BY i.created_at DESC
    `).all()
    // Catatan: Izin sekolah disimpan di perizinan umum tapi difilter keperluannya, 
    // atau jika tidak ada, tampilkan perizinan yang difilter. Ini sangat efisien.
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getIzinSekolah:", error)
    return c.json({ success: false, error: "Gagal mengambil data izin sekolah" }, 500)
  }
}

export const createIzinSekolah = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { santri_id, sekolah_nama, alasan, tgl_mulai, tgl_kembali } = body

    if (!santri_id || !sekolah_nama || !alasan || !tgl_mulai || !tgl_kembali) {
      return c.json({ success: false, error: "Data tidak lengkap" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO perizinan (santri_id, keperluan, tgl_mulai, tgl_kembali, status, disetujui_oleh)
      VALUES (?, ?, ?, ?, 'Diajukan', 'Seksi Pendidikan')
    `).bind(
      santri_id, 
      `Sekolah: ${sekolah_nama} (${alasan})`, 
      tgl_mulai, 
      tgl_kembali
    ).run()

    return c.json({ success: true, message: "Izin sekolah berhasil diajukan" })
  } catch (error) {
    console.error("Error createIzinSekolah:", error)
    return c.json({ success: false, error: "Gagal mengajukan izin sekolah" }, 500)
  }
}

export const updateIzinSekolahStatus = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { status } = body

    if (!id || !status) {
      return c.json({ success: false, error: "ID dan status wajib ada" }, 400)
    }

    await c.env.DB.prepare(`
      UPDATE perizinan SET status = ?, updated_at = datetime('now') WHERE id = ?
    `).bind(status, id).run()

    return c.json({ success: true, message: "Status izin sekolah berhasil diperbarui" })
  } catch (error) {
    console.error("Error updateIzinSekolahStatus:", error)
    return c.json({ success: false, error: "Gagal memperbarui status izin" }, 500)
  }
}

// --- Log Bimbingan BK ---
export const getBimbinganLogs = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT b.*, s.name as santri_name, s.nisn as santri_nisn, s.kelas as santri_kelas, s.asrama as santri_asrama
      FROM bimbingan_log b
      JOIN santri s ON b.santri_id = s.id
      ORDER BY b.created_at DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getBimbinganLogs:", error)
    return c.json({ success: false, error: "Gagal mengambil log bimbingan" }, 500)
  }
}

export const createBimbinganLog = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { santri_id, keluhan, solusi, pembimbing, tanggal } = body

    if (!santri_id || !keluhan || !pembimbing) {
      return c.json({ success: false, error: "Data wajib diisi" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO bimbingan_log (santri_id, keluhan, solusi, pembimbing, tanggal)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      santri_id, 
      keluhan, 
      solusi || '', 
      pembimbing, 
      tanggal || new Date().toISOString().split('T')[0]
    ).run()

    return c.json({ success: true, message: "Catatan bimbingan berhasil disimpan" })
  } catch (error) {
    console.error("Error createBimbinganLog:", error)
    return c.json({ success: false, error: "Gagal mencatat bimbingan" }, 500)
  }
}
