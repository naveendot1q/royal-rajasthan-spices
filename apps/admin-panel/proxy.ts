import { NextResponse, type NextRequest } from "next/server";

// Auth protection is handled in individual layouts via server-side session checks
// The proxy only handles static asset passthrough
export async function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
