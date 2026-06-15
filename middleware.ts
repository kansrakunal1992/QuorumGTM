// middleware.ts  — place at project root (same level as /app)
// Protects all /admin/* routes with HTTP Basic Auth
// Username: quorum   |   Password: your ADMIN_SECRET env var

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    try {
      const decoded = atob(authHeader.slice(6));
      const colonIdx = decoded.indexOf(":");
      const user = decoded.slice(0, colonIdx);
      const pass = decoded.slice(colonIdx + 1);
      if (user === "quorum" && pass === process.env.ADMIN_SECRET) {
        return NextResponse.next();
      }
    } catch { /* malformed header */ }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Quorum Admin"' },
  });
}

export const config = {
  matcher: "/admin/:path*",
};
