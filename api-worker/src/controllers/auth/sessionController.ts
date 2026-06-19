import { Context } from 'hono';
import { Env } from '../../index';
import { cookies } from "next/headers";

"edge";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sim_ppds_session");

    if (!sessionCookie || !sessionCookie.value) {
      return c.json({ success: false, session: null });
    }

    const session = JSON.parse(sessionCookie.value);
    return c.json({ success: true, session });
  } catch (error) {
    return c.json({ success: false, session: null }, { status: 500 });
  }
}
