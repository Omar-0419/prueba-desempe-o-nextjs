
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-6 text-[#142238]">
      <section className="w-full max-w-xl text-center">
        <Link href="/" className="text-3xl font-black tracking-tight">
          Co<span className="text-[#F51D3D]">Space</span>
        </Link>

        <div className="mt-12">
          <p className="text-8xl font-black tracking-tight text-[#F51D3D] sm:text-9xl">
            404
          </p>

          <h1 className="mt-5 text-3xl font-black sm:text-4xl">
            ¡Ups! Te has perdido.
          </h1>

          <p className="mx-auto mt-4 max-w-md leading-7 text-gray-500">
            La página que buscas no existe o fue movida.
            Pero todavía puedes encontrar tu espacio ideal en CoSpace.
          </p>
        </div>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl bg-[#F51D3D] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#d91834]"
          >
            Volver al inicio
          </Link>

          <Link
            href="/spaces"
            className="rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold transition hover:border-[#F51D3D] hover:text-[#F51D3D]"
          >
            Explorar espacios
          </Link>
        </div>

        <p className="mt-12 text-xs text-gray-400">
          CoSpace · Encuentra tu lugar ideal
        </p>
      </section>
    </main>
  );
}
