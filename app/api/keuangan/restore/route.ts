import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";

export const runtime = "edge";

// POST /api/keuangan/restore - pulihkan transaksi yang dihapus
export async function POST(request: Request) {
  try {
    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, error: "ID wajib ada" }, { status: 400 });

    await env.DB.prepare(
      "UPDATE transactions SET deleted_at = NULL WHERE id = ?"
    ).bind(id).run();

    return NextResponse.json({ success: true, message: "Transaksi berhasil dipulihkan" });
  } catch (error) {
    console.error("Finance RESTORE Error:", error);
    return NextResponse.json({ success: false, error: "Gagal memulihkan transaksi" }, { status: 500 });
  }
}
