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
  }
}

// --- Keamanan Kendaraan ---
export const getKendaraan = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT k.*, s.name as santri_name, s.nisn, s.kelas
      FROM keamanan_kendaraan k
      JOIN santri s ON k.santri_id = s.id
      ORDER BY k.id DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getKendaraan:", error)
    return c.json({ success: false, error: "Gagal mengambil data kendaraan" }, 500)
  }
}

export const createKendaraan = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { santri_id, jenis, merk, plat_nomor, warna, petugas } = body
    if (!santri_id || !jenis || !merk || !warna) return c.json({ success: false, error: "Data tidak lengkap" }, 400)
    
    await c.env.DB.prepare(`
      INSERT INTO keamanan_kendaraan (santri_id, jenis, merk, plat_nomor, warna, petugas)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(santri_id, jenis, merk, plat_nomor || "", warna, petugas).run()
    
    return c.json({ success: true, message: "Kendaraan berhasil didaftarkan" })
  } catch (error) {
    console.error("Error createKendaraan:", error)
    return c.json({ success: false, error: "Gagal mendaftarkan kendaraan" }, 500)
  }
}

// --- Keamanan Elektronik ---
export const getElektronik = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT e.*, s.name as santri_name, s.nisn, s.kelas
      FROM keamanan_elektronik e
      JOIN santri s ON e.santri_id = s.id
      ORDER BY e.id DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getElektronik:", error)
    return c.json({ success: false, error: "Gagal mengambil data elektronik" }, 500)
  }
}

export const createElektronik = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { santri_id, jenis, detail_jenis, kelengkapan, merk, warna, petugas } = body
    if (!santri_id || !jenis || !merk || !warna) return c.json({ success: false, error: "Data tidak lengkap" }, 400)

    await c.env.DB.prepare(`
      INSERT INTO keamanan_elektronik (santri_id, jenis, detail_jenis, kelengkapan, merk, warna, petugas)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(santri_id, jenis, detail_jenis || "", kelengkapan || "", merk, warna, petugas).run()

    return c.json({ success: true, message: "Barang elektronik berhasil didaftarkan" })
  } catch (error) {
    console.error("Error createElektronik:", error)
    return c.json({ success: false, error: "Gagal mendaftarkan elektronik" }, 500)
  }
}

// --- Keamanan Kompor ---
export const getKompor = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM keamanan_kompor
      ORDER BY id DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getKompor:", error)
    return c.json({ success: false, error: "Gagal mengambil data kompor" }, 500)
  }
}

export const createKompor = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { nama_pendaftar, kamar, merk, jenis_tabung, warna, penempatan, tanggal_kadaluarsa, petugas } = body
    if (!nama_pendaftar || !kamar || !merk || !jenis_tabung) return c.json({ success: false, error: "Data tidak lengkap" }, 400)

    await c.env.DB.prepare(`
      INSERT INTO keamanan_kompor (nama_pendaftar, kamar, merk, jenis_tabung, warna, penempatan, tanggal_kadaluarsa, petugas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(nama_pendaftar, kamar, merk, jenis_tabung, warna, penempatan, tanggal_kadaluarsa, petugas).run()

    return c.json({ success: true, message: "Kompor berhasil didaftarkan" })
  } catch (error) {
    console.error("Error createKompor:", error)
    return c.json({ success: false, error: "Gagal mendaftarkan kompor" }, 500)
  }
}

// --- Transaksi Keamanan ---
export const getTransaksi = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM keamanan_transaksi
      ORDER BY id DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getTransaksi:", error)
    return c.json({ success: false, error: "Gagal mengambil data transaksi" }, 500)
  }
}

export const createTransaksi = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { item_type, item_id, petugas } = body
    if (!item_type || !item_id || !petugas) return c.json({ success: false, error: "Data tidak lengkap" }, 400)

    await c.env.DB.prepare(`
      INSERT INTO keamanan_transaksi (item_type, item_id, waktu_pengambilan, petugas_pengambil, status)
      VALUES (?, ?, datetime('now'), ?, 'Dipinjam')
    `).bind(item_type, item_id, petugas).run()

    return c.json({ success: true, message: "Transaksi pengambilan berhasil" })
  } catch (error) {
    console.error("Error createTransaksi:", error)
    return c.json({ success: false, error: "Gagal membuat transaksi" }, 500)
  }
}

export const updateTransaksi = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { petugas } = body
    if (!petugas || !id) return c.json({ success: false, error: "Data tidak lengkap" }, 400)

    await c.env.DB.prepare(`
      UPDATE keamanan_transaksi 
      SET waktu_pengembalian = datetime('now'), petugas_pengembali = ?, status = 'Dikembalikan'
      WHERE id = ?
    `).bind(petugas, id).run()

    return c.json({ success: true, message: "Barang berhasil dikembalikan" })
  } catch (error) {
    console.error("Error updateTransaksi:", error)
    return c.json({ success: false, error: "Gagal memperbarui transaksi" }, 500)
  }
}
