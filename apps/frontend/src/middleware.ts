import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth";
import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "", // forward cookies
      },
    },
  );

  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/signin") ||
    request.nextUrl.pathname.startsWith("/signup");

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isBoardRoute = request.nextUrl.pathname.startsWith("/board");

  if (!session && (isDashboardRoute || isBoardRoute)) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/board/:path*", "/signin", "/signup"],
};
