import { prisma } from "@devboard/db/prismaClient";
import {Request, Response} from "express";
import { z } from "zod";
export default async function (req : Request, res : Response) {

    //validate the request
    const reqSchema = z.object({
        boardId: z.number(),
    });
    if(!reqSchema.safeParse(req.params).success){
        res.status(400).send("Invalid request, send correct params");
        return;
    }
    
    const boardId = req.params.boardId;
    //bring last 50 messages
    const chats = await prisma.board.findMany({
        where: {
            id: boardId
        },
        take: 50,
        orderBy: {
            id: "desc"
        }
    });
    console.log(`Sent the chats of board ${boardId}`)
    res.status(200).send({chats});
}