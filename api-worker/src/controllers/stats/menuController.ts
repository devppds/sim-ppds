import { Context } from 'hono';
import { Env } from '../../index';
 from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";

"edge";

export async function GET() {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };

    // 1. Santri Aktif (Not Alumni)
    const santriAktif = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM santri WHERE status != 'Alumni'"
    ).first<number>("count") || 0;

    // 2. Pengurus Aktif
    const pengurusAktif = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM ustadz WHERE status = 'Aktif'"
    ).first<number>("count") || 0;

    // 3. Alumni Santri
    const alumniSantri = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM santri WHERE status = 'Alumni'"
    ).first<number>("count") || 0;

    // 4. Alumni Pengurus (Tidak Aktif)
    const alumniPengurus = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM ustadz WHERE status = 'Tidak Aktif'"
    ).first<number>("count") || 0;

    return NextResponse.json({
      success: true,
      data: {
        santri: santriAktif,
        pengurus: pengurusAktif,
        alumni_santri: alumniSantri,
        alumni_pengurus: alumniPengurus
      }
    });
  } catch (error) {
    console.error("Error fetching menu stats:", error);
    return c.json({ success: false, error: "Gagal mengambil statistik menu" }, { status: 500 });
  }
}
