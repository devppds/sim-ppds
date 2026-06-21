import { Context } from 'hono'
import { Env } from '../index'

export const getSearchResults = async (c: Context<{ Bindings: Env }>) => {
  try {
    const query = c.req.query("q") || "";

    if (query.length < 2) {
      return c.json({ success: true, results: [] });
    }

    const santriSearch = await c.env.DB.prepare(`
      SELECT 'santri' as type, id, name, photo_url, (kelas || ' • ' || madrasah) as info
      FROM santri
      WHERE name LIKE ? OR nisn LIKE ? OR nik LIKE ?
      LIMIT 5
    `).bind(`%${query}%`, `%${query}%`, `%${query}%`).all();

    const ustadzSearch = await c.env.DB.prepare(`
      SELECT 'ustadz' as type, id, name, photo_url, (CASE WHEN sub_jabatan IS NULL OR sub_jabatan = '' THEN jabatan WHEN jabatan IN ('Ketua', 'Sekretaris', 'Bendahara') THEN sub_jabatan ELSE jabatan || ' (' || sub_jabatan || ')' END) as info
      FROM ustadz
      WHERE name LIKE ? OR nik LIKE ?
      LIMIT 3
    `).bind(`%${query}%`, `%${query}%`).all();

    const results = [...(santriSearch.results || []), ...(ustadzSearch.results || [])];

    c.header('Cache-Control', 'public, max-age=10, s-maxage=10');
    return c.json({ 
      success: true, 
      results: results.slice(0, 8) 
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return c.json({ success: false, error: "Gagal melakukan pencarian" }, 500);
  }
}
