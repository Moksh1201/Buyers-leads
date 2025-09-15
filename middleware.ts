import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtected = pathname.startsWith("/buyers") || pathname.startsWith("/api/buyers");
  const isAuthRoute = pathname.startsWith("/api/auth") || pathname === "/signin";
  if (!isProtected || isAuthRoute) return NextResponse.next();

  // Check NextAuth session cookie without importing NextAuth in Edge runtime
  const hasSession =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!hasSession) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/buyers/:path*", "/api/buyers/:path*"],
};


