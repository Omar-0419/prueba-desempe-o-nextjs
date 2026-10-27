import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

// Usamos el mismo secreto con el que firmamos el refresh token.
const refreshSecret = process.env.JWT_REFRESH_SECRET;

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // Si no existe la cookie, igualmente limpiamos la sesión del cliente.
    if (!refreshToken || !refreshSecret) {
      const response = NextResponse.json({
        message: "Sesión cerrada correctamente",
      });

      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");

      return response;
    }

    // Verificamos firma, expiración y contenido del JWT.
    await jwtVerify(
      refreshToken,
      new TextEncoder().encode(refreshSecret),
    );

    // La base de datos almacena el hash, nunca el token original.
    const tokenHash = createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Revocamos el token si todavía está activo.
    await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    // Borramos las cookies de autenticación.
    const response = NextResponse.json({
      message: "Sesión cerrada correctamente",
    });

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    return response;
  } catch {
    // Aunque el token sea inválido, eliminamos las cookies locales.
    const response = NextResponse.json({
      message: "Sesión cerrada correctamente",
    });

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    return response;
  }
}
