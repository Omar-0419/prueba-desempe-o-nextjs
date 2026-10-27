
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Space = {
    id: string;
    name: string;
    description: string | null;
    type: "DESK" | "MEETING_ROOM" | "PHONE_BOOTH";
    capacity: number;
    pricePerHour: string | number;
    imageUrl: string | null;
};

function ReservationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const spaceId = searchParams.get("spaceId");

    const [date, setDate] = useState("");
    const [startHour, setStartHour] = useState("09:00");
    const [duration, setDuration] = useState("1");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [space, setSpace] = useState<Space | null>(null);
    const [spaceLoading, setSpaceLoading] = useState(true);

    // Consultamos los datos reales del espacio seleccionado.

    useEffect(() => {
        if (!spaceId) {
            setSpaceLoading(false);
            setError("No se ha seleccionado ningún espacio.");
            return;
        }

        // Guardamos el ID validado para usarlo dentro de loadSpace.
        const selectedSpaceId = spaceId;

        let cancelled = false;


        async function loadSpace() {
            try {
                const response = await fetch(
                    `/api/spaces/${encodeURIComponent(selectedSpaceId)}`,
                    { cache: "no-store" }
                );

                if (!response.ok) {
                    throw new Error("No se pudo consultar el espacio.");
                }

                const data: Space = await response.json();

                if (!cancelled) {
                    setSpace(data);
                }
            } catch {
                if (!cancelled) {
                    setError(
                        "No fue posible cargar los datos del espacio. Vuelve al catálogo e inténtalo de nuevo."
                    );
                }
            } finally {
                if (!cancelled) {
                    setSpaceLoading(false);
                }
            }
        }

        void loadSpace();

        return () => {
            cancelled = true;
        };
    }, [spaceId]);

    // Formatea un valor monetario en pesos colombianos.
    function formatCOP(value: number) {
        return value.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        });
    }

    // Convierte la fecha y hora de Colombia a un instante ISO.
    function toColombiaISO(dateValue: string, timeValue: string) {
        return `${dateValue}T${timeValue}:00-05:00`;
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!spaceId || !space) {
            setError("No se ha podido identificar el espacio seleccionado.");
            return;
        }

        if (!date) {
            setError("Selecciona la fecha de la reserva.");
            return;
        }

        const startAt = new Date(toColombiaISO(date, startHour));
        const endAt = new Date(
            startAt.getTime() + Number(duration) * 60 * 60 * 1000
        );

        if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
            setError("La fecha o la hora seleccionada no son válidas.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/reservations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    spaceId,
                    startAt: startAt.toISOString(),
                    endAt: endAt.toISOString(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.error ||
                    data.message ||
                    "No se pudo crear la reserva."
                );
                return;
            }

            setSuccess("¡Reserva creada correctamente! Redirigiendo al dashboard...");

            // Mostramos la confirmación antes de redirigir.
            window.setTimeout(() => {
                router.push("/dashboard");
                router.refresh();
            }, 1200);
        } catch {
            setError(
                "No fue posible conectar con el servidor. Inténtalo de nuevo."
            );
        } finally {
            setLoading(false);
        }
    }

    // Horas de inicio permitidas según la duración elegida.
    const availableHours = Array.from({ length: 14 }, (_, index) => {
        const hour = index + 7;
        return `${String(hour).padStart(2, "0")}:00`;
    }).filter((hour) => {
        const endingHour =
            Number(hour.slice(0, 2)) + Number(duration);

        return endingHour <= 21;
    });

    // Mantiene una hora de inicio válida al cambiar la duración.
    function handleDurationChange(nextDuration: string) {
        setDuration(nextDuration);

        const start = Number(startHour.slice(0, 2));

        if (start + Number(nextDuration) > 21) {
            setStartHour("09:00");
        }
    }

    const estimatedTotal = space
        ? Number(space.pricePerHour) * Number(duration)
        : 0;

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10 text-[#142238]">
            <div className="mx-auto max-w-xl">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-6 text-sm font-semibold text-[#F51D3D] hover:underline"
                >
                    ← Volver
                </button>

                <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#F51D3D]">
                        CoSpace
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Reservar un espacio
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                        Selecciona la fecha, la hora de inicio y la duración.
                        Comprobaremos la disponibilidad antes de confirmar.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-8 space-y-6"
                    >
                        {/* Información del espacio seleccionado */}
                        {spaceLoading ? (
                            <p className="rounded-xl bg-gray-50 p-4 text-gray-600">
                                Cargando información del espacio...
                            </p>
                        ) : space ? (
                            <section className="rounded-xl border border-gray-200 p-4">
                                {space.imageUrl && (
                                    <img
                                        src={space.imageUrl}
                                        alt={space.name}
                                        className="mb-4 h-44 w-full rounded-lg object-cover"
                                    />
                                )}

                                <h2 className="text-lg font-bold">
                                    {space.name}
                                </h2>

                                {space.description && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        {space.description}
                                    </p>
                                )}

                                <p className="mt-3 text-sm">
                                    Tipo:{" "}
                                    <strong>
                                        {{
                                            DESK: "Escritorio",
                                            MEETING_ROOM: "Sala de reuniones",
                                            PHONE_BOOTH: "Cabina telefónica",
                                        }[space.type]}
                                    </strong>
                                </p>

                                <p className="mt-1 text-sm">
                                    Capacidad:{" "}
                                    <strong>{space.capacity} personas</strong>
                                </p>

                                <p className="mt-1 text-sm">
                                    Precio por hora:{" "}
                                    <strong>
                                        {formatCOP(Number(space.pricePerHour))}
                                    </strong>
                                </p>

                                <div className="mt-4 rounded-lg bg-gray-50 p-3">
                                    <p className="text-sm text-gray-600">
                                        Estimación para {duration}{" "}
                                        {duration === "1" ? "hora" : "horas"}
                                    </p>

                                    <p className="mt-1 text-xl font-bold text-[#F51D3D]">
                                        {formatCOP(estimatedTotal)}
                                    </p>
                                </div>
                            </section>
                        ) : (
                            <p
                                role="alert"
                                className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
                            >
                                No se pudo cargar el espacio. Vuelve al catálogo
                                e inténtalo de nuevo.
                            </p>
                        )}

                        {/* Fecha de la reserva */}
                        <div>
                            <label
                                htmlFor="date"
                                className="mb-2 block font-semibold"
                            >
                                Fecha
                            </label>

                            <input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                min={new Date().toLocaleDateString("en-CA", {
                                    timeZone: "America/Bogota",
                                })}
                                required
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#F51D3D]"
                            />

                            <p className="mt-1 text-xs text-gray-500">
                                Puedes reservar con hasta 30 días de anticipación.
                            </p>
                        </div>

                        {/* Duración */}
                        <div>
                            <label
                                htmlFor="duration"
                                className="mb-2 block font-semibold"
                            >
                                Duración
                            </label>

                            <select
                                id="duration"
                                value={duration}
                                onChange={(event) =>
                                    handleDurationChange(event.target.value)
                                }
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#F51D3D]"
                            >
                                <option value="1">1 hora</option>
                                <option value="2">2 horas</option>
                                <option value="3">3 horas</option>
                                <option value="4">4 horas</option>
                            </select>
                        </div>

                        {/* Hora de inicio */}
                        <div>
                            <label
                                htmlFor="startHour"
                                className="mb-2 block font-semibold"
                            >
                                Hora de inicio
                            </label>

                            <select
                                id="startHour"
                                value={startHour}
                                onChange={(event) =>
                                    setStartHour(event.target.value)
                                }
                                required
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#F51D3D]"
                            >
                                {availableHours.map((hour) => (
                                    <option key={hour} value={hour}>
                                        {hour}
                                    </option>
                                ))}
                            </select>

                            <p className="mt-1 text-xs text-gray-500">
                                Horario de atención: 07:00 a 21:00.
                            </p>
                        </div>

                        {/* Resumen de horario */}
                        <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                            <p>
                                <strong>Inicio:</strong>{" "}
                                {date || "Selecciona una fecha"} a las{" "}
                                {startHour}
                            </p>

                            <p className="mt-1">
                                <strong>Finalización:</strong>{" "}
                                {date || "Selecciona una fecha"} a las{" "}
                                {String(
                                    Number(startHour.slice(0, 2)) +
                                    Number(duration)
                                ).padStart(2, "0")}
                                :00
                            </p>

                            <p className="mt-2">
                                El total definitivo lo calcula y valida el servidor.
                            </p>
                        </div>

                        {/* Mensajes de estado */}
                        {error && (
                            <p
                                role="alert"
                                className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                            >
                                {error}
                            </p>
                        )}

                        {success && (
                            <p
                                role="status"
                                className="rounded-xl bg-green-50 p-3 text-sm text-green-700"
                            >
                                {success}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                spaceLoading ||
                                !space ||
                                Boolean(success)
                            }
                            className="w-full rounded-xl bg-[#F51D3D] px-5 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Procesando reserva..."
                                : success
                                    ? "Reserva confirmada"
                                    : "Confirmar reserva"}
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}

export default function NewReservationPage() {
    return (
        <Suspense
            fallback={
                <main className="p-10 text-center">
                    Cargando formulario...
                </main>
            }
        >
            <ReservationForm />
        </Suspense>
    );
}
