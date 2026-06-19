import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";
import { cookies } from "next/headers";

export const runtime = "edge";

async function hashPassword(password: string) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  try {
    const context = getRequestContext() as any;
    const env = context?.env as CloudflareEnv;
    const { currentPassword, newPassword } = await request.json() as any;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Password lama dan baru wajib diisi" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sim_ppds_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, error: "Sesi tidak valid, silakan login ulang" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.id;

    if (!env || !env.DB) {
       return NextResponse.json({ success: false, error: "Database tidak terhubung" }, { status: 500 });
    }

    // Verify current password
    const hashedCurrent = await hashPassword(currentPassword);
    const user = await env.DB.prepare("SELECT id FROM users WHERE id = ? AND password = ?").bind(userId, hashedCurrent).first();

    if (!user) {
      return NextResponse.json({ success: false, error: "Password lama salah" }, { status: 400 });
    }

    // Update password
    const hashedNew = await hashPassword(newPassword);
    await env.DB.prepare("UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?").bind(hashedNew, userId).run();

    return NextResponse.json({ success: true, message: "Password berhasil diperbarui" });

  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengganti password" }, { status: 500 });
  }
}
