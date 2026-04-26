import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/onboarding", "/payment"];
const AUTH_PATHS = ["/auth"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Read session token from Supabase cookie
  // Supabase stores auth token in sb-<project-ref>-auth-token
  const token =
    req.cookies.get("sb-access-token")?.value ||
    req.cookies.get("sb-auth-token")?.value;

  const isLoggedIn = !!token;

  // Protect routes: redirect unauthenticated users to /auth
  if (isProtected && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from /auth to /dashboard
  if (isAuthPage && isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/payment/:path*",
    "/auth/:path*",
  ],
};
