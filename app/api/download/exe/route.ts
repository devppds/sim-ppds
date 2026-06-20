import { NextResponse } from "next/server";

export const runtime = "edge";

const EXE_URL =
  "https://github.com/devppds/sim-ppds-release/releases/download/2.0.25/SIM-PPDS_Setup.exe";

export async function GET() {
  try {
    const res = await fetch(EXE_URL);
    if (!res.ok) {
      return new Response(`Failed to fetch EXE: ${res.statusText}`, { status: res.status });
    }

    return new Response(res.body, {
      headers: {
        "Content-Disposition": 'attachment; filename="SIM-PPDS_Setup.exe"',
        "Content-Type": "application/octet-stream",
        "Content-Length": res.headers.get("content-length") || "",
      },
    });
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
