<div align="center">
  <img src="public/tanstack-circle-logo.png" alt="TanStack logo" width="96" />
  <h1>Event Tracker Starter</h1>
  <p>Lightweight event + record tracker built with TanStack Start, TanStack Router, and TanStack Store.</p>
</div>

## Contents
- [Project Overview](#project-overview)
- [Data Model](#data-model)
- [Features](#features)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Implementation Notes](#implementation-notes)
- [API & Data Flows](#api--data-flows)
- [Roadmap](#roadmap)

## Project Overview
This app demonstrates how to manage recurring, count-based events (workouts, lessons, habits, etc.). Each event always has a current record that holds the most recent count. Completing an event closes the active record and optionally creates the next one in a single flow. The UI is powered by TanStack Router pages, and shared state experiments live in TanStack Store.

## Data Model
| Collection | Fields | Notes |
|------------|--------|-------|
| **Event** | `id`, `createdAt`, `updatedAt`, `title`, `currentRecordId`, `completed` | `currentRecordId` references the open `Record`. `completed` mirrors whether the current record is finished. |
| **Record** | `id`, `createdAt`, `updatedAt`, `count`, `eventId`, `completed` | Multiple records belong to one event. Only one record per event should be unfinished at any moment. |

When an event is deleted, all related records must be removed in the same transaction. When a record is marked complete, the parent event’s `currentRecordId` may be swapped to a newly created record if the user opts to continue the streak.

## Features
- **Home Page**
  - List all events with title and the count pulled from `currentRecordId`.
  - Inline `Complete` button prompts for confirmation and optional next-count input.
  - Delete action cascades to the event’s records.
- **Create Event Page**
  - Validates `title` and initial `count`.
  - Creates the event plus its first record atomically and redirects home.
- **Shared UX Enhancements**
  - Optimistic UI for completion/delete flows.
  - Graceful empty, loading, and error states.
  - Confirmation dialogs for destructive actions.

## Getting Started

```bash
pnpm install
pnpm dev
```

- Navigate to `http://localhost:4173` (or the port shown in the console).
- Populate `.env` with any keys required by integrations (see `src/routes/demo/*` for examples).

### Building & Previewing

```bash
pnpm build
pnpm preview
```

The `preview` command serves the production build locally so you can verify SSR + hydration before deploying.

### Testing

```bash
pnpm test
```

We use Vitest for unit and integration tests. Add new specs under `src/**/*.test.ts(x)` alongside components or utilities.

## Available Scripts
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite in dev mode with TanStack Start SSR enabled. |
| `pnpm build` | Build client + server bundles. |
| `pnpm preview` | Serve the production build locally. |
| `pnpm lint` | (Optional) Run ESLint if configured. |
| `pnpm test` | Execute Vitest suites. |

## Implementation Notes
- **Routing**: File-based routes live in `src/routes`. Home (`index.tsx`) will host the event list; `events/new.tsx` (to be created) can handle creation.
- **State & Data Fetching**: Prefer TanStack Query for server mutations + caching. Use loaders for SSR-friendly data requirements when possible.
- **UI Toolkit**: Tailwind CSS provides the base design system; Lucide icons supply glyphs for actions.
- **Devtools**: TanStack Router, Query, Store, and custom AI/store panels are pre-wired in `src/routes/__root.tsx` for quick debugging.

## API & Data Flows
1. **List Events**: `GET /api/events` ➝ returns events with embedded `currentRecord` information so the UI stays render-only.
2. **Create Event**: `POST /api/events` body `{ title, count }` ➝ server creates Event + Record transactionally, returns full Event.
3. **Complete Record**: `POST /api/events/:id/complete` body `{ createNext: boolean, nextCount?: number }` ➝ marks existing record `completed=true`; optionally creates new record and updates event pointer.
4. **Delete Event**: `DELETE /api/events/:id` ➝ removes event and its records in one operation.

All endpoints should be idempotent and return updated entities to keep TanStack Query caches in sync.

## Roadmap
1. Hook up real persistence (e.g., SQLite via Drizzle or Supabase) instead of demo data.
2. Add event detail view with historical record charting.
3. Support bulk complete/delete actions and multi-select.
4. Introduce reminders/notifications for overdue events.
5. Enhance accessibility: keyboard shortcuts for completion, better focus management in dialogs.

---

Need help or have ideas? File an issue or start a discussion so we can shape the event tracker together.
