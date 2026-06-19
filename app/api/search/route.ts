import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    // Search in Santri
    const santriSearch = await env.DB.prepare(`
      SELECT 'santri' as type, id, name, photo_url, (kelas || ' • ' || madrasah) as info
      FROM santri
      WHERE name LIKE ? OR nisn LIKE ? OR nik LIKE ?
      LIMIT 5
    `).bind(`%${query}%`, `%${query}%`, `%${query}%`).all();

    // Search in Ustadz
    const ustadzSearch = await env.DB.prepare(`
      SELECT 'ustadz' as type, id, name, photo_url, jabatan as info
      FROM ustadz
      WHERE name LIKE ? OR nik LIKE ?
      LIMIT 3
    `).bind(`%${query}%`, `%${query}%`).all();

    const results = [...(santriSearch.results || []), ...(ustadzSearch.results || [])];

    return NextResponse.json({ 
      success: true, 
      results: results.slice(0, 8) 
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ success: false, error: "Gagal melakukan pencarian" }, { status: 500 });
  }
}
