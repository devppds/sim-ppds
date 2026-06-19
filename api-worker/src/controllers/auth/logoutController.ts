import { Context } from 'hono';
import { Env } from '../../index';
import { cookies } from "next/headers";

"edge";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("sim_ppds_session");

  return c.json({ success: true, message: "Logged out" });
}
