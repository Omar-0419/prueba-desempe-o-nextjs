import Link from "next/link";

const benefits = [
  {
    number: "01",
    icon: "↗",
    title: "Flexibilidad total",
    description:
      "Reserva por horas o por el tiempo que necesites. Tú decides cómo trabajar.",
  },
  {
    number: "02",
    icon: "◇",
    title: "Espacios de calidad",
    description:
      "Ambientes cómodos, modernos y equipados para que puedas dar lo mejor de ti.",
  },
  {
    number: "03",
    icon: "◎",
    title: "Ubicaciones estratégicas",
    description:
      "Encuentra espacios ideales para trabajar, reunirte y desarrollar tus ideas.",
  },
  {
    number: "04",
    icon: "♧",
    title: "Ideal para todos",
    description:
      "Opciones para freelancers, emprendedores, profesionales y equipos de trabajo.",
  },
];

const featuredSpaces = [
  {
    name: "The Executive Desk",
    type: "ESCRITORIO",
    description:
      "Un espacio moderno y tranquilo para concentrarte en tus proyectos.",
    price: "15.000",
    capacity: "1 persona",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Creative Meeting Room",
    type: "SALA DE REUNIONES",
    description:
      "El lugar perfecto para compartir ideas y trabajar en equipo.",
    price: "45.000",
    capacity: "Hasta 6 personas",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Private Focus Room",
    type: "ESPACIO PRIVADO",
    description:
      "Privacidad, comodidad y tranquilidad para tus tareas más importantes.",
    price: "25.000",
    capacity: "Hasta 2 personas",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=85",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#142238]">
      {/* HERO */}
      <section className="relative isolate bg-[#101b2b]">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=90')",
          }}
        />

        {/* Capa oscura para mejorar la lectura */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b1422]/95 via-[#0b1422]/80 to-[#0b1422]/30" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:py-28">
          {/* Texto principal */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.17em] text-white backdrop-blur-md sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[#F51D3D]" />
              Tu próxima gran idea comienza aquí
            </div>

            <h1 className="mt-7 text-5xl font-black leading-[1.08] tracking-[-0.045em] text-white sm:text-6xl lg:text-[76px]">
              Un espacio para
              <span className="mt-1 block text-[#ff334f]">
                hacer que pase.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
              Reserva escritorios, salas de reuniones y espacios privados por
              hora. Trabaja a tu manera, con todo lo que necesitas para llevar
              tus ideas al siguiente nivel.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/spaces"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#F51D3D] px-7 py-4 text-sm font-bold text-white shadow-xl shadow-red-950/30 transition hover:-translate-y-1 hover:bg-[#dc1734] sm:text-base"
              >
                Explorar espacios
                <span className="text-xl">→</span>
              </Link>

              <a
                href="#beneficios"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-4 text-sm font-bold text-white transition hover:border-white hover:bg-white/10 sm:text-base"
              >
                Conocer más
              </a>
            </div>

            {/* Ventajas rápidas */}
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-4 text-sm text-slate-200">
              <span className="flex items-center gap-2">
                <span className="font-black text-[#ff334f]">✓</span>
                Reserva flexible
              </span>

              <span className="flex items-center gap-2">
                <span className="font-black text-[#ff334f]">✓</span>
                Precios transparentes
              </span>

              <span className="flex items-center gap-2">
                <span className="font-black text-[#ff334f]">✓</span>
                Gestión en línea
              </span>
            </div>
          </div>

          {/* TARJETA DE BÚSQUEDA */}
          <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-2xl shadow-black/20 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#F51D3D]">
                  Encuentra tu lugar
                </span>

                <h2 className="mt-3 text-2xl font-black tracking-tight text-[#142238] sm:text-3xl">
                  ¿Dónde quieres trabajar?
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Descubre espacios que se adaptan a tu día.
                </p>
              </div>

              <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-2xl text-[#F51D3D] sm:flex">
                ⌕
              </span>
            </div>

            <form action="/spaces" method="GET" className="mt-7 space-y-5">
              {/* Tipo de espacio */}
              <div>
                <label
                  htmlFor="space-type"
                  className="mb-2 block text-sm font-bold text-[#142238]"
                >
                  Tipo de espacio
                </label>

                <div className="relative">
                  <select
                    id="space-type"
                    name="type"
                    defaultValue="all"
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 pr-11 text-sm text-slate-700 outline-none transition focus:border-[#F51D3D] focus:bg-white focus:ring-4 focus:ring-red-50"
                  >
                    <option value="all">Todos los espacios</option>
                    <option value="DESK">Escritorios</option>
                    <option value="MEETING_ROOM">Salas de reuniones</option>
                    <option value="PHONE_BOOTH">Cabinas privadas</option>
                  </select>

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                    ↓
                  </span>
                </div>
              </div>

              {/* Capacidad */}
              <div>
                <label
                  htmlFor="capacity"
                  className="mb-2 block text-sm font-bold text-[#142238]"
                >
                  ¿Cuántas personas?
                </label>

                <div className="relative">
                  <select
                    id="capacity"
                    name="capacity"
                    defaultValue="1"
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 pr-11 text-sm text-slate-700 outline-none transition focus:border-[#F51D3D] focus:bg-white focus:ring-4 focus:ring-red-50"
                  >
                    <option value="1">1 persona</option>
                    <option value="2">Hasta 2 personas</option>
                    <option value="5">Hasta 5 personas</option>
                    <option value="10">Hasta 10 personas</option>
                    <option value="20">Más de 10 personas</option>
                  </select>

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                    ↓
                  </span>
                </div>
              </div>

              {/* Botón de búsqueda */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#F51D3D] px-5 py-4 font-bold text-white shadow-lg shadow-red-100 transition hover:-translate-y-0.5 hover:bg-[#dc1734]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4 4" />
                </svg>

                Buscar espacios
                <span className="ml-auto text-lg">→</span>
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-slate-400">
              Encuentra tu espacio ideal en pocos pasos.
            </p>
          </div>
        </div>

        {/* Transición visual inferior */}
        <div className="h-3 bg-gradient-to-r from-[#F51D3D] via-[#ff5269] to-[#F51D3D]" />
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#F51D3D]">
                Una mejor forma de trabajar
              </span>

              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#142238] sm:text-4xl lg:text-5xl">
                Tu trabajo merece
                <span className="text-[#F51D3D]"> un mejor espacio.</span>
              </h2>
            </div>

            <p className="max-w-md leading-7 text-slate-500">
              Creamos una forma sencilla de encontrar el lugar perfecto para
              concentrarte, colaborar y hacer crecer tus proyectos.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <article
                key={benefit.number}
                className="group rounded-3xl border border-slate-100 bg-[#F8F9FB] p-6 transition duration-300 hover:-translate-y-1 hover:border-red-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/60 sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-2xl font-bold text-[#F51D3D] transition group-hover:bg-[#F51D3D] group-hover:text-white">
                    {benefit.icon}
                  </span>

                  <span className="text-xs font-bold tracking-widest text-slate-300">
                    {benefit.number}
                  </span>
                </div>

                <h3 className="mt-7 text-lg font-extrabold text-[#142238]">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ESPACIOS DESTACADOS */}
      <section className="bg-[#F8F9FB] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#F51D3D]">
                Encuentra tu espacio
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-[#142238] sm:text-4xl lg:text-5xl">
                Espacios para grandes ideas.
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-slate-500">
                Desde un escritorio para trabajar en solitario hasta salas
                diseñadas para que las grandes ideas sucedan.
              </p>
            </div>

            <Link
              href="/spaces"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#142238] transition hover:border-[#F51D3D] hover:text-[#F51D3D]"
            >
              Ver todos los espacios
              <span className="text-lg">→</span>
            </Link>
          </div>

          {/* Grid de espacios */}
          <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {featuredSpaces.map((space) => (
              <article
                key={space.name}
                className="group overflow-hidden rounded-3xl border border-slate-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/70"
              >
                {/* Imagen */}
                <div className="relative h-60 overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={space.image}
                    alt={space.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                  <span className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/95 px-4 py-2 text-[10px] font-black tracking-widest text-[#F51D3D] shadow-sm">
                    {space.type}
                  </span>

                  <span className="absolute bottom-4 right-4 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-[#142238]">
                    {space.capacity}
                  </span>
                </div>

                {/* Información */}
                <div className="p-6 sm:p-7">
                  <h3 className="text-xl font-black tracking-tight text-[#142238] transition group-hover:text-[#F51D3D]">
                    {space.name}
                  </h3>

                  <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-500">
                    {space.description}
                  </p>

                  <div className="mt-6 flex items-end justify-between gap-3 border-t border-slate-100 pt-5">
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Precio por hora
                      </p>

                      <p className="mt-1 text-2xl font-black tracking-tight text-[#142238]">
                        ${space.price}
                      </p>
                    </div>

                    <Link
                      href="/spaces"
                      className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-3 text-sm font-bold text-[#F51D3D] transition hover:bg-[#F51D3D] hover:text-white"
                    >
                      Explorar
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/spaces"
              className="inline-flex items-center gap-3 rounded-full bg-[#142238] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#243954]"
            >
              Descubrir todos los espacios
              <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* LLAMADA A LA ACCIÓN */}
      <section className="bg-white px-5 py-20 lg:px-8 lg:py-24">
        <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[#142238] px-7 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          {/* Decoración de fondo */}
          <div className="absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full border-[45px] border-white/[0.04]" />

          <div className="absolute -bottom-32 right-1/4 -z-10 h-72 w-72 rounded-full bg-[#F51D3D]/20 blur-3xl" />

          <div className="flex flex-col items-start justify-between gap-9 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-200">
                Tu próxima jornada empieza aquí
              </span>

              <h2 className="mt-6 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                El espacio adecuado puede{" "}
                <span className="text-[#ff5269]">cambiarlo todo.</span>
              </h2>

              <p className="mt-5 max-w-xl leading-8 text-slate-300">
                Encuentra tu lugar, organiza tu tiempo y dale vida a tus ideas.
                Tu próximo gran proyecto puede comenzar hoy.
              </p>
            </div>

            <Link
              href="/spaces"
              className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#F51D3D] px-7 py-4 font-bold text-white shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:bg-[#dc1734]"
            >
              Explorar catálogo
              <span className="text-xl">→</span>
            </Link>
          </div>
        </div>
      </section>
   
    </main>
  );
}