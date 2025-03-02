import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/jwt";

// Middleware to protect routes
export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  if (!session) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  try {
    await decrypt(session);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
}

// Apply middleware to specific routes
export const config = {
  matcher: ["/dashboard/:path*", "/nurses/:path*", "/clients/:path*"],
};