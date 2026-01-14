## **What DevBoard Is**

DevBoard is a **real-time collaborative whiteboard platform** for developers, students, and knowledge workers to **draw, think, and take visual notes together**. It features **offline-first workflows, versioned state, and deep embedding into existing tools**.

At its core, DevBoard is an **Excalidraw-class collaborative canvas** extended with:

- Git-style versioning
- Notion-native embedding
- A lightweight browser overlay for contextual note-taking

The platform feels **fast, local, and resilient**—even under poor network conditions.

---

## **Core Design Principles**

1. **Local-first by default** — users can draw without network access.
2. **Conflict-free collaboration** — multiple users edit simultaneously without locks.
3. **Composable surface** — boards work standalone, embedded, or as overlays.
4. **Minimal cognitive load** — simple primitives, no design-tool complexity.
5. **Scalable backend** — real-time where needed, REST where appropriate.

---

# **Platform Versions (Roadmap-Aligned)**

## **V1 — Collaborative Whiteboard (Current Focus)**

- Infinite canvas with basic drawing primitives
- Real-time multi-user collaboration
- Presence (cursors, selections)
- Offline edits with sync-on-reconnect
- Persistent boards with snapshots and commits

**Primary use cases:**

- System design discussions
- Lecture note sketching
- Brainstorming sessions
- Interview preparation

---

## **V2 — Embedded Knowledge Surface**

- Boards embed as **live canvases inside Notion**
- Read-only or editable embed modes
- Seamless transition between embedded view and full app

**Primary use cases:**

- Living diagrams inside documentation
- Collaborative notes inside Notion pages
- Design docs that stay current

---

## **V3 — Contextual Overlay (Browser Extension)**

- Floating, resizable canvas over any webpage
- One-click minimize/maximize
- Save overlays directly into boards
- Screenshot + annotate workflow

**Primary use cases:**

- Taking notes while watching lectures or tutorials
- Annotating documentation or dashboards
- Rapid idea capture without context switching

---

# **High-Level Architecture Overview**

DevBoard uses a **clean separation of concerns** across three layers:

```
Client Layer  →Real-Time Sync Layer  →  Persistence Layer

```

Each layer scales and replaces independently.

---

## **1. Client Layer**

### **Components**

- **Web App (Next.js)**
    - Canvas rendering
    - User interactions (draw, move, resize)
    - Collaboration UI (presence, cursors)
- **Notion Embed**
    - Lightweight iframe view
    - Secure, scoped access
- **Browser Extension**
    - Overlay iframe injected into webpages
    - Shares the same backend and collaboration engine

### **Key Characteristics**

- No authoritative state stored on the client
- Uses CRDTs to reconcile concurrent edits
- Works offline using local persistence

---

## **2. Real-Time Collaboration Layer (WebSocket)**

This is the **heart of DevBoard**.

### **Responsibilities**

- Maintain one shared CRDT document per board
- Broadcast real-time updates between connected clients
- Handle user presence and awareness
- Enforce access control at connection time
- Persist incremental state updates

### **Core Concepts**

- **Room-based model:** one WebSocket room per board
- **CRDT-based state:** conflict-free merging
- **Awareness channel:** ephemeral presence data (not persisted)

### **Why This Matters**

- No edit locks
- No merge conflicts
- Natural multi-user experience
- Works equally well for 2 or 200 users

---

## **3. HTTP API Layer**

### **Responsibilities**

- Authentication and identity verification
- Board metadata management
- Membership and permissions
- Snapshot and commit retrieval
- Integration endpoints (Notion, future APIs)

### **What It Does NOT Do**

- Real-time state synchronization
- Canvas logic
- Collaboration orchestration

This keeps REST predictable and easy to debug.

---

## **4. Persistence Layer**

### **Primary Storage**

- **PostgreSQL**
    - Boards
    - Members
    - Commits
    - Snapshot metadata

### **State Persistence Strategy**

- **Append-only CRDT update log (WAL)**
- **Periodic snapshots** (JSON + rendered PNG)
