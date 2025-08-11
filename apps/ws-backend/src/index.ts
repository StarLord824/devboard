import { WebSocket, WebSocketServer } from "ws";
import http from "http";
import { authMiddleware } from "./authMiddleware";

//http server
const server = http.createServer();

//ws server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, request) => {
  authMiddleware(ws, request);

  console.log("New client connected to the WebSocket server");
  ws.on("message", (data) => {
    const message = data.toString();
    console.log(message);
    ws.send("Received the message on server: " + data);
  });
});

server.listen(8080, () => {
  console.log("Server is listening on port 8080");
});

