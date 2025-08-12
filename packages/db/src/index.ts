import { PrismaClient } from '@prisma/client';

//singleton prisma client

export const prisma = new PrismaClient();