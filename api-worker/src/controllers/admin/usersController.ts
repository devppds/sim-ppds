import { Context } from 'hono';
import { Env } from '../../index';
 from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";
import { cookies } from "next/headers";

"edge";

// Helper function for SHA-256 hashing
async function hashPassword(password: string) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Middleware manual check for Root Admin (Pengasuh)
async function isRoot() {
  const cookieStore = await cookies();
  const session = cookieStore.get("sim_ppds_session")?.value;
  if (!session) return false;
  try {
    const data = JSON.parse(session);
    return data.role_level === "ROOT";
  } catch (e) { return false; }
}

// GET /api/admin/users - List all users
export async function GET() {
  try {
    if (!await isRoot()) return c.json({ error: "Unauthorized" }, { status: 403 });

    const env = c.env; as unknown as { env: CloudflareEnv };
    const { results } = await env.DB.prepare(
      "SELECT id, username, name, role, status, last_login, created_at FROM users ORDER BY role DESC"
    ).all();

    return c.json({ success: true, data: results });
  } catch (error) {
    console.error("User List Error:", error);
    return c.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: Request) {
  try {
    if (!await isRoot()) return c.json({ error: "Unauthorized" }, { status: 403 });

    const env = c.env; as unknown as { env: CloudflareEnv };
    const { username, password, name, role } = await request.json() as any;

    if (!username || !password || !name || !role) {
      return c.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    await env.DB.prepare(
      "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)"
    ).bind(username, hashedPassword, name, role).run();

    return c.json({ success: true, message: "User created successfully" });
  } catch (error: any) {
    if (error.message.includes("UNIQUE")) {
      return c.json({ success: false, error: "Username already exists" }, { status: 400 });
    }
    console.error("User Create Error:", error);
    return c.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/users - delete user
export async function DELETE(request: Request) {
  try {
    if (!await isRoot()) return c.json({ error: "Unauthorized" }, { status: 403 });

    const env = c.env; as unknown as { env: CloudflareEnv };
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return c.json({ success: false, error: "ID required" }, { status: 400 });

    // Prevent self-deletion if needed (could check session ID)
    
    await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();

    return c.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("User Delete Error:", error);
    return c.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
