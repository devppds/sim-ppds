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
    const { newPassword } = await request.json() as any;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sim_ppds_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);

    // Development fallback
    if (session.username === "developer" || session.username === "admin") {
      // Just clear the is_default_password flag in session and let it pass
      session.is_default_password = false;
      cookieStore.set("sim_ppds_session", JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
      });
      return NextResponse.json({ success: true });
    }

    if (!env || !env.DB) {
      return NextResponse.json({ success: false, error: "Database not connected" }, { status: 500 });
    }

    const hashedPassword = await hashPassword(newPassword);

    // Update password in DB
    await env.DB.prepare("UPDATE users SET password = ? WHERE id = ?")
      .bind(hashedPassword, session.id)
      .run();

    // Update session to remove the is_default_password flag
    session.is_default_password = false;
    cookieStore.set("sim_ppds_session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Force Change Password Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update password" }, { status: 500 });
  }
}
