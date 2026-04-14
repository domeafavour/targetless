<div align="center">
  <h1>Targetless</h1>
  <p>Lightweight event &amp; record tracker — a PWA built with TanStack Start, TanStack Router, and Supabase.</p>
</div>

## Contents

- [Contents](#contents)
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Data Model](#data-model)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Development](#development)
  - [Building \& Previewing](#building--previewing)
  - [Testing](#testing)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Implementation Notes](#implementation-notes)
- [Deployment](#deployment)

## Project Overview

Targetless helps you manage recurring, count-based events such as workouts, lessons, habits, and more. Each event keeps a **current record** that holds the most recent count. Completing a record closes it and optionally spins up the next one in a single flow. The entire app runs as a **client-side SPA** with pre-rendering support and is deployable to GitHub Pages.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [TanStack Start](https://tanstack.com/start) (SPA mode with pre-rendering) |
| **Routing** | [TanStack Router](https://tanstack.com/router) — file-based routes |
| **Data Fetching** | [TanStack Query](https://tanstack.com/query) via [react-query-kit](https://github.com/nichenqin/react-query-kit) |
| **Forms** | [TanStack Form](https://tanstack.com/form) |
| **Backend / Auth** | [Supabase](https://supabase.com) (Postgres + Auth) |
| **Offline Fallback** | IndexedDB in-memory store (`src/lib/event-store.ts`) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) (dashboard filter/sort preferences persisted to `localStorage`) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (New York style) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Build** | [Vite](https://vitejs.dev/) |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| **PWA** | Service Worker (`public/sw.js`) + Web App Manifest |

## Data Model

| Table | Key Fields | Notes |
|-------|------------|-------|
| **events** | `id`, `created_at`, `updated_at`, `title`, `current_record_id`, `completed`, `creator_id` | `current_record_id` references the open record. `completed` mirrors whether the current record is finished. Scoped to the authenticated user via `creator_id`. |
| **records** | `id`, `created_at`, `updated_at`, `count`, `event_id`, `completed` | Multiple records belong to one event. Only one record per event should remain unfinished at any time. |

When an event is deleted, all related records are removed in the same transaction. When a record is marked complete, the parent event's `current_record_id` may be swapped to a newly created record if the user opts to continue.

## Features

- **Dashboard** (`/`)
  - Lists all events with title, current count, and status pill (active / completed).
  - Filter by status: **All**, **Active**, **Completed**.
  - Sort by **created** or **updated** date, ascending or descending.
  - Inline **Complete** button with confirmation dialog.
  - Delete action cascades to the event's records.
  - Empty, loading, and error states handled gracefully.
- **Create Event** (`/events/new`)
  - Validates title and initial count.
  - Creates event + first record atomically and redirects to the dashboard.
- **Event Detail** (`/events/detail?id=<eventId>`)
  - Full record timeline showing each record's count and timestamp.
  - Complete individual records or the entire event.
  - Create a new record when all previous records are completed.
  - Delete the event from the detail view.
- **Authentication** (`/login`)
  - Email / password sign-in powered by Supabase Auth.
- **PWA Support**
  - Installable on mobile and desktop.
  - Service Worker registered on load with periodic update checks.
- **Developer Experience**
  - TanStack Router, Query, and AI devtools panels pre-wired in the root layout.

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (recommended package manager)

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<your-supabase-anon-key>
```

### Development

```bash
pnpm install
pnpm dev
```

The dev server starts at `http://localhost:3000`.

### Building & Previewing

```bash
pnpm build           # Standard production build
pnpm build:gh-pages  # Build + generate index for GitHub Pages
pnpm preview         # Serve the production build locally
```

### Testing

```bash
pnpm test
```

Vitest runs all `*.test.ts(x)` specs. Place new tests alongside the source files they cover.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server on port 3000 (SPA mode). |
| `pnpm build` | Production build (client bundle + pre-rendered pages). |
| `pnpm build:gh-pages` | Production build + `scripts/generate-index.js` for GitHub Pages. |
| `pnpm preview` | Serve the production build locally. |
| `pnpm test` | Run Vitest test suites. |

## Project Structure

```
src/
├── router.tsx                 # TanStack Router setup with Query integration
├── routeTree.gen.ts           # Auto-generated route tree
├── styles.css                 # Global Tailwind styles
├── components/
│   ├── CompleteEventButton.tsx
│   ├── CompleteRecordButton.tsx
│   ├── DashboardEmptyState.tsx
│   ├── DashboardEventItem.tsx
│   ├── DashboardEvents.tsx
│   ├── DashboardFilter.tsx
│   ├── DashboardSorting.tsx
│   ├── DashboardStatCard.tsx
│   ├── DeleteEvent.tsx
│   ├── EventStatusPill.tsx
│   ├── Header.tsx
│   ├── LoadingOr.tsx
│   ├── NewRecordButton.tsx
│   ├── RefreshEventsButton.tsx
│   └── ui/                    # Reusable primitives (shadcn/ui)
├── integrations/
│   └── tanstack-query/        # Query client provider & devtools
├── lib/
│   ├── ai-devtools.tsx        # Custom AI devtools panel
│   ├── date-utils.ts          # Timestamp formatting helpers
│   ├── event-store.ts         # IndexedDB-backed event/record store (offline fallback)
│   ├── supabase.ts            # Supabase client initialisation
│   ├── utils.ts               # General utilities (cn, etc.)
│   ├── api/
│   │   ├── auth.ts            # Supabase Auth helpers + react-query-kit router
│   │   ├── events.ts          # Event/record CRUD — Supabase-first, IndexedDB fallback
│   │   └── supabase.types.ts  # Generated Supabase DB types
│   └── store/
│       └── event-dashboard.ts # Zustand store for dashboard filter/sort
└── routes/
    ├── __root.tsx              # Root layout (Header, devtools, PWA script)
    ├── index.tsx               # Dashboard page
    ├── login.tsx               # Login page
    └── events/
        ├── detail.tsx          # Event detail + record timeline
        └── new.tsx             # Create event form
```

## Implementation Notes

- **Routing** — File-based routes in `src/routes/` are auto-discovered by the TanStack Router Vite plugin. The generated route tree lives in `src/routeTree.gen.ts`.
- **Data Layer** — API calls go through `react-query-kit` routers (`src/lib/api/events.ts`, `src/lib/api/auth.ts`) backed by Supabase. An IndexedDB store (`src/lib/event-store.ts`) provides an offline-capable fallback.
- **State Management** — Dashboard filter and sort preferences are persisted in `localStorage` via a Zustand store (`src/lib/store/event-dashboard.ts`).
- **UI Toolkit** — Tailwind CSS v4 with the `@tailwindcss/vite` plugin, shadcn/ui components (Radix primitives), and Lucide icons.
- **Devtools** — TanStack Router, Query, and AI devtools are pre-wired in the root layout for quick debugging.
- **PWA** — A service worker is registered at load time and refreshes every 10 minutes. The web app manifest enables "Add to Home Screen" on supported platforms.
- **Path Aliases** — `@/*` maps to `./src/*` via `tsconfig.json` paths + `vite-tsconfig-paths`.
- **GitHub Pages** — Set `GITHUB_PAGES=true` during build. The Vite config adjusts `base` to `/targetless/` and the router uses a matching `basepath`.

## Deployment

The project is configured for **GitHub Pages** out of the box:

```bash
GITHUB_PAGES=true pnpm build:gh-pages
```

This produces a fully pre-rendered static site under `dist/` with the `/targetless/` base path. Push the contents to the `gh-pages` branch or configure GitHub Actions to deploy automatically.
