import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";
import { cookies } from "next/headers";

export const runtime = "edge";

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
    if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const { results } = await env.DB.prepare(
      "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100"
    ).all();

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Audit List Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
