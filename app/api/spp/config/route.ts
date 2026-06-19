import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";

export const runtime = "edge";

// GET /api/spp/config - ambil tarif berdasarkan madrasah, status, jenjang, dan periode
export async function GET(request: Request) {
  try {
    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");

    if (all === "true") {
      const { results } = await env.DB.prepare("SELECT * FROM spp_config ORDER BY created_at DESC").all() as any;
      return NextResponse.json({ success: true, data: results });
    }

    const status = searchParams.get("status");
    const madrasah = searchParams.get("madrasah");
    const kelas = searchParams.get("kelas");
    const period = searchParams.get("period") || "Semua";
    const entryMonth = searchParams.get("entry_month"); // 1-12

    let query = "SELECT amount FROM spp_config WHERE status = ?";
    const params: any[] = [status];

    if (madrasah) {
      query += " AND madrasah = ?";
      params.push(madrasah);
    }

    // Logic untuk mencocokkan jenjang berdasarkan nama kelas (Fuzzy)
    const k = kelas?.toLowerCase() || "";
    if (k.includes("khidmah")) query += " AND kelas_name = 'Khidmah'";
    else if (k.includes("ibtida")) query += " AND kelas_name = 'Ibtida'";
    else if (k.includes("tsanawiyyah")) query += " AND kelas_name = 'Tsanawiyyah'";
    else if (k.includes("aliyyah")) query += " AND kelas_name = 'Aliyyah'";
    else if (k.includes("ma'had aly") || k.includes("mahad aly")) {
        // Cek jika semester 7-8 (Khidmah)
        if (k.includes("sem 7") || k.includes("sem 8")) query += " AND kelas_name = 'Khidmah'";
        else query += " AND kelas_name = 'Ma''had Aly'";
    }
    else if (k.includes("ula")) query += " AND kelas_name = 'Ula'";
    else if (k.includes("wustho")) query += " AND kelas_name = 'Wustho'";
    else if (k.includes("ulya")) query += " AND kelas_name = 'Ulya'";
    else if (k.includes("sp")) query += " AND kelas_name = 'SP'";
    else query += " AND kelas_name = 'Ibtida'"; // Default

    // Cek tarif khusus santri baru masuk bulan tsb jika ada
    if (entryMonth) {
      const newStudentRow = await env.DB.prepare(
        `${query} AND entry_month = ? AND is_new_student = 1`
      ).bind(...params, entryMonth).first() as any;
      
      if (newStudentRow) return NextResponse.json({ success: true, amount: newStudentRow.amount });
    }

    // Cek periode spesifik
    const periodRow = await env.DB.prepare(
      `${query} AND (period_name = ? OR period_name = 'Semua')`
    ).bind(...params, period).first() as any;

    return NextResponse.json({ 
      success: true,
      amount: periodRow?.amount || 0,
      period: period
    });
  } catch (error) {
    console.error("Config GET Error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil tarif" }, { status: 500 });
  }
}

// POST /api/spp/config - tambah/update konfigurasi tarif
export async function POST(request: Request) {
  try {
    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const body = await request.json() as any;
    const { status, madrasah, kelas_name, period_name, amount, entry_month, is_new_student, description } = body;

    await env.DB.prepare(`
      INSERT INTO spp_config (status, madrasah, kelas_name, period_name, amount, entry_month, is_new_student, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(status, madrasah || 'MHM', kelas_name, period_name, amount, entry_month || null, is_new_student ? 1 : 0, description).run();

    return NextResponse.json({ success: true, message: "Konfigurasi disimpan" });
  } catch (error) {
    console.error("Config POST Error:", error);
    return NextResponse.json({ success: false, error: "Gagal menyimpan konfigurasi" }, { status: 500 });
  }
}
