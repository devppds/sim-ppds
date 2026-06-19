import { Context } from 'hono';
import { Env } from '../../index';
 from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";

"edge";

// GET /api/notifications - ambil list notifikasi terbaru
export async function GET() {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };
    
    // Ambil 10 notifikasi terbaru
    const { results } = await env.DB.prepare(
      "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10"
    ).all();

    // Hitung jumlah yang belum dibaca
    const unreadCount = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM notifications WHERE is_read = 0"
    ).first() as any;

    return NextResponse.json({ 
      success: true, 
      data: results, 
      unreadCount: unreadCount?.count || 0 
    });
  } catch (error) {
    console.error("Notifications GET Error:", error);
    return c.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/notifications - tandai sudah dibaca
export async function PUT(request: Request) {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id === "all") {
      await env.DB.prepare("UPDATE notifications SET is_read = 1").run();
    } else {
      await env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").bind(id).run();
    }

    return c.json({ success: true, message: "Notifikasi diperbarui" });
  } catch (error) {
    console.error("Notifications PUT Error:", error);
    return c.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
