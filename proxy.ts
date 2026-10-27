import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

async function verifyToken(token: string) {
  if (!ACCESS_TOKEN_SECRET) {
    throw new Error("Falta ACCESS_TOKEN_SECRET en las variables de entorno.");
  }

  const secret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
  const { payload } = await jwtVerify(token, secret);

  if (!payload.sub || typeof payload.role !== "string") {
    throw new Error("Token inválido.");
  }

  return payload;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isPrivateRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/reservations");

  // Las páginas públicas no necesitan autenticación.
  if (!isAdminRoute && !isPrivateRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = await verifyToken(token);

    // Solo los administradores pueden acceder a /admin.
    if (isAdminRoute && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Token de acceso inválido:", error);

    const response = NextResponse.redirect(
      new URL("/login", request.url)
    );

    response.cookies.delete("accessToken");
    return response;
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/reservations/:path*",
  ],
};