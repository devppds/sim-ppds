import { Context } from 'hono';
import { Env } from '../../index';
 from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";

"edge";

// Helper to get current academic year (e.g., 2025/2026)
function getCurrentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  
  if (month >= 7) {
    return `${year}/${year + 1}`;
  } else {
    return `${year - 1}/${year}`;
  }
}

export async function GET(request: Request) {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const year = searchParams.get("year");

    if (type === "santri") {
      let query = "SELECT * FROM santri WHERE status = 'Alumni'";
      const params: any[] = [];
      
      if (year) {
        query += " AND tahun_lulus = ?";
        params.push(year);
      }
      
      query += " ORDER BY updated_at DESC";
      
      const { results } = await env.DB.prepare(query).bind(...params).all();
      return c.json({ success: true, data: results });
    } else if (type === "pengurus") {
      let query = "SELECT * FROM ustadz WHERE status = 'Tidak Aktif'";
      const params: any[] = [];
      
      if (year) {
        query += " AND tahun_purna = ?";
        params.push(year);
      }
      
      query += " ORDER BY updated_at DESC";
      
      const { results } = await env.DB.prepare(query).bind(...params).all();
      return c.json({ success: true, data: results });
    }

    return c.json({ success: false, error: "Tipe tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching alumni:", error);
    return c.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };
    const body = await request.json();
    const { type, items, ...manualData } = body as any;

    const currentYear = getCurrentAcademicYear();

    if (items && Array.isArray(items)) {
      // Bulk Import
      let count = 0;
      for (const item of items) {
        if (type === "santri") {
          await env.DB.prepare(`
            INSERT INTO santri (name, nisn, nik, status, tahun_lulus, street, rt_rw, province, city, district, village, postal_code, photo_url, wali_wa, kelas, asrama)
            VALUES (?, ?, ?, 'Alumni', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '-', '-')
          `).bind(
            item.name, item.nisn, item.nik, item.tahun_lulus || currentYear,
            item.street, item.rt_rw, item.province, item.city, item.district, item.village, item.postal_code,
            item.photo_url, item.phone, // phone mapped to wali_wa or similar
          ).run();
        } else {
          await env.DB.prepare(`
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
      // Manual Single Input
      if (type === "santri") {
        await env.DB.prepare(`
          INSERT INTO santri (name, nisn, nik, status, tahun_lulus, street, rt_rw, province, city, district, village, postal_code, photo_url, wali_wa, kelas, asrama)
          VALUES (?, ?, ?, 'Alumni', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '-', '-')
        `).bind(
          manualData.name, manualData.nisn || "", manualData.nik || "", manualData.tahun_lulus || currentYear,
          manualData.street, manualData.rt_rw, manualData.province, manualData.city, manualData.district, manualData.village, manualData.postal_code,
          manualData.photo_url, manualData.phone
        ).run();
      } else {
        await env.DB.prepare(`
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
    return c.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
