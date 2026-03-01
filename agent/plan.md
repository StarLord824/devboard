# Devboard — Finalized Production Plan

> Collaborative Drawing Board Application  
> Stack: Next.js 15 · Express 5 · WebSocket · Yjs · PostgreSQL · Prisma · Better-Auth · Zustand · TanStack Query · Docker

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack — Final Decisions](#2-tech-stack--final-decisions)
3. [Development Phases & Roadmap](#3-development-phases--roadmap)
4. [Database Schema](#4-database-schema)
5. [System Architecture](#5-system-architecture)
6. [Real-Time Collaboration Strategy](#6-real-time-collaboration-strategy)
7. [Drawing Engine Architecture](#7-drawing-engine-architecture)
8. [State Management Architecture](#8-state-management-architecture)
9. [API Design](#9-api-design)
10. [WebSocket Protocol](#10-websocket-protocol)
11. [Frontend Pages & Routing](#11-frontend-pages--routing)
12. [Notes & Snapshots](#12-notes--snapshots)
13. [Authentication Flow](#13-authentication-flow)
14. [Security & Permissions](#14-security--permissions)
15. [Performance Optimizations](#15-performance-optimizations)
16. [Docker & Deployment](#16-docker--deployment)
17. [Folder Structure](#17-folder-structure)
18. [Environment Variables](#18-environment-variables)
19. [Future Scaling Path](#19-future-scaling-path)

---

## 1. Project Overview

Devboard is a production-grade collaborative drawing board application. Users can create infinite-canvas boards, draw freely, collaborate in real-time with other users, annotate with sticky notes, and manage versioned snapshots of their work — all organized in a multi-board dashboard.

### Core User Flows

- **Solo**: Create a board, draw, auto-save, revisit later
- **Collaborative**: Share a board link, multiple users draw simultaneously with live cursors
- **Organized**: Dashboard showing all boards with thumbnails, search, and tags
- **Versioned**: Snapshot boards at any point, restore to any previous version
- **Annotated**: Sticky notes pinned to canvas coordinates, manageable from dashboard

---

## 2. Tech Stack — Final Decisions

### Why each tool was chosen

| Layer | Technology | Decision & Rationale |
|---|---|---|
| Frontend Framework | **Next.js 15** (App Router) | ✅ Keep. RSC, streaming, middleware-based auth guards, Vercel deployment |
| Canvas Engine | **HTML5 Canvas API** (custom) | ✅ Build in-house. Full control, no Konva overhead, enables dirty-rect optimization |
| UI State | **Zustand + Immer** | ✅ Best choice. Minimal boilerplate, fine-grained subscriptions, no Redux ceremony |
| Server State | **TanStack Query v5** | ✅ Add this. Handles REST caching, background sync, optimistic updates for all API calls |
| CRDT / Collab | **Yjs + y-websocket** | ✅ Industry standard. Conflict-free, offline-capable, built-in undo-per-user |
| WebSocket | **ws** (native Node.js) | ✅ Keep. Minimal overhead, pairs directly with Yjs y-websocket provider |
| HTTP API | **Express 5** | ✅ Keep. Async-first in v5, mature, flexible |
| Authentication | **Better-Auth** | ✅ Replace next-auth + manual JWT. DB-backed sessions, OAuth, framework-agnostic |
| Database ORM | **Prisma + PostgreSQL** | ✅ Keep. Type-safe, great migrations, scales well |
| Offline Cache | **Dexie.js** (IndexedDB) | ✅ Add. Local-first resilience before server sync |
| Validation | **Zod** (`@devboard/common`) | ✅ Keep. Single source of truth for all types across packages |
| Monorepo | **Turborepo + pnpm** | ✅ Keep |
| Containerization | **Docker + Docker Compose** | ✅ Add from day one. Reproducible local dev, portable production builds |
| Animations | **Motion (Framer)** | ✅ Keep. UI transitions only, never on canvas |

### Explicitly rejected (with reason)

| Technology | Verdict | Reason |
|---|---|---|
| Redux / Redux Toolkit | ❌ Skip | Excessive boilerplate for canvas state changing 60×/sec. Zustand is strictly better here |
| Recoil | ❌ Skip | Effectively abandoned by Meta. Jotai is the spiritual successor but Zustand is simpler for this use case |
| tRPC | ❌ Skip | Type-safe API calls already achieved via shared Zod schemas + Axios. Adding tRPC is redundant overhead |
| gRPC | ❌ Skip | Browsers cannot speak native gRPC. Designed for service-to-service, not browser-to-server |
| Kubernetes | ❌ Not now | Over-engineered for current scale. WebSocket affinity issues require Redis pub/sub first. Revisit at 10+ services |
| Konva | ❌ Skip | External canvas library. Prevents dirty-rect optimization and fine-grained control needed for performance |
| TanStack Router | ❌ Skip | Redundant — already using Next.js App Router |

### Planned for future scaling

| Technology | When to Add |
|---|---|
| **Redis** (pub/sub) | When horizontally scaling WS server to 2+ instances |
| **Kubernetes** | When managing 10+ services with dedicated DevOps |
| **gRPC** | If internal microservices (snapshot generator, AI service) need high-throughput service-to-service calls |

---

## 3. Development Phases & Roadmap

### Phase 1 — Core Drawing Board
**Goal**: Fully working, optimized solo canvas. No auth. All drawing state persists to DB.

- [ ] Custom canvas engine: pen, rect, ellipse, line, arrow, text, eraser, select tool
- [ ] Canvas layering: static / active / overlay layers
- [ ] Infinite canvas: pan (space+drag, middle mouse), zoom (wheel), virtual coordinates
- [ ] Viewport transform: world ↔ screen coordinate conversion
- [ ] Settings : predefined color pallete for canvas color, and a color picker button, to pick any of there choice too, explicitly. Color choice for a board to be stored. Option to switch between plain, grid, or dots pattern over canvas.
- [ ] Minimap : visible for a short interval, when zooming in/oout, or scrolling within the canvas.
- [ ] History: Yjs UndoManager (undo/redo scoped to current user, Ctrl+Z / Ctrl+Y)
- [ ] Path simplification: Ramer–Douglas–Peucker algorithm for freehand strokes
- [ ] Auto-save: debounced (1.5s) Y.Doc binary state → PostgreSQL
- [ ] Local cache: Dexie.js IndexedDB for offline resilience
- [ ] Element selection: single + multi-select, move, resize, rotate
- [ ] Keyboard shortcuts: Delete, Ctrl+A, Ctrl+D (duplicate), Escape
- [ ] TanStack Query for all REST calls

### Phase 2 — Authentication
**Goal**: Better-Auth fully integrated. Users own boards.

- [ ] Remove manual JWT + bcrypt from `apps/api`
- [ ] Remove `next-auth` from `apps/frontend`
- [ ] Better-Auth setup: email/password + GitHub OAuth
- [ ] DB-backed sessions (revocable)
- [ ] Next.js middleware for route protection
- [ ] User profile: avatar, display name
- [ ] WS server validates Better-Auth sessions

### Phase 3 — Dashboard & Multi-Board
**Goal**: Full board management. Multiple boards per user.

- [ ] Dashboard: grid + list view with canvas thumbnail previews
- [ ] Board CRUD: create, rename, duplicate, archive, delete
- [ ] Multi-page boards: ordered pages per board (like Figma pages)
- [ ] Page management: add, rename, reorder, delete pages
- [ ] Board search and filter
- [ ] Board sharing: invite link generation (configurable permissions)
- [ ] Thumbnail generation on save (server-renders 200px PNG)

### Phase 4 — Real-Time Collaboration
**Goal**: Multiple users drawing simultaneously, conflict-free.

- [ ] Yjs Y.Doc per page, persisted as `Bytes` in PostgreSQL
- [ ] y-websocket server provider on `apps/ws`
- [ ] Live cursors: real-time cursor positions via Yjs Awareness
- [ ] Presence bar: avatars of active collaborators in toolbar
- [ ] Persistent user colors: stable color assigned per userId
- [ ] Viewer-only mode: WS server rejects Y.Doc updates from VIEWER role
- [ ] Offline resilience: reconnects and resumes from last known state

### Phase 5 — Notes & Snapshots
**Goal**: Sticky notes + versioned snapshots with management dashboard.

- [ ] Sticky notes: rich-text, anchored to canvas coordinates
- [ ] Notes synced via Yjs (position) + REST (content)
- [ ] Auto-snapshots: triggered after 5min inactivity, max 20 retained per page
- [ ] Manual snapshots: user-named, never auto-purged
- [ ] Snapshot storage: PNG to Cloudflare R2, Y.Doc binary to PostgreSQL
- [ ] Snapshot restore: current state auto-backed-up, then rollback applied
- [ ] Notes dashboard: list all notes across all boards, filterable
- [ ] Notes export: markdown / PDF

---

## 4. Database Schema

### Better-Auth Required Tables (auto-managed)

```prisma
// Better-Auth manages these — do not manually edit
model User {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean
  image         String?
  createdAt     DateTime
  updatedAt     DateTime

  // App relations
  ownedBoards   Board[]       @relation("ownedBoards")
  boardMembers  BoardMember[]
  notes         Note[]
  snapshots     Snapshot[]    @relation("createdSnapshots")
  sessions      Session[]
  accounts      Account[]
}

model Session {
  id        String   @id
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime
  updatedAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String  @id
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  idToken               String?
  createdAt             DateTime
  updatedAt             DateTime
  user                  User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime
  updatedAt  DateTime
}
```

### Application Tables

```prisma
model Board {
  id          String        @id @default(cuid())
  name        String
  slug        String        @unique
  ownerId     String
  owner       User          @relation("ownedBoards", fields: [ownerId], references: [id])
  members     BoardMember[]
  pages       Page[]
  snapshots   Snapshot[]
  inviteLinks InviteLink[]
  isArchived  Boolean       @default(false)
  thumbnail   String?       // URL to latest snapshot PNG (Cloudflare R2)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([ownerId])
}

model BoardMember {
  id       String     @id @default(cuid())
  boardId  String
  userId   String
  role     MemberRole @default(EDITOR)
  board    Board      @relation(fields: [boardId], references: [id], onDelete: Cascade)
  user     User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  joinedAt DateTime   @default(now())

  @@unique([boardId, userId])
  @@index([userId])
}

model Page {
  id        String     @id @default(cuid())
  boardId   String
  board     Board      @relation(fields: [boardId], references: [id], onDelete: Cascade)
  name      String     @default("Page 1")
  order     Int
  yjsState  Bytes?     // Serialized Y.Doc binary — the entire canvas CRDT state
  notes     Note[]
  snapshots Snapshot[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([boardId, order])
}

model Note {
  id        String   @id @default(cuid())
  pageId    String
  page      Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  content   String   // Rich text as Tiptap JSON string
  x         Float    // World-space canvas coordinate
  y         Float    // World-space canvas coordinate
  width     Float    @default(240)
  color     String   @default("#FEF08A")
  isPinned  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([pageId])
  @@index([authorId])
}

model Snapshot {
  id          String       @id @default(cuid())
  boardId     String
  pageId      String
  board       Board        @relation(fields: [boardId], references: [id], onDelete: Cascade)
  page        Page         @relation(fields: [pageId], references: [id], onDelete: Cascade)
  name        String?      // null = auto-snapshot
  type        SnapshotType
  imageUrl    String       // Cloudflare R2 URL of full PNG
  thumbUrl    String       // Cloudflare R2 URL of 200px thumbnail
  yjsState    Bytes        // Frozen Y.Doc binary at snapshot time
  createdById String
  createdBy   User         @relation("createdSnapshots", fields: [createdById], references: [id])
  createdAt   DateTime     @default(now())

  @@index([boardId, pageId, createdAt])
}

model InviteLink {
  id        String     @id @default(cuid())
  boardId   String
  board     Board      @relation(fields: [boardId], references: [id], onDelete: Cascade)
  token     String     @unique @default(cuid())
  role      MemberRole @default(EDITOR)
  expiresAt DateTime?
  usedCount Int        @default(0)
  maxUses   Int?       // null = unlimited
  createdAt DateTime   @default(now())

  @@index([token])
}

enum MemberRole {
  VIEWER
  EDITOR
  ADMIN
}

enum SnapshotType {
  AUTO
  MANUAL
}
```

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER CLIENT                           │
│                                                                 │
│  Next.js 15 App Router                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Canvas Engine│  │ Zustand Store│  │  TanStack Query      │  │
│  │ (HTML5 Canvas│  │ (UI state)   │  │  (REST server state) │  │
│  │  4 layers)   │  └──────────────┘  └──────────────────────┘  │
│  └──────┬───────┘                                              │
│         │ reads/writes                                          │
│  ┌──────▼───────┐  ┌──────────────┐                           │
│  │  Yjs Y.Doc   │  │  Dexie.js    │                           │
│  │  (canvas CRDT│  │  (IndexedDB  │                           │
│  │   elements)  │  │   offline)   │                           │
│  └──────┬───────┘  └──────────────┘                           │
└─────────┼───────────────────────────────────────────────────────┘
          │
     ┌────┴────────────────────────────────┐
     │ WSS (Yjs sync + awareness)          │ HTTPS (REST)
     ▼                                     ▼
┌─────────────────────┐      ┌────────────────────────┐
│   apps/ws           │      │   apps/api             │
│                     │      │                        │
│  y-websocket server │      │  Express 5             │
│  Yjs room manager   │      │  Better-Auth middleware │
│  Awareness handler  │      │  REST controllers      │
│  Session validator  │      │  Zod validation        │
└──────────┬──────────┘      └───────────┬────────────┘
           │                             │
           └──────────────┬──────────────┘
                          │ Prisma ORM
                          ▼
              ┌───────────────────────┐
              │      PostgreSQL       │
              │                       │
              │  User / Session /     │
              │  Board / Page /       │
              │  Note / Snapshot      │
              └───────────────────────┘
                          │
              ┌───────────▼───────────┐
              │   Cloudflare R2       │
              │   (PNG snapshots +    │
              │    thumbnails)        │
              └───────────────────────┘
```

### Request Flow — Board Load

```
1. User navigates to /board/[boardId]
2. Next.js middleware checks Better-Auth session cookie
   └── Unauthenticated → redirect /signin
3. Server Component fetches board metadata + user role via REST API
   └── Not a member → 403 page
4. Client Component mounts:
   a. Zustand store initialized (tool=pen, zoom=1, selectedIds=[])
   b. Yjs Y.Doc created
   c. TanStack Query fetches board pages, notes, snapshots
5. WebSocket connects: wss://ws.devboard.app/boards/:boardId?pageId=:pageId&token=:sessionToken
6. WS server validates session token via Better-Auth
7. WS server loads page.yjsState from PostgreSQL → sends Y.SYNC_STEP_1
8. Client responds with Y.SYNC_STEP_2 → full state merged
9. Canvas renders all elements from Y.Doc
10. User draws → Y.Doc updated locally (instant) → UPDATE diff sent to WS
11. WS server broadcasts diff to all room members → DB persisted (debounced 2s)
```

---

## 6. Real-Time Collaboration Strategy

### Why Yjs CRDT

| Approach | Verdict | Reason |
|---|---|---|
| Zustand shared state | ❌ | No conflict resolution — last write wins, data loss on concurrent edits |
| HTTP polling | ❌ | 200–500ms latency, server overload, terrible UX for drawing |
| Plain WebSockets (manual) | ⚠️ | Works but requires hand-rolled conflict resolution — error-prone |
| Operational Transform (OT) | ⚠️ | Google Docs' approach. Correct but complex to implement for canvas |
| **Yjs CRDT + WebSocket** | ✅ | Conflict-free by design, offline support, battle-tested (Figma, Linear, Notion) |

### Yjs Data Model

```typescript
const ydoc = new Y.Doc()

// Canvas elements — the full drawing state
const elements = ydoc.getMap<CanvasElement>('elements')

// Page-level metadata (element ordering for z-index)
const elementOrder = ydoc.getArray<string>('elementOrder')

// Awareness — ephemeral, NOT persisted
const awareness = new Awareness(ydoc)
```

### Sync Flow

```
Client A draws stroke
  → Y.Doc.elements.set(id, element) [instant local render]
  → Yjs generates binary UPDATE diff (~50-200 bytes)
  → Sends over WebSocket

WS Server receives UPDATE
  → Validates sender has EDITOR role
  → Broadcasts to all other clients in room
  → Queues Y.Doc state for DB persist (debounced 2s)

Client B receives UPDATE
  → Yjs merges deterministically (CRDT — no conflicts possible)
  → Canvas re-renders changed elements only
```

### Awareness (Live Cursors & Presence)

```typescript
// Set your own state — broadcast to all room members
awareness.setLocalStateField('cursor', { x: 450, y: 320 })
awareness.setLocalStateField('user', {
  id: session.userId,
  name: session.user.name,
  color: getUserColor(session.userId), // deterministic from userId
})
awareness.setLocalStateField('selection', ['elem_abc', 'elem_def'])

// Read all connected users
awareness.getStates() // Map<clientId, AwarenessState>
```

Awareness is ephemeral — it lives only in the WS server's memory and resets on disconnect. It is never persisted to the database.

---

## 7. Drawing Engine Architecture

### Canvas Layer Stack

```
┌─────────────────────────────────────┐  z-index: 4
│  OVERLAY layer (selection handles,  │  Redrawn: on selection change
│  resize knobs, bounding boxes)      │
├─────────────────────────────────────┤  z-index: 3
│  CURSOR layer (remote collaborator  │  Redrawn: on awareness update (~60fps)
│  cursors with name labels)          │
├─────────────────────────────────────┤  z-index: 2
│  ACTIVE layer (element currently    │  Cleared + redrawn: every mousemove
│  being drawn by local user)         │
├─────────────────────────────────────┤  z-index: 1
│  STATIC layer (all committed        │  Redrawn: only on new commit, undo,
│  elements from Y.Doc)               │  or remote Y.Doc update
└─────────────────────────────────────┘
```

All layers are `position: absolute` with identical dimensions, stacked via CSS z-index.

### Coordinate System

All elements are stored in **world coordinates** (virtual canvas space). The viewport transform is applied at render time.

```typescript
// World → Screen
const toScreen = (worldX: number, worldY: number) => ({
  x: (worldX - camera.x) * zoom,
  y: (worldY - camera.y) * zoom,
})

// Screen → World (for mouse events)
const toWorld = (screenX: number, screenY: number) => ({
  x: screenX / zoom + camera.x,
  y: screenY / zoom + camera.y,
})
```

### Element Data Model

```typescript
type CanvasElement = {
  id: string
  type: 'path' | 'rect' | 'ellipse' | 'line' | 'arrow' | 'text' | 'image'

  // Bounding box in world coordinates
  x: number
  y: number
  width: number
  height: number
  rotation: number // radians

  style: {
    stroke: string       // hex color
    fill: string         // hex color or 'transparent'
    strokeWidth: number
    opacity: number      // 0–1
    lineDash: number[]   // [] = solid, [5,5] = dashed
  }

  // Type-specific fields
  points?: [number, number][]  // path: absolute world coords
  text?: string                // text element content
  fontSize?: number
  src?: string                 // image: base64 or R2 URL

  // Metadata
  createdBy: string            // userId
  createdAt: number            // unix timestamp ms
  lockedBy?: string            // userId if element is locked
}
```

### Undo/Redo

```typescript
// UndoManager scoped to canvas elements only
// Tracks changes per-clientID — undo reverts YOUR changes, not collaborators'
const undoManager = new Y.UndoManager(
  [elements, elementOrder],
  { trackedOrigins: new Set([ydoc.clientID]) }
)

// Keyboard bindings
Ctrl+Z → undoManager.undo()
Ctrl+Y / Ctrl+Shift+Z → undoManager.redo()
```

### Performance — Dirty Rect Rendering

```typescript
let isDirty = false

// Only schedule repaint when something changed
const markDirty = () => {
  if (!isDirty) {
    isDirty = true
    requestAnimationFrame(render)
  }
}

const render = () => {
  isDirty = false
  // Only clear and redraw elements whose bounding boxes
  // intersect the dirty region
  ctx.clearRect(dirtyRegion.x, dirtyRegion.y, dirtyRegion.w, dirtyRegion.h)
  drawElementsInRegion(dirtyRegion)
}
```

---

## 8. State Management Architecture

Three separate state domains — never mix them:

```
┌─────────────────────────────────────────────────────────────┐
│  Yjs Y.Doc  (canvas CRDT state)                             │
│  • All canvas elements (shapes, strokes, text, images)      │
│  • Element ordering (z-index)                               │
│  • Note positions (synced, collaborative)                   │
│  Persisted: PostgreSQL (Page.yjsState as Bytes)             │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Zustand Store  (UI state)                                  │
│  • activeTool: 'pen' | 'rect' | 'select' | ...             │
│  • zoom: number                                             │
│  • camera: { x: number, y: number }                        │
│  • selectedElementIds: string[]                             │
│  • isPanMode: boolean                                       │
│  • activePageId: string                                     │
│  • sidebarOpen: boolean                                     │
│  NOT persisted — resets on page load                        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  TanStack Query  (server state / REST)                      │
│  • boards list (GET /api/boards)                            │
│  • board details + pages (GET /api/boards/:id)              │
│  • snapshots list (GET /api/boards/:id/snapshots)           │
│  • notes list (GET /api/boards/:id/notes)                   │
│  Cached, background-refetched, stale-while-revalidate       │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. API Design

All endpoints under `/api/v1/`. All protected routes require a valid Better-Auth session cookie.

### Boards

| Method | Endpoint | Role Required | Description |
|---|---|---|---|
| `GET` | `/boards` | Authenticated | List all boards (owned + member) |
| `POST` | `/boards` | Authenticated | Create board |
| `GET` | `/boards/:id` | Member | Board details + pages |
| `PATCH` | `/boards/:id` | Admin | Rename, archive |
| `DELETE` | `/boards/:id` | Owner | Delete board + all data |

### Pages

| Method | Endpoint | Role Required | Description |
|---|---|---|---|
| `POST` | `/boards/:id/pages` | Editor | Add page |
| `PATCH` | `/boards/:id/pages/:pid` | Editor | Rename, reorder |
| `DELETE` | `/boards/:id/pages/:pid` | Admin | Delete page |

### Members & Invites

| Method | Endpoint | Role Required | Description |
|---|---|---|---|
| `GET` | `/boards/:id/members` | Member | List members + roles |
| `PATCH` | `/boards/:id/members/:uid` | Admin | Change member role |
| `DELETE` | `/boards/:id/members/:uid` | Admin | Remove member |
| `POST` | `/boards/:id/invite` | Admin | Generate invite link |
| `GET` | `/invite/:token` | — | Validate invite link |
| `POST` | `/invite/:token/accept` | Authenticated | Join board via link |

### Snapshots

| Method | Endpoint | Role Required | Description |
|---|---|---|---|
| `GET` | `/boards/:id/snapshots` | Member | List snapshots |
| `POST` | `/boards/:id/snapshots` | Editor | Create manual snapshot |
| `POST` | `/boards/:id/snapshots/:sid/restore` | Admin | Restore page to snapshot |
| `DELETE` | `/boards/:id/snapshots/:sid` | Admin | Delete manual snapshot |

### Notes

| Method | Endpoint | Role Required | Description |
|---|---|---|---|
| `GET` | `/boards/:id/notes` | Member | All notes across board |
| `POST` | `/pages/:pid/notes` | Editor | Create note |
| `PATCH` | `/notes/:nid` | Author | Update content/position |
| `DELETE` | `/notes/:nid` | Author or Admin | Delete note |

### Auth (Better-Auth handles all routes)

```
POST /api/auth/sign-in/email
POST /api/auth/sign-up/email
POST /api/auth/sign-out
GET  /api/auth/session
GET  /api/auth/sign-in/github
GET  /api/auth/callback/github
POST /api/auth/forget-password
POST /api/auth/reset-password
```

---

## 10. WebSocket Protocol

### Connection

```
wss://ws.devboard.app/boards/:boardId
  ?pageId=:pageId
  &token=:betterAuthSessionToken
```

Server validates session token against Better-Auth before upgrading the HTTP connection to WebSocket.

### Yjs Built-in Message Types

| Message | Direction | Description |
|---|---|---|
| `Y_SYNC_STEP_1` | Server → Client | Server sends its state vector on connect |
| `Y_SYNC_STEP_2` | Client → Server | Client sends all updates server is missing |
| `Y_UPDATE` | Bidirectional | Incremental Y.Doc diff, broadcast to room |
| `Y_AWARENESS` | Bidirectional | Cursor positions, user presence, selections |

### Application Message Types

```typescript
// Client → Server
type ClientMessage =
  | { type: 'join-board'; boardId: string; pageId: string }
  | { type: 'switch-page'; pageId: string }
  | { type: 'note-create'; pageId: string; noteId: string; x: number; y: number; content: string }
  | { type: 'note-update'; noteId: string; content?: string; x?: number; y?: number }
  | { type: 'note-delete'; noteId: string }

// Server → Client
type ServerMessage =
  | { type: 'room-joined'; members: AwarenessUser[] }
  | { type: 'page-switched'; pageId: string }
  | { type: 'note-synced'; note: Note }
  | { type: 'note-deleted'; noteId: string }
  | { type: 'snapshot-created'; snapshot: SnapshotMeta }
  | { type: 'page-restored'; pageId: string; snapshotId: string }
  | { type: 'member-joined'; user: AwarenessUser }
  | { type: 'member-left'; userId: string }
  | { type: 'error'; code: string; message: string }
```

### Server Room Management

```typescript
// In-memory room state (per WS server instance)
type Room = {
  boardId: string
  pageId: string
  doc: Y.Doc                          // Loaded from Page.yjsState
  awareness: Awareness
  clients: Map<WebSocket, ClientInfo> // ws → { userId, role }
}

const rooms = new Map<string, Room>() // key: `${boardId}:${pageId}`
```

---

## 11. Frontend Pages & Routing

```
app/
├── page.tsx                        → / (Landing page)
├── (auth)/
│   ├── signin/page.tsx             → /signin
│   └── signup/page.tsx             → /signup
├── dashboard/
│   ├── page.tsx                    → /dashboard (boards grid)
│   ├── notes/page.tsx              → /dashboard/notes (all notes)
│   └── settings/page.tsx           → /dashboard/settings
├── board/
│   └── [boardId]/
│       ├── page.tsx                → /board/:boardId (canvas)
│       └── snapshots/page.tsx      → /board/:boardId/snapshots
└── invite/
    └── [token]/page.tsx            → /invite/:token (join flow)
```

### Middleware (route protection)

```typescript
// middleware.ts
export const config = {
  matcher: ['/dashboard/:path*', '/board/:path*']
}

export default async function middleware(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return NextResponse.redirect('/signin')
  return NextResponse.next()
}
```

---

## 12. Notes & Snapshots

### Sticky Notes Architecture

Note **positions** are synced via Yjs (collaborative, instant). Note **content** is saved via REST to PostgreSQL (indexed, searchable, avoids binary Yjs bloat).

```typescript
// In Yjs Y.Doc — position only
const notePositions = ydoc.getMap<{ x: number; y: number; width: number }>('notePositions')

// In PostgreSQL via REST — content + metadata
// Note.content = Tiptap JSON string
// Note.x, Note.y = world coordinates (kept in sync with Yjs on blur)
```

### Snapshot Lifecycle

```
Auto-snapshot trigger:
  WS server detects 5 min of no Y.Doc updates on a page
    → Calls internal REST endpoint POST /internal/snapshots/auto
    → Generates PNG via node-canvas server-side render
    → Uploads PNG + thumb to Cloudflare R2
    → Saves yjsState + imageUrl to Snapshot table
    → Prunes oldest auto-snapshots if count > 20

Manual snapshot:
  User clicks "Save Snapshot" in UI
    → POST /api/boards/:id/snapshots { name: "Before client review" }
    → Same pipeline as auto, but type=MANUAL, never pruned

Snapshot restore:
  User selects snapshot → POST /api/.../restore
    → Server auto-snapshots current state first (safety net)
    → Page.yjsState updated to snapshot's yjsState
    → WS server broadcasts { type: 'page-restored', pageId }
    → All connected clients: Y.Doc replaced from new Page.yjsState
    → Full Y.SYNC sequence re-runs
```

---

## 13. Authentication Flow

```
Sign Up:
  POST /api/auth/sign-up/email { name, email, password }
    → Better-Auth hashes password, creates User + Session
    → Returns session cookie (httpOnly, secure, sameSite=lax)
    → Redirect → /dashboard

Sign In:
  POST /api/auth/sign-in/email { email, password }
    → Better-Auth verifies hash, creates new Session row
    → Returns session cookie
    → Redirect → /dashboard

GitHub OAuth:
  GET /api/auth/sign-in/github
    → Redirect → GitHub authorize page
    → Callback → /api/auth/callback/github
    → Better-Auth creates/links Account row, creates Session
    → Redirect → /dashboard

Session Validation (WS):
  Client sends sessionToken as URL query param
  WS server calls Better-Auth's verifySession(token)
  Returns { userId, user } or throws → drop connection

Sign Out:
  POST /api/auth/sign-out
    → Better-Auth deletes Session row from DB
    → Clears session cookie
    → Redirect → /signin
```

---

## 14. Security & Permissions

### Role Matrix

| Action | VIEWER | EDITOR | ADMIN | OWNER |
|---|---|---|---|---|
| View canvas | ✅ | ✅ | ✅ | ✅ |
| Send Y.Doc updates (draw) | ❌ | ✅ | ✅ | ✅ |
| Create/edit own notes | ❌ | ✅ | ✅ | ✅ |
| Delete others' notes | ❌ | ❌ | ✅ | ✅ |
| Create manual snapshot | ❌ | ✅ | ✅ | ✅ |
| Restore snapshot | ❌ | ❌ | ✅ | ✅ |
| Add/remove members | ❌ | ❌ | ✅ | ✅ |
| Generate invite links | ❌ | ❌ | ✅ | ✅ |
| Rename/archive board | ❌ | ❌ | ✅ | ✅ |
| Delete board | ❌ | ❌ | ❌ | ✅ |

### Security Practices

- All sessions DB-backed (revocable — not stateless JWT)
- WS connections validated before upgrade, not after
- Y.Doc updates rejected server-side if sender role is VIEWER
- Canvas element size clamped server-side (prevent canvas bomb: max 50,000×50,000 world units)
- Y.Doc binary size validated before persistence (max 10MB per page)
- Invite tokens are cuid2 (cryptographically random, not guessable)
- All Zod validation in shared `@devboard/common` package — single source of truth
- R2 snapshot URLs are signed (time-limited) for non-public boards

---

## 15. Performance Optimizations

### Canvas

- 4-layer architecture — static layer only redrawn when Y.Doc changes
- `requestAnimationFrame` with dirty flag — no render if nothing changed
- Offscreen canvas pre-render for static layer (`OffscreenCanvas` API)
- Ramer–Douglas–Peucker path simplification on freehand stroke commit (reduces point count by ~70%)
- Image elements: lazy-loaded and cached in a `Map<id, HTMLImageElement>` — never re-decoded
- Viewport culling: skip rendering elements outside current viewport bounds

### Networking

- Yjs diffs are tiny (50–200 bytes per operation vs sending full state)
- Y.Doc DB persistence debounced to 2 seconds (not every keystroke)
- Awareness throttled to 50ms (20fps for cursor updates)
- TanStack Query: stale-while-revalidate, background refetch only on window focus

### Database

```sql
-- Critical indexes
CREATE INDEX idx_board_owner ON "Board"("ownerId");
CREATE INDEX idx_boardmember_user ON "BoardMember"("userId");
CREATE INDEX idx_page_board_order ON "Page"("boardId", "order");
CREATE INDEX idx_snapshot_board_page_date ON "Snapshot"("boardId", "pageId", "createdAt");
CREATE INDEX idx_note_page ON "Note"("pageId");
CREATE INDEX idx_invite_token ON "InviteLink"("token");
```

- `Page.yjsState` (large Bytes column) excluded from all list queries — fetched only when opening a board
- Board list API returns thumbnail URL only — never canvas data
- Notes dashboard paginates (cursor-based, not offset)

---

## 16. Docker & Deployment

### Local Development (Docker Compose)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: devboard
      POSTGRES_USER: devboard
      POSTGRES_PASSWORD: devboard_local
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:  # Add when scaling WS server
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Production Services

| Service | Platform | Notes |
|---|---|---|
| `apps/frontend` | **Vercel** | Zero-config Next.js, Edge middleware, global CDN |
| `apps/api` | **Fly.io** or Railway | Always-on Node.js, auto-scaling |
| `apps/ws` | **Fly.io** (dedicated app) | Persistent WS connections, multi-region |
| PostgreSQL | **Neon** or Supabase | Serverless Postgres, branching for staging |
| Object Storage | **Cloudflare R2** | No egress fees, CDN via Cloudflare Workers |
| Error Tracking | **Sentry** | Frontend + backend |
| Logs | **Axiom** | Structured log ingestion |

### Production Dockerfiles

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm turbo

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/db/package.json ./packages/db/
COPY packages/common/package.json ./packages/common/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm turbo run build --filter=@devboard/api

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

---

## 17. Folder Structure

```
devboard/
├── apps/
│   ├── frontend/                   # Next.js 15
│   │   ├── app/
│   │   │   ├── page.tsx            # Landing
│   │   │   ├── (auth)/signin/
│   │   │   ├── (auth)/signup/
│   │   │   ├── dashboard/
│   │   │   └── board/[boardId]/
│   │   ├── components/
│   │   │   ├── canvas/
│   │   │   │   ├── CanvasEngine.ts        # Core render loop
│   │   │   │   ├── CanvasLayers.tsx       # 4-layer stack component
│   │   │   │   ├── tools/                 # pen.ts, rect.ts, select.ts ...
│   │   │   │   ├── elements/              # render functions per type
│   │   │   │   └── viewport.ts            # pan/zoom/coordinate transforms
│   │   │   ├── collaboration/
│   │   │   │   ├── YjsProvider.tsx        # Y.Doc + WS provider setup
│   │   │   │   ├── CursorLayer.tsx        # Remote cursors
│   │   │   │   └── PresenceBar.tsx        # Collaborator avatars
│   │   │   ├── dashboard/
│   │   │   ├── notes/
│   │   │   └── snapshots/
│   │   ├── stores/
│   │   │   └── canvasStore.ts             # Zustand store (UI state only)
│   │   └── lib/
│   │       ├── auth-client.ts             # Better-Auth client
│   │       └── query-client.ts            # TanStack Query setup
│   │
│   ├── api/                        # Express 5
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts                # Better-Auth session middleware
│   │   │   │   ├── requireRole.ts
│   │   │   │   └── validate.ts            # Zod request validation
│   │   │   ├── routes/
│   │   │   │   ├── boards.ts
│   │   │   │   ├── pages.ts
│   │   │   │   ├── notes.ts
│   │   │   │   ├── snapshots.ts
│   │   │   │   └── invites.ts
│   │   │   └── lib/
│   │   │       ├── auth.ts                # Better-Auth server instance
│   │   │       └── r2.ts                  # Cloudflare R2 client
│   │   └── Dockerfile
│   │
│   └── ws/                         # WebSocket server
│       ├── src/
│       │   ├── index.ts
│       │   ├── rooms.ts                   # Room manager (in-memory)
│       │   ├── auth.ts                    # Session validation
│       │   ├── persistence.ts             # Debounced Y.Doc → DB save
│       │   └── messages.ts                # Application-level message handler
│       └── Dockerfile
│
├── packages/
│   ├── db/                         # Prisma
│   │   ├── schema.prisma
│   │   └── index.ts                # Re-exports PrismaClient
│   ├── common/                     # Shared types + Zod schemas
│   │   ├── schemas/
│   │   │   ├── board.ts
│   │   │   ├── canvas.ts           # CanvasElement type
│   │   │   ├── ws.ts               # WS message types
│   │   │   └── note.ts
│   │   └── index.ts
│   ├── ui/                         # Shared React components
│   ├── eslint-config/
│   └── typescript-config/
│
├── docker-compose.yml              # Local dev (PostgreSQL + Redis)
├── turbo.json
└── pnpm-workspace.yaml
```

---

## 18. Environment Variables

```bash
# packages/db — used by both api and ws
DATABASE_URL="postgresql://devboard:devboard_local@localhost:5432/devboard"

# apps/api
PORT=3001
BETTER_AUTH_SECRET="your-secret-min-32-chars"
BETTER_AUTH_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

# OAuth (Better-Auth)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Cloudflare R2
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="devboard-snapshots"
R2_PUBLIC_URL="https://snapshots.devboard.app"

# apps/ws
PORT=3002
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="same-secret-as-api"
BETTER_AUTH_URL="http://localhost:3001"  # Points to API for session lookup

# apps/frontend (.env.local)
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3002"
BETTER_AUTH_SECRET="same-secret-as-api"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3001"
```

---

## 19. Future Scaling Path

```
Current (Phase 1–5):
  Single WS server instance
  Single API instance
  PostgreSQL on Neon
  Deploy: Vercel + Fly.io

Step 1 — Horizontal WS Scaling:
  Add Redis pub/sub
  WS servers publish Y.Doc updates to Redis channel
  Other WS instances subscribe and forward to their local clients
  Fly.io: scale ws app to 2+ instances

Step 2 — DB Connection Pooling:
  Add PgBouncer or use Neon's built-in connection pooling
  Required when WS server instances > 5

Step 3 — Offload Snapshot Generation:
  Move PNG rendering to a dedicated worker service
  Add a job queue (BullMQ + Redis) between API and worker
  Prevents snapshot rendering from blocking API responses

Step 4 — Kubernetes (if needed):
  When managing 5+ services with distinct scaling profiles
  Requires: Helm charts, ingress controller, cert-manager
  WebSocket affinity: use sticky sessions (ip_hash in nginx ingress)
  Not recommended before genuine need — operational overhead is high
```

---

*Last updated: March 2026*  
*This document reflects the finalized decisions from system design review.*