import { Context } from 'hono';
import { Env } from '../../index';
 from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";
import { cookies } from "next/headers";

"edge";

async function isRoot() {
    const cookieStore = await cookies();
    const session = cookieStore.get("sim_ppds_session")?.value;
    if (!session) return false;
    try {
      const data = JSON.parse(session);
      return data.role_level === "ROOT";
    } catch (e) { return false; }
}

// GET /api/admin/roles - List all dynamic roles
export async function GET() {
    try {
        const env = c.env; as unknown as { env: CloudflareEnv };
        const { results } = await env.DB.prepare("SELECT * FROM jabatan ORDER BY nama ASC").all();
        return c.json({ success: true, data: results });
    } catch (error) {
        console.error("Roles List Error:", error);
        return c.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

// POST /api/admin/roles - Add new role
export async function POST(request: Request) {
    try {
        if (!await isRoot()) return c.json({ error: "Unauthorized" }, { status: 403 });
        const env = c.env; as unknown as { env: CloudflareEnv };
        const { nama, akses_level, deskripsi } = await request.json() as any;

        const VALID_LEVELS = ['ROOT', 'SEKRETARIAT', 'KEUANGAN', 'VIEW_ALL', 'STAFF', 'RESTRICTED_SPP'];
        if (!nama || !akses_level || !VALID_LEVELS.includes(akses_level)) {
            return c.json({ success: false, error: "Nama dan Level diperlukan/valid" }, { status: 400 });
        }

        await env.DB.prepare(
            "INSERT INTO jabatan (nama, akses_level, deskripsi) VALUES (?, ?, ?)"
        ).bind(nama, akses_level, deskripsi).run();

        return c.json({ success: true, message: "Jabatan ditambahkan" });
    } catch (e: any) {
        if (e.message.includes("UNIQUE")) {
            return c.json({ success: false, error: "Jabatan sudah ada" }, { status: 400 });
        }
        return c.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
