import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// El cliente envía fechas ISO con zona horaria explícita.
const reservationSchema = z.object({
  spaceId: z.string().uuid(),
  startAt: z.string().datetime({ offset: true }),
  endAt: z.string().datetime({ offset: true }),
});

// CoSpace opera según la hora local de Colombia, no la del servidor.
function getColombiaTime(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  ) as Record<string, string>;
}

// GET: consulta las reservas del usuario autenticado.
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    // El administrador puede consultar todas las reservas.
    // Los usuarios normales solo pueden consultar las propias.
    const where = session.role === "ADMIN" ? {} : { userId: session.userId };

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        space: {
          select: {
            id: true,
            name: true,
            type: true,
            pricePerHour: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ reservations }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener reservas:", error);

    return NextResponse.json(
      { message: "Error al obtener las reservas" },
      { status: 500 }
    );
  }
}

// POST: crea una reserva después de validar las reglas del negocio.
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Debes iniciar sesión" },
        { status: 401 }
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

    const validation = reservationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos de reserva inválidos",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { spaceId, startAt: startInput, endAt: endInput } = validation.data;

    const startAt = new Date(startInput);
    const endAt = new Date(endInput);
    const now = new Date();

    // La reserva debe durar entre 1 y 4 horas completas.
    const durationMs = endAt.getTime() - startAt.getTime();
    const hourMs = 60 * 60 * 1000;
    const hours = durationMs / hourMs;

    if (hours < 1 || hours > 4 || !Number.isInteger(hours)) {
      return NextResponse.json(
        { error: "La reserva debe durar entre 1 y 4 horas completas" },
        { status: 400 }
      );
    }

    // No se permiten reservas pasadas ni con más de 30 días de anticipación.
    const maxDate = new Date(now.getTime() + 30 * 24 * hourMs);

    if (startAt <= now || startAt > maxDate) {
      return NextResponse.json(
        {
          error:
            "La reserva debe ser futura y estar dentro de los próximos 30 días",
        },
        { status: 400 }
      );
    }

    // Validamos el horario usando America/Bogota, aunque el servidor
    // esté configurado en otra zona horaria.
    const startLocal = getColombiaTime(startAt);
    const endLocal = getColombiaTime(endAt);

    const sameDay =
      startLocal.year === endLocal.year &&
      startLocal.month === endLocal.month &&
      startLocal.day === endLocal.day;

    const startHour = Number(startLocal.hour);
    const endHour = Number(endLocal.hour);

    const startsOnHour =
      startLocal.minute === "00" && startLocal.second === "00";

    const endsOnHour = endLocal.minute === "00" && endLocal.second === "00";

    if (
      !sameDay ||
      !startsOnHour ||
      !endsOnHour ||
      startHour < 7 ||
      endHour > 21
    ) {
      return NextResponse.json(
        {
          error:
            "El horario permitido es de 07:00 a 21:00, en horas completas y el mismo día",
        },
        { status: 400 }
      );
    }

    // El espacio debe existir y estar activo.
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
    });

    if (!space || !space.isActive) {
      return NextResponse.json(
        { error: "El espacio no existe o no está disponible" },
        { status: 404 }
      );
    }

    // Máximo tres reservas confirmadas futuras por usuario.
    const futureReservations = await prisma.reservation.count({
      where: {
        userId: session.userId,
        status: "CONFIRMED",
        startAt: { gt: now },
      },
    });

    if (futureReservations >= 3) {
      return NextResponse.json(
        { error: "Ya tienes el máximo de 3 reservas futuras confirmadas" },
        { status: 409 }
      );
    }

    // Evita solapamientos tanto para el espacio como para el usuario.
    // Si una reserva termina exactamente cuando empieza otra, se permite.
    const conflict = await prisma.reservation.findFirst({
      where: {
        status: "CONFIRMED",
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        OR: [{ spaceId }, { userId: session.userId }],
      },
      select: { id: true },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "El horario se cruza con otra reserva tuya o del espacio" },
        { status: 409 }
      );
    }

    // El precio siempre se calcula en el servidor.
    const totalPrice = space.pricePerHour.mul(hours);

    const reservation = await prisma.reservation.create({
      data: {
        userId: session.userId,
        spaceId,
        startAt,
        endAt,
        totalPrice,
        status: "CONFIRMED",
      },
      include: {
        space: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    console.error("Error creando reserva:", error);
    return NextResponse.json(
      { error: "No se pudo crear la reserva" },
      { status: 500 }
    );
  }
}
