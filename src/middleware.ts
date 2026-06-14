import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function shouldTriggerIngest(pathname: string): boolean {
  if (pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/_next")) return false;
  if (pathname === "/favicon.ico") return false;
  if (/\.[a-z0-9]+$/i.test(pathname)) return false;
  return true;
}

export function middleware(request: NextRequest) {
  if (request.method !== "GET" || !shouldTriggerIngest(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.next();
  }

  const triggerUrl = new URL("/api/ingest/run-if-due", request.url);
  void fetch(triggerUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  }).catch(() => {});

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
