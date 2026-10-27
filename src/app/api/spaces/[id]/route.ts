
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const updateSpaceSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().min(5).max(1000).optional(),
  type: z.enum(["DESK", "MEETING_ROOM", "PHONE_BOOTH"]).optional(),
  capacity: z.number().int().min(1).max(500).optional(),
  pricePerHour: z.number().positive().max(100000000).optional(),
  imageUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Debes enviar al menos un campo para actualizar" }
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: "ID de espacio inválido" },
        { status: 400 }
      );
    }

    const space = await prisma.space.findFirst({
      where: {
        id,
        isActive: true,
      },
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

    if (!space) {
      return NextResponse.json(
        { error: "Espacio no encontrado o no disponible" },
        { status: 404 }
      );
    }

    return NextResponse.json({ space }, { status: 200 });
  } catch (error) {
    console.error("Error consultando espacio:", error);

    return NextResponse.json(
      { error: "No se pudo consultar el espacio" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Solo los administradores pueden modificar espacios.
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Debes iniciar sesión" },
        { status: 401 }
      );
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos de administrador" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: "ID de espacio inválido" },
        { status: 400 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "El JSON enviado no es válido" },
        { status: 400 }
      );
    }

    const validation = updateSpaceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const existingSpace = await prisma.space.findUnique({
      where: { id },
    });

    if (!existingSpace) {
      return NextResponse.json(
        { error: "Espacio no encontrado" },
        { status: 404 }
      );
    }

    // No se puede desactivar un espacio con reservas confirmadas futuras.
    if (validation.data.isActive === false && existingSpace.isActive) {
      const upcomingReservation = await prisma.reservation.findFirst({
        where: {
          spaceId: id,
          status: "CONFIRMED",
          startAt: { gt: new Date() },
        },
        select: { id: true },
      });

      if (upcomingReservation) {
        return NextResponse.json(
          {
            error:
              "No puedes desactivar este espacio porque tiene reservas confirmadas futuras",
          },
          { status: 409 }
        );
      }
    }

    const updatedSpace = await prisma.space.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ space: updatedSpace });
  } catch (error) {
    console.error("Error actualizando espacio:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar el espacio" },
      { status: 500 }
    );
  }
}
