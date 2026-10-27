
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Debes iniciar sesión" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    const isAdmin = session.role === "ADMIN";
    const isOwner = reservation.userId === session.userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "No tienes permiso para cancelar esta reserva" },
        { status: 403 }
      );
    }

    if (reservation.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "La reserva ya está cancelada" },
        { status: 409 }
      );
    }

    const now = new Date();
    const twoHours = 2 * 60 * 60 * 1000;

    // El usuario debe cancelar con 2 horas de anticipación.
    // El administrador puede cancelar sin ese límite.
    if (!isAdmin && reservation.startAt.getTime() - now.getTime() < twoHours) {
      return NextResponse.json(
        { error: "Debes cancelar con al menos 2 horas de anticipación" },
        { status: 400 }
      );
    }

    // Actualizamos el estado; nunca eliminamos la reserva.
    const result = await prisma.reservation.updateMany({
      where: {
        id,
        status: "CONFIRMED",
      },
      data: {
        status: "CANCELLED",
      },
    });

    if (result.count !== 1) {
      return NextResponse.json(
        { error: "La reserva ya fue modificada; vuelve a consultar su estado" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message: "Reserva cancelada correctamente",
    });
  } catch (error) {
    console.error("Error cancelando reserva:", error);

    return NextResponse.json(
      { error: "No se pudo cancelar la reserva" },
      { status: 500 }
    );
  }
}
