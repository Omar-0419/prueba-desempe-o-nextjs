import { SignJWT, jwtVerify } from "jose";

// Los secretos se leen desde las variables de entorno.
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret || !refreshSecret) {
  throw new Error("Faltan los secretos JWT en el entorno");
}

// jose trabaja con claves en formato Uint8Array.
const accessKey = new TextEncoder().encode(accessSecret);
const refreshKey = new TextEncoder().encode(refreshSecret);

// Token corto: se utiliza para autenticar las solicitudes.
export async function createAccessToken(userId: string, role: string) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(accessKey);
}

// Token largo: permitirá renovar el acceso sin iniciar sesión otra vez.
export async function createRefreshToken(userId: string) {
  return new SignJWT({ type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(refreshKey);

}

// Verifica que el token de acceso sea válido y no esté vencido.
export async function verifyAccessToken(token: string) {
  return jwtVerify(token, accessKey, {
    algorithms: ["HS256"],
  });
}
