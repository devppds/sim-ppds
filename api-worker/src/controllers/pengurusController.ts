import { Context } from 'hono'
import { Env } from '../index'

export const getPengurus = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM ustadz WHERE status = 'Aktif' ORDER BY created_at DESC"
    ).all()
    
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
    const { nik, name, phone, jabatan, jabatan_tambahan, kamar, photo_url, gender } = body

    if (!name || !nik) {
      return c.json({ success: false, error: "Nama dan NIK wajib diisi" }, 400)
    }

    await c.env.DB.prepare(
      `INSERT INTO ustadz (nik, name, phone, jabatan, jabatan_tambahan, kamar, photo_url, gender, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Aktif')`
    ).bind(nik, name, phone, jabatan, jabatan_tambahan, kamar, photo_url, gender || 'L').run()

    return c.json({ success: true, message: "Pengurus berhasil ditambahkan" })
  } catch (error: any) {
    console.error("Error adding pengurus:", error)
    return c.json({ 
      success: false, 
      error: error.message?.includes("UNIQUE") ? "NIK sudah terdaftar" : "Gagal menyimpan data" 
    }, 500)
  }
}
