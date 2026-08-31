import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Halaman yang hanya bisa diakses jika SUDAH login
  const protectedRoutes = ["/dashboard"];
  // Halaman yang hanya bisa diakses jika BELUM login
  const authRoutes = ["/login", "/register"];

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  // Panggil session endpoint Better Auth dari middleware
  const sessionUrl = new URL("/api/auth/get-session", request.url);
  let isLoggedIn = false;

  try {
    const res = await fetch(sessionUrl.toString(), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (res.ok) {
      const data = await res.json();
      isLoggedIn = !!data?.session;
    }
  } catch {
    // Jika session check gagal, anggap tidak login
    isLoggedIn = false;
  }

  // Jika mengakses halaman proteksi tanpa login → redirect ke /login
  if (isProtected && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Jika sudah login dan mencoba akses /login atau /register → redirect ke /dashboard
  if (isAuthRoute && isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
