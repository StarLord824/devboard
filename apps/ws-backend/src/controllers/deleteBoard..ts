import { WebSocket } from "ws";
import { z } from "zod";
import { parsedDataSchema, userStateSchema } from "../types";
import { prisma } from "@devboard/db/prismaClient";

export default async function (ws : WebSocket, request: any, parsedData: z.infer<typeof parsedDataSchema>, users: z.infer<typeof userStateSchema>[]) {
    //find the user in the users array and remove the boardId from the boards array,
    //if user is not in the array, do nothing
    const boardId = parsedData.boardId;
    const userId = parsedData.userId;

    try{
        //remove board from db
        await prisma.board.delete({
        where: {
            id: boardId
        }
        });
        const user = users.find( (user) => user.userId === userId);
        if(!user) {
        return;
        } else {
        user.boards = user.boards.filter( (board: string) => board !== boardId);
        }
    } catch(error){
        console.log(`Error deleting board: ${error}`);
        ws.send(JSON.stringify({
            type: "error",
            message: "Error deleting board"
        }));
        return; 
    }
}