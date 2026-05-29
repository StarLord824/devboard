# Devboard — Implementation Log

> Tracks what's been built, per phase. Updated after each completion.

---

## Phase 1 — Core Drawing Board

### Scaffolding ✅

| Item                         | Status  | Files                                                                                                                           |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Archive old apps             | ✅ Done | `_archive-frontend/`, `_archive-api/`, `_archive-ws/`                                                                           |
| Scaffold Next.js 15 frontend | ✅ Done | `apps/frontend/` (App Router, Turbopack, Tailwind v4)                                                                           |
| Scaffold Express 5 API       | ✅ Done | `apps/api/src/index.ts` (health check endpoint)                                                                                 |
| Scaffold WS server           | ✅ Done | `apps/ws/src/index.ts` (ws + y-websocket)                                                                                       |
| Workspace conflicts resolved | ✅ Done | pnpm + Turborepo builds pass                                                                                                    |
| Prisma V2 schema             | ✅ Done | `packages/db/prisma/schema.prisma` — User, Session, Account, Verification, Board, BoardMember, Page, Note, Snapshot, InviteLink |

### Canvas Engine ✅

| Item                | Status  | Files                                                                                   |
| ------------------- | ------- | --------------------------------------------------------------------------------------- |
| Type system         | ✅ Done | `src/lib/canvas-types.ts` — CanvasElement, ToolType, Camera, ElementStyle               |
| Viewport transforms | ✅ Done | `src/lib/viewport.ts` — worldToScreen, screenToWorld, culling                           |
| Path simplification | ✅ Done | `src/lib/simplify-path.ts` — Ramer–Douglas–Peucker                                      |
| Zustand store       | ✅ Done | `src/stores/canvasStore.ts` — all UI state (tool, zoom, camera, selection, pan)         |
| 4-layer engine      | ✅ Done | `src/components/canvas/CanvasEngine.ts` — static/active/cursor/overlay layers           |
| Layer mount         | ✅ Done | `src/components/canvas/CanvasLayers.tsx` — stacked canvases + local element state       |
| Element renderer    | ✅ Done | `src/components/canvas/elements/renderer.ts` — path, rect, ellipse, line, arrow, text   |
| Toolbar             | ✅ Done | `src/components/canvas/Toolbar.tsx` — 9 tools + 6-color palette + react-colorful        |
| Settings panel      | ✅ Done | `src/components/canvas/SettingsPanel.tsx` — bg color picker + pattern (plain/grid/dots) |
| Minimap             | ✅ Done | `src/components/canvas/Minimap.tsx` — auto-show on zoom/pan                             |
| Canvas Topbar       | ✅ Done | `src/components/canvas/CanvasTopbar.tsx` — board name, back to dashboard, share button  |
| Board route         | ✅ Done | `src/app/board/[boardId]/page.tsx` — fullscreen canvas                                  |

### Dependencies Installed ✅

`zustand`, `immer`, `@tanstack/react-query`, `axios`, `yjs`, `y-websocket`, `dexie`, `lucide-react`, `motion`, `zod`, `nanoid`, `react-colorful`

### Remaining Phase 1 Work

| Item                                              | Status         | Blocked On    |
| ------------------------------------------------- | -------------- | ------------- |
| shadcn/ui init + components                       | ⬜ Not started | —             |
| Design tokens (CSS vars)                          | ⬜ Not started | shadcn init   |
| next-themes (dark/light mode)                     | ⬜ Not started | —             |
| Toolbar refactor → shadcn Toggle/Tooltip          | ⬜ Not started | shadcn init   |
| Style Panel (right side, element styling)         | ⬜ Not started | shadcn init   |
| **Zoom controls widget**                          | ✅ Done        | —             |
| Undo/Redo (Yjs UndoManager)                       | ⬜ Not started | Phase 4       |
| TanStack Query provider                           | ⬜ Not started | —             |
| Dexie.js IndexedDB cache                          | ⬜ Not started | —             |
| Auto-save (debounced persist)                     | ⬜ Not started | Phase 4 (Yjs) |
| **Keyboard shortcut alignment** (V,P,R,E,L,A,T,H) | ✅ Done        | —             |
| **Object Eraser & Proportional Scale**            | ✅ Done        | —             |
| **Stroke Style (Solid/Dashed)**                   | ✅ Done        | —             |

---

<!-- phase 2 -->

## Phase 2 — Authentication

| Item                        | Status  | Files                                                                  |
| --------------------------- | ------- | ---------------------------------------------------------------------- |
| Better-Auth server config   | ✅ Done | `src/lib/auth.ts` — Prisma adapter, email/password + GitHub OAuth      |
| Better-Auth client hooks    | ✅ Done | `src/lib/auth-client.ts` — `signIn`, `signUp`, `useSession`, `signOut` |
| Next.js API catch-all route | ✅ Done | `src/app/api/auth/[...all]/route.ts`                                   |
| Route protection middleware | ✅ Done | `src/middleware.ts` — redirects unauthenticated users                  |
| Sign In page                | ✅ Done | `src/app/(auth)/signin/page.tsx` — split-panel, GitHub + email         |
| Sign Up page                | ✅ Done | `src/app/(auth)/signup/page.tsx` — split-panel, GitHub + email         |
| WS session validation       | ✅ Done | `apps/ws/src/index.ts` — cookie-based session check on upgrade         |
| Email/password sign-up      | ✅ Done | Verified working end-to-end                                            |

### Dependencies Installed

`better-auth`, `@better-fetch/fetch`, `@devboard/db` (workspace), `cookie`, `@types/cookie`

---

<!-- phase 3 -->

## Phase 3 — Dashboard & Multi-Board

| Item                      | Status  | Files                                                                                    |
| ------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| Dashboard layout          | ✅ Done | `src/app/dashboard/layout.tsx` — sidebar + main content                                  |
| Sidebar navigation        | ✅ Done | `src/components/dashboard/Sidebar.tsx` — nav, user avatar, sign out                      |
| Topbar                    | ✅ Done | `src/components/dashboard/Topbar.tsx` — search, new board button                         |
| Dashboard page            | ✅ Done | `src/app/dashboard/page.tsx` — grid/list toggle, search, empty state                     |
| Board CRUD server actions | ✅ Done | `src/app/dashboard/actions.ts` — get, create, rename, duplicate, archive, delete         |
| Board Card                | ✅ Done | `src/components/dashboard/BoardCard.tsx` — thumbnail, menu, inline rename, share button  |
| Create Board Dialog       | ✅ Done | `src/components/dashboard/CreateBoardDialog.tsx` — modal with name input                 |
| Page management actions   | ✅ Done | `src/app/dashboard/board-actions.ts` — CRUD + reorder + getBoardName                     |
| Pages Strip               | ✅ Done | `src/components/canvas/PagesStrip.tsx` — tabs, inline rename/delete, drag-to-reorder     |
| Board Client wrapper      | ✅ Done | `src/app/board/[boardId]/BoardClient.tsx` — topbar + canvas + pages strip                |
| Share actions             | ✅ Done | `src/app/dashboard/share-actions.ts` — invite link CRUD + accept                         |
| Share Dialog              | ✅ Done | `src/components/dashboard/ShareDialog.tsx` — generate/copy/revoke links                  |
| Invite page               | ✅ Done | `src/app/invite/[token]/page.tsx` — accept invite + redirect to board                    |
| Notes stub page           | ✅ Done | `src/app/dashboard/notes/page.tsx` — placeholder (Phase 5)                               |
| Snapshots stub page       | ✅ Done | `src/app/dashboard/snapshots/page.tsx` — placeholder (Phase 5)                           |
| Settings stub page        | ✅ Done | `src/app/dashboard/settings/page.tsx` — shows user name/email via useSession             |

---

## Infrastructure & DevOps

| Item                              | Status  | Files                                                                              |
| --------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| Local dev env files               | ✅ Done | `apps/frontend/.env.local`, `apps/api/.env`, `apps/ws/.env`, `packages/db/.env`   |
| Docker — frontend                 | ✅ Done | `apps/frontend/Dockerfile` — 4-stage turbo prune + Next.js standalone             |
| Docker — API                      | ✅ Done | `apps/api/Dockerfile` — 4-stage Node.js build                                     |
| Docker — WS                       | ✅ Done | `apps/ws/Dockerfile` — 4-stage with prisma generate                               |
| docker-compose.prod.yml           | ✅ Done | Full stack: db (healthcheck) + api + ws + frontend                                 |
| .dockerignore                     | ✅ Done | Excludes node_modules, .next, dist, .turbo, _archive-*                             |
| Root pnpm scripts                 | ✅ Done | `db:up`, `db:down`, `docker:prod:up`, `docker:prod:down` in root `package.json`   |
| Next.js standalone output         | ✅ Done | `output: "standalone"` in `next.config.ts`                                        |
| Fix: `ws` direct dependency       | ✅ Done | Added `ws` to `apps/ws/package.json` — was crashing on startup                    |
| Fix: `@prisma/client` in frontend | ✅ Done | Added to `apps/frontend/package.json` + `serverExternalPackages` in next.config   |
| Fix: Account.password migration   | ✅ Done | `packages/db/prisma/migrations/20260529.../` — adds `password` col to Account     |
| Fix: Removed Google OAuth stub    | ✅ Done | Removed unused Google provider from `auth.ts` (no env vars, no UI)                |

---

## Future Phases

_Phase 4 (Collaboration / Yjs), Phase 5 (Notes & Snapshots), Landing Page — not started_
