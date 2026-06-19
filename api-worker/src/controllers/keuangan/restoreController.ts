import { Context } from 'hono';
import { Env } from '../../index';
 from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";

"edge";

// POST /api/keuangan/restore - pulihkan transaksi yang dihapus
export async function POST(request: Request) {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return c.json({ success: false, error: "ID wajib ada" }, { status: 400 });

    await env.DB.prepare(
      "UPDATE transactions SET deleted_at = NULL WHERE id = ?"
    ).bind(id).run();

    return c.json({ success: true, message: "Transaksi berhasil dipulihkan" });
  } catch (error) {
    console.error("Finance RESTORE Error:", error);
    return c.json({ success: false, error: "Gagal memulihkan transaksi" }, { status: 500 });
  }
}
