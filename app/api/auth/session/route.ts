import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "edge";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sim_ppds_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, session: null });
    }

    const session = JSON.parse(sessionCookie.value);
    return NextResponse.json({ success: true, session });
  } catch (error) {
    return NextResponse.json({ success: false, session: null }, { status: 500 });
  }
}
