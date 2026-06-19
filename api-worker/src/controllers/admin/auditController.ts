import { Context } from 'hono';
import { Env } from '../../index';
 from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";
import { cookies } from "next/headers";

"edge";

async function isAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("sim_ppds_session")?.value;
  if (!session) return false;
  try {
    const data = JSON.parse(session);
    return data.role === "Pengasuh";
  } catch (e) { return false; }
}

export async function GET() {
  try {
    if (!await isAdmin()) return c.json({ error: "Unauthorized" }, { status: 403 });

    const env = c.env; as unknown as { env: CloudflareEnv };
    const { results } = await env.DB.prepare(
      "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100"
    ).all();

    return c.json({ success: true, data: results });
  } catch (error) {
    console.error("Audit List Error:", error);
    return c.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
