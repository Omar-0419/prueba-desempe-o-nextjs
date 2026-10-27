
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type SpaceType = "DESK" | "MEETING_ROOM" | "PHONE_BOOTH";

type Space = {
  id: string;
  name: string;
  description: string | null;
  type: SpaceType;
  capacity: number;
  pricePerHour: number | string;
  imageUrl: string | null;
};

const typeLabels: Record<SpaceType, string> = {
  DESK: "Escritorio privado",
  MEETING_ROOM: "Sala de reuniones",
  PHONE_BOOTH: "Cabina telefónica",
};

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Carga espacios activos directamente desde nuestra API.
  const loadSpaces = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/spaces", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudieron cargar los espacios.");
      }

      setSpaces(data.spaces ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al cargar los espacios."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSpaces();
  }, [loadSpaces]);

  // Los filtros trabajan sobre los datos reales recibidos de la API.
  const filteredSpaces = spaces.filter((space) => {
    const matchesSearch =
      space.name.toLowerCase().includes(search.toLowerCase()) ||
      (space.description ?? "").toLowerCase().includes(search.toLowerCase());

    const matchesType = type === "ALL" || space.type === type;

    return matchesSearch && matchesType;
  });

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#142238]">

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-[#142238] shadow-sm transition hover:border-[#F51D3D] hover:text-[#F51D3D]"
          >
            <span aria-hidden="true">←</span>
            Volver al dashboard
          </Link>
        </div>
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#F51D3D]">
          Encuentra tu lugar ideal
        </p>

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Explora nuestros espacios
            </h1>
            <p className="mt-4 max-w-2xl text-gray-500">
              Encuentra el lugar ideal para concentrarte, trabajar o reunirte
              con tu equipo.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
            <p className="text-sm text-gray-500">Espacios disponibles</p>
            <p className="text-2xl font-black">{spaces.length}</p>
          </div>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-[1fr_240px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o descripción..."
            aria-label="Buscar espacios"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-4 outline-none transition focus:border-[#F51D3D]"
          />

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            aria-label="Filtrar por tipo"
            className="rounded-xl border border-gray-200 bg-white px-4 py-4 outline-none focus:border-[#F51D3D]"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="DESK">Escritorios</option>
            <option value="MEETING_ROOM">Salas de reuniones</option>
            <option value="PHONE_BOOTH">Cabinas telefónicas</option>
          </select>
        </div>

        {loading ? (
          <div className="py-24 text-center text-gray-500">
            Cargando espacios desde la base de datos...
          </div>
        ) : error ? (
          <div className="mt-10 rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p className="font-semibold text-red-600">{error}</p>
            <button
              onClick={() => void loadSpaces()}
              className="mt-4 rounded-xl bg-[#F51D3D] px-5 py-3 font-semibold text-white"
            >
              Intentar nuevamente
            </button>
          </div>
        ) : filteredSpaces.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
            <div className="text-4xl">⌕</div>
            <h2 className="mt-4 text-xl font-bold">
              {spaces.length === 0
                ? "Todavía no hay espacios disponibles"
                : "No encontramos resultados"}
            </h2>
            <p className="mt-2 text-gray-500">
              {spaces.length === 0
                ? "Cuando se registren espacios activos, aparecerán aquí."
                : "Prueba con otro nombre o cambia los filtros."}
            </p>
          </div>
        ) : (
          <>
            <p className="mt-8 text-sm text-gray-500">
              {filteredSpaces.length}{" "}
              {filteredSpaces.length === 1
                ? "espacio encontrado"
                : "espacios encontrados"}
            </p>

            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSpaces.map((space) => (
                <article
                  key={space.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-52 items-center justify-center overflow-hidden bg-gray-100">
                    {space.imageUrl ? (
                      <img
                        src={space.imageUrl}
                        alt={space.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl text-gray-400">⌂</span>
                    )}
                  </div>

                  <div className="p-6">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[#F51D3D]">
                      {typeLabels[space.type]}
                    </span>

                    <h2 className="mt-4 text-xl font-bold">{space.name}</h2>

                    <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                      {space.description || "Espacio disponible para reservar."}
                    </p>

                    <p className="mt-4 text-sm text-gray-600">
                      Capacidad:{" "}
                      <span className="font-semibold">{space.capacity} personas</span>
                    </p>

                    <div className="mt-5 flex items-end justify-between gap-3 border-t border-gray-100 pt-5">
                      <div>
                        <p className="text-xs text-gray-500">Precio por hora</p>
                        <p className="text-lg font-black">
                          {money.format(Number(space.pricePerHour))}
                        </p>
                      </div>

                      <Link
                        href={`/spaces/${space.id}`}
                        className="rounded-xl bg-[#F51D3D] px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600"
                      >
                        Ver espacio
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
