import { WebSocketServer } from "ws";
import http from "http";
import dotenv from "dotenv";
import * as cookie from "cookie";
import prisma from "@devboard/db/prismaClient";

dotenv.config();

const PORT = process.env.PORT || 3002;
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("[WS] Server is running (v2)");
});

const wss = new WebSocketServer({ noServer: true });

// Handle upgrade
server.on("upgrade", async (request, socket, head) => {
  const cookies = cookie.parse(request.headers.cookie || "");
  const sessionToken =
    cookies["better-auth.session_token"] ||
    cookies["__Secure-better-auth.session_token"];

  if (!sessionToken) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    // Attach user to request so it can be used later if needed
    (request as any).user = session.user;

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } catch (error) {
    console.error("WS Upgrade Error:", error);
    socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
    socket.destroy();
  }
});

wss.on("connection", (conn, req) => {
  const user = (req as any).user;
  console.log(`User ${user?.id} (${user?.email}) connected via WS`);

  // Usually /boardId
  const urlParts = req.url?.split("/") || [];
  const docName = urlParts[urlParts.length - 1] || "global";

  console.log(`[WS] Connection opened for workspace document: ${docName}`);
  // Phase 4 will implement actual Yjs syncing via y-websocket here.
  
  conn.on("message", (msg) => {
    // Basic echo for now
    conn.send(`Echo: ${msg}`);
  });
});

server.listen(PORT, () => {
  console.log(`[WS] Server is listening on port ${PORT}`);
});
