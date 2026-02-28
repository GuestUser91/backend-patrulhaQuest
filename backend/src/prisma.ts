import { PrismaClient } from '@prisma/client';

// Ensure a single PrismaClient instance in development to avoid exhausting connection pool
declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

const prisma = global.__prismaClient ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.__prismaClient = prisma;

export default prisma;
