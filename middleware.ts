import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getSeksiMainMenu(role: string): string | null {
  const r = role.toUpperCase();
  if (r.includes("KEAMANAN")) return "/keamanan";
  if (r.includes("PENDIDIKAN")) return "/pendidikan";
  if (r.includes("WAJAR")) return "/wajar";
  if (r.includes("JAMIYYAH") || r.includes("JAMI'YYAH") || r.includes("JAM'IYYAH")) return "/jamiyyah";
  if (r.includes("PLP")) return "/plp";
  if (r.includes("KBR") || r.includes("KEBERSIHAN")) return "/kebersihan";
  if (r.includes("PEMBANGUNAN")) return "/pembangunan";
  if (r.includes("MEDIA")) return "/media";
  if (r.includes("TAKMIR")) return "/takmir";
  if (r.includes("FASILITAS")) return "/fasilitas";
  if (r.includes("LOGISTIK") || r.includes("HUMASY")) return "/logistik";
  if (r.includes("KESEHATAN") || r.includes("KLINIK")) return "/klinik";
  if (r.includes("BUMP")) return "/bump";
  if (r.includes("BENDAHARA") || r.includes("KEUANGAN")) return "/spp";
  return null;
}

export function middleware(request: NextRequest) {
  const session = request.cookies.get("sim_ppds_session")?.value;
  const { pathname } = request.nextUrl;

  // 1. Skip Auth for static files, api routes, and the login page
  const isStaticFile = pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|json|js|css)$/i);
  
  if (
    isStaticFile ||
    pathname.includes("/_next") || 
    pathname.includes("/favicon.ico") || 
    pathname.startsWith("/public") ||
    pathname.startsWith("/api/auth") || 
    pathname === "/" ||
    pathname === "/login"
  ) {
    if (session && (pathname === "/" || pathname === "/login")) {
      const sessionData = JSON.parse(session);
      const roleLower = (sessionData.role || "").toLowerCase();
      const usernameLower = (sessionData.username || "").toLowerCase();
      const isAnggota = roleLower.includes("anggota") || usernameLower.includes("anggota");
      if (isAnggota) {
        const targetPath = getSeksiMainMenu(sessionData.role || "");
        if (targetPath) {
          return NextResponse.redirect(new URL(targetPath, request.url));
        }
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 2. If no session and trying to access management pages, redirect to login
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. User is authenticated
  try {
     const sessionData = JSON.parse(session);
     
     // Redirect section members to their main menu directly
     const roleLower = (sessionData.role || "").toLowerCase();
     const usernameLower = (sessionData.username || "").toLowerCase();
     const isAnggota = roleLower.includes("anggota") || usernameLower.includes("anggota");
     if (isAnggota && (pathname === "/dashboard" || pathname === "/" || pathname === "/login")) {
        const targetPath = getSeksiMainMenu(sessionData.role || "");
        if (targetPath) {
           return NextResponse.redirect(new URL(targetPath, request.url));
        }
     }

      // Access Control Logic
      const level = sessionData.role_level || 'STAFF';
      const role = (sessionData.role || "").toUpperCase();
      const isSekretariat = level === 'SEKRETARIAT' || role.includes('SEKRETARIS') || role.includes('SEKRETARIAT');
      const isKeuangan = level === 'KEUANGAN' || role.includes('BENDAHARA') || role.includes('KEUANGAN') || level === 'RESTRICTED_SPP' || role === 'SEKSI KEUANGAN';
      const isRoot = level === 'ROOT' || role === 'DEVELOPER' || role === 'MUDIR' || role.includes('SUPER');

      // 1. Pusat Kontrol: ROOT Only (Super Admin)
      if (pathname.startsWith("/pusat-kontrol") && !isRoot) {
         return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // 2. Pengaturan: All authenticated users can access settings page
      // No restriction here because page content will be customized based on role.

      // 3. Seksi Keuangan: Limited access to /spp and /pengaturan only
      if (level === 'RESTRICTED_SPP' || sessionData.role === 'Seksi Keuangan') {
         if (!pathname.startsWith("/spp") && !pathname.startsWith("/pengaturan")) {
            return NextResponse.redirect(new URL("/spp", request.url));
         }
      }

      // 4. Eksekutif: ROOT, VIEW_ALL, SEKRETARIAT, KEUANGAN
      if (pathname.startsWith("/eksekutif") && !(isRoot || level === 'VIEW_ALL' || isSekretariat || isKeuangan)) {
         return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // 5. Clearance: ROOT, VIEW_ALL, SEKRETARIAT
      if (pathname.startsWith("/clearance") && !(isRoot || level === 'VIEW_ALL' || isSekretariat)) {
         return NextResponse.redirect(new URL("/dashboard", request.url));
      }
     
     return NextResponse.next();
  } catch {
     // If session cookie is malformed, clear it and redirect to login
     const res = NextResponse.redirect(new URL("/login", request.url));
     res.cookies.delete("sim_ppds_session");
     return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (except auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
