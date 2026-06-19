import { Context } from 'hono';
import { Env } from '../../index';
 from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";
import { canWrite } from "@/lib/auth";

"edge";

// GET /api/santri - ambil semua santri dari D1
export async function GET() {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };
    
    // Query ke database D1 lokal/remote
    const { results } = await env.DB.prepare(
      "SELECT * FROM santri WHERE status != 'Alumni' ORDER BY created_at DESC LIMIT 50"
    ).all();

    return c.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching santri:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error atau Database belum siap" },
      { status: 500 }
    );
  }
}

// POST /api/santri - tambah santri baru
export async function POST(request: Request) {
  try {
    if (!await canWrite('SANTRI')) {
      return c.json({ success: false, error: "Izin ditolak (Hanya Lihat/View-Only)" }, { status: 403 });
    }
    const env = c.env; as unknown as { env: CloudflareEnv };
    const body = (await request.json()) as any;
    const { 
      nisn, nik, name, madrasah, kelas, asrama, asal, 
      photo_url, street, rt_rw, province, city, 
      district, village, postal_code, wali_name, wali_wa,
      status = 'Baru'
    } = body;

    if (!nisn || !name || !kelas) {
      return NextResponse.json(
        { success: false, error: "NISN, nama, dan kelas wajib diisi" },
        { status: 400 }
      );
    }

    await env.DB.prepare(
      `INSERT INTO santri (
        nisn, nik, name, madrasah, kelas, asrama, asal, 
        photo_url, street, rt_rw, province, city, 
        district, village, postal_code, wali_name, wali_wa, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      nisn, nik, name, madrasah, kelas, asrama, asal, 
      photo_url, street, rt_rw, province, city, 
      district, village, postal_code, wali_name, wali_wa, status
    ).run();

    return NextResponse.json({
      success: true,
      message: "Santri berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error adding santri:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan data ke database" },
      { status: 500 }
    );
  }
}
