
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ?? data.message ?? "No se pudo iniciar sesión.",
        );
        return;
      }

      // El backend determina el rol; no confiamos en un rol enviado desde el formulario.
      if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else if (data.user?.role === "USER") {
        router.push("/dashboard");
      } else {
        setError("La cuenta inició sesión, pero no se reconoció su rol.");
      }
    } catch {
      setError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F8F9FB] px-5 py-10">
      {/* Decoración */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-red-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white bg-white shadow-2xl shadow-slate-200/70 lg:grid-cols-2">
        {/* Panel visual */}
        <section className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden bg-[#142238] p-12 text-white lg:flex xl:p-16">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-br from-[#142238] via-[#142238]/90 to-[#F51D3D]/40" />

          <Link href="/" className="relative z-10 w-fit">
            <span className="text-[25px] font-black tracking-tight text-white">
              Co<span className="text-[#F51D3D]">Space</span>
            </span>
          </Link>

          <div className="relative z-10 max-w-md">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-200">
              Nos alegra tenerte aquí
            </span>

            <h1 className="mt-7 text-5xl font-black leading-tight tracking-tight xl:text-6xl">
              Tu próximo gran día de trabajo{" "}
              <span className="text-[#ff5269]">comienza aquí.</span>
            </h1>

            <p className="mt-6 text-base leading-8 text-slate-300">
              Accede a tu cuenta y continúa descubriendo espacios para
              concentrarte, colaborar y hacer crecer tus ideas.
            </p>

            <div className="mt-10 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md">
              <p className="mt-1 text-lg font-semibold leading-8">
                Encuentra el lugar adecuado y deja que tus ideas hagan el
                resto.
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                La experiencia CoSpace
              </p>
            </div>
          </div>
        </section>

        {/* Formulario de acceso conectado al backend */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-10 xl:px-16">
          <div className="w-full max-w-md">
            <Link href="/" className="inline-block lg:hidden">
              <span className="text-[25px] font-black tracking-tight text-[#142238]">
                Co<span className="text-[#F51D3D]">Space</span>
              </span>
            </Link>

            <div className="mt-8 lg:mt-0">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#F51D3D]">
                Bienvenido de nuevo
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#142238] sm:text-4xl">
                Inicia sesión
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Ingresa tus datos para continuar con tu experiencia CoSpace.
              </p>
            </div>

            <form className="mt-9 space-y-6" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-[#142238]"
                >
                  Correo electrónico
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@correo.com"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-[#142238] outline-none transition placeholder:text-slate-400 focus:border-[#F51D3D] focus:bg-white focus:ring-4 focus:ring-red-50"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="text-sm font-bold text-[#142238]"
                  >
                    Contraseña
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-[#F51D3D] transition hover:text-[#dc1734]"
                  >
                    ¿La olvidaste?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 pr-20 text-sm text-[#142238] outline-none transition placeholder:text-slate-400 focus:border-[#F51D3D] focus:bg-white focus:ring-4 focus:ring-red-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 transition hover:text-[#F51D3D]"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#F51D3D] px-5 py-4 font-bold text-white shadow-lg shadow-red-100 transition hover:-translate-y-0.5 hover:bg-[#dc1734] focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Ingresando..." : "Iniciar sesión"}
                {!loading && <span className="text-xl">→</span>}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">
                ¿Eres nuevo en CoSpace?
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-[#142238] transition hover:border-[#F51D3D] hover:bg-red-50 hover:text-[#F51D3D]"
            >
              Crear una cuenta
            </Link>

            <p className="mt-8 text-center text-xs leading-6 text-slate-400">
              Al continuar, accedes a tu cuenta de CoSpace.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
