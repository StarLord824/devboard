# Devboard — UI Specifications

> Design system, component map, and page-by-page UI spec  
> Stack: shadcn/ui · Aceternity UI · TailAdmin · next-themes · Tailwind CSS v4 · Motion

---

## Table of Contents

1. [Design System — Tokens & Theming](#1-design-system--tokens--theming)
2. [Dark / Light Mode Architecture](#2-dark--light-mode-architecture)
3. [Typography](#3-typography)
4. [Component Library Map](#4-component-library-map)
5. [Landing Page](#5-landing-page)
6. [Auth Pages — Sign In & Sign Up](#6-auth-pages--sign-in--sign-up)
7. [Dashboard — Boards Grid](#7-dashboard--boards-grid)
8. [Dashboard — Notes Page](#8-dashboard--notes-page)
9. [Dashboard — Snapshots Page](#9-dashboard--snapshots-page)
10. [Dashboard — Settings Page](#10-dashboard--settings-page)
11. [Canvas Board — Full Spec](#11-canvas-board--full-spec)
12. [Canvas Toolbar — Tool Picker](#12-canvas-toolbar--tool-picker)
13. [Canvas — Style Panel](#13-canvas--style-panel)
14. [Canvas — Collaborator UI](#14-canvas--collaborator-ui)
15. [Canvas — Pages Strip](#15-canvas--pages-strip)
16. [Sticky Notes — On Canvas](#16-sticky-notes--on-canvas)
17. [Invite & Share Flow](#17-invite--share-flow)
18. [Responsive & Breakpoints](#18-responsive--breakpoints)
19. [Animation Guidelines](#19-animation-guidelines)
20. [Accessibility](#20-accessibility)

---

## 1. Design System — Tokens & Theming

All tokens are CSS custom properties defined in `globals.css`. TailAdmin's `@theme` block is extended to include these. shadcn/ui reads from the same variables via its `cn()` utility. Aceternity components are dropped in as-is and inherit the theme automatically via Tailwind.

### Color Tokens

```css
/* globals.css */
@layer base {
  :root {
    /* === BRAND === */
    --color-brand:         220 90% 56%;    /* #3b82f6 — primary blue */
    --color-brand-hover:   220 90% 48%;
    --color-brand-subtle:  220 90% 96%;

    /* === CANVAS === */
    --color-canvas-bg:     240 5% 96%;     /* light canvas surface */
    --color-canvas-grid:   240 5% 88%;     /* grid dot/line color */

    /* === SURFACE === */
    --color-bg:            0 0% 100%;
    --color-bg-subtle:     240 5% 96%;
    --color-bg-muted:      240 5% 92%;
    --color-surface:       0 0% 100%;
    --color-surface-raised: 0 0% 98%;

    /* === BORDER === */
    --color-border:        240 5% 88%;
    --color-border-subtle: 240 5% 93%;

    /* === TEXT === */
    --color-text:          240 10% 10%;
    --color-text-muted:    240 5% 45%;
    --color-text-subtle:   240 5% 65%;

    /* === STATUS === */
    --color-success:       142 72% 29%;
    --color-warning:       38 92% 50%;
    --color-danger:        0 84% 60%;
    --color-info:          199 89% 48%;

    /* === SHADOWS === */
    --shadow-sm:   0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md:   0 4px 12px 0 rgb(0 0 0 / 0.08);
    --shadow-lg:   0 8px 24px 0 rgb(0 0 0 / 0.12);

    /* === RADIUS === */
    --radius-sm:  4px;
    --radius-md:  8px;
    --radius-lg:  12px;
    --radius-xl:  16px;
    --radius-full: 9999px;
  }

  .dark {
    /* === BRAND === */
    --color-brand:         213 94% 68%;
    --color-brand-hover:   213 94% 60%;
    --color-brand-subtle:  213 94% 12%;

    /* === CANVAS === */
    --color-canvas-bg:     240 6% 10%;     /* dark canvas — NOT pure black */
    --color-canvas-grid:   240 6% 16%;

    /* === SURFACE === */
    --color-bg:            240 6% 7%;
    --color-bg-subtle:     240 6% 10%;
    --color-bg-muted:      240 6% 13%;
    --color-surface:       240 6% 11%;
    --color-surface-raised: 240 6% 14%;

    /* === BORDER === */
    --color-border:        240 5% 20%;
    --color-border-subtle: 240 5% 16%;

    /* === TEXT === */
    --color-text:          240 5% 95%;
    --color-text-muted:    240 5% 60%;
    --color-text-subtle:   240 5% 40%;

    /* === STATUS === */
    --color-success:       142 70% 45%;
    --color-warning:       38 92% 60%;
    --color-danger:        0 84% 65%;
    --color-info:          199 89% 58%;

    /* === SHADOWS === */
    --shadow-sm:   0 1px 2px 0 rgb(0 0 0 / 0.3);
    --shadow-md:   0 4px 12px 0 rgb(0 0 0 / 0.4);
    --shadow-lg:   0 8px 24px 0 rgb(0 0 0 / 0.5);
  }
}
```

### Tailwind Extension

```css
/* globals.css — extend TailAdmin's @theme block */
@theme {
  --color-brand:          hsl(var(--color-brand));
  --color-brand-hover:    hsl(var(--color-brand-hover));
  --color-canvas-bg:      hsl(var(--color-canvas-bg));
  --color-surface:        hsl(var(--color-surface));
  --color-surface-raised: hsl(var(--color-surface-raised));
  --color-text-muted:     hsl(var(--color-text-muted));
  --color-border:         hsl(var(--color-border));
}
```

---

## 2. Dark / Light Mode Architecture

**Tool:** `next-themes` — handles class toggling, system preference detection, and hydration flicker prevention.

**Strategy:** Tailwind `class` mode. The `.dark` class is toggled on `<html>` by next-themes. TailAdmin already uses this pattern natively.

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Theme toggle component** — placed in dashboard topbar and canvas topbar:

```tsx
// components/ui/ThemeToggle.tsx
'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**Canvas special case:** The canvas background color is read from CSS variables at runtime, NOT from a hardcoded hex. This ensures canvas repaints on theme change.

```typescript
// In canvas render loop
const bg = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-canvas-bg')
ctx.fillStyle = `hsl(${bg})`
```

---

## 3. Typography

| Role | Font | Weight | Size | Usage |
|---|---|---|---|---|
| Display | Geist | 700 | 48–72px | Landing page hero only |
| Heading 1 | Geist | 600 | 30px | Page titles |
| Heading 2 | Geist | 600 | 24px | Section headers |
| Heading 3 | Geist | 500 | 18px | Card titles, panel headers |
| Body | Geist | 400 | 14px | Default UI text |
| Body Small | Geist | 400 | 12px | Labels, metadata, timestamps |
| Mono | Geist Mono | 400 | 13px | Board IDs, code, keyboard shortcuts |
| Canvas Label | Geist | 500 | 11–13px | Canvas element text, cursor labels |

Load via `next/font/google` or `next/font/local` for zero layout shift.

---

## 4. Component Library Map

**Rule: Aceternity UI is for marketing pages only. Inside the app (dashboard + canvas), use shadcn/ui exclusively.**

### shadcn/ui — App Components

Install these via `npx shadcn@latest add`:

| Component | Used For |
|---|---|
| `Button` | All action buttons across app |
| `Input` | Forms, board rename, search |
| `Textarea` | Note content editor fallback |
| `Dialog` | Create board, delete confirm, rename |
| `Sheet` | Notes drawer, snapshots drawer (slides from right) |
| `Popover` | Style panel (color picker, stroke width) |
| `DropdownMenu` | Board context menu, member role selector |
| `ContextMenu` | Right-click on canvas element |
| `Tooltip` | Toolbar icons, all icon-only buttons |
| `Tabs` | Canvas pages strip, dashboard view toggle |
| `Toggle` | Tool picker buttons (active/inactive state) |
| `ToggleGroup` | Grouped tool picker in canvas toolbar |
| `Slider` | Opacity, stroke width in style panel |
| `Select` | Role selector in invite modal |
| `Badge` | Member role chips, board status tags |
| `Avatar` | Collaborator presence bar, member lists |
| `AvatarGroup` | Multiple collaborators stacked |
| `Card` | Board grid thumbnails, note cards in drawer |
| `Separator` | Toolbar dividers, panel sections |
| `ScrollArea` | Pages list, notes list, snapshot list |
| `Skeleton` | Loading states for board grid |
| `Toast / Sonner` | Success/error feedback (save, share, copy) |
| `Alert` | Destructive action warnings |
| `HoverCard` | Board thumbnail preview on hover |
| `Command` | Board search palette (Cmd+K) |

### Aceternity UI — Landing Page Components

| Aceternity Component | Used On |
|---|---|
| `Spotlight` | Landing hero background |
| `Background Beams with Collision` | Hero section behind headline |
| `Aurora Background` | Alternate hero variant (light mode) |
| `Bento Grid` | Features section |
| `Animated Tooltip` | Collaborator avatars in features demo |
| `Text Generate Effect` | Hero headline animation on load |
| `Flip Words` | Hero subheadline cycling descriptor |
| `Tracing Beam` | Features scroll section (left rail) |
| `Card Hover Effect` | Pricing cards |
| `Moving Border` | Primary CTA button on landing |
| `Infinite Moving Cards` | Testimonials / use-case strip |
| `Navbar Menu` | Landing page navigation |
| `Canvas Reveal Effect` | "How it works" section reveal |

### Magic UI — Landing Page Supplements

| Magic UI Component | Used On |
|---|---|
| `Bento Grid` | Feature highlights grid (alternative to Aceternity) |
| `Animated List` | Collaboration activity feed demo in features |
| `Marquee` | Logo strip or feature tag cloud |
| `Shine Border` | Feature card borders |

---

## 5. Landing Page

**Route:** `/`  
**Vibe:** Dark by default. Professional, technical, creative. Think Linear meets Excalidraw.

### Sections (top to bottom)

---

#### 5.1 Navbar

```
[Logo + "Devboard"]                    [Features] [Pricing] [Docs]    [Sign In]  [Get Started →]
```

- **Component:** Aceternity `Navbar Menu` (sticky, hides on scroll down, reveals on scroll up)
- Background: `bg-background/80 backdrop-blur-md border-b border-border/40`
- Logo: SVG mark + wordmark in Geist 600
- Nav links: `text-text-muted hover:text-text transition-colors`
- "Sign In": shadcn `Button variant="ghost"`
- "Get Started": shadcn `Button` with Aceternity `Moving Border` wrapper
- Theme toggle: `ThemeToggle` component (right side of nav)

---

#### 5.2 Hero

**Background:** Aceternity `Spotlight` + `Background Beams with Collision`

```
                    [ Spotlight effect fills viewport ]

              ✦  Introducing Devboard

     Draw. Think. Collaborate.
     in real-time.

     The infinite canvas built for teams who think visually.
     No bloat. No friction. Just draw.

          [ Start Drawing Free ]    [ See it live → ]

     [ Canvas preview screenshot / animated demo ]
```

- Headline: Geist 700, 64px, `Text Generate Effect` on load
- Subheadline: `Flip Words` cycling through: _"collaborate"_ / _"brainstorm"_ / _"design"_ / _"plan"_
- Primary CTA: shadcn `Button size="lg"` + Aceternity `Moving Border`
- Secondary CTA: shadcn `Button variant="ghost" size="lg"` with arrow icon
- Hero image: Animated screenshot of the canvas board with live cursor demo (short looped video or gif)
- Below the fold hint: subtle animated scroll indicator

---

#### 5.3 Social Proof Strip

```
Trusted by teams at  [Logo] [Logo] [Logo] [Logo] [Logo] [Logo]
```

- Magic UI `Marquee` — slow continuous scroll of company name/logo placeholders
- `bg-bg-subtle border-y border-border`

---

#### 5.4 Features — Bento Grid

**Component:** Aceternity `Bento Grid` with 6 cards

```
┌─────────────────────────┬──────────────┐
│  Real-time collaboration│  Infinite    │
│  Live cursors. See      │  Canvas      │
│  every stroke as it     │              │
│  happens.               │              │
├──────────────┬──────────┴──────────────┤
│  Sticky      │  Versioned Snapshots    │
│  Notes       │  Roll back to any       │
│              │  point in time.         │
├──────────────┴──────────┬──────────────┤
│  Multi-page Boards      │  Share in    │
│  Organize work across   │  one click   │
│  pages like Figma.      │              │
└─────────────────────────┴──────────────┘
```

- Card 1 (large, 2-col): Collaboration — show animated cursors with `Animated Tooltip` on avatars
- Card 2: Infinite Canvas — canvas grid pattern background
- Card 3: Sticky Notes — color note grid preview
- Card 4: Snapshots — timeline/version history preview
- Card 5: Multi-page — tab strip preview
- Card 6: Sharing — one-click link copy animation
- Aceternity `Tracing Beam` on the left as user scrolls through this section

---

#### 5.5 How It Works

3-step horizontal or vertical walkthrough:

```
  01. Create a board         02. Invite your team        03. Draw together
  One click. Infinite        Share a link. No            Real-time sync.
  canvas, ready to go.       account needed to join.     Zero conflicts.
```

- **Component:** Aceternity `Canvas Reveal Effect` — each step revealed on scroll
- Step number: large muted Geist Mono `01`, `02`, `03`
- Accompanying micro-animation or static screenshot per step

---

#### 5.6 Testimonials

```
"Devboard replaced our entire Miro setup."    "The fastest whiteboard I've used."
```

- **Component:** Aceternity `Infinite Moving Cards` — slow horizontal scroll
- Card style: `bg-surface border border-border rounded-xl p-6`
- Quote text + avatar + name + company

---

#### 5.7 Pricing

3-tier pricing grid:

```
      Free              Pro ($9/mo)           Team ($29/mo)
  3 boards            Unlimited boards       Everything in Pro
  Solo only           Invite collaborators   Admin controls
  5 snapshots/board   Unlimited snapshots    Priority support
  [ Get Started ]     [ Start Free Trial ]   [ Contact Sales ]
```

- **Component:** Aceternity `Card Hover Effect` on each pricing card
- Pro card: `border-brand` highlight ring + "Most Popular" badge
- CTA buttons: shadcn `Button` (ghost, default, outline variants)

---

#### 5.8 CTA Banner

```
        Ready to draw your next big idea?

              [ Start for Free — No credit card ]
```

- Full-width section with Aceternity `Aurora Background`
- Single large CTA button with `Moving Border`

---

#### 5.9 Footer

```
[Logo]  [Devboard]                   Product    Company    Legal
                                     Features   About      Privacy
                                     Pricing    Blog       Terms
                                     Changelog  Contact    Cookies

© 2025 Devboard. All rights reserved.              [Twitter] [GitHub] [Discord]
```

- `bg-bg-subtle border-t border-border`
- 4-column grid on desktop, stacked on mobile

---

## 6. Auth Pages — Sign In & Sign Up

**Routes:** `/signin`, `/signup`  
**Layout:** Split-panel. Left: brand panel. Right: form.

```
┌────────────────────────────┬────────────────────────────┐
│                            │                            │
│   [Aceternity Spotlight]   │   Sign in to Devboard      │
│                            │                            │
│   [Logo]                   │   [GitHub OAuth button]    │
│   Devboard                 │   ─── or ───               │
│                            │   Email ________________   │
│   "Draw. Think.            │   Password _____________   │
│    Collaborate."           │                            │
│                            │   [Sign In]                │
│                            │                            │
│                            │   Don't have an account?   │
│                            │   Sign up →                │
└────────────────────────────┴────────────────────────────┘
```

- Left panel: `bg-bg-subtle` with Aceternity `Spotlight` + brand quote
- Right panel: `bg-background` centered form
- GitHub button: full-width, `variant="outline"` + GitHub icon
- Divider: shadcn `Separator` with "or" label
- Form fields: shadcn `Input` + `Label`
- Submit: full-width shadcn `Button`
- Error state: shadcn `Alert variant="destructive"` above form
- Loading state: Button shows spinner + "Signing in..."
- Link to other auth page: `text-brand hover:underline`

---

## 7. Dashboard — Boards Grid

**Route:** `/dashboard`  
**Layout:** TailAdmin sidebar layout (adapted). Left sidebar + main content area.

### Sidebar

```
┌──────────────────┐
│  [Logo] Devboard │
├──────────────────┤
│  ◉ Boards        │
│  ○ Notes         │
│  ○ Snapshots     │
│  ○ Settings      │
├──────────────────┤
│  Recent Boards   │
│  > My Board      │
│  > Team Ideas    │
│  > Wireframes    │
├──────────────────┤
│  [Avatar] User   │
│  name@email.com  │
└──────────────────┘
```

- TailAdmin's sidebar component, reskinned with Devboard tokens
- Active nav item: `bg-brand/10 text-brand border-r-2 border-brand`
- Sidebar collapse toggle on mobile (hamburger)
- Recent boards: last 5 accessed, with board thumbnail `14×14` favicon

### Topbar

```
[☰ Sidebar]   Boards                    [🔍 Search]  [+ New Board]  [🔔]  [Theme]  [Avatar]
```

- Search: Cmd+K opens shadcn `Command` palette with board search
- "+ New Board": shadcn `Button` → opens `Dialog` with board name input
- Notification bell: placeholder for Phase 4 collab notifications

### Board Grid

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ [thumb]  │  │ [thumb]  │  │ [thumb]  │  │    +     │
│          │  │          │  │          │  │  New     │
│ Board A  │  │ Board B  │  │ Board C  │  │  Board   │
│ 2h ago   │  │ Yesterday│  │ 3 days   │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

- Grid: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`
- Board Card:
  - shadcn `Card` with `hover:shadow-lg hover:border-brand/40 transition-all cursor-pointer`
  - Thumbnail: `aspect-video bg-canvas-bg` — rendered PNG snapshot or live mini-canvas
  - Title: Geist 500 14px, truncated
  - Metadata: last edited timestamp, member count avatars
  - On hover: `...` overflow menu appears (top-right) → Rename, Duplicate, Archive, Delete
- List toggle: `Tabs` with Grid / List icons in topbar
- Loading: shadcn `Skeleton` cards matching grid layout
- Empty state: centered illustration + "Create your first board" CTA

### Board Context Menu (right-click or `...` menu)

```
Open
Open in new tab
─────────────
Rename
Duplicate
─────────────
Share
Copy link
─────────────
Archive
Delete
```

- shadcn `DropdownMenu`
- "Delete" item: `text-danger` color, opens confirmation `Dialog`

---

## 8. Dashboard — Notes Page

**Route:** `/dashboard/notes`

```
Notes                         [Filter: All boards ▼]  [Sort: Recent ▼]  [🔍 Search notes]

┌─────────────────────────────────────────────────────────────────┐
│ My Board › Page 1          ●  2h ago                            │
│ This is the content of the sticky note. It can be multi-line... │
│ [View on Canvas →]                                              │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ Team Ideas › Page 2        ●  Yesterday                         │
│ Action items from the meeting: 1. Finalize color palette...     │
│ [View on Canvas →]                                              │
└─────────────────────────────────────────────────────────────────┘
```

- Each note: shadcn `Card` with left color accent strip matching note color
- Board + page breadcrumb in card header: `text-text-muted text-xs`
- "View on Canvas →": navigates to `/board/[boardId]?page=[pageId]&highlight=[noteId]` — canvas scrolls to and highlights the note
- Pagination: cursor-based, shadcn `Button` "Load more" at bottom
- Empty state: "No notes yet. Add sticky notes on any canvas."

---

## 9. Dashboard — Snapshots Page

**Route:** `/board/[boardId]/snapshots`

```
Snapshots — My Board                      [+ Save Snapshot]

Auto-saved   Manual   ← filter tabs

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  [thumb]    │  │  [thumb]    │  │  [thumb]    │
│  Today 2:30 │  │  Yesterday  │  │  Before...  │
│  Auto       │  │  Auto       │  │  "v1.0"     │
│  [Restore]  │  │  [Restore]  │  │  [Restore]  │
└─────────────┘  └─────────────┘  └─────────────┘
```

- Snapshot card: `aspect-video` thumbnail + metadata + Restore button
- Manual snapshots: show user-given name prominently
- "Restore" button: opens confirmation `Dialog` (warns current state will be saved first)
- "+ Save Snapshot": opens `Dialog` with optional name field

---

## 10. Dashboard — Settings Page

**Route:** `/dashboard/settings`

Sections:
- **Profile:** Avatar upload, display name, email (read-only if OAuth)
- **Account:** Change password (email accounts only), delete account
- **Appearance:** Theme selector (Light / Dark / System) — uses `ThemeToggle` expanded UI
- **Notifications:** Toggle email notifications (Phase 4+)

- TailAdmin's settings page layout adapted
- Form fields: shadcn `Input`, `Button`
- Danger zone (delete account): `border-danger/30 bg-danger/5` section, requires typed confirmation

---

## 11. Canvas Board — Full Spec

**Route:** `/board/[boardId]`

### Layout Zones

```
┌─────────────────────────────────────────────────────────┐
│  TOPBAR (56px fixed)                                    │
├───┬─────────────────────────────────────────────────────┤
│   │                                                     │
│ T │                                                     │
│ O │           CANVAS (fills remaining space)            │
│ O │                                                     │
│ L │              [cursor layer]                         │
│ B │              [active layer]                         │
│ A │              [static layer]                         │
│ R │                                                     │
│   │                                                     │
├───┴─────────────────────────────────────────────────────┤
│  PAGES STRIP (40px fixed)                               │
└─────────────────────────────────────────────────────────┘

           [ZOOM CONTROLS — bottom left, floating]
        [STYLE PANEL — right side, floating, on selection]
        [MINIMAP — bottom right, floating]
```

### Topbar (56px)

```
[← Dashboard]  [Board Name ✎]  [Page count]     [Share]  [Snapshot 📷]  [Theme]  [User Avatars]
```

- `bg-surface border-b border-border`
- "← Dashboard": shadcn `Button variant="ghost" size="sm"` with chevron
- Board name: inline-editable `<span>` — click to become `Input`, blur to save, Enter to save
- Page count: `text-text-muted text-sm` — "3 pages"
- Share button: shadcn `Button variant="outline"` → opens Share `Dialog`
- Snapshot button: camera icon, `Button variant="ghost" size="icon"` → creates manual snapshot
- Collaborator avatars: stacked `Avatar` components (max 4 shown, +N for overflow)
  - Each avatar has colored ring matching their cursor color
  - Hover: `HoverCard` showing name + "viewing" or "editing" status

---

## 12. Canvas Toolbar — Tool Picker

**Position:** Left side, vertically centered, floating pill

```
┌───┐
│ ✥ │  Select / Move (V)
├───┤
│ ✏ │  Pen / Freehand (P)
├───┤
│ □ │  Rectangle (R)
├───┤
│ ○ │  Ellipse (E)
├───┤
│ / │  Line (L)
├───┤
│ → │  Arrow (A)
├───┤
│ T │  Text (T)
├───┤
│ ◻ │  Image (I)
├───┤
│ ⌫ │  Eraser (X)
└───┘
```

- Container: `bg-surface border border-border rounded-xl shadow-lg p-1 flex flex-col gap-0.5`
- Each tool: shadcn `Toggle` with `Tooltip` showing name + keyboard shortcut
  - Default: `text-text-muted hover:bg-bg-muted hover:text-text`
  - Active: `bg-brand/15 text-brand`
  - Size: `h-9 w-9 rounded-lg`
- `Separator` between tool groups (select / draw / shapes / utility)
- Tool icon source: `lucide-react` icons

---

## 13. Canvas — Style Panel

**Trigger:** Appears when 1+ elements are selected  
**Position:** Floating, right side of canvas, `top-[72px] right-4`

```
┌────────────────────────┐
│ Style                  │
├────────────────────────┤
│ Stroke                 │
│ ●●●●●●●●  [hex input] │  ← color swatches
│                        │
│ Fill                   │
│ ●●●●●●●●  [hex input] │
│  ○ Transparent         │
├────────────────────────┤
│ Stroke Width           │
│ ──────●─────  3px      │
├────────────────────────┤
│ Opacity                │
│ ──────────●  100%      │
├────────────────────────┤
│ Line Style             │
│ [——] [- -] [···]       │
├────────────────────────┤
│ Arrange                │
│ [↑ Front] [↓ Back]     │
│ [⊞ Group] [⊟ Ungroup]  │
└────────────────────────┘
```

- Container: `bg-surface border border-border rounded-xl shadow-lg p-3 w-56`
- Color swatches: 8-color palette grid (brand colors + common) + custom hex input
- shadcn `Slider` for stroke width and opacity
- Line style: shadcn `ToggleGroup` with 3 options (solid, dashed, dotted)
- Arrange buttons: shadcn `Button variant="outline" size="sm"`
- Panel animates in/out with Motion `AnimatePresence` — slide from right + fade

---

## 14. Canvas — Collaborator UI

### Live Cursors

Rendered directly on the cursor canvas layer (not HTML). Each remote user:
- Cursor: SVG arrow shape filled with user's assigned color
- Name tag: small pill below cursor — `bg-[userColor] text-white text-xs rounded px-1.5 py-0.5`
- User color: deterministic, derived from `userId` via hue rotation across 12 preset colors

### Presence Bar (in Topbar)

```
[Avatar A] [Avatar B] [Avatar C]  +2
```

- Stacked avatars with colored ring borders
- Tooltip on hover: user name + role
- "+2" overflow badge: shadcn `Badge`

### User Color Palette (12 slots)

```typescript
const CURSOR_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#06b6d4', '#84cc16', '#f59e0b', '#6366f1',
]
const getUserColor = (userId: string) => {
  const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return CURSOR_COLORS[hash % CURSOR_COLORS.length]
}
```

### Selection Indicators

When another user has an element selected: dashed colored border around the element's bounding box with their name tag. Rendered on the overlay canvas layer. Does not interfere with the local user's selection handles.

---

## 15. Canvas — Pages Strip

**Position:** Bottom, 40px fixed

```
[+]  [Page 1  ×]  [Page 2  ×]  [Page 3  ×]  [+ Add Page]
```

- Container: `bg-surface border-t border-border px-3 flex items-center gap-1`
- shadcn `Tabs` for the strip layout
- Each page tab:
  - Double-click to rename inline
  - `×` button appears on hover to delete (with confirmation)
  - Drag to reorder (Motion drag)
  - Active: `bg-brand/10 text-brand border-b-2 border-brand`
- "+ Add Page" at the end: `Button variant="ghost" size="sm"`
- Overflow: horizontal scroll with fade mask on edges

---

## 16. Sticky Notes — On Canvas

**Appearance:** Rendered as HTML `<div>` overlays absolutely positioned over the canvas (not drawn on canvas), using world-to-screen coordinate transform.

```
┌──────────────────────────┐
│ ×                    📌  │  ← header bar (drag handle + actions)
├──────────────────────────┤
│                          │
│  Note content here.      │
│  Click to edit.          │
│                          │
└──────────────────────────┘
```

- Container: `rounded-lg shadow-md border border-black/10 min-w-[200px] min-h-[100px]`
- Background color: user-selectable from 6 options (yellow, pink, blue, green, purple, white)
  - Default: `#FEF08A` (yellow) in light mode
- Header bar: `flex items-center justify-between px-2 py-1 rounded-t-lg cursor-grab`
- Drag to reposition (updates world coordinates in Yjs)
- Resize: resize handle bottom-right corner
- Edit: click body area → Tiptap minimal editor (bold, italic, bullet list, link)
- Pin button: `📌` toggles `isPinned` — pinned notes always render on top
- Delete: `×` button top-left
- Transition: position updates from Yjs (other users moving notes) use CSS `transition: transform 80ms ease`

### Note Color Picker

6-swatch palette in header bar context menu (right-click or ⋮ button):
```
🟡 🩷 🔵 🟢 🟣 ⬜
```

---

## 17. Invite & Share Flow

**Trigger:** "Share" button in canvas topbar

```
┌─────────────────────────────────────────┐
│ Share "My Board"                        │
├─────────────────────────────────────────┤
│ Invite by email                         │
│ [email@example.com ___________] [Role▼] [Invite] │
│                                         │
│ Members                                 │
│ [Avatar] Alice (you)      Owner     [—] │
│ [Avatar] Bob              Editor    [▼] │
│ [Avatar] Carol            Viewer    [▼] │
├─────────────────────────────────────────┤
│ Share link                              │
│ [https://devboard.app/invite/abc123  📋]│
│ Anyone with link can: [Editor ▼]        │
│ [Disable link]  [Regenerate]            │
└─────────────────────────────────────────┘
```

- shadcn `Dialog` modal
- Email input + role `Select` + "Invite" `Button` in a row
- Members list: each row has avatar, name, role `DropdownMenu`, remove button
- Link row: truncated URL + copy button — on copy: `Toast` "Link copied!"
- Link permission `Select`: Viewer / Editor
- "Disable link" changes color to `text-danger` on click

---

## 18. Responsive & Breakpoints

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Canvas board not supported — show "Open on desktop" message |
| Tablet | 640–1024px | Dashboard: 2-col grid, sidebar collapses to bottom tab bar |
| Desktop | 1024–1440px | Full layout, 3–4 col board grid |
| Wide | > 1440px | 5 col board grid, wider canvas toolbar spacing |

**Canvas board is desktop-only.** On mobile/tablet, show a friendly message:

```
┌─────────────────────────────────┐
│         [Devboard Logo]         │
│                                 │
│  Canvas boards work best on     │
│  a larger screen.               │
│                                 │
│  Open this board on your        │
│  desktop or laptop.             │
│                                 │
│  [← Back to Dashboard]          │
└─────────────────────────────────┘
```

---

## 19. Animation Guidelines

**Rule: Animations must never compete with canvas rendering.**

### Where to use Motion

| Location | Animation | Duration |
|---|---|---|
| Landing page | All Aceternity effects, Text Generate, Flip Words | 600–1200ms |
| Page transitions | Fade + slight upward translate (layout animations) | 200ms |
| Dashboard board cards | `hover:scale-[1.01]` subtle scale | 150ms |
| Dialog / Sheet open | shadcn default (opacity + translate) | 150ms |
| Style panel | Slide in from right + fade | 200ms |
| Toolbar tooltips | shadcn default | 100ms |
| Note position updates | CSS `transition: transform 80ms ease` | 80ms |
| Snapshot thumbnail hover | Scale + shadow lift | 150ms |
| Toast notifications | Slide up from bottom | 200ms |

### Never animate

- Canvas element renders (handled by rAF)
- Cursor updates (60fps CSS `transform` on HTML overlay cursors)
- Anything on the `<canvas>` element itself (use requestAnimationFrame)
- Page load of canvas route (no entrance animation — canvas loads instantly)

### Motion config

```typescript
// lib/motion.ts
export const defaultTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}

export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.15 },
}
```

---

## 20. Accessibility

- All interactive elements have `aria-label` or visible text
- Keyboard navigation: Tab order follows visual layout
- Canvas toolbar: full keyboard access (V, P, R, E, L, A, T, X shortcuts)
- All icon-only buttons wrapped in shadcn `Tooltip` with descriptive text
- Color contrast: all text meets WCAG AA minimum (4.5:1 body, 3:1 large text) in both themes
- Focus rings: visible on all interactive elements — `focus-visible:ring-2 focus-visible:ring-brand`
- Avoid conveying information through color alone (use icons + text alongside color)
- `prefers-reduced-motion`: all Motion animations respect this

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- Canvas cursor: CSS `cursor` changes to match active tool
  - Select: `cursor-default`
  - Pen/Draw: `cursor-crosshair`
  - Pan mode: `cursor-grab` / `cursor-grabbing`
  - Eraser: custom SVG cursor
  - Text: `cursor-text`

---

## Quick Reference — Page × Component Matrix

| Page | shadcn | Aceternity | TailAdmin | Custom |
|---|---|---|---|---|
| Landing | Button, Separator | Spotlight, Beams, Bento, Moving Border, Tracing Beam, Infinite Cards | — | ThemeToggle |
| Sign In/Up | Input, Button, Alert, Separator | Spotlight | — | Split layout |
| Dashboard | Card, Dialog, DropdownMenu, Command, Skeleton, Tabs, Badge, Avatar, Toast | — | Sidebar, Topbar, Grid layout | Board card, Theme toggle |
| Canvas Board | Toggle, Tooltip, Popover, Slider, ContextMenu, Sheet, Dialog, Tabs, Avatar | — | — | All canvas layers, toolbar, style panel, cursors, minimap, notes overlay |
| Notes Dashboard | Card, ScrollArea, Badge, Select | — | Sidebar, Topbar | Note card with color accent |
| Snapshots | Card, Dialog, Button, Tabs | — | Sidebar, Topbar | Snapshot grid |
| Settings | Input, Button, Select, Alert, Separator | — | Settings layout | — |
| Invite Modal | Dialog, Input, Select, Avatar, Badge, Toast | — | — | Share link row |

---

*Last updated: March 2026*  
*Companion document to `devboard_plan.md`*