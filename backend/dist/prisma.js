import { PrismaClient } from '@prisma/client';
const prisma = global.__prismaClient ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production')
    global.__prismaClient = prisma;
export default prisma;
//# sourceMappingURL=prisma.js.map