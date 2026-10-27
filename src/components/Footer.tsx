"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  // Obtenemos el año después del montaje para evitar errores de prerenderizado.
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-5">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-gray-500 sm:flex-row">
        <p>
          © {year ?? "2026"} CoSpace. Todos los derechos reservados.
        </p>

        <Link
          href="/spaces"
          className="transition-colors hover:text-blue-600"
        >
          Explorar espacios
        </Link>
      </div>
    </footer>
  );
}
