import { prisma } from "@devboard/db/prismaClient";

export const createUser = async (user: any) => {
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

