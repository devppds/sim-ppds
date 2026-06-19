import { Context } from 'hono';
import { Env } from '../../index';
 from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";

"edge";

// GET /api/pengurus - ambil semua data pengurus
export async function GET() {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };
    const { results } = await env.DB.prepare("SELECT * FROM ustadz WHERE status = 'Aktif' ORDER BY created_at DESC").all();
    return c.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching pengurus:", error);
    return c.json({ success: false, error: "Gagal mengambil data" }, { status: 500 });
  }
}

// POST /api/pengurus - tambah pengurus baru
export async function POST(request: Request) {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };
    const body = (await request.json()) as any;
    const { 
      nik, name, phone, jabatan, jabatan_tambahan, kamar, photo_url, gender 
    } = body;

    if (!name || !nik) {
      return c.json({ success: false, error: "Nama dan NIK wajib diisi" }, { status: 400 });
    }

    await env.DB.prepare(
      `INSERT INTO ustadz (nik, name, phone, jabatan, jabatan_tambahan, kamar, photo_url, gender, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Aktif')`
    ).bind(nik, name, phone, jabatan, jabatan_tambahan, kamar, photo_url, gender || 'L').run();

    return c.json({ success: true, message: "Pengurus berhasil ditambahkan" });
  } catch (error: any) {
    console.error("Error adding pengurus:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message?.includes("UNIQUE") ? "NIK sudah terdaftar" : "Gagal menyimpan data" 
    }, { status: 500 });
  }
}
