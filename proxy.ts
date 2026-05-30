// Next.js 16 renamed the `middleware` file convention to `proxy`.
// This gates every matched route on an authenticated session. It is an
// OPTIMISTIC check only — each Server Action must still re-verify auth
// (handled in Phase 2). See node_modules/next/dist/docs auth guide.
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/login", "/register"]);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.has(pathname);

  if (!isLoggedIn && !isPublic) {
    const url = new URL("/login", req.nextUrl);
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except API routes, Next internals and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
