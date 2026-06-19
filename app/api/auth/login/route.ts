import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";
import { cookies } from "next/headers";

export const runtime = "edge";

// Helper function for SHA-256 hashing (supported in Cloudflare Edge)
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
    const { username, password } = await request.json() as any;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username and password required" }, { status: 400 });
    }

    // 1. DEVELOPMENT FALLBACK: If D1 is not available (common in 'next dev')
    if (process.env.NODE_ENV === "development" && (!env || !env.DB)) {
       console.warn("⚠️ [DEV MODE] Cloudflare D1 not found. Using local fallback for 'admin' user.");
       if (username === "admin" && password === "admin123") {
          const mockUser = {
             id: 1,
             username: "admin",
             name: "Super Admin (Local Dev)",
             role: "Super Admin",
             role_level: "ROOT"
          };
          
          const cookieStore = await cookies();
          cookieStore.set("sim_ppds_session", JSON.stringify({ ...mockUser, timestamp: Date.now() }), {
            httpOnly: true,
            secure: false, // Local dev
            sameSite: "strict",
            maxAge: 60 * 60 * 24,
          });

          return NextResponse.json({ success: true, user: mockUser });
       }
    }

    if (!env || !env.DB) {
       return NextResponse.json({ success: false, error: "Database not connected" }, { status: 500 });
    }

    // Hash the incoming password to compare with the DB
    const hashedPassword = await hashPassword(password);

    // Look up the user in D1 with their access level
    const user = await env.DB.prepare(
      `SELECT u.id, u.username, u.name, u.role, u.status, j.akses_level as role_level 
       FROM users u 
       LEFT JOIN jabatan j ON u.role = j.nama 
       WHERE u.username = ? AND u.password = ?`
    ).bind(username, hashedPassword).first() as any;

    if (!user) {
      return NextResponse.json({ success: false, error: "Username atau Password salah" }, { status: 401 });
    }

    if (user.status !== "Aktif") {
      return NextResponse.json({ success: false, error: "Akun dinonaktifkan" }, { status: 403 });
    }

    // Set Session Cookie (Simple for this phase, later can use JWT/Iron-Session)
    // We store minimal info: id, role, name, level
    const sessionData = { 
       id: user.id, 
       username: user.username, 
       role: user.role,
       role_level: user.role_level || 'STAFF', 
       name: user.name,
       timestamp: Date.now() 
    };
    
    // In production, sign this payload! For now, we set it as a secure cookie
    const cookieStore = await cookies();
    cookieStore.set("sim_ppds_session", JSON.stringify(sessionData), {
      httpOnly: true, // Sidebar & Topbar now fetch from /api/auth/session
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
    });

    // Update last_login
    await env.DB.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?")
      .bind(user.id)
      .run();

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name, role: user.role } 
    });

  } catch (error) {
    console.error("Auth Login Error:", error);
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 });
  }
}
