import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Define las reglas que deben cumplir los datos recibidos.
const registerSchema = z.object({

  // trim() elimina espacios al inicio y al final.
  // min() y max() establecen la longitud permitida.
  name: z.string().trim().min(2).max(100),

  // email() valida el formato del correo.
  // transform() lo convierte a minúsculas para normalizarlo.
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),

  // La contraseña debe tener entre 8 y 72 caracteres.
  // El máximo evita superar el límite habitual de bcrypt.
  password: z.string().min(8).max(72),
});


export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);

    // 1. Validar los datos recibidos.
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Usamos únicamente los datos que Zod ya validó.
    const { name, email, password } = parsed.data;

    // 2. Comprobar si el correo ya está registrado.
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo ya está registrado" },
        { status: 409 },
      );
    }

    // 3. Buscar el rol USER creado mediante el seed.
    const userRole = await prisma.role.findUnique({
      where: { name: "USER" },
    });

    if (!userRole) {
      return NextResponse.json(
        { error: "No está configurado el rol de usuario" },
        { status: 500 },
      );
    }

    // 4. Nunca guardar la contraseña en texto plano.
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Crear el usuario con el rol asignado desde el servidor.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roleId: userRole.id,
      },
      // Seleccionamos solo los campos que podemos devolver.
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
    });

    // 6. Responder sin exponer el hash de la contraseña.
    return NextResponse.json(
      {
        message: "Usuario registrado correctamente",
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    // Registra el error en el servidor, no detalles internos al cliente.
    console.error("Error en registro:", error);

    return NextResponse.json(
      { error: "Error interno al registrar el usuario" },
      { status: 500 },
    );
  }
}
