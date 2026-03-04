import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["error"],
  datasourceUrl: process.env.DATABASE_URL!,
});

prisma.$connect().catch(console.error);
