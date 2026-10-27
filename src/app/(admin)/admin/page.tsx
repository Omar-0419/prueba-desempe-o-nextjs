"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type ApiReservation = {
  id: string;
  startAt: string;
  endAt: string;
  totalPrice: number | string;
  status: "CONFIRMED" | "CANCELLED" | "PENDING" | string;
  user?: { id?: string; name?: string; email?: string } | null;
  space?: { id?: string; name?: string; type?: string; imageUrl?: string | null; pricePerHour?: number | string } | null;
};

type ApiSpace = {
  id: string;
  name: string;
  description?: string | null;
  type: "DESK" | "MEETING_ROOM" | "PHONE_BOOTH" | string;
  capacity: number;
  pricePerHour: number | string;
  imageUrl?: string | null;
};

const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Bogota" });
const typeLabels: Record<string, string> = { DESK: "Escritorio privado", MEETING_ROOM: "Sala de reuniones", PHONE_BOOTH: "Cabina telefónica" };
const statusLabels: Record<string, string> = { CONFIRMED: "Confirmada", PENDING: "Pendiente", CANCELLED: "Cancelada" };

const menuItems = [
  { label: "Dashboard", icon: "⌂", href: "/admin" },
  { label: "Reservas", icon: "▣", href: "/admin/reservations" },
  { label: "Espacios", icon: "▦", href: "/admin/spaces" },
  { label: "Usuarios", icon: "♙", href: "/admin/users" },
  { label: "Categorías", icon: "◈", href: "/admin/categories" },
  { label: "Configuración", icon: "⚙", href: "/admin/settings" },
];

export default function AdminDashboardPage() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [reservationFilter, setReservationFilter] = useState("Todas");
  const [search, setSearch] = useState("");
  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [spaces, setSpaces] = useState<ApiSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Carga los datos reales usando las API existentes del proyecto.
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [reservationsResponse, spacesResponse] = await Promise.all([
        fetch("/api/reservations", { cache: "no-store" }),
        fetch("/api/spaces", { cache: "no-store" }),
      ]);
      const [reservationsData, spacesData] = await Promise.all([
        reservationsResponse.json(),
        spacesResponse.json(),
      ]);

      if (!reservationsResponse.ok) {
        throw new Error(reservationsData.error ?? reservationsData.message ?? "No se pudieron cargar las reservas.");
      }
      if (!spacesResponse.ok) {
        throw new Error(spacesData.error ?? spacesData.message ?? "No se pudieron cargar los espacios.");
      }

      setReservations(Array.isArray(reservationsData.reservations) ? reservationsData.reservations : []);
      setSpaces(Array.isArray(spacesData.spaces) ? spacesData.spaces : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const normalizedReservations = useMemo(() => reservations.map((reservation) => {
    const customer = reservation.user?.name ?? reservation.user?.email ?? "Usuario";
    const status = statusLabels[reservation.status] ?? reservation.status;
    return {
      id: reservation.id,
      customer,
      initials: customer.split(/\\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U",
      space: reservation.space?.name ?? "Espacio no disponible",
      date: dateFormatter.format(new Date(reservation.startAt)),
      amount: money.format(Number(reservation.totalPrice)),
      status,
      rawStatus: reservation.status,
    };
  }), [reservations]);

  const filteredReservations = normalizedReservations.filter((reservation) => {
    const matchesFilter = reservationFilter === "Todas" || reservation.status === reservationFilter;
    const matchesSearch =
      reservation.customer.toLowerCase().includes(search.toLowerCase()) ||
      reservation.id.toLowerCase().includes(search.toLowerCase()) ||
      reservation.space.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const confirmedCount = reservations.filter((item) => item.status === "CONFIRMED").length;
  const pendingCount = reservations.filter((item) => item.status === "PENDING").length;
  const cancelledCount = reservations.filter((item) => item.status === "CANCELLED").length;
  const revenue = reservations
    .filter((item) => item.status === "CONFIRMED")
    .reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
  const activeSpaces = spaces.length;

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#142238]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-[260px] shrink-0 flex-col border-r border-gray-100 bg-white px-6 py-8 lg:flex">
          <Link href="/" className="mb-12 inline-block">
            <span className="text-[25px] font-black tracking-tight text-[#142238]">
              Co<span className="text-[#F51D3D]">Space</span>
            </span>
          </Link>

          <div className="mb-8 rounded-xl bg-[#142238] p-4 text-white">
            <p className="text-xs font-medium text-gray-300">
              Panel de control
            </p>
            <p className="mt-1 text-lg font-black">Administración</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Administrador
            </div>
          </div>

          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-[2px] text-gray-400">
            General
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
                <span className="w-5 text-center text-xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-gray-100 pt-5">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-[#F51D3D]"
            >
              <span className="text-xl">↩</span>
              Volver al sitio
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/90 px-5 py-4 backdrop-blur-md sm:px-8 lg:px-10">
            <div>
              <Link href="/" className="lg:hidden">
                <span className="text-xl font-black tracking-tight text-[#142238]">
                  Co<span className="text-[#F51D3D]">Space</span>
                </span>
              </Link>
              <p className="hidden text-sm text-gray-400 lg:block">
                CoSpace / Administración
              </p>
              <h1 className="mt-1 hidden text-lg font-black lg:block">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold">Administrador</p>
                <p className="text-xs text-gray-400">Gestión de plataforma</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#142238] font-bold text-white">
                AD
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
            {/* Welcome */}
            <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="mb-2 text-sm font-semibold text-[#F51D3D]">
                  RESUMEN GENERAL
                </p>
                <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                  ¡Bienvenido, administrador!
                </h2>
                <p className="mt-3 text-sm text-gray-500 sm:text-base">
                  Supervisa las reservas, los usuarios y los espacios de
                  CoSpace desde un solo lugar.
                </p>
              </div>

              <Link
                href="/admin/spaces/new"
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#F51D3D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d91834]"
              >
                <span className="text-lg">+</span>
                Agregar espacio
              </Link>
            </section>

            {error && (
              <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <span>{error}</span>
                <button onClick={() => void loadDashboard()} className="font-bold underline">Intentar de nuevo</button>
              </div>
            )}

            {loading && (
              <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-500">
                Cargando estadísticas, reservas y espacios desde la API...
              </div>
            )}

            {/* Statistics */}
            <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Ingresos confirmados",
                  value: money.format(revenue),
                  note: "Suma de reservas confirmadas",
                  icon: "$",
                  color: "bg-green-50 text-green-600",
                  trend: "↗",
                },
                {
                  title: "Reservas",
                  value: String(reservations.length),
                  note: `${confirmedCount} confirmadas · ${cancelledCount} canceladas`,
                  icon: "▣",
                  color: "bg-blue-50 text-blue-600",
                  trend: "↗",
                },
                {
                  title: "Usuarios registrados",
                  value: "—",
                  note: "No hay endpoint de usuarios conectado",
                  icon: "♙",
                  color: "bg-violet-50 text-violet-600",
                  trend: "↗",
                },
                {
                  title: "Espacios disponibles",
                  value: String(activeSpaces),
                  note: "Espacios recibidos desde la API",
                  icon: "▦",
                  color: "bg-rose-50 text-[#F51D3D]",
                  trend: "→",
                },
              ].map((stat) => (
                <article
                  key={stat.title}
                  className="rounded-2xl border border-gray-100 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-100/70"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </span>
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl font-bold ${stat.color}`}
                    >
                      {stat.icon}
                    </span>
                  </div>
                  <p className="text-2xl font-black sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-xs leading-5 text-gray-400">
                    <span className="mr-1 font-bold text-green-600">
                      {stat.trend}
                    </span>
                    {stat.note}
                  </p>
                </article>
              ))}
            </section>

            {/* Activity and summary */}
            <section className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-7 xl:col-span-2">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black">
                      Actividad de reservas
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Volumen de reservas durante los últimos meses.
                    </p>
                  </div>
                  <span className="rounded-lg border border-gray-100 px-3 py-2 text-xs font-semibold text-gray-500">
                    Últimos 6 meses
                  </span>
                </div>

                <div className="flex h-56 items-end justify-around gap-3 border-b border-gray-100 px-2 pb-3">
                  {(() => {
                    const monthNames = ["May", "Jun", "Jul", "Ago", "Sep", "Oct"];
                    const monthly = monthNames.map((month, index) => {
                      const monthNumber = index + 4;
                      const count = reservations.filter((reservation) => {
                        const date = new Date(reservation.startAt);
                        return date.getFullYear() === 2026 && date.getMonth() + 1 === monthNumber;
                      }).length;
                      return { month, count };
                    });
                    const max = Math.max(1, ...monthly.map((item) => item.count));
                    return monthly.map((item) => ({ ...item, height: `${Math.max(4, item.count / max * 100)}%` }));
                  })().map((item) => (
                    <div
                      key={item.month}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                    >
                      <div
                        className="w-full max-w-12 rounded-t-lg bg-[#F51D3D] transition-opacity hover:opacity-75"
                        style={{ height: item.height }}
                        title={`${item.count} reservas en ${item.month}`}
                      />
                      <span className="text-xs font-medium text-gray-400">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-gray-400">
                  Actividad calculada con las reservas recibidas de la API.
                </p>
              </div>

              <div className="rounded-2xl bg-[#142238] p-6 text-white sm:p-7">
                <p className="text-sm font-medium text-gray-300">
                  Estado de las reservas
                </p>
                <h3 className="mt-2 text-2xl font-black">
                  Resumen general
                </h3>

                <div className="mt-7 space-y-6">
                  {[
                    {
                      label: "Confirmadas",
                      value: String(confirmedCount),
                      width: `${reservations.length ? confirmedCount / reservations.length * 100 : 0}%`,
                      color: "bg-green-400",
                    },
                    {
                      label: "Pendientes",
                      value: String(pendingCount),
                      width: `${reservations.length ? pendingCount / reservations.length * 100 : 0}%`,
                      color: "bg-amber-400",
                    },
                    {
                      label: "Canceladas",
                      value: String(cancelledCount),
                      width: `${reservations.length ? cancelledCount / reservations.length * 100 : 0}%`,
                      color: "bg-rose-400",
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-300">{item.label}</span>
                        <span className="font-bold">{item.value}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: item.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/admin/reservations"
                  className="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-sm font-bold transition hover:bg-white/10"
                >
                  Gestionar reservas →
                </Link>
              </div>
            </section>

            {/* Recent reservations */}
            <section className="mb-10 overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-7">
                <div>
                  <h3 className="text-xl font-black">Reservas recientes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Consulta las últimas operaciones de los usuarios.
                  </p>
                </div>
                <Link
                  href="/admin/reservations"
                  className="text-sm font-bold text-[#F51D3D] hover:underline"
                >
                  Ver todas →
                </Link>
              </div>

              <div className="border-t border-gray-100 p-5 sm:px-7">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar cliente, espacio o reserva..."
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#F51D3D] focus:ring-2 focus:ring-rose-100"
                  />

                  <select
                    value={reservationFilter}
                    onChange={(event) =>
                      setReservationFilter(event.target.value)
                    }
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#F51D3D]"
                  >
                    <option value="Todas">Todos los estados</option>
                    <option value="Confirmada">Confirmadas</option>
                    <option value="Pendiente">Pendientes</option>
                    <option value="Cancelada">Canceladas</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                        <th className="px-3 py-4 font-semibold">Cliente</th>
                        <th className="px-3 py-4 font-semibold">Espacio</th>
                        <th className="px-3 py-4 font-semibold">Fecha</th>
                        <th className="px-3 py-4 font-semibold">Importe</th>
                        <th className="px-3 py-4 font-semibold">Estado</th>
                        <th className="px-3 py-4 font-semibold">Reserva</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations.map((reservation) => (
                        <tr
                          key={reservation.id}
                          className="border-b border-gray-50 last:border-0 hover:bg-gray-50/70"
                        >
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFE3E7] text-xs font-bold text-[#F51D3D]">
                                {reservation.initials}
                              </div>
                              <span className="text-sm font-semibold">
                                {reservation.customer}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {reservation.space}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {reservation.date}
                          </td>
                          <td className="px-3 py-4 text-sm font-bold">
                            {reservation.amount}
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                                reservation.status === "Confirmada"
                                  ? "bg-green-50 text-green-700"
                                  : reservation.status === "Pendiente"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-600"
                              }`}
                            >
                              {reservation.status}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-sm font-bold text-gray-500">
                            {reservation.id}
                          </td>
                        </tr>
                      ))}

                      {filteredReservations.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-3 py-10 text-center text-sm text-gray-400"
                          >
                            No se encontraron reservas con esos filtros.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Spaces management */}
            <section>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black">Espacios destacados</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Revisa el rendimiento y estado de los espacios.
                  </p>
                </div>
                <Link
                  href="/admin/spaces"
                  className="text-sm font-bold text-[#F51D3D] hover:underline"
                >
                  Administrar espacios →
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {spaces.slice(0, 3).map((space) => (
                  <article
                    key={space.id}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-100/70"
                  >
                    <div className="relative">
                      {space.imageUrl ? (
                        <img
                          src={space.imageUrl}
                          alt={space.name}
                          className="h-44 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center bg-slate-100 text-4xl text-slate-400">▦</div>
                      )}
                      <span
                        className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-bold ${
                          true
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        Disponible
                      </span>
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-semibold text-[#F51D3D]">
                        {typeLabels[space.type] ?? space.type}
                      </p>
                      <h4 className="mt-2 text-lg font-black">{space.name}</h4>

                      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                        <div>
                          <p className="text-xs text-gray-400">
                            Total de reservas
                          </p>
                          <p className="mt-1 text-lg font-black">
                            {reservations.filter((reservation) => reservation.space?.id === space.id).length}
                          </p>
                        </div>
                        <Link
                          href="/admin/spaces"
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold transition hover:border-[#F51D3D] hover:text-[#F51D3D]"
                        >
                          Gestionar
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
