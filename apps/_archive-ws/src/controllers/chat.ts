import { WebSocket } from "ws";
import { z } from "zod";
import { parsedDataSchema, userStateSchema } from "../utils/types";

export default async function (
  ws: WebSocket,
  request: any,
  parsedData: z.infer<typeof parsedDataSchema>,
  users: z.infer<typeof userStateSchema>[]
) {
  const userId = parsedData.userId;
  const message = parsedData.message;
  const boardId = parsedData.boardId;

  //all users haveing this boards should receive the message, except the sender
  users.forEach((user) => {
    if (user.boards.includes(boardId) && user.userId !== userId) {
      user.WebSocket.send(
        JSON.stringify({
          type: "chat",
          message,
          sender: userId,
          recipient: user.userId,
          board: boardId,
        })
      );
    }
  });
}
