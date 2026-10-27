
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useState } from "react";

function EditSpaceForm() {
  const params = useParams<{ id: string }>();
  const spaceId = params.id;

  const [form, setForm] = useState({
    name: "The Executive Desk",
    description:
      "Un espacio de trabajo privado, cómodo y equipado para concentrarte y desarrollar tus proyectos.",
    type: "Escritorio privado",
    capacity: "2",
    price: "45000",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800",
    status: "Publicado",
  });

  const [message, setMessage] = useState("");

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.price ||
      Number(form.price) <= 0 ||
      Number(form.capacity) < 1
    ) {
      setMessage("Verifica los campos obligatorios antes de continuar.");
      return;
    }

    setMessage(
      "Formulario validado. Conecta el backend para guardar las modificaciones."
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FB] text-[#142238]">
      <header className="border-b border-gray-100 bg-white px-5 py-5 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight">
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
            Administración / Espacios / Editar
          </p>
          <h1 className="text-3xl font-black sm:text-4xl">
            Editar espacio
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Modifica la información y las condiciones de este espacio.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Identificador: {spaceId}
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
                Actualiza el nombre, la descripción, el tipo y la capacidad.
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
                      <option>Escritorio privado</option>
                      <option>Sala de reuniones</option>
                      <option>Espacio individual</option>
                      <option>Oficina privada</option>
                      <option>Espacio colaborativo</option>
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
                Cambia la URL si deseas utilizar otra imagen.
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

              <div className="mt-5 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                {form.image ? (
                  <img
                    src={form.image}
                    alt="Vista previa del espacio"
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center text-sm text-gray-400">
                    No hay imagen seleccionada
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h2 className="text-lg font-black">Precio y estado</h2>

              <div className="mt-5">
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-bold"
                >
                  Precio por hora (COP) *
                </label>
                <div className="flex overflow-hidden rounded-xl border border-gray-200 focus-within:border-[#F51D3D]">
                  <span className="border-r border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-500">
                    $
                  </span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="1"
                    step="100"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="w-full min-w-0 px-3 py-3 text-sm outline-none"
                  />
                </div>
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
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h2 className="text-lg font-black">Resumen actualizado</h2>

              <div className="mt-4 space-y-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Tipo</span>
                  <span className="text-right font-semibold">{form.type}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Capacidad</span>
                  <span className="font-semibold">
                    {form.capacity} personas
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

            {message && (
              <p
                role="status"
                className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-[#F51D3D]"
              >
                {message}
              </p>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                className="w-full rounded-xl bg-[#F51D3D] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#d91834]"
              >
                Guardar cambios
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

export default function EditSpacePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F8F9FB] p-8 text-[#142238]">
          Cargando formulario de edición...
        </main>
      }
    >
      <EditSpaceForm />
    </Suspense>
  );
}
