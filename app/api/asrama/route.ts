import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";

export const runtime = "edge";

export async function GET() {
  try {
    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };

    // Ambil data santri yang memiliki asrama
    const { results: santriResults } = await env.DB.prepare(
      "SELECT name, asrama, kelas, status FROM santri WHERE asrama IS NOT NULL AND status NOT IN ('Alumni', 'Keluar')"
    ).all();

    // Ambil data pengurus yang memiliki kamar
    const { results: pengurusResults } = await env.DB.prepare(
      "SELECT name, kamar, jabatan, photo_url FROM ustadz WHERE kamar IS NOT NULL"
    ).all();

    return NextResponse.json({
      success: true,
      data: {
        santri: santriResults,
        pengurus: pengurusResults
      }
    });
  } catch (error) {
    console.error("Error fetching asrama data:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data asrama" }, { status: 500 });
  }
}
