import { Context } from 'hono';
import { Env } from '../../index';
 from "@cloudflare/next-on-pages";

"edge";

interface CloudflareEnv {
  DB: D1Database;
}

// GET /api/arsip - List all archive files
export async function GET() {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };
    const { results } = await env.DB.prepare(
      "SELECT * FROM arsip ORDER BY created_at DESC"
    ).all();

    return c.json({ success: true, data: results });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: "Gagal mengambil data arsip" }, { status: 500 });
  }
}

// POST /api/arsip - Save new archive file reference
export async function POST(request: Request) {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };
    const body = await request.json() as any;
    const { name, url, type, size, category, doc_date, doc_number, flow_type, sender_receiver } = body;

    if (!name || !url) {
      return c.json({ success: false, error: "Nama dan URL wajib diisi" }, { status: 400 });
    }

    await env.DB.prepare(
      "INSERT INTO arsip (name, url, type, size, category, doc_date, doc_number, flow_type, sender_receiver) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(name, url, type, size, category, doc_date, doc_number, flow_type, sender_receiver).run();

    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving arsip:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Gagal menyimpan ke database: " + (error.message || "Unknown error") 
    }, { status: 500 });
  }
}
