import { WebSocketServer } from "ws";
import http from "http";
import dotenv from "dotenv";
import * as Y from "yjs";
import { setupWSConnection } from "y-websocket/bin/utils";

dotenv.config();

const PORT = process.env.PORT || 3002;
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("[WS] Server is running (v2)");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (conn, req) => {
  console.log("New connection established");
  // For Phase 1 we pass documentName as 'global' just to test
  setupWSConnection(conn, req, { docName: "global", gc: true });
});

server.listen(PORT, () => {
  console.log(`[WS] Server is listening on port ${PORT}`);
});
