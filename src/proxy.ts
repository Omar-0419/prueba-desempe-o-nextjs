import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.JWT_ACCESS_SECRET;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si no hay secreto configurado, no permitimos acceso privado.
  if (!secret) {
    return NextResponse.redirect(
      new URL("/login", request.url),
    );
  }

  const token = request.cookies.get("accessToken")?.value;

  // Sin token, el usuario debe iniciar sesión.
  if (!token) {
    return NextResponse.redirect(
      new URL("/login", request.url),
    );
  }

  try {
    // Verifica la firma y expiración del JWT usando el secreto y el algoritmo HS256, y extrae su payload.
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] },
    );

    // Las páginas administrativas son solo para ADMIN.
    if (
      pathname.startsWith("/admin") &&
      payload.role !== "ADMIN"
    ) {
      return NextResponse.redirect(
        new URL("/dashboard", request.url),
      );
    }

    return NextResponse.next();
  } catch {
    // Token inválido o vencido: volver al login.
    const response = NextResponse.redirect(
      new URL("/login", request.url),
    );

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    return response;
  }
}

// Aplica el middleware únicamente a las rutas /dashboard y /admin, incluyendo sus subrutas.
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
