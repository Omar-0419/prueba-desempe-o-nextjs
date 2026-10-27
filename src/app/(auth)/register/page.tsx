
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? data.error ?? "No se pudo crear la cuenta.");
        return;
      }

      setSuccess("Cuenta creada correctamente. Ahora puedes iniciar sesión.");

      // Damos tiempo para que el usuario lea el mensaje.
      window.setTimeout(() => router.push("/login"), 1000);
    } catch {
      setError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F8F9FB] px-5 py-10">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-red-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white bg-white shadow-2xl shadow-slate-200/70 lg:grid-cols-2">
        <section className="relative hidden min-h-[700px] flex-col justify-between overflow-hidden bg-[#142238] p-12 text-white lg:flex xl:p-16">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85')",
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
              Tu espacio, tus ideas
            </span>
            <h1 className="mt-7 text-5xl font-black leading-tight tracking-tight xl:text-6xl">
              Todo gran proyecto comienza con un{" "}
              <span className="text-[#ff5269]">buen espacio.</span>
            </h1>
            <p className="mt-6 text-base leading-8 text-slate-300">
              Únete a CoSpace y descubre una nueva forma de trabajar,
              conectar y hacer realidad tus ideas.
            </p>
            <div className="mt-9 space-y-4">
              {[
                "Encuentra espacios para cada necesidad",
                "Organiza tus jornadas de trabajo",
                "Descubre nuevas posibilidades",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-[#ff5269]">
                    ✓
                  </span>
                  <span className="text-sm font-medium text-slate-200">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-400">
            © 2026 CoSpace. Espacio para trabajar mejor.
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-10 xl:px-16">
          <div className="w-full max-w-md">
            <Link href="/" className="inline-block lg:hidden">
              <span className="text-[25px] font-black tracking-tight text-[#142238]">
                Co<span className="text-[#F51D3D]">Space</span>
              </span>
            </Link>

            <div className="mt-8 lg:mt-0">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#F51D3D]">
                Comienza hoy
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#142238] sm:text-4xl">
                Crea tu cuenta
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Regístrate para descubrir los espacios que se adaptan a ti.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleRegister}>
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-bold text-[#142238]">
                  Nombre completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Tu nombre completo"
                  required
                  minLength={2}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-[#142238] outline-none transition placeholder:text-slate-400 focus:border-[#F51D3D] focus:bg-white focus:ring-4 focus:ring-red-50"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-bold text-[#142238]">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@correo.com"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-[#142238] outline-none transition placeholder:text-slate-400 focus:border-[#F51D3D] focus:bg-white focus:ring-4 focus:ring-red-50"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-bold text-[#142238]">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    minLength={8}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-20 text-sm text-[#142238] outline-none transition placeholder:text-slate-400 focus:border-[#F51D3D] focus:bg-white focus:ring-4 focus:ring-red-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 transition hover:text-[#F51D3D]"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Utiliza al menos 8 caracteres.
                </p>
              </div>

              {error && (
                <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {success && (
                <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#F51D3D] px-5 py-4 font-bold text-white shadow-lg shadow-red-100 transition hover:-translate-y-0.5 hover:bg-[#dc1734] focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creando cuenta..." : "Crear mi cuenta"}
                {!loading && <span className="text-xl">→</span>}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">¿Ya tienes cuenta?</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-[#142238] transition hover:border-[#F51D3D] hover:bg-red-50 hover:text-[#F51D3D]"
            >
              Iniciar sesión
            </Link>

            <p className="mt-7 text-center text-xs leading-6 text-slate-400">
              Al registrarte podrás comenzar a explorar CoSpace.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
