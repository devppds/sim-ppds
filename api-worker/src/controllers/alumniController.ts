import { Context } from 'hono'
import { Env } from '../index'

function getCurrentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  if (month >= 7) {
    return `${year}/${year + 1}`;
  } else {
    return `${year - 1}/${year}`;
  }
}

export const getAlumniList = async (c: Context<{ Bindings: Env }>) => {
  try {
    const type = c.req.query("type");
    const year = c.req.query("year");

    if (type === "santri") {
      let query = "SELECT * FROM santri WHERE status = 'Alumni'";
      const params: any[] = [];
      
      if (year) {
        query += " AND tahun_lulus = ?";
        params.push(year);
      }
      
      query += " ORDER BY updated_at DESC";
      
      const { results } = await c.env.DB.prepare(query).bind(...params).all();
      c.header('Cache-Control', 'public, max-age=15, s-maxage=15');
      return c.json({ success: true, data: results });
    } else if (type === "pengurus") {
      let query = "SELECT * FROM ustadz WHERE status = 'Tidak Aktif'";
      const params: any[] = [];
      
      if (year) {
        query += " AND tahun_purna = ?";
        params.push(year);
      }
      
      query += " ORDER BY updated_at DESC";
      
      const { results } = await c.env.DB.prepare(query).bind(...params).all();
      c.header('Cache-Control', 'public, max-age=15, s-maxage=15');
      return c.json({ success: true, data: results });
    }

    return c.json({ success: false, error: "Tipe tidak valid" }, 400);
  } catch (error) {
    console.error("Error fetching alumni:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
}

export const createAlumni = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json() as any;
    const { type, items, ...manualData } = body;

    const currentYear = getCurrentAcademicYear();

    if (items && Array.isArray(items)) {
      let count = 0;
      for (const item of items) {
        if (type === "santri") {
          await c.env.DB.prepare(`
            INSERT INTO santri (name, nisn, nik, status, tahun_lulus, street, rt_rw, province, city, district, village, postal_code, photo_url, wali_wa, kelas, asrama)
            VALUES (?, ?, ?, 'Alumni', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '-', '-')
          `).bind(
            item.name, item.nisn, item.nik, item.tahun_lulus || currentYear,
            item.street, item.rt_rw, item.province, item.city, item.district, item.village, item.postal_code,
            item.photo_url, item.phone
          ).run();
        } else {
          await c.env.DB.prepare(`
            INSERT INTO ustadz (name, nik, status, tahun_purna, street, rt_rw, province, city, district, village, postal_code, photo_url, phone, jabatan)
            VALUES (?, ?, 'Tidak Aktif', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '-')
          `).bind(
            item.name, item.nik, item.tahun_purna || currentYear,
            item.street, item.rt_rw, item.province, item.city, item.district, item.village, item.postal_code,
            item.photo_url, item.phone
          ).run();
        }
        count++;
      }
      return c.json({ success: true, count });
    } else {
      if (type === "santri") {
        await c.env.DB.prepare(`
          INSERT INTO santri (name, nisn, nik, status, tahun_lulus, street, rt_rw, province, city, district, village, postal_code, photo_url, wali_wa, kelas, asrama)
          VALUES (?, ?, ?, 'Alumni', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '-', '-')
        `).bind(
          manualData.name, manualData.nisn || "", manualData.nik || "", manualData.tahun_lulus || currentYear,
          manualData.street, manualData.rt_rw, manualData.province, manualData.city, manualData.district, manualData.village, manualData.postal_code,
          manualData.photo_url, manualData.phone
        ).run();
      } else {
        await c.env.DB.prepare(`
          INSERT INTO ustadz (name, nik, status, tahun_purna, street, rt_rw, province, city, district, village, postal_code, photo_url, phone, jabatan)
          VALUES (?, ?, 'Tidak Aktif', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '-')
        `).bind(
          manualData.name, manualData.nik || "", manualData.tahun_purna || currentYear,
          manualData.street, manualData.rt_rw, manualData.province, manualData.city, manualData.district, manualData.village, manualData.postal_code,
          manualData.photo_url, manualData.phone
        ).run();
      }
      return c.json({ success: true });
    }
  } catch (error) {
    console.error("Error creating alumni:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
}
