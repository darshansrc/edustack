import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  const { pathname } = request.nextUrl;

  if (session && pathname == "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!session && pathname == "/admin") {
    return NextResponse.redirect(new URL("/auth/admin", request.url));
  }

  if (pathname == "/auth/admin" && session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
}
