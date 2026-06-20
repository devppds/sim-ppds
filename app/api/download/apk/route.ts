import { NextResponse } from "next/server";

export const runtime = "edge";

const APK_URL =
  "https://github.com/devppds/sim-ppds-release/releases/download/2.0.25/SIM-PPDS.apk";

export async function GET() {
  try {
    const res = await fetch(APK_URL);
    if (!res.ok) {
      return new Response(`Failed to fetch APK: ${res.statusText}`, { status: res.status });
    }

    return new Response(res.body, {
      headers: {
        "Content-Disposition": 'attachment; filename="SIM-PPDS.apk"',
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Length": res.headers.get("content-length") || "",
      },
    });
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
