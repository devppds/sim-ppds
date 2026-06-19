import { Context } from 'hono'
import { Env } from '../index'

// --- Perizinan (E-Gate) ---
export const getPerizinan = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT p.*, s.name as santri_name, s.nisn as santri_nisn, s.kelas as santri_kelas, s.asrama as santri_asrama
      FROM perizinan p
      JOIN santri s ON p.santri_id = s.id
      ORDER BY p.created_at DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getPerizinan:", error)
    return c.json({ success: false, error: "Gagal mengambil data perizinan" }, 500)
  }
}

export const createPerizinan = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { santri_id, keperluan, tgl_mulai, tgl_kembali, disetujui_oleh } = body

    if (!santri_id || !keperluan || !tgl_mulai || !tgl_kembali) {
      return c.json({ success: false, error: "Data tidak lengkap" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO perizinan (santri_id, keperluan, tgl_mulai, tgl_kembali, status, disetujui_oleh)
      VALUES (?, ?, ?, ?, 'Diajukan', ?)
    `).bind(santri_id, keperluan, tgl_mulai, tgl_kembali, disetujui_oleh || 'Keamanan').run()

    return c.json({ success: true, message: "Perizinan berhasil diajukan" })
  } catch (error) {
    console.error("Error createPerizinan:", error)
    return c.json({ success: false, error: "Gagal membuat perizinan" }, 500)
  }
}

export const updatePerizinanStatus = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { status } = body

    if (!id || !status) {
      return c.json({ success: false, error: "ID dan status wajib diisi" }, 400)
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19)

    let query = "UPDATE perizinan SET status = ?, updated_at = datetime('now')"
    const bindings: (string | number | null)[] = [status]

    if (status === 'Keluar') {
      query += ", scan_keluar_at = ?"
      bindings.push(nowStr)
    } else if (status === 'Kembali' || status === 'Terlambat') {
      query += ", scan_kembali_at = ?"
      bindings.push(nowStr)
    }

    query += " WHERE id = ?"
    bindings.push(id)

    await c.env.DB.prepare(query).bind(...bindings).run()

    return c.json({ success: true, message: `Status perizinan diperbarui menjadi ${status}` })
  } catch (error) {
    console.error("Error updatePerizinanStatus:", error)
    return c.json({ success: false, error: "Gagal memperbarui status perizinan" }, 500)
  }
}

// --- SKKB (Surat Keterangan Kelakuan Baik) ---
export const getSKKB = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT k.*, s.name as santri_name, s.nisn as santri_nisn, s.kelas as santri_kelas, s.asrama as santri_asrama
      FROM skkb k
      JOIN santri s ON k.santri_id = s.id
      ORDER BY k.created_at DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getSKKB:", error)
    return c.json({ success: false, error: "Gagal mengambil data SKKB" }, 500)
  }
}

export const createSKKB = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { santri_id, keperluan, catatan, petugas } = body

    if (!santri_id || !keperluan) {
      return c.json({ success: false, error: "Santri dan Keperluan wajib diisi" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO skkb (santri_id, keperluan, catatan, petugas)
      VALUES (?, ?, ?, ?)
    `).bind(santri_id, keperluan, catatan || '', petugas || 'Seksi Keamanan').run()

    return c.json({ success: true, message: "Dokumen SKKB berhasil dicatat" })
  } catch (error) {
    console.error("Error createSKKB:", error)
    return c.json({ success: false, error: "Gagal membuat dokumen SKKB" }, 500)
  }
}

// --- Asset Registry ---
export const getAssets = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT a.*, s.name as santri_name, s.nisn as santri_nisn, s.kelas as santri_kelas
      FROM santri_assets a
      JOIN santri s ON a.santri_id = s.id
      ORDER BY a.created_at DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getAssets:", error)
    return c.json({ success: false, error: "Gagal mengambil data register aset" }, 500)
  }
}

export const createAsset = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { santri_id, jenis_asset, merk_tipe, no_registrasi, barcode_qr } = body

    if (!santri_id || !jenis_asset || !merk_tipe || !barcode_qr) {
      return c.json({ success: false, error: "Data tidak lengkap" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO santri_assets (santri_id, jenis_asset, merk_tipe, no_registrasi, barcode_qr, status)
      VALUES (?, ?, ?, ?, ?, 'Aktif')
    `).bind(santri_id, jenis_asset, merk_tipe, no_registrasi || '', barcode_qr).run()

    return c.json({ success: true, message: "Aset santri berhasil didaftarkan" })
  } catch (error) {
    console.error("Error createAsset:", error)
    return c.json({ success: false, error: "Gagal mendaftarkan aset santri" }, 500)
  }
}

// --- Pelanggaran & Bullying ---
export const getPelanggaran = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT p.*, s.name as santri_name, s.nisn as santri_nisn, s.kelas as santri_kelas, s.asrama as santri_asrama
      FROM pelanggaran p
      JOIN santri s ON p.santri_id = s.id
      ORDER BY p.created_at DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getPelanggaran:", error)
    return c.json({ success: false, error: "Gagal mengambil data pelanggaran" }, 500)
  }
}

export const createPelanggaran = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { santri_id, jenis, deskripsi, point, tindakan_diambil, dilaporkan_oleh } = body

    if (!santri_id || !jenis || !deskripsi) {
      return c.json({ success: false, error: "Data tidak lengkap" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO pelanggaran (santri_id, jenis, deskripsi, point, tindakan_diambil, status, dilaporkan_oleh)
      VALUES (?, ?, ?, ?, ?, 'Penyelidikan', ?)
    `).bind(santri_id, jenis, deskripsi, point || 0, tindakan_diambil || '', dilaporkan_oleh || 'Petugas Keamanan').run()

    return c.json({ success: true, message: "Pelanggaran berhasil dilaporkan" })
  } catch (error) {
    console.error("Error createPelanggaran:", error)
    return c.json({ success: false, error: "Gagal melaporkan pelanggaran" }, 500)
  }
}
