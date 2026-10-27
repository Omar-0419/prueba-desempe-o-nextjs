//Instancia reutilizable de Prisma para evitar múltiples conexiones durante el desarrollo.

//Next.js puede recargar módulos muchas veces durante el desarrollo. Esta configuración reutiliza la misma instancia de Prisma en lugar de crear una nueva cada vez.

import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}