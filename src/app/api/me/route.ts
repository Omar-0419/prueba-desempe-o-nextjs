
import { NextResponse} from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {

    // Identificamos al usuario usando la cookie de sesión.
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { user: null, message: "No autenticado" },
        { status: 401 }
      );
    }

    // Consultamos los datos actuales del usuario y su rol en la base de datos.
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { user: null, message: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error consultando la sesión:", error);

    return NextResponse.json(
      { message: "Error al consultar la sesión" },
      { status: 500 }
    );
  }
}
