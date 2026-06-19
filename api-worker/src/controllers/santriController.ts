import { Context } from 'hono'
import { Env } from '../index'

// Mengambil Santri dengan Pagination, Search, dan Filter
export const getSantriPaginated = async (c: Context<{ Bindings: Env }>) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
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
