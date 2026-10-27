
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export default function Navbar() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const checkSession = useCallback(async () => {
    try {
      // El servidor verifica la cookie HttpOnly.
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession, pathname]);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("No se pudo cerrar la sesión.");
      }

      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al cerrar sesión."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (

    <header className="border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-black tracking-tight">
          Co<span className="text-[#F51D3D]">Space</span>
        </Link>

        <div className="flex items-center gap-4 text-sm font-semibold">
          <Link
            href="/spaces"
            className="hidden text-[#142238] transition hover:text-[#F51D3D] sm:block"
          >
            Explorar espacios
          </Link>

          {!checked ? (
            <div
              className="h-9 w-24 animate-pulse rounded-lg bg-gray-100"
              aria-label="Verificando sesión"
            />
          ) : user ? (
            <>
              {user.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="hidden text-[#142238] hover:text-[#F51D3D] sm:block"
                >
                  Administración
                </Link>
              ) : null}

              <Link
                href="/dashboard"
                className="text-[#142238] hover:text-[#F51D3D]"
              >
                Mi cuenta
              </Link>

              <span className="hidden text-gray-500 md:inline">
                {user.name}
              </span>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-xl border border-gray-200 px-4 py-2.5 transition hover:border-[#F51D3D] hover:text-[#F51D3D] disabled:opacity-50"
              >
                {loggingOut ? "Saliendo..." : "Cerrar sesión"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[#142238] transition hover:text-[#F51D3D]"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-[#F51D3D] px-4 py-2.5 text-white transition hover:bg-red-600"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>

  );
}
