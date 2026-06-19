import { Context } from 'hono';
import { Env } from '../../index';
 from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";

"edge";

// GET /api/spp - ambil daftar santri beserta status pembayaran SPP untuk periode tertentu
export async function GET(request: Request) {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };
    const { searchParams } = new URL(request.url);
    
    // Default: Periode saat ini (Maulid/Rajab/Syawal) - kita asumsikan berdasarkan bulan sekarang
    const month = new Date().getMonth() + 1; // 1-12
    let defaultPeriod = 'Syawal';
    if (month >= 3 && month <= 6) defaultPeriod = 'Maulid';
    else if (month >= 7 && month <= 10) defaultPeriod = 'Rajab';
    
    const period = searchParams.get("period") || defaultPeriod;
    const academicYear = searchParams.get("academic_year") || "2025/2026";
    const classFilter = searchParams.get("class");
    const statusFilter = searchParams.get("status");

    // Query untuk ambil santri beserta pembayarannya di periode tsb
    let query = `
      SELECT 
        s.id, s.nisn, s.name, s.kelas, s.madrasah, s.status as santri_status, s.tahun_masuk,
        p.id as payment_id, p.amount, p.status as payment_status, p.paid_at, p.period, p.academic_year
      FROM santri s
      LEFT JOIN spp_payments p ON s.id = p.santri_id AND p.period = ? AND p.academic_year = ?
      WHERE s.status NOT IN ('Alumni', 'Keluar')
    `;
    
    const params: any[] = [period, academicYear];
    
    if (classFilter) {
      query += " AND s.kelas LIKE ?";
      params.push(`%${classFilter}%`);
    }

    if (statusFilter) {
      query += " AND s.status = ?";
      params.push(statusFilter);
    }

    query += " ORDER BY s.name ASC";

    const { results } = await env.DB.prepare(query).bind(...params).all() as any;

    // Hitung ringkasan
    const summary = await env.DB.prepare(`
      SELECT 
        COUNT(CASE WHEN p.status = 'Lunas' THEN 1 END) as paid_count,
        COUNT(s.id) as total_count,
        SUM(CASE WHEN p.status = 'Lunas' THEN p.amount ELSE 0 END) as total_amount
      FROM santri s
      LEFT JOIN spp_payments p ON s.id = p.santri_id AND p.period = ? AND p.academic_year = ?
      WHERE s.status NOT IN ('Alumni', 'Keluar')
    `).bind(period, academicYear).first() as any;

    return NextResponse.json({ 
      success: true, 
      data: results,
      summary: summary || { paid_count: 0, total_count: 0, total_amount: 0 },
      period,
      academicYear
    });
  } catch (error) {
    console.error("SPP GET error:", error);
    return c.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/spp - rekam pembayaran SPP Periode
export async function POST(request: Request) {
  try {
    const env = c.env; as unknown as { env: CloudflareEnv };
    const body = await request.json() as any;
    const { santri_id, amount, period, academic_year, status = 'Lunas' } = body;

    if (!santri_id || !amount || !period) {
      return c.json({ success: false, error: "Data tidak lengkap" }, { status: 400 });
    }

    // 1. Simpan ke tabel spp_payments
    await env.DB.prepare(
      "INSERT INTO spp_payments (santri_id, amount, period, academic_year, status, paid_at) VALUES (?, ?, ?, ?, ?, datetime('now'))"
    ).bind(santri_id, amount, period, academic_year || "2025/2026", status).run();

    // 2. Tambahkan ke tabel transactions (Keuangan)
    const santri = await env.DB.prepare("SELECT name, kelas FROM santri WHERE id = ?").bind(santri_id).first() as any;
    const description = `Syahriah ${period} ${academic_year} - ${santri?.name} (${santri?.kelas})`;
    await env.DB.prepare(
      "INSERT INTO transactions (type, category, amount, description, date) VALUES ('Pemasukan', 'SPP', ?, ?, date('now'))"
    ).bind(amount, description).run();

    return c.json({ success: true, message: "Pembayaran berhasil dicatat" });
  } catch (error) {
    console.error("SPP POST Error:", error);
    return c.json({ success: false, error: "Gagal mencatat pembayaran" }, { status: 500 });
  }
}
