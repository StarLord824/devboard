import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import dotenv from "dotenv";
import * as cookie from "cookie";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import prisma from "@devboard/db/prismaClient";

dotenv.config();

// ── Wire protocol constants (must match y-websocket client) ───────────────────
const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

// ── In-memory doc registry ────────────────────────────────────────────────────
interface DocState {
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  conns: Map<WebSocket, Set<number>>; // conn → clientIds it owns
}

const docs = new Map<string, DocState>();
const writeTimers = new Map<string, ReturnType<typeof setTimeout>>();
const inflight = new Map<string, Promise<DocState>>();

async function writeToDB(pageId: string, doc: Y.Doc): Promise<void> {
  const state = Buffer.from(Y.encodeStateAsUpdate(doc));
  await prisma.page
    .update({ where: { id: pageId }, data: { yjsState: state } })
    .catch((err) => console.error("[WS] DB write failed:", err));
}

async function getOrCreateDoc(pageId: string): Promise<DocState> {
  if (docs.has(pageId)) return docs.get(pageId)!;
  if (inflight.has(pageId)) return inflight.get(pageId)!;

  const promise = (async (): Promise<DocState> => {
    const doc = new Y.Doc({ gc: true });
    const awareness = new awarenessProtocol.Awareness(doc);
    const conns = new Map<WebSocket, Set<number>>();
    const state: DocState = { doc, awareness, conns };

    // Load persisted state
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (page?.yjsState) {
      Y.applyUpdate(doc, page.yjsState as Uint8Array);
    }

    // Broadcast updates + schedule 30s DB write
    doc.on("update", (update: Uint8Array, origin: unknown) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);
      conns.forEach((_, conn) => {
        if (conn !== origin && conn.readyState === WebSocket.OPEN) {
          conn.send(message);
        }
      });
      const existing = writeTimers.get(pageId);
      if (existing) clearTimeout(existing);
      writeTimers.set(
        pageId,
        setTimeout(() => {
          writeToDB(pageId, doc);
          writeTimers.delete(pageId);
        }, 30_000)
      );
    });

    // Broadcast awareness changes to all conns
    awareness.on(
      "update",
      (
        { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
        origin: unknown
      ) => {
        if (origin instanceof WebSocket) {
          const ownedIds = conns.get(origin);
          if (ownedIds) added.forEach((id) => ownedIds.add(id));
        }
        const changedClients = added.concat(updated).concat(removed);
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
        encoding.writeVarUint8Array(
          encoder,
          awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
        );
        const message = encoding.toUint8Array(encoder);
        conns.forEach((_, conn) => {
          if (conn.readyState === WebSocket.OPEN) conn.send(message);
        });
      }
    );

    docs.set(pageId, state);
    return state;
  })();

  inflight.set(pageId, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(pageId);
  }
}

function setupConnection(conn: WebSocket, pageId: string, state: DocState): void {
  const { doc, awareness, conns } = state;
  conns.set(conn, new Set());

  // Sync step 1 — send our state vector so client can reply with what we're missing
  const syncEncoder = encoding.createEncoder();
  encoding.writeVarUint(syncEncoder, MESSAGE_SYNC);
  syncProtocol.writeSyncStep1(syncEncoder, doc);
  conn.send(encoding.toUint8Array(syncEncoder));

  // Send current awareness states to the new client
  const awarenessStates = awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awarenessStates.keys()))
    );
    conn.send(encoding.toUint8Array(awarenessEncoder));
  }

  conn.on("message", (data: Buffer) => {
    try {
      const decoder = decoding.createDecoder(new Uint8Array(data));
      const messageType = decoding.readVarUint(decoder);

      if (messageType === MESSAGE_SYNC) {
        const replyEncoder = encoding.createEncoder();
        encoding.writeVarUint(replyEncoder, MESSAGE_SYNC);
        const syncType = syncProtocol.readSyncMessage(decoder, replyEncoder, doc, conn);
        if (syncType === syncProtocol.messageYjsSyncStep1) {
          conn.send(encoding.toUint8Array(replyEncoder));
        }
      } else if (messageType === MESSAGE_AWARENESS) {
        awarenessProtocol.applyAwarenessUpdate(
          awareness,
          decoding.readVarUint8Array(decoder),
          conn
        );
      }
    } catch (err) {
      console.error("[WS] Message handling error:", err);
    }
  });

  conn.on("close", () => {
    const ownedIds = conns.get(conn);
    if (ownedIds && ownedIds.size > 0) {
      awarenessProtocol.removeAwarenessStates(awareness, Array.from(ownedIds), null);
    }
    conns.delete(conn);

    if (conns.size === 0) {
      const timer = writeTimers.get(pageId);
      if (timer) {
        clearTimeout(timer);
        writeTimers.delete(pageId);
      }
      writeToDB(pageId, doc).finally(() => docs.delete(pageId));
    }
  });
}

// ── HTTP + WS server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3002;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("[WS] Devboard collaboration server");
});

const wss = new WebSocketServer({ noServer: true });

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

    const pathname = new URL(request.url ?? "/", "ws://x").pathname;
    const pageId = pathname.split("/").filter(Boolean).pop() ?? "";
    if (!pageId) {
      socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
      socket.destroy();
      return;
    }

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { boardId: true },
    });
    if (!page) {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }

    const isMember =
      (await prisma.board.count({
        where: { id: page.boardId, ownerId: session.user.id },
      })) > 0 ||
      (await prisma.boardMember.count({
        where: { boardId: page.boardId, userId: session.user.id },
      })) > 0;

    if (!isMember) {
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      socket.destroy();
      return;
    }

    const docState = await getOrCreateDoc(pageId);

    wss.handleUpgrade(request, socket, head, (ws) => {
      console.log(`[WS] ${session.user.email} joined page ${pageId}`);
      setupConnection(ws, pageId, docState);
    });
  } catch (error) {
    console.error("[WS] Upgrade error:", error);
    socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`[WS] Server listening on port ${PORT}`);
});
