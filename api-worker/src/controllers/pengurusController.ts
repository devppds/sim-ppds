import { Context } from 'hono'
import { Env } from '../index'
import { triggerCloudinaryDelete } from '../utils/cloudinary'

export const getPengurus = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        id, nik, name, phone, 
        jabatan as jabatan_utama, sub_jabatan, 
        (CASE 
          WHEN sub_jabatan IS NULL OR sub_jabatan = '' THEN jabatan 
          WHEN jabatan IN ('Ketua', 'Sekretaris', 'Bendahara') THEN sub_jabatan 
          ELSE jabatan || ' (' || sub_jabatan || ')' 
        END) as jabatan,
        jabatan_tambahan, kamar, photo_url, gender, status, created_at, updated_at
      FROM ustadz 
      WHERE status = 'Aktif' 
      ORDER BY created_at DESC
    `).all()
    
    c.header('Cache-Control', 'public, max-age=30, s-maxage=30')
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error fetching pengurus:", error)
    return c.json({ success: false, error: "Gagal mengambil data" }, 500)
  }
}

export const addPengurus = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { nik, name, phone, jabatan, sub_jabatan, jabatan_tambahan, kamar, photo_url, gender } = body

    if (!name || !nik) {
      return c.json({ success: false, error: "Nama dan NIK wajib diisi" }, 400)
    }

    await c.env.DB.prepare(
      `INSERT INTO ustadz (nik, name, phone, jabatan, sub_jabatan, jabatan_tambahan, kamar, photo_url, gender, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Aktif')`
    ).bind(nik, name, phone, jabatan, sub_jabatan || null, jabatan_tambahan, kamar, photo_url, gender || 'L').run()

    return c.json({ success: true, message: "Pengurus berhasil ditambahkan" })
  } catch (error: any) {
    console.error("Error adding pengurus:", error)
    return c.json({ 
      success: false, 
      error: error.message?.includes("UNIQUE") ? "NIK sudah terdaftar" : "Gagal menyimpan data" 
    }, 500)
  }
}

export const updatePengurus = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    if (!id) return c.json({ success: false, error: "ID wajib ada" }, 400)

    const body = await c.req.json()
    const { nik, name, phone, jabatan, sub_jabatan, jabatan_tambahan, kamar, photo_url, gender, status } = body

    if (!name || !nik) {
      return c.json({ success: false, error: "Nama dan NIK wajib diisi" }, 400)
    }

    // Get old photo url to delete if a new one was uploaded
    const oldPengurus = await c.env.DB.prepare("SELECT photo_url FROM ustadz WHERE id = ?").bind(id).first() as any;
    if (oldPengurus && oldPengurus.photo_url && photo_url && oldPengurus.photo_url !== photo_url) {
      await triggerCloudinaryDelete(c, oldPengurus.photo_url);
    }

    await c.env.DB.prepare(`
      UPDATE ustadz SET
        nik = ?, name = ?, phone = ?, jabatan = ?, sub_jabatan = ?, jabatan_tambahan = ?, kamar = ?, photo_url = ?, gender = ?, status = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(nik, name, phone, jabatan, sub_jabatan || null, jabatan_tambahan || null, kamar || null, photo_url || null, gender || 'L', status || 'Aktif', id).run()

    return c.json({ success: true, message: "Pengurus berhasil diperbarui" })
  } catch (error: any) {
    console.error("Error updating pengurus:", error)
    if (error.message?.includes("UNIQUE")) {
      return c.json({ success: false, error: "NIK sudah terdaftar" }, 400)
    }
    return c.json({ success: false, error: "Gagal memperbarui data" }, 500)
  }
}

export const deletePengurus = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    if (!id) return c.json({ success: false, error: "ID wajib ada" }, 400)

    // Select old photo to delete from Cloudinary
    const pengurus = await c.env.DB.prepare("SELECT photo_url FROM ustadz WHERE id = ?").bind(id).first() as any
    if (pengurus && pengurus.photo_url) {
      await triggerCloudinaryDelete(c, pengurus.photo_url)
    }

    await c.env.DB.prepare("DELETE FROM ustadz WHERE id = ?").bind(id).run()
    return c.json({ success: true, message: "Pengurus berhasil dihapus permanen" })
  } catch (error) {
    console.error("Error deleting pengurus:", error)
    return c.json({ success: false, error: "Gagal menghapus pengurus" }, 500)
  }
}
