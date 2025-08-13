import { prisma } from "@devboard/db/prismaClient";
import { boardSchema, userSchema } from "@devboard/common/types";
import { z } from "zod";

export const createUser = async (user: z.infer<typeof userSchema>) => {
    return await prisma.user.create({
        data: {
            username: user.username,
            name: user.name,
            email: user.email,
            password: user.password,
        }
    });
}

export const getUser = async (username: string) => {
    return await prisma.user.findUnique({
        where: {
            username: username
        }
    });
}

export const createBoard = async (board: z.infer<typeof boardSchema>) => {
    return await prisma.board.create({
        data: {
            slug: board.slug,
            admin: {
                connect: { id: board.admin }
            },
            participants: {
                connect: board.participants.map((participant) => ({ id: participant }))
            },
        }
    });
}

export const getBoard = async (slug: string) => {
    return await prisma.board.findUnique({
        where: {
            slug: slug
        }
    });
}

