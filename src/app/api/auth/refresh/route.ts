// Renueva la sesión validando el refresh token, revocando el anterior, guardando el nuevo en la base de datos y actualizando las cookies.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import {
  createAccessToken,
  createRefreshToken,
} from "@/lib/auth";

const refreshSecret = process.env.JWT_REFRESH_SECRET;

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // Si no hay token, no podemos renovar la sesión.
  if (!refreshToken || !refreshSecret) {
    const response = NextResponse.json(
      { message: "Sesión no válida. Inicia sesión nuevamente." },
      { status: 401 },
    );

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  // Verificamos la firma y la expiración del JWT.
  let userId: string;

  try {
    const { payload } = await jwtVerify(
      refreshToken,
      new TextEncoder().encode(refreshSecret),
      { algorithms: ["HS256"] },
    );

    if (!payload.sub) {
      throw new Error("El token no contiene un usuario");
    }

    userId = payload.sub;
  } catch {
    const response = NextResponse.json(
      { message: "Refresh token inválido o vencido" },
      { status: 401 },
    );

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  try {
    // Calculamos el hash para buscar el token almacenado.
    const tokenHash = createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      const response = NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 401 },
      );

      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }

    // Creamos el nuevo token de acceso y rotamos el refresh token.
    const newAccessToken = await createAccessToken(
      user.id,
      user.role.name,
    );

    const newRefreshToken = await createRefreshToken(user.id);

    const newTokenHash = createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    const now = new Date();

    // Revocamos el anterior y guardamos el nuevo en una transacción.
    await prisma.$transaction(async (tx) => { //tx es el cliente de Prisma que se utiliza para ejecutar consultas dentro de una transacción.
      const revoked = await tx.refreshToken.updateMany({
        where: {
          tokenHash,
          userId: user.id,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: { revokedAt: now },
      });

      // Evita renovar un token vencido, revocado o ya utilizado.
      if (revoked.count !== 1) {
        throw new Error("REFRESH_TOKEN_INVALID");
      }

      await tx.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: newTokenHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    });

    const response = NextResponse.json({
      message: "Token renovado correctamente",
    });

    const secure = process.env.NODE_ENV === "production";

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "REFRESH_TOKEN_INVALID"
    ) {
      const response = NextResponse.json(
        { message: "Refresh token vencido o revocado" },
        { status: 401 },
      );

      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }

    console.error("Error al renovar el token:", error);

    return NextResponse.json(
      { message: "Error interno al renovar la sesión" },
      { status: 500 },
    );
  }
}