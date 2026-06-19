import { Context } from 'hono';
import { Env } from '../../index';
 from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";

"edge";

// PUT /api/santri/[id] - update data santri atau status
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };
    const id = params.id;
    const body = (await request.json()) as any;
    
    // Jika hanya update status (untuk alumni) - bisa disertai tahun_lulus
    if (body.status && !body.name) {
      const tahunLulus = body.tahun_lulus || null;
      await env.DB.prepare(
        "UPDATE santri SET status = ?, tahun_lulus = COALESCE(?, tahun_lulus), updated_at = datetime('now') WHERE id = ?"
      ).bind(body.status, tahunLulus, id).run();
      
      return c.json({ success: true, message: "Status santri diperbarui" });
    }

    // Update full profile
    const { 
      nisn, 
      nik = "", 
      name, 
      madrasah = "", 
      kelas, 
      asrama = "", 
      asal = "", 
      photo_url = "", 
      street = "", 
      rt_rw = "", 
      province = "", 
      city = "", 
      district = "", 
      village = "", 
      postal_code = "", 
      wali_name = "", 
      wali_wa = "", 
      status = "Aktif"
    } = body;

    await env.DB.prepare(
      `UPDATE santri SET 
        nisn = ?, nik = ?, name = ?, madrasah = ?, kelas = ?, asrama = ?, asal = ?, 
        photo_url = ?, street = ?, rt_rw = ?, province = ?, city = ?, 
        district = ?, village = ?, postal_code = ?, wali_name = ?, wali_wa = ?, 
        status = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).bind(
      nisn, 
      nik, 
      name, 
      madrasah, 
      kelas, 
      asrama, 
      asal, 
      photo_url, 
      street, 
      rt_rw, 
      province, 
      city, 
      district, 
      village, 
      postal_code, 
      wali_name, 
      wali_wa, 
      status, 
      id
    ).run();

    return c.json({ success: true, message: "Data santri diperbarui" });
  } catch (error: any) {
    console.error("Error updating santri:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message?.includes("UNIQUE") ? "NISN sudah terdaftar" : "Gagal memperbarui data" 
    }, { status: 500 });
  }
}

// DELETE /api/santri/[id] - hapus santri permanen
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };
    const id = params.id;

    await env.DB.prepare("DELETE FROM santri WHERE id = ?").bind(id).run();
    return c.json({ success: true, message: "Santri berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting santri:", error);
    return c.json({ success: false, error: "Gagal menghapus data" }, { status: 500 });
  }
}
