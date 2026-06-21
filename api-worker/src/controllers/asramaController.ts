import { Context } from 'hono'
import { Env } from '../index'

export const getAsramaData = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results: santriResults } = await c.env.DB.prepare(
      "SELECT name, asrama, kelas, status, jabatan FROM santri WHERE asrama IS NOT NULL AND status NOT IN ('Alumni', 'Keluar')"
    ).all();

    const { results: pengurusResults } = await c.env.DB.prepare(
      "SELECT name, kamar, (CASE WHEN sub_jabatan IS NULL OR sub_jabatan = '' THEN jabatan WHEN jabatan IN ('Ketua', 'Sekretaris', 'Bendahara') THEN sub_jabatan ELSE jabatan || ' (' || sub_jabatan || ')' END) as jabatan, photo_url FROM ustadz WHERE kamar IS NOT NULL"
    ).all();

    c.header('Cache-Control', 'public, max-age=15, s-maxage=15')
    return c.json({
      success: true,
      data: {
        santri: santriResults,
        pengurus: pengurusResults
      }
    });
  } catch (error) {
    console.error("Error fetching asrama data:", error);
    return c.json({ success: false, error: "Gagal mengambil data asrama" }, 500);
  }
}
