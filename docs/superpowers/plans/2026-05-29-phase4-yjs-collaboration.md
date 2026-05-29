# Phase 4 — Yjs Collaboration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire real-time multi-user collaboration into the devboard canvas using Yjs, with full DB persistence via `Page.yjsState`, live peer cursors, and per-client undo/redo.

**Architecture:** Each page gets its own `Y.Doc`. The WS server speaks the y-websocket wire protocol (sync + awareness) implemented directly using `y-protocols` and `lib0` — y-websocket v3 removed the old `bin/utils.js` server helper. `CanvasEngine.ts` is untouched; only `CanvasLayers.tsx` changes its data source from local `useState` to Y.Map/Y.Array observers.

**Tech Stack:** `yjs`, `y-websocket` (WebsocketProvider client), `y-protocols` (server sync/awareness), `lib0` (encoding), Prisma (`Page.yjsState Bytes?`), `ws` (WebSocket server)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `apps/ws/package.json` | Modify | Add `y-protocols` and `lib0` as direct deps |
| `apps/ws/src/index.ts` | Modify | Full Yjs sync server with Prisma persistence |
| `apps/frontend/src/components/canvas/CanvasEngine.ts` | Modify | Add optional `onAwarenessUpdate` callback to options |
| `apps/frontend/src/app/board/[boardId]/BoardClient.tsx` | Modify | Pass `activePageId` to `CanvasLayers` |
| `apps/frontend/src/components/canvas/CanvasLayers.tsx` | Modify | Replace useState with Y.Doc + observers + cursors + undo |
| `apps/frontend/src/components/canvas/CanvasTopbar.tsx` | Modify | Add `canUndo`/`canRedo` props and buttons |

---

## Task 1: Add Direct Dependencies to WS Server

`y-protocols` and `lib0` are currently transitive deps of `y-websocket`. pnpm strict hoisting means you cannot import them without declaring them directly.

**Files:**
- Modify: `apps/ws/package.json`

- [ ] **Step 1: Add deps**

Run from workspace root:
```bash
pnpm --filter ws add y-protocols lib0
```

- [ ] **Step 2: Verify resolution**

```bash
cd apps/ws && node -e "require('y-protocols/sync'); require('lib0/encoding'); console.log('OK')"
```

Expected output: `OK`

- [ ] **Step 3: Commit**

```bash
git add apps/ws/package.json pnpm-lock.yaml
git commit -m "chore(ws): add y-protocols and lib0 as direct deps"
```

---

## Task 2: Implement Yjs WebSocket Server

Replace the echo stub in `apps/ws/src/index.ts` with the full Yjs sync + awareness protocol and Prisma persistence.

**Files:**
- Modify: `apps/ws/src/index.ts`

- [ ] **Step 1: Replace `apps/ws/src/index.ts` with the full implementation**

```typescript
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

async function writeToDB(pageId: string, doc: Y.Doc): Promise<void> {
  const state = Buffer.from(Y.encodeStateAsUpdate(doc));
  await prisma.page
    .update({ where: { id: pageId }, data: { yjsState: state } })
    .catch((err) => console.error("[WS] DB write failed:", err));
}

async function getOrCreateDoc(pageId: string): Promise<DocState> {
  if (docs.has(pageId)) return docs.get(pageId)!;

  const doc = new Y.Doc({ gc: true });
  const awareness = new awarenessProtocol.Awareness(doc);
  const conns = new Map<WebSocket, Set<number>>();
  const state: DocState = { doc, awareness, conns };
  docs.set(pageId, state);

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
    // Debounced persistence
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
      // Track which clientIds each conn owns
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

  return state;
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
        // readSyncMessage reads the sub-type, applies updates (origin=conn), writes step2 reply if needed
        const syncType = syncProtocol.readSyncMessage(decoder, replyEncoder, doc, conn);
        // Only send the reply for step1 (step2 response). step2/update are handled by doc.on('update')
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
      // Last client left — cancel debounced timer and persist immediately
      const timer = writeTimers.get(pageId);
      if (timer) {
        clearTimeout(timer);
        writeTimers.delete(pageId);
      }
      writeToDB(pageId, doc).then(() => docs.delete(pageId));
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
  // 1. Session auth
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

    // 2. Extract pageId from URL: ws://host/{pageId}
    const pageId = request.url?.split("/").filter(Boolean).pop() ?? "";
    if (!pageId) {
      socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
      socket.destroy();
      return;
    }

    // 3. Board membership check
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

    // 4. Upgrade and wire Yjs
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm --filter ws build
```

Expected: no errors. If you see `cannot find module 'y-protocols/sync'` or similar, run `pnpm install` first.

- [ ] **Step 3: Start dev server and verify it boots**

```bash
pnpm --filter ws dev
```

Expected log: `[WS] Server listening on port 3002`

- [ ] **Step 4: Commit**

```bash
git add apps/ws/src/index.ts apps/ws/package.json pnpm-lock.yaml
git commit -m "feat(ws): implement Yjs sync server with Prisma persistence"
```

---

## Task 3: CanvasEngine — Add onAwarenessUpdate Callback

Add one optional callback to `UseCanvasEngineOptions` and call it on every mouse move. No other engine changes.

**Files:**
- Modify: `apps/frontend/src/components/canvas/CanvasEngine.ts:20-26` (options interface)
- Modify: `apps/frontend/src/components/canvas/CanvasEngine.ts:625` (onMouseMove)

- [ ] **Step 1: Extend the options interface**

Find the `UseCanvasEngineOptions` interface (line ~20) and add the optional callback:

```typescript
interface UseCanvasEngineOptions {
  elements: Map<string, CanvasElement>;
  elementOrder: string[];
  onCommitElement: (element: CanvasElement) => void;
  onUpdateElement: (id: string, partial: Partial<CanvasElement>) => void;
  onDeleteElements: (ids: string[]) => void;
  onAwarenessUpdate?: (pos: { x: number; y: number }) => void;
}
```

- [ ] **Step 2: Destructure the new callback in `useCanvasEngine`**

Find the destructuring at the start of `useCanvasEngine` (the line that reads `onCommitElement, onUpdateElement, onDeleteElements`) and add `onAwarenessUpdate`:

```typescript
export function useCanvasEngine({
  elements,
  elementOrder,
  onCommitElement,
  onUpdateElement,
  onDeleteElements,
  onAwarenessUpdate,
}: UseCanvasEngineOptions) {
```

- [ ] **Step 3: Call `onAwarenessUpdate` at the top of `onMouseMove`**

Find the `onMouseMove` callback (line ~625). Add this as the FIRST line inside the callback body, before any early returns:

```typescript
const onMouseMove = useCallback(
  (e: React.MouseEvent) => {
    // Always broadcast world-space cursor position to collaborators
    const { wx, wy } = getWorldPos(e);
    onAwarenessUpdate?.({ x: wx, y: wy });

    // Pan
    if (isPanning.current && panStart.current) {
    // ... rest of existing code unchanged
```

- [ ] **Step 4: Add `onAwarenessUpdate` to the useCallback dependency array**

Find the dependency array at the end of `onMouseMove` (contains `zoom, getWorldPos, setCamera, ...`) and add `onAwarenessUpdate`:

```typescript
  [
    zoom,
    getWorldPos,
    setCamera,
    selectedElementIds,
    onUpdateElement,
    markDirty,
    onAwarenessUpdate,
  ],
);
```

- [ ] **Step 5: Verify TypeScript is happy**

```bash
pnpm --filter frontend build 2>&1 | grep -i error | head -10
```

Expected: no type errors in CanvasEngine.ts.

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/components/canvas/CanvasEngine.ts
git commit -m "feat(canvas): add onAwarenessUpdate callback to engine options"
```

---

## Task 4: BoardClient — Pass activePageId to CanvasLayers

`CanvasLayers` will need the active page ID to connect to the right Yjs doc. `BoardClient` already tracks `activePageId`.

**Files:**
- Modify: `apps/frontend/src/app/board/[boardId]/BoardClient.tsx:74`

- [ ] **Step 1: Add `pageId` prop to the `CanvasLayers` call**

Find line ~74 in `BoardClient.tsx`:
```tsx
<CanvasLayers boardId={boardId} />
```

Change it to:
```tsx
<CanvasLayers boardId={boardId} pageId={activePageId} />
```

- [ ] **Step 2: Verify TypeScript complains about missing prop** 

```bash
pnpm --filter frontend build 2>&1 | grep "pageId" | head -5
```

Expected: type error about `pageId` not existing on `CanvasLayers` props — this confirms the prop is wired correctly and will be resolved in Task 5.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/app/board/[boardId]/BoardClient.tsx
git commit -m "feat(board): pass activePageId to CanvasLayers"
```

---

## Task 5: CanvasLayers — Replace useState with Y.Doc + Observers

This is the core data-layer swap. The engine (`useCanvasEngine`) is not touched.

**Files:**
- Modify: `apps/frontend/src/components/canvas/CanvasLayers.tsx`

- [ ] **Step 1: Replace the entire file with the Yjs-backed version**

```tsx
"use client";

import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import type { CanvasElement } from "@/lib/canvas-types";
import { useCanvasEngine, COLOR_PALETTE } from "./CanvasEngine";
import { useCanvasStore } from "@/stores/canvasStore";
import { ToolType, BackgroundPattern } from "@/lib/canvas-types";
import { nanoid } from "nanoid";
import Toolbar from "./Toolbar";
import SettingsPanel from "./SettingsPanel";
import Minimap from "./Minimap";
import ZoomControls from "./ZoomControls";

const LAYER_STYLE: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  touchAction: "none",
};

interface CanvasLayersProps {
  boardId: string;
  pageId: string;
}

export default function CanvasLayers({ boardId, pageId }: CanvasLayersProps) {
  // ── Yjs shared document ────────────────────────────────────────────────────
  const ydoc = useMemo(() => new Y.Doc(), [pageId]);

  const provider = useMemo(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3002";
    return new WebsocketProvider(`${wsUrl}/${pageId}`, pageId, ydoc);
  }, [ydoc, pageId]);

  const yElements = useMemo(
    () => ydoc.getMap<CanvasElement>("elements"),
    [ydoc]
  );
  const yElementOrder = useMemo(
    () => ydoc.getArray<string>("elementOrder"),
    [ydoc]
  );

  // Cleanup when pageId changes or component unmounts
  useEffect(() => {
    return () => {
      provider.destroy();
    };
  }, [provider]);

  // ── React state mirrored from Yjs (engine reads these unchanged) ───────────
  const [elements, setElements] = useState<Map<string, CanvasElement>>(
    new Map()
  );
  const [elementOrder, setElementOrder] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      setElements(new Map(yElements.entries()));
      setElementOrder(yElementOrder.toArray());
    };
    yElements.observe(sync);
    yElementOrder.observe(sync);
    // Initial sync in case doc loaded from DB
    sync();
    return () => {
      yElements.unobserve(sync);
      yElementOrder.unobserve(sync);
    };
  }, [yElements, yElementOrder]);

  // ── Write callbacks (write to Yjs, not local state) ───────────────────────
  const onCommitElement = useCallback(
    (el: CanvasElement) => {
      ydoc.transact(() => {
        yElements.set(el.id, el);
        yElementOrder.push([el.id]);
      });
    },
    [ydoc, yElements, yElementOrder]
  );

  const onUpdateElement = useCallback(
    (id: string, partial: Partial<CanvasElement>) => {
      const existing = yElements.get(id);
      if (existing) yElements.set(id, { ...existing, ...partial });
    },
    [yElements]
  );

  const onDeleteElements = useCallback(
    (ids: string[]) => {
      ydoc.transact(() => {
        ids.forEach((id) => yElements.delete(id));
        const arr = yElementOrder.toArray();
        for (let i = arr.length - 1; i >= 0; i--) {
          if (ids.includes(arr[i])) yElementOrder.delete(i, 1);
        }
      });
    },
    [ydoc, yElements, yElementOrder]
  );

  // ── Awareness: send local cursor ───────────────────────────────────────────
  const onAwarenessUpdate = useCallback(
    (pos: { x: number; y: number }) => {
      provider.awareness.setLocalStateField("cursor", pos);
    },
    [provider]
  );

  // ── Engine ─────────────────────────────────────────────────────────────────
  const engine = useCanvasEngine({
    elements,
    elementOrder,
    onCommitElement,
    onUpdateElement,
    onDeleteElements,
    onAwarenessUpdate,
  });

  const { settingsPanelOpen } = useCanvasStore();

  // ── Minimap visibility ─────────────────────────────────────────────────────
  const [showMinimap, setShowMinimap] = useState(false);
  const minimapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerMinimap = useCallback(() => {
    setShowMinimap(true);
    if (minimapTimer.current) clearTimeout(minimapTimer.current);
    minimapTimer.current = setTimeout(() => setShowMinimap(false), 2000);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      engine.onWheel(e);
      triggerMinimap();
    },
    [engine, triggerMinimap]
  );

  return (
    <div
      ref={engine.containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{ cursor: engine.getCursor() }}
    >
      <canvas ref={engine.staticRef} style={{ ...LAYER_STYLE, zIndex: 1 }} />
      <canvas ref={engine.activeRef} style={{ ...LAYER_STYLE, zIndex: 2 }} />
      <canvas ref={engine.cursorRef} style={{ ...LAYER_STYLE, zIndex: 3 }} />
      <canvas
        ref={engine.overlayRef}
        style={{ ...LAYER_STYLE, zIndex: 4 }}
        onWheel={handleWheel}
        onMouseDown={engine.onMouseDown}
        onMouseMove={engine.onMouseMove}
        onMouseUp={engine.onMouseUp}
        onMouseLeave={engine.onMouseUp}
      />

      <Toolbar
        strokeColor={engine.strokeColor}
        onStrokeColorChange={engine.setStrokeColor}
        strokeWidth={engine.strokeWidth}
        onStrokeWidthChange={engine.setStrokeWidth}
        lineDash={engine.lineDash}
        onLineDashChange={engine.setLineDash}
      />
      <ZoomControls />
      {settingsPanelOpen && <SettingsPanel />}
      {showMinimap && (
        <Minimap elements={elements} elementOrder={elementOrder} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript builds clean**

```bash
pnpm --filter frontend build 2>&1 | grep -i error | head -20
```

Expected: no errors.

- [ ] **Step 3: Smoke test in browser**

Start `pnpm dev`. Open a board. Draw something. Verify shapes appear. Open a second browser tab to the same board URL, draw something — both tabs should see each other's strokes.

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/components/canvas/CanvasLayers.tsx
git commit -m "feat(canvas): replace local useState with Yjs Y.Doc for real-time sync"
```

---

## Task 6: Live Peer Cursors

Render collaborators' cursor positions on the existing `cursorRef` canvas layer (layer 3, z-index 3).

**Files:**
- Modify: `apps/frontend/src/components/canvas/CanvasLayers.tsx`

- [ ] **Step 1: Add the `hashColor` utility and `AwarenessState` type at the top of the file (after imports)**

```typescript
const CURSOR_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4",
];

function hashColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) & 0xffff;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}

interface AwarenessState {
  cursor?: { x: number; y: number };
  user?: { id: string; name: string; color: string };
}
```

- [ ] **Step 2: Add `useSession` import at top of file**

```typescript
import { useSession } from "@/lib/auth-client";
import { worldToScreen } from "@/lib/viewport";
```

- [ ] **Step 3: Inside the `CanvasLayers` component, add peer cursor state and effects after the `onAwarenessUpdate` callback**

```typescript
// ── Session identity ───────────────────────────────────────────────────────
const { data: session } = useSession();

// ── Peer cursor state ──────────────────────────────────────────────────────
const [peerCursors, setPeerCursors] = useState<AwarenessState[]>([]);

// Set local user identity in awareness once session is available
useEffect(() => {
  if (!session?.user) return;
  provider.awareness.setLocalState({
    user: {
      id: session.user.id,
      name: session.user.name,
      color: hashColor(session.user.id),
    },
  });
}, [provider, session?.user?.id]);

// Subscribe to remote awareness state changes
useEffect(() => {
  const handler = () => {
    const states = Array.from(provider.awareness.getStates().entries())
      .filter(([clientId]) => clientId !== provider.awareness.clientID)
      .map(([, state]) => state as AwarenessState);
    setPeerCursors(states);
  };
  provider.awareness.on("change", handler);
  return () => provider.awareness.off("change", handler);
}, [provider]);

// Read camera/zoom for cursor world→screen conversion
const camera = useCanvasStore((s) => s.camera);
const zoom = useCanvasStore((s) => s.zoom);

// Render peer cursors onto cursorRef canvas
useEffect(() => {
  const canvas = engine.cursorRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const state of peerCursors) {
    if (!state.cursor || !state.user) continue;
    const { x: sx, y: sy } = worldToScreen(
      state.cursor.x,
      state.cursor.y,
      camera,
      zoom
    );
    const color = state.user.color;

    // Circle
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Name label
    ctx.font = "11px sans-serif";
    ctx.fillStyle = color;
    ctx.fillText(state.user.name, sx + 8, sy - 4);
  }
}, [peerCursors, camera, zoom, engine.cursorRef]);
```

- [ ] **Step 4: Verify TypeScript builds clean**

```bash
pnpm --filter frontend build 2>&1 | grep -i error | head -20
```

Expected: no errors.

- [ ] **Step 5: Smoke test cursors**

Open two browser tabs to the same board URL (both signed in as different users or same user for basic test). Move the mouse in one tab — a colored dot with the user's name should appear in the other tab.

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/components/canvas/CanvasLayers.tsx
git commit -m "feat(canvas): add live peer cursors via Yjs Awareness API"
```

---

## Task 7: Undo/Redo — Y.UndoManager + Keyboard + Topbar Buttons

**Files:**
- Modify: `apps/frontend/src/components/canvas/CanvasLayers.tsx`
- Modify: `apps/frontend/src/components/canvas/CanvasTopbar.tsx`
- Modify: `apps/frontend/src/app/board/[boardId]/BoardClient.tsx`

- [ ] **Step 1: Add `Y.UndoManager` import and setup in `CanvasLayers.tsx`**

At the top of the file, `Y` is already imported. Inside the component, add after the `yElementOrder` memo:

```typescript
const undoManager = useMemo(
  () =>
    new Y.UndoManager([yElements, yElementOrder], {
      captureTimeout: 500, // batch rapid strokes into one undo step
    }),
  [yElements, yElementOrder]
);
```

- [ ] **Step 2: Add undo/redo state and keyboard listener in `CanvasLayers.tsx`**

Add after the `undoManager` memo:

```typescript
const [canUndo, setCanUndo] = useState(false);
const [canRedo, setCanRedo] = useState(false);

// Sync undo/redo availability
useEffect(() => {
  const update = () => {
    setCanUndo(undoManager.canUndo());
    setCanRedo(undoManager.canRedo());
  };
  undoManager.on("stack-item-added", update);
  undoManager.on("stack-item-popped", update);
  undoManager.on("stack-cleared", update);
  return () => {
    undoManager.off("stack-item-added", update);
    undoManager.off("stack-item-popped", update);
    undoManager.off("stack-cleared", update);
  };
}, [undoManager]);

// Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    if (e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      undoManager.undo();
    } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
      e.preventDefault();
      undoManager.redo();
    }
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, [undoManager]);
```

- [ ] **Step 3: Pass `canUndo`/`canRedo` up through the component tree**

`CanvasLayers` doesn't render `CanvasTopbar` — `BoardClient` does. The cleanest path is to lift the callbacks: pass `onUndo` / `onRedo` / `canUndo` / `canRedo` as props from `CanvasLayers` up to `BoardClient`, which passes them into `CanvasTopbar`.

In `CanvasLayers.tsx`, add to the props interface:

```typescript
interface CanvasLayersProps {
  boardId: string;
  pageId: string;
  onUndoReady?: (fns: { undo: () => void; redo: () => void; canUndo: boolean; canRedo: boolean }) => void;
}
```

And add an effect to notify the parent whenever undo/redo availability changes:

```typescript
// Notify parent of undo/redo functions + availability
const { onUndoReady } = props; // destructure at top with boardId/pageId
useEffect(() => {
  onUndoReady?.({
    undo: () => undoManager.undo(),
    redo: () => undoManager.redo(),
    canUndo,
    canRedo,
  });
}, [canUndo, canRedo, undoManager, onUndoReady]);
```

> Note: destructure `onUndoReady` from the component props alongside `boardId` and `pageId`.

- [ ] **Step 4: Update `CanvasTopbar.tsx` to accept and render undo/redo buttons**

Replace the current `CanvasTopbar` with:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Undo2, Redo2 } from "lucide-react";
import ShareDialog from "@/components/dashboard/ShareDialog";

interface CanvasTopbarProps {
  boardId: string;
  boardName: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export default function CanvasTopbar({
  boardId,
  boardName,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: CanvasTopbarProps) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <header className="h-12 shrink-0 flex items-center justify-between px-4 bg-white border-b border-zinc-200 z-30">
        {/* Left — back */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Dashboard</span>
        </button>

        {/* Center — board name */}
        <p className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-zinc-900 truncate max-w-xs pointer-events-none">
          {boardName}
        </p>

        {/* Right — undo/redo + share */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Redo2 size={15} />
          </button>
          <div className="w-px h-5 bg-zinc-200 mx-1" />
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Share2 size={14} />
            Share
          </button>
        </div>
      </header>

      <ShareDialog
        open={shareOpen}
        boardId={boardId}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}
```

- [ ] **Step 5: Update `BoardClient.tsx` to wire undo/redo from `CanvasLayers` to `CanvasTopbar`**

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import CanvasLayers from "@/components/canvas/CanvasLayers";
import PagesStrip from "@/components/canvas/PagesStrip";
import CanvasTopbar from "@/components/canvas/CanvasTopbar";
import {
  getBoardName,
  getPages,
  createPage,
  renamePage,
  deletePage,
} from "@/app/dashboard/board-actions";

interface PageItem {
  id: string;
  name: string;
  order: number;
}

interface UndoState {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function BoardClient({ boardId }: { boardId: string }) {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [activePageId, setActivePageId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [boardName, setBoardName] = useState("");
  const [undoState, setUndoState] = useState<UndoState | null>(null);

  const fetchPages = useCallback(async () => {
    try {
      const [name, data] = await Promise.all([
        getBoardName(boardId),
        getPages(boardId),
      ]);
      setBoardName(name);
      const sorted = (data as PageItem[]).sort((a, b) => a.order - b.order);
      setPages(sorted);
      if (!activePageId || !sorted.find((p) => p.id === activePageId)) {
        setActivePageId(sorted[0]?.id || "");
      }
    } catch {
      // board without pages
    } finally {
      setLoading(false);
    }
  }, [boardId, activePageId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleAddPage = async () => {
    const newPage = await createPage(boardId, `Page ${pages.length + 1}`);
    await fetchPages();
    setActivePageId(newPage.id);
  };

  const handleRenamePage = async (pageId: string, name: string) => {
    await renamePage(pageId, name);
    fetchPages();
  };

  const handleDeletePage = async (pageId: string) => {
    await deletePage(pageId);
    if (activePageId === pageId) setActivePageId("");
    fetchPages();
  };

  return (
    <div className="flex flex-col w-full h-full">
      <CanvasTopbar
        boardId={boardId}
        boardName={boardName}
        canUndo={undoState?.canUndo ?? false}
        canRedo={undoState?.canRedo ?? false}
        onUndo={undoState?.undo}
        onRedo={undoState?.redo}
      />

      <div className="relative flex-1 overflow-hidden">
        {activePageId && (
          <CanvasLayers
            boardId={boardId}
            pageId={activePageId}
            onUndoReady={setUndoState}
          />
        )}

        {!loading && pages.length > 0 && (
          <PagesStrip
            boardId={boardId}
            pages={pages}
            activePageId={activePageId}
            onSelectPage={setActivePageId}
            onAddPage={handleAddPage}
            onRenamePage={handleRenamePage}
            onDeletePage={handleDeletePage}
            onReorderPages={fetchPages}
          />
        )}
      </div>
    </div>
  );
}
```

> Note: `CanvasLayers` is now only rendered when `activePageId` is non-empty, avoiding a WebSocket connection to `""`.

- [ ] **Step 6: Verify TypeScript builds clean**

```bash
pnpm --filter frontend build 2>&1 | grep -i error | head -20
```

Expected: no errors.

- [ ] **Step 7: Smoke test undo/redo**

Open a board. Draw a shape. Press `Ctrl+Z` — shape disappears. Press `Ctrl+Shift+Z` — shape reappears. Verify the Undo/Redo buttons in the topbar enable/disable correctly.

- [ ] **Step 8: Commit**

```bash
git add apps/frontend/src/components/canvas/CanvasLayers.tsx \
        apps/frontend/src/components/canvas/CanvasTopbar.tsx \
        apps/frontend/src/app/board/[boardId]/BoardClient.tsx
git commit -m "feat(canvas): add undo/redo via Y.UndoManager and topbar buttons"
```

---

## Final Verification

- [ ] Open two browser tabs signed in as the same user to the same board
- [ ] Draw in tab 1 — strokes appear in tab 2 within ~100ms
- [ ] Move mouse in tab 1 — colored cursor dot with username appears in tab 2
- [ ] Press Ctrl+Z in tab 1 — stroke disappears only in tab 1 (per-client undo)
- [ ] Restart the WS server (`pnpm --filter ws dev`) — reload the board — all strokes still present (DB persistence confirmed)
- [ ] Check `pnpm --filter ws dev` logs — no crash, shows connection logs per join/leave
