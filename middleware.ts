import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
    pathname === "/login"
  ) {
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
          // Access Control Logic
      const level = sessionData.role_level || 'STAFF';

      // 1. Pusat Kontrol: ROOT Only (Super Admin)
      if (pathname.startsWith("/pusat-kontrol") && level !== 'ROOT') {
         return NextResponse.redirect(new URL("/", request.url));
      }

      // 2. Pengaturan: ROOT or SEKRETARIAT
      if (pathname.startsWith("/pengaturan") && !(level === 'ROOT' || level === 'SEKRETARIAT')) {
         return NextResponse.redirect(new URL("/", request.url));
      }

      // 3. Seksi Keuangan: Limited access to /spp only
      if (level === 'RESTRICTED_SPP' || sessionData.role === 'Seksi Keuangan') {
         if (!pathname.startsWith("/spp")) {
            return NextResponse.redirect(new URL("/spp", request.url));
         }
      }
     
     return NextResponse.next();
  } catch (e) {
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
