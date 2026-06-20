import { NextResponse } from "next/server";

export const runtime = "edge";

const APK_URL =
  "https://github.com/devppds/sim-ppds-release/releases/download/2.0.25/SIM-PPDS.apk";

export async function GET() {
  return NextResponse.redirect(APK_URL, {
    status: 302,
    headers: {
      "Content-Disposition": 'attachment; filename="SIM-PPDS.apk"',
    },
  });
}
