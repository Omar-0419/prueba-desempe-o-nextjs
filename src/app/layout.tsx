
import type { Metadata } from "next";
import "./globals.css";
import LayoutContent from "@/components/LayoutContent";

export const metadata: Metadata = {
  title: "CoSpace",
  description: "Reserva tu espacio de trabajo ideal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
