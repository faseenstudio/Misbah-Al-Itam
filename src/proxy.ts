import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: bounce visitors without a session cookie away from the admin
// panel before rendering. Real authorization happens in src/lib/dal.ts on every request.
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

export function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (!hasSession) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  // Everything under /admin except the login page itself.
  matcher: ["/admin", "/admin/((?!login).*)"],
};
