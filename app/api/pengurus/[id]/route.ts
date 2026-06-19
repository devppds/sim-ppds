import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";

export const runtime = "edge";

// PUT /api/pengurus/[id] - update data pengurus
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const id = params.id;
    const body = (await request.json()) as any;
    
    // Support partial update for status only (bisa disertai tahun_purna)
    if (body.status && !body.name) {
      const tahunPurna = body.tahun_purna || null;
      await env.DB.prepare(
        "UPDATE ustadz SET status = ?, tahun_purna = COALESCE(?, tahun_purna), updated_at = datetime('now') WHERE id = ?"
      ).bind(body.status, tahunPurna, id).run();
      return NextResponse.json({ success: true, message: "Status diperbarui" });
    }

    const { 
      nik, 
      name, 
      phone, 
      jabatan, 
      jabatan_tambahan = "", 
      kamar = "", 
      photo_url = "", 
      gender = "L", 
      status = "Aktif" 
    } = body;

    await env.DB.prepare(
      `UPDATE ustadz SET 
        nik = ?, name = ?, phone = ?, jabatan = ?, 
        jabatan_tambahan = ?, kamar = ?, photo_url = ?, 
        gender = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).bind(
      nik, 
      name, 
      phone, 
      jabatan, 
      jabatan_tambahan, 
      kamar, 
      photo_url, 
      gender, 
      status, 
      id
    ).run();

    return NextResponse.json({ success: true, message: "Data berhasil diperbarui" });
  } catch (error: any) {
    console.error("Error updating pengurus:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message?.includes("UNIQUE") ? "NIK sudah digunakan" : "Gagal memperbarui data" 
    }, { status: 500 });
  }
}

// DELETE /api/pengurus/[id] - hapus data pengurus
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const id = params.id;

    await env.DB.prepare("DELETE FROM ustadz WHERE id = ?").bind(id).run();
    return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal menghapus data" }, { status: 500 });
  }
}
