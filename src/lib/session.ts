// Este archivo obtiene y valida el access token de las cookies para identificar al usuario y su rol; devuelve la sesión si es válida o null si no está autenticado.

import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  // Sin cookie no existe una sesión autenticada.
  if (!token) {
    return null;
  }

  try {
    const { payload } = await verifyAccessToken(token);

    // El token debe identificar al usuario y su rol.
    if (!payload.sub || typeof payload.role !== "string") {
      return null;
    }

    return {
      userId: payload.sub,
      role: payload.role,
    };
  } catch {
    // Un token inválido o vencido no autentica al usuario.
    return null;
  }
}