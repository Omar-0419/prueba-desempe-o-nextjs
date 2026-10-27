
"use client";

import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { useCallback, useEffect, useState } from "react";

type SpaceType = "DESK" | "MEETING_ROOM" | "PHONE_BOOTH";
type ReservationStatus = "CONFIRMED" | "CANCELLED";

type Reservation = {
  id: string;
  startAt: string;
  endAt: string;
  totalPrice: string | number;
  status: ReservationStatus;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  space: {
    id: string;
    name: string;
    type: SpaceType;
    pricePerHour: string | number;
    imageUrl: string | null;
  };
};

const menuItems = [
  { label: "Dashboard", icon: "⌂", href: "/dashboard" },
  { label: "Mis reservas", icon: "▣", href: "/dashboard" },
  { label: "Explorar espacios", icon: "⌕", href: "/spaces" },
];

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

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "America/Bogota",
});

const timeFormatter = new Intl.DateTimeFormat("es-CO", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Bogota",
});

const todayFormatter = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "America/Bogota",
});

export default function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [showAllReservations, setShowAllReservations] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // El reloj se inicializa en el navegador, no durante el prerenderizado.
  const [now, setNow] = useState<number | null>(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    const currentDate = new Date();

    setNow(currentDate.getTime());
    setToday(todayFormatter.format(currentDate));
  }, []);

  // Consulta las reservas del usuario autenticado.
  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reservations", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            data.message ??
            "No fue posible consultar tus reservas.",
        );
      }

      if (!Array.isArray(data.reservations)) {
        throw new Error("La respuesta de la API no tiene el formato esperado.");
      }

      setReservations(data.reservations);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al consultar las reservas.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  // Cancela mediante el endpoint existente; el backend valida los permisos.
  async function cancelReservation(id: string) {
    const confirmed = window.confirm(
      "¿Confirmas que deseas cancelar esta reserva?",
    );

    if (!confirmed) return;

    setCancellingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? data.message ?? "No fue posible cancelar la reserva.",
        );
      }

      setMessage(data.message ?? "Reserva cancelada correctamente.");
      await loadReservations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al cancelar la reserva.",
      );
    } finally {
      setCancellingId(null);
    }
  }

  // Hasta que el navegador inicialice la hora, no calculamos reservas futuras.
  const currentTime = now ?? 0;

  const sortedReservations = [...reservations].sort((a, b) => {
    const aUpcoming =
      now !== null &&
      a.status === "CONFIRMED" &&
      new Date(a.startAt).getTime() > currentTime;

    const bUpcoming =
      now !== null &&
      b.status === "CONFIRMED" &&
      new Date(b.startAt).getTime() > currentTime;

    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;

    return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
  });

  const visibleReservations = showAllReservations
    ? sortedReservations
    : sortedReservations.slice(0, 2);

  const upcomingReservations = reservations.filter(
    (reservation) =>
      now !== null &&
      reservation.status === "CONFIRMED" &&
      new Date(reservation.startAt).getTime() > currentTime,
  );

  const confirmedHours = reservations.reduce((total, reservation) => {
    if (reservation.status !== "CONFIRMED") return total;

    const start = new Date(reservation.startAt).getTime();
    const end = new Date(reservation.endAt).getTime();

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return total;
    }

    return total + (end - start) / 3_600_000;
  }, 0);

  const userName = reservations[0]?.user?.name;
  const initials =
    userName
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "CS";

  const stats = [
    {
      title: "Reservas totales",
      value: String(reservations.length),
      description: "Reservas registradas en tu cuenta",
      icon: "▣",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Próximas reservas",
      value: String(upcomingReservations.length),
      description: "Confirmadas y pendientes de realizarse",
      icon: "◷",
      color: "bg-rose-50 text-[#F51D3D]",
    },
    {
      title: "Horas reservadas",
      value: String(Number(confirmedHours.toFixed(1))),
      description: "Horas de reservas confirmadas",
      icon: "◴",
      color: "bg-violet-50 text-violet-600",
    },
    {
      title: "Espacios favoritos",
      value: "—",
      description: "Función todavía no disponible",
      icon: "♡",
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#142238]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[260px] shrink-0 flex-col border-r border-gray-100 bg-white px-6 py-8 lg:flex">
          <Link href="/" className="mb-12 inline-block">
            <span className="text-[25px] font-black tracking-tight text-[#142238]">
              Co<span className="text-[#F51D3D]">Space</span>
            </span>
          </Link>

          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-[2px] text-gray-400">
            Menú principal
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setActiveMenu(item.label)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeMenu === item.label
                    ? "bg-[#FFF0F2] text-[#F51D3D]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#142238]"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="mt-6 flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 hover:text-[#F51D3D]"
          >
            <span>↪</span> Volver al inicio
          </Link>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/90 px-5 py-4 backdrop-blur-md sm:px-8 lg:px-10">
            <div className="flex items-center gap-3">
              <Link href="/" className="lg:hidden">
                <span className="text-xl font-black tracking-tight text-[#142238]">
                  Co<span className="text-[#F51D3D]">Space</span>
                </span>
              </Link>
              <div className="hidden lg:block">
                <p className="text-sm text-gray-500">Tu espacio de trabajo</p>
                <p className="font-bold">Panel de usuario</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <Link
                href="/spaces"
                className="hidden rounded-xl bg-[#F51D3D] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#d91834] sm:inline-flex"
              >
                + Nueva reserva
              </Link>

              <LogoutButton />

              <div className="flex items-center gap-3 border-l border-gray-100 pl-3 sm:pl-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFE3E7] font-bold text-[#F51D3D]">
                  {initials}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold">{userName ?? "Mi cuenta"}</p>
                  <p className="text-xs text-gray-400">Usuario</p>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
            <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-sm font-semibold capitalize text-[#F51D3D]">
                  {today}
                </p>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  ¡Hola{userName ? `, ${userName.split(" ")[0]}` : ""}! 👋
                </h1>
                <p className="mt-3 text-sm text-gray-500 sm:text-base">
                  Aquí tienes un resumen de tu actividad en CoSpace.
                </p>
              </div>

              <Link
                href="/spaces"
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold transition hover:border-[#F51D3D] hover:text-[#F51D3D]"
              >
                Explorar espacios <span>→</span>
              </Link>
            </section>

            <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <article
                  key={stat.title}
                  className="rounded-2xl border border-gray-100 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-100/70"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${stat.color}`}
                    >
                      {stat.icon}
                    </span>
                  </div>
                  <p className="text-3xl font-black">
                    {loading ? "…" : stat.value}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">{stat.description}</p>
                </article>
              ))}
            </section>

            <section className="mb-10">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black sm:text-2xl">Tus reservas</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Consulta tus reservas y sus estados actuales.
                  </p>
                </div>

                {!loading && reservations.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setShowAllReservations((current) => !current)}
                    className="shrink-0 text-sm font-bold text-[#F51D3D] hover:underline"
                  >
                    {showAllReservations ? "Ver menos" : "Ver todas"}
                  </button>
                )}
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={() => void loadReservations()}
                    className="mt-2 font-bold underline"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              )}

              {message && (
                <p
                  role="status"
                  className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
                >
                  {message}
                </p>
              )}

              {loading && (
                <div className="rounded-2xl border border-gray-100 bg-white p-8 text-sm text-gray-500">
                  Cargando reservas desde el servidor...
                </div>
              )}

              {!loading && !error && reservations.length === 0 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
                  <p className="font-bold">Todavía no tienes reservas</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Cuando hagas una reserva, aparecerá aquí.
                  </p>
                  <Link
                    href="/spaces"
                    className="mt-4 inline-block font-bold text-[#F51D3D] hover:underline"
                  >
                    Explorar espacios →
                  </Link>
                </div>
              )}

              {!loading && !error && reservations.length > 0 && (
                <div className="space-y-4">
                  {visibleReservations.map((reservation) => {
                    const isConfirmed = reservation.status === "CONFIRMED";

                    return (
                      <article
                        key={reservation.id}
                        className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:p-5"
                      >
                        {reservation.space.imageUrl ? (
                          <img
                            src={reservation.space.imageUrl}
                            alt={reservation.space.name}
                            className="h-44 w-full rounded-xl object-cover sm:h-28 sm:w-36"
                          />
                        ) : (
                          <div
                            aria-label="Este espacio no tiene imagen"
                            className="flex h-32 w-full items-center justify-center rounded-xl bg-slate-100 text-4xl text-slate-400 sm:h-28 sm:w-36"
                          >
                            ▦
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                isConfirmed
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isConfirmed ? "Confirmada" : "Cancelada"}
                            </span>
                            <span className="text-xs text-gray-400">
                              Reserva #{reservation.id.slice(0, 8)}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold">
                            {reservation.space.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {typeLabels[reservation.space.type]}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                            <span>
                              ▦ {dateFormatter.format(new Date(reservation.startAt))}
                            </span>
                            <span>
                              ◷ {timeFormatter.format(new Date(reservation.startAt))}
                              {" - "}
                              {timeFormatter.format(new Date(reservation.endAt))}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4 sm:block sm:border-0 sm:pt-0 sm:text-right">
                          <div>
                            <p className="text-xs text-gray-400">Precio total</p>
                            <p className="mt-1 text-xl font-black">
                              {money.format(Number(reservation.totalPrice))}
                            </p>
                          </div>

                          {isConfirmed && (
                            <button
                              type="button"
                              disabled={cancellingId === reservation.id}
                              onClick={() => void cancelReservation(reservation.id)}
                              className="text-sm font-bold text-[#F51D3D] hover:underline disabled:cursor-not-allowed disabled:opacity-50 sm:mt-3 sm:inline-block"
                            >
                              {cancellingId === reservation.id
                                ? "Cancelando..."
                                : "Cancelar reserva"}
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-2xl bg-[#142238] p-7 text-white sm:p-8 xl:col-span-2">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                  <div className="max-w-lg">
                    <span className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-rose-200">
                      TU PRÓXIMO ESPACIO TE ESPERA
                    </span>
                    <h2 className="text-2xl font-black leading-tight sm:text-3xl">
                      Encuentra el lugar perfecto para tus ideas.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-gray-300">
                      Explora escritorios, salas de reuniones y espacios privados
                      diseñados para ayudarte a concentrarte.
                    </p>
                    <Link
                      href="/spaces"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#F51D3D] px-5 py-3 text-sm font-bold transition hover:bg-[#d91834]"
                    >
                      Descubrir espacios <span>→</span>
                    </Link>
                  </div>

                  <div className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-6xl sm:flex">
                    ✦
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <h2 className="text-lg font-black">Accesos rápidos</h2>
                <p className="mt-1 text-sm text-gray-500">
                  ¿Qué quieres hacer hoy?
                </p>

                <div className="mt-5 space-y-3">
                  <Link
                    href="/spaces"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-rose-200 hover:bg-rose-50/50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-xl text-[#F51D3D]">
                      ⌕
                    </span>
                    <span>
                      <span className="block text-sm font-bold">Buscar espacios</span>
                      <span className="mt-1 block text-xs text-gray-400">
                        Encuentra tu lugar ideal
                      </span>
                    </span>
                    <span className="ml-auto text-gray-400">→</span>
                  </Link>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-rose-200 hover:bg-rose-50/50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                      ▣
                    </span>
                    <span>
                      <span className="block text-sm font-bold">Mis reservas</span>
                      <span className="mt-1 block text-xs text-gray-400">
                        Consulta tu agenda
                      </span>
                    </span>
                    <span className="ml-auto text-gray-400">→</span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
