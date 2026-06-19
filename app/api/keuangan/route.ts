import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";

export const runtime = "edge";

// GET /api/keuangan - ambil semua data transaksi
export async function GET(request: Request) {
  try {
    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const { searchParams } = new URL(request.url);
    const showTrashed = searchParams.get("trashed") === "true";

    const whereClause = showTrashed ? "WHERE deleted_at IS NOT NULL" : "WHERE deleted_at IS NULL";
    
    const { results } = await env.DB.prepare(
      `SELECT * FROM transactions ${whereClause} ORDER BY date DESC, id DESC LIMIT 100`
    ).all();

    // Hitung ringkasan (hanya yang aktif)
    const summary = await env.DB.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'Pemasukan' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'Pengeluaran' THEN amount ELSE 0 END) as total_expense
      FROM transactions
      WHERE deleted_at IS NULL
    `).first() as any;

    return NextResponse.json({ 
      success: true, 
      data: results,
      summary: summary || { total_income: 0, total_expense: 0 }
    });
  } catch (error) {
    console.error("Finance API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/keuangan - catat transaksi baru
export async function POST(request: Request) {
  try {
    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const body = await request.json() as any;
    
    const { 
      type, 
      category, 
      amount, 
      description = "", 
      date = new Date().toISOString().split('T')[0],
      proof_url = null 
    } = body;

    if (!type || !category || !amount) {
      return NextResponse.json({ success: false, error: "Tipe, kategori, dan jumlah harus diisi" }, { status: 400 });
    }

    await env.DB.prepare(
      "INSERT INTO transactions (type, category, amount, description, date, proof_url) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(type, category, amount, description, date, proof_url).run();

    return NextResponse.json({ success: true, message: "Transaksi berhasil dicatat" });
  } catch (error) {
    console.error("Finance POST Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/keuangan - edit transaksi
export async function PUT(request: Request) {
  try {
    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const body = await request.json() as any;
    const { id, type, category, amount, description, date, proof_url } = body;

    if (!id) return NextResponse.json({ success: false, error: "ID wajib ada" }, { status: 400 });

    await env.DB.prepare(`
      UPDATE transactions 
      SET type = ?, category = ?, amount = ?, description = ?, date = ?, proof_url = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(type, category, amount, description, date, proof_url, id).run();

    return NextResponse.json({ success: true, message: "Transaksi diperbarui" });
  } catch (error) {
    console.error("Finance PUT Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/keuangan - hapus transaksi (soft delete)
export async function DELETE(request: Request) {
  try {
    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const permanent = searchParams.get("permanent") === "true";

    if (!id) return NextResponse.json({ success: false, error: "ID wajib ada" }, { status: 400 });

    if (permanent) {
      await env.DB.prepare("DELETE FROM transactions WHERE id = ?").bind(id).run();
      return NextResponse.json({ success: true, message: "Transaksi dihapus permanen" });
    } else {
      await env.DB.prepare("UPDATE transactions SET deleted_at = datetime('now') WHERE id = ?").bind(id).run();
      return NextResponse.json({ success: true, message: "Transaksi dipindah ke Recycle Bin" });
    }
  } catch (error) {
    console.error("Finance DELETE Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
