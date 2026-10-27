"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

function LayoutContentInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Las páginas de autenticación tienen su propio diseño.
  const isAuthPage =
    pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
    </>
  );
}

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<>{children}</>}>
      <LayoutContentInner>{children}</LayoutContentInner>
    </Suspense>
  );
}
