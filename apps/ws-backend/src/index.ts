import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import http from "http";

//http server
const server = http.createServer();

//ws server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
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