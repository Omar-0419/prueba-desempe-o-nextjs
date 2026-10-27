
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const spaceTypeLabels: Record<string, string> = {
  DESK: "Escritorio privado",
  MEETING_ROOM: "Sala de reuniones",
  PHONE_BOOTH: "Cabina telefónica",
};

export default function NewSpacePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "DESK",
    capacity: "1",
    price: "",
    image: "",
    status: "Borrador",
  });

  const [errors, setErrors] = useState("");

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors("");

    const capacity = Number(form.capacity);
    const pricePerHour = Number(form.price);

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      !Number.isFinite(pricePerHour) ||
      pricePerHour <= 0
    ) {
      setErrors("Completa los campos obligatorios con valores válidos.");
      return;
    }

    setSubmitting(true);

    try {
      // La API espera los valores de SpaceType definidos en Prisma.
      const response = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          type: form.type,
          capacity,
          pricePerHour,
          imageUrl: form.image.trim() || null,
          // El modelo actual usa isActive (boolean), no un estado de tres valores.
          isActive: form.status === "Publicado",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || data.message ||
          (response.status === 401 || response.status === 403
            ? "Debes iniciar sesión con una cuenta administradora para crear espacios."
            : "No se pudo crear el espacio.")
        );
      }

      // Al crearse correctamente, volvemos al catálogo administrativo.
      router.push("/spaces");
      router.refresh();
    } catch (error) {
      setErrors(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al conectar con el servidor."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F9FB] text-[#142238]">
      <header className="border-b border-gray-100 bg-white px-5 py-5 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/admin" className="text-xl font-black tracking-tight">
            Co<span className="text-[#F51D3D]">Space</span>
          </Link>

          <Link
            href="/admin/spaces"
            className="text-sm font-semibold text-gray-500 hover:text-[#F51D3D]"
          >
            ← Volver a espacios
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#F51D3D]">
            Administración / Espacios
          </p>
          <h1 className="text-3xl font-black sm:text-4xl">
            Crear nuevo espacio
          </h1>
          <p className="mt-3 text-sm text-gray-500 sm:text-base">
            Registra un espacio para que los usuarios puedan conocerlo y
            reservarlo.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3"
        >
          <section className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-black">Información general</h2>
              <p className="mt-1 text-sm text-gray-500">
                Describe las características principales del espacio.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-bold"
                  >
                    Nombre del espacio *
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Ej. Creative Meeting Room"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#F51D3D] focus:ring-2 focus:ring-rose-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-bold"
                  >
                    Descripción *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Describe el espacio, sus características y para qué actividades es ideal..."
                    className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#F51D3D] focus:ring-2 focus:ring-rose-100"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="type"
                      className="mb-2 block text-sm font-bold"
                    >
                      Tipo de espacio *
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#F51D3D]"
                    >
                      <option value="DESK">Escritorio privado</option>
                      <option value="MEETING_ROOM">Sala de reuniones</option>
                      <option value="PHONE_BOOTH">Cabina telefónica</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="capacity"
                      className="mb-2 block text-sm font-bold"
                    >
                      Capacidad de personas *
                    </label>
                    <input
                      id="capacity"
                      name="capacity"
                      type="number"
                      min="1"
                      max="1000"
                      value={form.capacity}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#F51D3D]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-black">Imagen del espacio</h2>
              <p className="mt-1 text-sm text-gray-500">
                Ingresa la URL de una imagen para mostrarla en el catálogo.
              </p>

              <div className="mt-5">
                <label
                  htmlFor="image"
                  className="mb-2 block text-sm font-bold"
                >
                  URL de la imagen
                </label>
                <input
                  id="image"
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#F51D3D]"
                />
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-dashed border-gray-200 bg-gray-50">
                {form.image ? (
                  <img
                    src={form.image}
                    alt="Vista previa del espacio"
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 flex-col items-center justify-center text-gray-400">
                    <span className="text-4xl">▧</span>
                    <p className="mt-3 text-sm font-semibold">
                      Vista previa de la imagen
                    </p>
                    <p className="mt-1 text-xs">
                      Ingresa una URL para visualizarla aquí
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h2 className="text-lg font-black">Precio y disponibilidad</h2>

              <div className="mt-5">
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-bold"
                >
                  Precio por hora (COP) *
                </label>
                <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 focus-within:border-[#F51D3D]">
                  <span className="border-r border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-500">
                    $
                  </span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="1"
                    step="1"
                    value={form.price}
                    onChange={handleChange}
                    required
                    placeholder="45000"
                    className="w-full min-w-0 px-3 py-3 text-sm outline-none"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Define el valor que pagará el usuario por cada hora.
                </p>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-bold"
                >
                  Estado del espacio
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#F51D3D]"
                >
                  <option value="Borrador">Borrador</option>
                  <option value="Publicado">Publicado</option>
                  <option value="Inactivo">Inactivo</option>
                </select>

                <p className="mt-2 text-xs leading-5 text-gray-400">
                  Publicado activa el espacio. Borrador e Inactivo se guardan como inactivos, porque el modelo actual solo distingue entre activo e inactivo.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h2 className="text-lg font-black">Resumen</h2>

              <div className="mt-4 space-y-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Tipo</span>
                  <span className="text-right font-semibold">
                    {spaceTypeLabels[form.type] ?? form.type}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Capacidad</span>
                  <span className="font-semibold">
                    {form.capacity || "0"} personas
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Precio por hora</span>
                  <span className="font-bold">
                    {form.price
                      ? `$${Number(form.price).toLocaleString("es-CO")}`
                      : "Sin definir"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Estado</span>
                  <span className="font-semibold">{form.status}</span>
                </div>
              </div>
            </div>

            {errors && (
              <p
                role="status"
                className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-[#F51D3D]"
              >
                {errors}
              </p>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#F51D3D] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#d91834] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Guardando espacio..." : "Crear espacio"}
              </button>

              <Link
                href="/admin/spaces"
                className="block w-full rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-center text-sm font-bold transition hover:bg-gray-50"
              >
                Cancelar
              </Link>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
