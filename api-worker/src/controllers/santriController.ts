import { Context } from 'hono'
import { Env } from '../index'
import { triggerCloudinaryDelete } from '../utils/cloudinary'

// Mengambil Santri dengan Pagination, Search, dan Filter
export const getSantriPaginated = async (c: Context<{ Bindings: Env }>) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '1000')
    const offset = (page - 1) * limit
    const search = c.req.query('q') || ''
    const kelas = c.req.query('kelas') || ''

    let countQuery = "SELECT COUNT(*) as total FROM santri WHERE 1=1"
    let dataQuery = "SELECT id, nisn, nik, name, kelas, asrama, asal, status, photo_url FROM santri WHERE 1=1"
    const params: any[] = []

    if (search) {
      countQuery += " AND (name LIKE ? OR nisn LIKE ?)"
      dataQuery += " AND (name LIKE ? OR nisn LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    if (kelas) {
      countQuery += " AND kelas = ?"
      dataQuery += " AND kelas = ?"
      params.push(kelas)
    }

    dataQuery += " ORDER BY name ASC LIMIT ? OFFSET ?"
    
    // Mengeksekusi query count dan data secara bersamaan (Batch)
    const [countRes, dataRes] = await c.env.DB.batch([
      c.env.DB.prepare(countQuery).bind(...params),
      c.env.DB.prepare(dataQuery).bind(...params, limit, offset)
    ])

    const total = (countRes.results[0] as any).total

    // Set Cache-Control header (Cache di CDN & Browser selama 30 detik untuk menghemat read D1)
    c.header('Cache-Control', 'public, max-age=30, s-maxage=30')

    return c.json({ 
      success: true, 
      data: dataRes.results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching santri:", error)
    return c.json({ success: false, error: "Gagal mengambil data santri" }, 500)
  }
}

export const createSantri = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const {
      nisn, nik, name, birth_date, birth_place, gender = 'L',
      asal, madrasah, kelas, asrama, photo_url, status = 'Biasa',
      street, rt_rw, province, city, district, village, postal_code,
      wali_name, wali_wa, wali_phone, tahun_masuk, tahun_lulus
    } = body

    if (!name || !nisn || !kelas) {
      return c.json({ success: false, error: "Nama, NISN, dan Kelas wajib diisi" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO santri (
        nisn, nik, name, birth_date, birth_place, gender, asal, madrasah, kelas, asrama,
        photo_url, status, street, rt_rw, province, city, district, village, postal_code,
        wali_name, wali_wa, wali_phone, tahun_masuk, tahun_lulus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      nisn, nik || null, name, birth_date || null, birth_place || null, gender,
      asal || null, madrasah || null, kelas, asrama || null, photo_url || null, status,
      street || null, rt_rw || null, province || null, city || null, district || null, village || null, postal_code || null,
      wali_name || null, wali_wa || null, wali_phone || null, tahun_masuk || null, tahun_lulus || null
    ).run()

    return c.json({ success: true, message: "Santri berhasil ditambahkan" })
  } catch (error: any) {
    console.error("Error creating santri:", error)
    if (error.message?.includes("UNIQUE")) {
      return c.json({ success: false, error: "NISN sudah terdaftar" }, 400)
    }
    return c.json({ success: false, error: "Gagal menambahkan santri" }, 500)
  }
}

export const updateSantri = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    if (!id) return c.json({ success: false, error: "ID wajib ada" }, 400)

    const body = await c.req.json()
    const {
      nisn, nik, name, birth_date, birth_place, gender,
      asal, madrasah, kelas, asrama, photo_url, status,
      street, rt_rw, province, city, district, village, postal_code,
      wali_name, wali_wa, wali_phone, tahun_masuk, tahun_lulus
    } = body

    if (!name || !kelas) {
      return c.json({ success: false, error: "Nama dan Kelas wajib diisi" }, 400)
    }

    // Get old photo url to delete if a new one was uploaded
    const oldSantri = await c.env.DB.prepare("SELECT photo_url FROM santri WHERE id = ?").bind(id).first() as any;
    if (oldSantri && oldSantri.photo_url && photo_url && oldSantri.photo_url !== photo_url) {
      await triggerCloudinaryDelete(c, oldSantri.photo_url);
    }

    await c.env.DB.prepare(`
      UPDATE santri SET
        nisn = ?, nik = ?, name = ?, birth_date = ?, birth_place = ?, gender = ?,
        asal = ?, madrasah = ?, kelas = ?, asrama = ?, photo_url = ?, status = ?,
        street = ?, rt_rw = ?, province = ?, city = ?, district = ?, village = ?, postal_code = ?,
        wali_name = ?, wali_wa = ?, wali_phone = ?, tahun_masuk = ?, tahun_lulus = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      nisn, nik || null, name, birth_date || null, birth_place || null, gender || 'L',
      asal || null, madrasah || null, kelas, asrama || null, photo_url || null, status || 'Biasa',
      street || null, rt_rw || null, province || null, city || null, district || null, village || null, postal_code || null,
      wali_name || null, wali_wa || null, wali_phone || null, tahun_masuk || null, tahun_lulus || null,
      id
    ).run()

    return c.json({ success: true, message: "Santri berhasil diperbarui" })
  } catch (error: any) {
    console.error("Error updating santri:", error)
    if (error.message?.includes("UNIQUE")) {
      return c.json({ success: false, error: "NISN sudah terdaftar" }, 400)
    }
    return c.json({ success: false, error: "Gagal memperbarui santri" }, 500)
  }
}

export const deleteSantri = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    if (!id) return c.json({ success: false, error: "ID wajib ada" }, 400)

    // Select old photo to delete from Cloudinary
    const santri = await c.env.DB.prepare("SELECT photo_url FROM santri WHERE id = ?").bind(id).first() as any
    if (santri && santri.photo_url) {
      await triggerCloudinaryDelete(c, santri.photo_url)
    }

    await c.env.DB.prepare("DELETE FROM santri WHERE id = ?").bind(id).run()
    return c.json({ success: true, message: "Santri berhasil dihapus permanen" })
  } catch (error) {
    console.error("Error deleting santri:", error)
    return c.json({ success: false, error: "Gagal menghapus santri" }, 500)
  }
}

export const createSantriBulk = async (c: Context<{ Bindings: Env }>) => {
  try {
    const list = await c.req.json() as any[]
    if (!Array.isArray(list) || list.length === 0) {
      return c.json({ success: false, error: "Data bulk kosong" }, 400)
    }

    const statements = list.map(s => {
      return c.env.DB.prepare(`
        INSERT OR REPLACE INTO santri (
          nisn, nik, name, gender, asal, madrasah, kelas, asrama, photo_url, status,
          street, rt_rw, province, city, district, village, postal_code,
          wali_name, wali_wa, wali_phone, tahun_masuk, tahun_lulus
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        s.nisn || "", s.nik || null, s.name, s.gender || 'L', s.asal || null, s.madrasah || null,
        s.kelas, s.asrama || null, s.photo_url || null, s.status || 'Biasa',
        s.street || null, s.rt_rw || null, s.province || null, s.city || null, s.district || null, s.village || null, s.postal_code || null,
        s.wali_name || null, s.wali_wa || null, s.wali_phone || null, s.tahun_masuk || null, s.tahun_lulus || null
      )
    })

    await c.env.DB.batch(statements)
    return c.json({ success: true, message: `Berhasil import ${list.length} santri` })
  } catch (error) {
    console.error("Error importing bulk santri:", error)
    return c.json({ success: false, error: "Gagal mengimport data santri" }, 500)
  }
}

export const getSantriDetail = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    if (!id) return c.json({ success: false, error: "ID wajib ada" }, 400)

    const santri = await c.env.DB.prepare("SELECT * FROM santri WHERE id = ?").bind(id).first()
    if (!santri) {
      return c.json({ success: false, error: "Santri tidak ditemukan" }, 404)
    }

    const [paymentsRes, permissionsRes, violationsRes] = await c.env.DB.batch([
      c.env.DB.prepare("SELECT * FROM spp_payments WHERE santri_id = ? ORDER BY paid_at DESC, id DESC").bind(id),
      c.env.DB.prepare("SELECT * FROM perizinan WHERE santri_id = ? ORDER BY tgl_mulai DESC, id DESC").bind(id),
      c.env.DB.prepare("SELECT * FROM pelanggaran WHERE santri_id = ? ORDER BY created_at DESC, id DESC").bind(id)
    ])

    return c.json({
      success: true,
      data: {
        santri,
        payments: paymentsRes.results,
        permissions: permissionsRes.results,
        violations: violationsRes.results
      }
    })
  } catch (error) {
    console.error("Error fetching santri detail:", error)
    return c.json({ success: false, error: "Gagal mengambil detail santri" }, 500)
  }
}
