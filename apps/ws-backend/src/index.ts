import { WebSocket, WebSocketServer } from "ws";
import { authMiddleware } from "./authMiddleware";
import http from "http";
import {z} from "zod";
import createBoard from "./controllers/createBoard";
import joinBoard from "./controllers/joinBoard";
import leaveBoard from "./controllers/leaveBoard";
import deleteBoard from "./controllers/deleteBoard.";
import chat from "./controllers/chat";
import { parsedDataSchema, userStateSchema } from "./types";
//http server
const server = http.createServer();

//ws server
const wss = new WebSocketServer({ server });


//global state


const users: z.infer<typeof userStateSchema>[] = [];
// const boards: z.infer<typeof boardStateSchema>[] = [];

wss.on("connection", async (ws : WebSocket, request) => {
  
  const userId = authMiddleware(ws, request);
  if(!userId){
    ws.close();
    return;
  }

  users.push({
    userId,
    WebSocket: ws,
    boards: [],
  });

  console.log("New client connected to the WebSocket server");
  ws.on("message", async (data) => {
    const parsedData : z.infer<typeof parsedDataSchema> = JSON.parse(data as unknown as string);

    if(parsedData.type === "create-board"){
      createBoard(ws, request, parsedData, users)
    }
    else if(parsedData.type === "join-board"){
      joinBoard(ws, request, parsedData, users);
    }
    else if(parsedData.type === "leave-board"){
      leaveBoard(ws, request, parsedData, users);
    }
    else if(parsedData.type === "delete-board"){
      deleteBoard(ws, request, parsedData, users);
    }
    else if(parsedData.type === "chat"){
      chat( ws, request, parsedData, users);
    } else {
      ws.send(JSON.stringify({
        type: "error",
        message: "Invalid message type"
      }));
    }
  });
});

server.listen(8080, () => {
  console.log("Server is listening on port 8080");
});

