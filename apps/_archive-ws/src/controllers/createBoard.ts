import prisma from "@devboard/db/prismaClient";
import { WebSocket } from "ws";
import { z } from "zod";
import { parsedDataSchema, userStateSchema } from "../utils/types";
import axios from "axios";

export default async function (
  ws: WebSocket,
  request: any,
  parsedData: z.infer<typeof parsedDataSchema>,
  users: z.infer<typeof userStateSchema>[]
) {
  const slug = parsedData.slug;
  const userId = parsedData.userId;

  try {
    //check if board exists in db
    // const board = await prisma.board.findUnique({
    //   where: {
    //     slug,
    //   },
    // });
    // if (board) {
    //   ws.send(
    //     JSON.stringify({
    //       type: "error",
    //       message: "Board with this slug already exists",
    //     })
    //   );
    //   return;
    // }

    //create board in db by hitting http-backend
    const res = await axios.post<{
        newBoard: { slug: string; admin: string; id: string }
      }>(
        "http://localhost:8000/api/v1/create-board",
        {
          slug,
          admin: userId,
        }
    )
    const { newBoard } = res.data;
    // const newBoard = await prisma.board.create({
    //   data: {
    //     slug,
    //     adminId: userId,
    //     participants: {
    //       connect: [
    //         {
    //           id: userId,
    //         },
    //       ],
    //     },
    //     Chats: {
    //       connect: [],
    //     },
    //   },
    // });
    //find the user in the users array and add the boardId to the boards array,
    //if user is not in the array, add new user to the array
    const user = users.find((user) => user.userId === userId);
    if (!user) {
      users.push({
        userId,
        WebSocket: ws,
        boards: [newBoard.id],
      });
    } else {
      console.log(`newBoard :`, JSON.stringify(newBoard));
      user.boards.push(newBoard.id);
    }
  } catch (err) {
    console.log("Error connecting the DB", err);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Error creating board",
      })
    );
    return;
  }
}
