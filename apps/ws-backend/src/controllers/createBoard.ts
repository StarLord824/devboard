import { prisma } from "@devboard/db/prismaClient";
import { WebSocket } from "ws";
import { z } from "zod";
import { parsedDataSchema, userStateSchema } from "../types";

export default async function (ws : WebSocket, request: any, parsedData: z.infer<typeof parsedDataSchema>, users: z.infer<typeof userStateSchema>[]) {

    const boardId = parsedData.boardId;
    const userId = parsedData.userId;

    //check if board exists in db
    const board = await prisma.board.findUnique({
    where: {
        slug: boardId
    }
    });
    if(board){
    ws.send(JSON.stringify({
        type: "error",
        message: "Board with this slug already exists"
    }));
    return;
    }

    //create board in db

    //find the user in the users array and add the boardId to the boards array,
    //if user is not in the array, add new user to the array
    const user = users.find( (user) => user.userId === userId);
    if(!user) {
    users.push({
        userId,
        WebSocket: ws,
        boards: [boardId]
    })
    } else {
    //check if the board is already in the array
    if(!user.boards.includes(boardId)){
        user.boards.push(boardId);
    }
    }
}