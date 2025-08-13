import { WebSocket, WebSocketServer } from "ws";
import http from "http";
import { authMiddleware } from "./authMiddleware";
import {z} from "zod";
//http server
const server = http.createServer();

//ws server
const wss = new WebSocketServer({ server });


//global state
const userStateSchema = z.object({
  userId: z.string(),
  WebSocket : z.any(), // Accept any type (WebSocket instance)
  boards : z.array(z.string()),
})
const boardStateSchema = z.object({
  boardId: z.string(),
  users : z.array(z.string()),
})

const users: z.infer<typeof userStateSchema>[] = [];
// const boards: z.infer<typeof boardStateSchema>[] = [];

wss.on("connection", (ws, request) => {
  
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
  ws.on("message", (data) => {
    const parsedData = JSON.parse(data as unknown as string);
    
    if(parsedData.type === "join-board"){
      //find the user in the users array and add the boardId to the boards array,
      //if user is not in the array, add new user to the array
      const boardId = parsedData.boardId;
      const userId = parsedData.userId;
      
      const user =users.find( (user) => user.userId === userId);
      if(!user) {
        users.push({
          userId,
          WebSocket: ws,
          boards: [boardId]
        })
      } else {
        user.boards.push(boardId);
      }
    }
    else if(parsedData.type === "leave-board"){
      //find the user in the users array and remove the boardId from the boards array,
      //if user is not in the array, do nothing
      const boardId = parsedData.boardId;
      const userId = parsedData.userId;

      const user =users.find( (user) => user.userId === userId);
      if(!user) {
        return;
      } else {
        user.boards = user.boards.filter( (board) => board !== boardId);
      }
    }

    if(parsedData.type === "chat"){
      const userId = parsedData.userId;
      const message = parsedData.message;
      const boardId = parsedData.boardId;

      //all users haveing this boards should receive the message
      users.filter( (user) => user.boards.includes(boardId)).forEach( (user) => {
        user.WebSocket.send(JSON.stringify({
          type: "chat",
          from : userId,
          messgae : message,
          board : boardId,
        }));
      });
    }
  });
});

server.listen(8080, () => {
  console.log("Server is listening on port 8080");
});

