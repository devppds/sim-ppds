import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sim_ppds_session");
    if (!sessionCookie) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const { token, seksi } = await req.json();

    // The secret used by the admin PC
    const secret = `ABSENSI-JAGA-SECRET-${seksi}`;

    // Token logic: generated as SHA-256 of (secret + Math.floor(Date.now() / 15000))
    // We check current window and the previous window to account for network latency (15s leeway)
    const currentWindow = Math.floor(Date.now() / 15000);
    const previousWindow = currentWindow - 1;

    // Simulate SHA-256 (Since we are in Edge/Node, we can use Web Crypto API)
    const encoder = new TextEncoder();
    
    const checkToken = async (windowIndex: number) => {
      const data = encoder.encode(secret + windowIndex);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex === token;
    };

    const isValidCurrent = await checkToken(currentWindow);
    const isValidPrevious = await checkToken(previousWindow);

    if (!isValidCurrent && !isValidPrevious) {
      return NextResponse.json({ success: false, message: "QR Code Kadaluarsa atau Tidak Valid" }, { status: 400 });
    }

    // Now check if it's within their scheduled time
    // For mock, we check current time against a dummy schedule
    // Real implementation would query `jadwal_jaga` for `session.username`
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // Example schedule check logic
    // Let's assume shift 1: 08:00 - 16:00, shift 2: 16:00 - 00:00, shift 3: 00:00 - 08:00
    // If they scan outside, we reject.
    let isWithinSchedule = true; // Replace with actual DB query
    
    // Fake schedule logic for demonstration:
    // If it's between 2 AM and 4 AM, we pretend they have no schedule to show the rejection logic
    if (currentHour >= 2 && currentHour <= 4) {
      isWithinSchedule = false;
    }

    if (!isWithinSchedule) {
      return NextResponse.json({ 
        success: false, 
        message: "Ditolak: Anda memindai QR di luar jam jaga yang dijadwalkan." 
      }, { status: 403 });
    }

    // Record attendance to `absensi_jaga`
    // INSERT INTO absensi_jaga ...

    return NextResponse.json({ 
      success: true, 
      message: "Kehadiran Jaga Berhasil Dicatat!",
      user: session.name
    });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
