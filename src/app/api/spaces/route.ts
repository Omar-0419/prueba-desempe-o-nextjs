import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { cookies } from "next/headers";
import z from "zod";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const spaces = await prisma.space.findMany({
      // El catálogo público no muestra espacios desactivados.
      where: {
        isActive: true,
      },
      // Mostramos primero los espacios creados recientemente.
      orderBy: {
        createdAt: "desc",
      },
      // Devolvemos solo los campos necesarios para el catálogo.
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        capacity: true,
        pricePerHour: true,
        imageUrl: true,
      },
    });

    return NextResponse.json({ spaces }, { status: 200 });
  } catch (error) {
    console.error("Error al consultar espacios:", error);

    return NextResponse.json(
      { message: "Error al obtener los espacios" },
      { status: 500 },
    );
  }
}

// Define y valida la estructura de un espacio, estableciendo tipos de datos, campos obligatorios y límites para cada propiedad.
const createSpaceSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(1000),
  type: z.enum(["DESK", "MEETING_ROOM", "PHONE_BOOTH"]),
  capacity: z.number().int().min(1).max(500),
  pricePerHour: z.number().positive().max(100000000),
  imageUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  // Verificamos que exista una sesión válida.
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { message: "Debes iniciar sesión" },
      { status: 401 },
    );
  }

  // Solo los administradores pueden crear espacios.
  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { message: "No tienes permisos para crear espacios" },
      { status: 403 },
    );
  }

  try {
    const body: unknown = await request.json();
    const validation = createSpaceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Datos inválidos",
          errors: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    const space = await prisma.space.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        capacity: data.capacity,
        pricePerHour: data.pricePerHour,
        imageUrl: data.imageUrl,
      },
    });

    return NextResponse.json({ space }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "El JSON enviado no es válido" },
        { status: 400 },
      );
    }

    console.error("Error al crear espacio:", error);

    return NextResponse.json(
      { message: "Error interno al crear el espacio" },
      { status: 500 },
    );
  }
}
