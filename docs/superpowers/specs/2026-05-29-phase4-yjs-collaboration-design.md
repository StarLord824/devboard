# Phase 4 — Yjs Collaboration Design

**Date:** 2026-05-29
**Scope:** Wire real-time multi-user collaboration into the canvas using Yjs + y-websocket, with full DB persistence via the existing `Page.yjsState` column.

---

## 1. Goals

- Replace the local `useState` element store in `CanvasLayers.tsx` with a `Y.Doc` shared over WebSocket
- Persist canvas state to `Page.yjsState Bytes?` in Postgres (survives server restarts)
- Live peer cursors rendered on the existing cursor canvas layer
- Per-client undo/redo via `Y.UndoManager`
- `CanvasEngine.ts` must not change (engine is decoupled from the data source)

---

## 2. Architecture

### URL Pattern

`ws://{NEXT_PUBLIC_WS_URL}/{pageId}`

The page ID is the Yjs doc name. One `Y.Doc` per page. The existing URL parser in `apps/ws/src/index.ts` already extracts the last path segment correctly.

### Y.Doc Structure (per page)

| Shared type | Key | Value |
|---|---|---|
| `Y.Map` named `'elements'` | element ID (`string`) | `CanvasElement` (plain object) |
| `Y.Array` named `'elementOrder'` | — | ordered `string[]` of element IDs |

Plain objects (not nested `Y.Map`) are used as values in `yElements` — deep reactivity on individual element fields is not needed; the whole element is replaced on update.

### Data Flow — Write Path

```
User draws
  → onCommitElement / onUpdateElement / onDeleteElements (CanvasLayers)
    → Y.Doc transact (yElements + yElementOrder)
      → Yjs delta broadcast to all peers via WS
        → peer observer fires
          → setState (setElements / setElementOrder)
            → CanvasEngine re-renders (unchanged)
```

### Data Flow — Read Path

`yElements.observe` + `yElementOrder.observe` → `setElements(new Map(yElements.entries()))` + `setElementOrder(yElementOrder.toArray())` → engine receives `Map<string, CanvasElement>` and `string[]`, identical to today.

---

## 3. WS Server (`apps/ws/src/index.ts`)

### Persistence Provider (set once at startup)

```ts
import { setupWSConnection, setPersistence } from 'y-websocket/bin/utils'
import * as Y from 'yjs'

setPersistence({
  bindState: async (pageId: string, ydoc: Y.Doc) => {
    const page = await prisma.page.findUnique({ where: { id: pageId } })
    if (page?.yjsState) Y.applyUpdate(ydoc, page.yjsState as Uint8Array)

    // 30s debounced safety write while doc is active
    ydoc.on('update', () => {
      const existing = writeTimers.get(pageId)
      if (existing) clearTimeout(existing)
      writeTimers.set(pageId, setTimeout(() => {
        const state = Buffer.from(Y.encodeStateAsUpdate(ydoc))
        prisma.page.update({ where: { id: pageId }, data: { yjsState: state } }).catch(console.error)
        writeTimers.delete(pageId)
      }, 30_000))
    })
  },
  writeState: async (pageId: string, ydoc: Y.Doc) => {
    // Called by y-websocket when last client disconnects
    const existing = writeTimers.get(pageId)
    if (existing) { clearTimeout(existing); writeTimers.delete(pageId) }
    const state = Buffer.from(Y.encodeStateAsUpdate(ydoc))
    await prisma.page.update({ where: { id: pageId }, data: { yjsState: state } })
  },
})

const writeTimers = new Map<string, ReturnType<typeof setTimeout>>()
```

### Board Access Check (on upgrade, after session validation)

After confirming a valid session, extract `pageId` from the URL, look up `Page.boardId`, then verify `BoardMember` row exists for `(boardId, userId)` OR `Board.ownerId === userId`. Reject with HTTP 403 if not a member.

### Connection Handler

```ts
wss.on('connection', (conn, req) => {
  const pageId = req.url?.split('/').pop() ?? ''
  setupWSConnection(conn, req, { docName: pageId, gc: true })
})
```

The existing `http.createServer`, `server.on('upgrade')` auth gate, and `server.listen` are unchanged.

---

## 4. Frontend (`CanvasLayers.tsx`)

### New prop

`pageId: string` — passed from `BoardClient`, which already knows the active page from `PagesStrip`.

### Y.Doc + Provider setup

```ts
const ydoc = useMemo(() => new Y.Doc(), [pageId])
const provider = useMemo(
  () => new WebsocketProvider(`${process.env.NEXT_PUBLIC_WS_URL}/${pageId}`, pageId, ydoc),
  [ydoc, pageId]
)
const yElements = useMemo(() => ydoc.getMap<CanvasElement>('elements'), [ydoc])
const yElementOrder = useMemo(() => ydoc.getArray<string>('elementOrder'), [ydoc])

// Cleanup on page switch
useEffect(() => () => provider.destroy(), [provider])
```

### Observers → React state (engine reads unchanged)

```ts
useEffect(() => {
  const sync = () => {
    setElements(new Map(yElements.entries()))
    setElementOrder(yElementOrder.toArray())
  }
  yElements.observe(sync)
  yElementOrder.observe(sync)
  return () => { yElements.unobserve(sync); yElementOrder.unobserve(sync) }
}, [yElements, yElementOrder])
```

### Callbacks (write to Yjs instead of useState)

```ts
const onCommitElement = useCallback((el: CanvasElement) => {
  ydoc.transact(() => {
    yElements.set(el.id, el)
    yElementOrder.push([el.id])
  })
}, [ydoc, yElements, yElementOrder])

const onUpdateElement = useCallback((id: string, partial: Partial<CanvasElement>) => {
  const existing = yElements.get(id)
  if (existing) yElements.set(id, { ...existing, ...partial })
}, [yElements])

const onDeleteElements = useCallback((ids: string[]) => {
  ydoc.transact(() => {
    ids.forEach(id => yElements.delete(id))
    // Remove ids from yElementOrder in reverse index order
    const arr = yElementOrder.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      if (ids.includes(arr[i])) yElementOrder.delete(i, 1)
    }
  })
}, [ydoc, yElements, yElementOrder])
```

---

## 5. Live Cursors

### Send (CanvasEngine.ts — minimal change)

Add optional `onAwarenessUpdate?: (pos: { x: number; y: number }) => void` to `UseCanvasEngineOptions`. Call it inside `onMouseMove` after converting screen → world coords. No other engine changes.

### Receive + Render (CanvasLayers.tsx)

```ts
// Set local user identity once on connect
useEffect(() => {
  if (!session?.user) return
  provider.awareness.setLocalState({
    user: { id: session.user.id, name: session.user.name, color: hashColor(session.user.id) }
  })
}, [provider, session])

// Subscribe to peer state
useEffect(() => {
  const handler = () => {
    const states = Array.from(provider.awareness.getStates().entries())
      .filter(([clientId]) => clientId !== provider.awareness.clientID)
      .map(([, state]) => state)
    setPeerCursors(states)
  }
  provider.awareness.on('change', handler)
  return () => provider.awareness.off('change', handler)
}, [provider])

// Render on cursorRef canvas
useEffect(() => {
  const ctx = cursorRef.current?.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (const state of peerCursors) {
    if (!state.cursor) continue
    const { sx, sy } = worldToScreen(state.cursor.x, state.cursor.y, camera, zoom)
    // draw colored circle + name label
  }
}, [peerCursors, camera, zoom])
```

`cursorRef` is already in the canvas layer stack at z-index 3. No new layer needed.

`hashColor(userId: string): string` — pure function, maps user ID to one of 8 distinct hues using a simple hash mod.

### Awareness callback wired in CanvasLayers

```ts
const onAwarenessUpdate = useCallback(({ x, y }: { x: number; y: number }) => {
  provider.awareness.setLocalStateField('cursor', { x, y })
}, [provider])
```

Passed into `useCanvasEngine({ ..., onAwarenessUpdate })`.

---

## 6. Undo / Redo

```ts
const undoManager = useMemo(
  () => new Y.UndoManager([yElements, yElementOrder], { captureTimeout: 500 }),
  [yElements, yElementOrder]
)
```

`captureTimeout: 500ms` batches rapid strokes into a single undo step. Scope is per-page and per-client (peers' changes are not undone — correct collaborative behavior).

**Keyboard handler** (window keydown, in CanvasLayers):
- `Ctrl/Cmd+Z` → `undoManager.undo()`
- `Ctrl/Cmd+Shift+Z` or `Ctrl+Y` → `undoManager.redo()`

**CanvasTopbar undo/redo buttons** — expose `canUndo`/`canRedo` booleans via `undoManager.on('stack-item-added', ...)` + `undoManager.on('stack-item-popped', ...)` observers. Pass as props to `CanvasTopbar` for optional toolbar buttons.

---

## 7. Files Changed

| File | Change |
|---|---|
| `apps/ws/src/index.ts` | `setPersistence` + `setupWSConnection` + board access check |
| `apps/frontend/src/components/canvas/CanvasLayers.tsx` | Y.Doc + WebsocketProvider + observers + cursors + undo |
| `apps/frontend/src/components/canvas/CanvasEngine.ts` | Add optional `onAwarenessUpdate` to options interface + call in onMouseMove |
| `apps/frontend/src/components/canvas/CanvasTopbar.tsx` | Optional `canUndo`/`canRedo` props + buttons |
| `apps/frontend/src/app/board/[boardId]/BoardClient.tsx` | Pass `pageId` down to `CanvasLayers` |

**Not changed:** `schema.prisma`, existing migrations, `canvasStore.ts`, element renderer, toolbar, minimap.

---

## 8. Out of Scope (future phases)

- Dexie.js IndexedDB offline cache
- Auto-save indicator UI
- Conflict resolution UI (Yjs handles this automatically via CRDTs)
- Snapshot-on-save
