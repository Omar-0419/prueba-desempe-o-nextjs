import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";

type Space = {
  id: string;
  name: string;
  description: string | null;
  type: "DESK" | "MEETING_ROOM" | "PHONE_BOOTH";
  capacity: number;
  pricePerHour: string | number;
  imageUrl: string | null;
};

type SpaceDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const typeLabels: Record<Space["type"], string> = {
  DESK: "Escritorio",
  MEETING_ROOM: "Sala de reuniones",
  PHONE_BOOTH: "Cabina telefónica",
};

// La página exterior permite prerenderizar una estructura de carga.
export default function SpaceDetailsPage({
  params,
}: SpaceDetailsPageProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-4 py-10 text-[#142238]">
          <div className="mx-auto max-w-6xl">
            Cargando información del espacio...
          </div>
        </main>
      }
    >
      <SpaceDetailsContent params={params} />
    </Suspense>
  );
}

// Los parámetros y la consulta se resuelven dentro del límite de Suspense.
async function SpaceDetailsContent({
  params,
}: SpaceDetailsPageProps) {
  const { id } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/spaces/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("No se pudo cargar la información del espacio.");
  }

  const data: { space: Space } = await response.json();
  const space = data.space;

  const price = Number(space.pricePerHour).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-[#142238]">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/spaces"
          className="mb-6 inline-block text-sm font-semibold text-[#F51D3D] hover:underline"
        >
          ← Volver a espacios
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {space.imageUrl ? (
              <img
                src={space.imageUrl}
                alt={space.name}
                className="h-80 w-full object-cover"
              />
            ) : (
              <div className="flex h-80 items-center justify-center bg-gray-200 text-gray-500">
                Sin imagen disponible
              </div>
            )}
          </div>

          <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-[#F51D3D]">
              {typeLabels[space.type]}
            </span>

            <h1 className="mt-4 text-3xl font-bold">{space.name}</h1>

            <p className="mt-4 leading-7 text-gray-600">
              {space.description || "No hay una descripción disponible."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Capacidad</p>
                <p className="mt-1 text-xl font-bold">
                  {space.capacity} personas
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Precio por hora</p>
                <p className="mt-1 text-xl font-bold">{price}</p>
              </div>
            </div>

            <Link
              href={`/reservations/new?spaceId=${encodeURIComponent(space.id)}`}
              className="mt-8 block rounded-xl bg-[#F51D3D] px-5 py-3 text-center font-bold text-white transition hover:bg-red-700"
            >
              Reservar este espacio
            </Link>

            <p className="mt-3 text-center text-sm text-gray-500">
              Necesitas iniciar sesión para completar tu reserva.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
