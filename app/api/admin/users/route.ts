import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";
import { cookies } from "next/headers";

export const runtime = "edge";

// Helper function for SHA-256 hashing
async function hashPassword(password: string) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Middleware manual check for Root Admin or Sekretariat
async function isAuthorized() {
  const cookieStore = await cookies();
  const session = cookieStore.get("sim_ppds_session")?.value;
  if (!session) return false;
  try {
    const data = JSON.parse(session);
    const role = (data.role || "").toUpperCase();
    return data.role_level === "ROOT" || data.role_level === "SEKRETARIAT" || role === "DEVELOPER" || role.includes("SEKRETARIS") || role.includes("SEKRETARIAT");
  } catch (e) { return false; }
}

// GET /api/admin/users - List all users
export async function GET() {
  try {
    if (!await isAuthorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sim_ppds_session")?.value;
    let isDev = false;
    if (sessionCookie) {
      const session = JSON.parse(sessionCookie);
      isDev = (session.role || "").toUpperCase() === "DEVELOPER" || (session.username || "").toLowerCase() === "developer";
    }

    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    
    let query = "SELECT id, username, full_name as name, role, is_active, last_login, created_at FROM users";
    if (!isDev) {
      query += " WHERE LOWER(username) != 'developer' AND LOWER(role) != 'developer'";
    }
    query += " ORDER BY role DESC";

    const { results } = await env.DB.prepare(query).all();

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("User List Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: Request) {
  try {
    if (!await isAuthorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const { username, password, name, role } = await request.json() as any;

    if (!username || !password || !name || !role) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    await env.DB.prepare(
      "INSERT INTO users (username, password, full_name, role, is_active) VALUES (?, ?, ?, ?, 1)"
    ).bind(username, hashedPassword, name, role).run();

    return NextResponse.json({ success: true, message: "User created successfully" });
  } catch (error: any) {
    if (error.message.includes("UNIQUE")) {
      return NextResponse.json({ success: false, error: "Username already exists" }, { status: 400 });
    }
    console.error("User Create Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/admin/users - Update user active status or reset password
export async function PUT(request: Request) {
  try {
    if (!await isAuthorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const { id, is_active, reset_password } = await request.json() as any;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sim_ppds_session")?.value;
    let isDev = false;
    if (sessionCookie) {
      const session = JSON.parse(sessionCookie);
      isDev = (session.role || "").toUpperCase() === "DEVELOPER" || (session.username || "").toLowerCase() === "developer";
    }

    // Protect Developer accounts from modification by non-developers
    const targetUser = await env.DB.prepare("SELECT username, role FROM users WHERE id = ?").bind(id).first() as any;
    if (targetUser) {
      const isTargetDev = (targetUser.username || "").toLowerCase() === "developer" || (targetUser.role || "").toLowerCase() === "developer";
      if (isTargetDev && !isDev) {
        return NextResponse.json({ success: false, error: "Tidak memiliki hak akses untuk memodifikasi akun Developer" }, { status: 403 });
      }
    }

    if (reset_password) {
      // Reset to 123456 (hash: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92)
      await env.DB.prepare(
        "UPDATE users SET password = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' WHERE id = ?"
      ).bind(id).run();
      return NextResponse.json({ success: true, message: "Password berhasil di-reset ke default (123456)" });
    }

    if (is_active !== undefined) {
      await env.DB.prepare(
        "UPDATE users SET is_active = ? WHERE id = ?"
      ).bind(is_active ? 1 : 0, id).run();
      return NextResponse.json({ success: true, message: `Status pengguna berhasil diperbarui` });
    }

    return NextResponse.json({ success: false, error: "No action specified" }, { status: 400 });
  } catch (error) {
    console.error("User Update Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/users - delete user
export async function DELETE(request: Request) {
  try {
    if (!await isAuthorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sim_ppds_session")?.value;
    let isDev = false;
    if (sessionCookie) {
      const session = JSON.parse(sessionCookie);
      isDev = (session.role || "").toUpperCase() === "DEVELOPER" || (session.username || "").toLowerCase() === "developer";
    }

    // Protect Developer accounts from deletion by non-developers
    const targetUser = await env.DB.prepare("SELECT username, role FROM users WHERE id = ?").bind(id).first() as any;
    if (targetUser) {
      const isTargetDev = (targetUser.username || "").toLowerCase() === "developer" || (targetUser.role || "").toLowerCase() === "developer";
      if (isTargetDev && !isDev) {
        return NextResponse.json({ success: false, error: "Tidak memiliki hak akses untuk menghapus akun Developer" }, { status: 403 });
      }
    }

    await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("User Delete Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
