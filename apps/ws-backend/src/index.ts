import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import http from "http";

//http server
const server = http.createServer();

//ws server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    console.log(message);
  });
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});