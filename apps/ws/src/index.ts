import { WebSocket, WebSocketServer } from "ws";
import http from "http";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";

// Store Y.Doc instances per room
const docs = new Map<string, Y.Doc>();
const awareness = new Map<string, awarenessProtocol.Awareness>();

// HTTP server
const server = http.createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("DevBoard WS Server");
});

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket, req) => {
  // Extract room name from URL (e.g., /board-demo-board)
  const roomName = req.url?.slice(1) || "default";
  
  console.log(`Client connected to room: ${roomName}`);

  // Get or create Y.Doc for this room
  if (!docs.has(roomName)) {
    const doc = new Y.Doc();
    docs.set(roomName, doc);
    
    const aware = new awarenessProtocol.Awareness(doc);
    awareness.set(roomName, aware);
  }

  const doc = docs.get(roomName)!;
  const aware = awareness.get(roomName)!;

  // Send initial sync
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, 0); // messageSync
  syncProtocol.writeSyncStep1(encoder, doc);
  ws.send(encoding.toUint8Array(encoder));

  // Handle incoming messages
  ws.on("message", (message: Buffer) => {
    const decoder = decoding.createDecoder(new Uint8Array(message));
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case 0: // sync
        encoding.writeVarUint(encoder, 0);
        const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, doc, ws);
        if (encoding.length(encoder) > 1) {
          // Broadcast to all clients in the room
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(encoding.toUint8Array(encoder));
            }
          });
        }
        break;
      case 1: // awareness
        awarenessProtocol.applyAwarenessUpdate(aware, decoding.readVarUint8Array(decoder), ws);
        break;
    }
  });

  // Handle awareness updates
  const awarenessChangeHandler = ({ added, updated, removed }: any, origin: any) => {
    const changedClients = added.concat(updated).concat(removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, 1); // awareness message
    encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(aware, changedClients));
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(encoding.toUint8Array(encoder));
      }
    });
  };

  aware.on("update", awarenessChangeHandler);

  ws.on("close", () => {
    aware.off("update", awarenessChangeHandler);
    awarenessProtocol.removeAwarenessStates(aware, [aware.clientID], null);
    console.log(`Client disconnected from room: ${roomName}`);
  });
});

server.listen(8080, () => {
  console.log("WebSocket Server is listening on port 8080");
});
