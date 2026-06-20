import { NextResponse } from "next/server";

export const runtime = "edge";

const EXE_URL =
  "https://github.com/devppds/sim-ppds-release/releases/download/2.0.25/SIM-PPDS_Setup.exe";

export async function GET() {
  return NextResponse.redirect(EXE_URL, {
    status: 302,
    headers: {
      "Content-Disposition": 'attachment; filename="SIM-PPDS_Setup.exe"',
    },
  });
}
