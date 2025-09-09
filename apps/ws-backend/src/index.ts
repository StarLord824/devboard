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

const users: z.infer<typeof userStateSchema>[] = [];
// const boards: z.infer<typeof boardStateSchema>[] = [];

wss.on("connection", async (ws : WebSocket, request) => {
  
  const userId = authMiddleware(ws, request);
  if(!userId){
    console.log('Unauthorized')
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
    const operation = parsedData.type
    if(operation === "create-board"){
      createBoard(ws, request, parsedData, users)
      ws.send('create-board'); 
    }
    else if(operation === "join-board"){
      joinBoard(ws, request, parsedData, users);
      ws.send('join-board');
    }
    else if(operation === "leave-board"){
      leaveBoard(ws, request, parsedData, users);
      ws.send('leave-board');
    }
    else if(operation === "delete-board"){
      deleteBoard(ws, request, parsedData, users);
      ws.send('delete-board');
    }
    else if(operation === "chat"){
      chat( ws, request, parsedData, users);
      ws.send('chat');
    } 
    else {
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

