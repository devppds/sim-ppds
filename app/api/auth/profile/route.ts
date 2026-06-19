import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";
import { cookies } from "next/headers";

export const runtime = "edge";

// GET /api/auth/profile - Fetch profile of logged in user
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sim_ppds_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Sesi tidak valid, silakan login ulang" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie);
    const userId = session.id;

    const context = getRequestContext() as any;
    const env = context?.env as CloudflareEnv;

    if (!env || !env.DB) {
      // Dev mode fallback
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          success: true,
          data: {
            id: session.id,
            username: session.username,
            name: session.name,
            role: session.role,
            avatar_url: session.avatar_url || null
          }
        });
      }
      return NextResponse.json({ success: false, error: "Database tidak terhubung" }, { status: 500 });
    }

    const user = await env.DB.prepare(
      "SELECT id, username, full_name as name, role, avatar_url, is_active FROM users WHERE id = ?"
    ).bind(userId).first() as any;

    if (!user) {
      return NextResponse.json({ success: false, error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/auth/profile - Update profile details of logged in user
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sim_ppds_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Sesi tidak valid, silakan login ulang" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie);
    const userId = session.id;
    const { name, avatar_url } = await request.json() as any;

    if (!name) {
      return NextResponse.json({ success: false, error: "Nama lengkap wajib diisi" }, { status: 400 });
    }

    const context = getRequestContext() as any;
    const env = context?.env as CloudflareEnv;

    if (env && env.DB) {
      await env.DB.prepare(
        "UPDATE users SET full_name = ?, avatar_url = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(name, avatar_url || null, userId).run();
    }

    // Update session cookie
    const updatedSession = {
      ...session,
      name,
      avatar_url: avatar_url || null,
      timestamp: Date.now()
    };

    cookieStore.set("sim_ppds_session", JSON.stringify(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ success: true, message: "Profil berhasil diperbarui", user: updatedSession });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
