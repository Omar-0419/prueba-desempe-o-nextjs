import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAccessToken, createRefreshToken } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(72),
});

export async function POST(request: Request) {
  try {
    // Lee el body de la petición y lo guarda como unknown hasta validar su estructura.
    const body: unknown = await request.json();

    // Valida el body con el esquema de login y devuelve el resultado de la validación sin lanzar excepciones.
    const parsed = loginSchema.safeParse(body);


    if (!parsed.success) {
      return NextResponse.json(
        { error: "Correo o contraseña inválidos" },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    // Buscar al usuario junto con su rol.
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    // Mismo mensaje para correo inexistente o contraseña incorrecta.
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 },
      );
    }

    // Crear tokens usando el ID y el rol reales del usuario.
    const accessToken = await createAccessToken(user.id, user.role.name);
    const refreshToken = await createRefreshToken(user.id);

    // Guardamos únicamente el hash del refresh token en la base de datos.
    const tokenHash = createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Calcula la fecha de expiración dentro de 7 días a partir de ahora.
    const decodedExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Guarda en la base de datos el refresh token asociado al usuario y su fecha de expiración.
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: decodedExpiry,
      },
    });

    // Cookies inaccesibles desde JavaScript del navegador.
    const cookieStore = await cookies();
    const secure = process.env.NODE_ENV === "production";

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);

    return NextResponse.json(
      { error: "Error interno al iniciar sesión" },
      { status: 500 },
    );
  }
}
