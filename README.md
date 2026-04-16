# Targetless Monorepo

A lightweight event & record tracker — PWA built with TanStack Start, TanStack Router, Supabase, and a modular TypeScript monorepo architecture.

---

## Monorepo Structure

```

.
├── apps/
│ └── web/ # Main PWA frontend (SPA)
├── packages/
│ ├── data-access/ # Data layer: Supabase, IndexedDB, repositories
│ ├── domain/ # Pure domain logic: types, validators, selectors
│ └── ui/ # Shared UI primitives (shadcn/ui, Radix, Tailwind)
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── ...

```

- **apps/web**: Main web application (SPA, PWA, Vite, TanStack Start)
- **packages/data-access**: Data access layer (Supabase, IndexedDB, repositories)
- **packages/domain**: Domain types, validators, selectors (no dependencies)
- **packages/ui**: Shared UI primitives (Radix, shadcn/ui, Tailwind, Lucide)

---

## Tech Stack

| Layer         | Technology                                                                     |
| ------------- | ------------------------------------------------------------------------------ |
| Framework     | [TanStack Start](https://tanstack.com/start) (SPA, pre-rendering)              |
| Routing       | [TanStack Router](https://tanstack.com/router) (file-based)                    |
| Data Fetching | [TanStack Query](https://tanstack.com/query), [react-query-kit]                |
| Forms         | [TanStack Form](https://tanstack.com/form)                                     |
| Backend/Auth  | [Supabase](https://supabase.com) (Postgres + Auth)                             |
| Offline       | IndexedDB (fallback, via data-access)                                          |
| State         | [Zustand](https://zustand-demo.pmnd.rs/)                                       |
| UI            | [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui], [Radix], Lucide      |
| Validation    | [Zod](https://zod.dev/)                                                        |
| Build         | [Vite](https://vitejs.dev/)                                                    |
| Test          | [Vitest](https://vitest.dev/), [Testing Library](https://testing-library.com/) |
| PWA           | Service Worker, Web App Manifest                                               |

---

## Features

- **Dashboard**: List, filter, sort, complete, and delete events/records
- **Event Detail**: Timeline, complete records, add/delete events
- **Create Event**: Atomic event + record creation
- **Auth**: Supabase email/password login
- **Offline**: IndexedDB fallback for all data
- **PWA**: Installable, service worker, manifest
- **Devtools**: TanStack Router/Query/AI devtools pre-wired
- **Reusable UI**: shadcn/ui, Radix, Tailwind, Lucide icons

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm (recommended)

### Setup

```bash
pnpm install
```

### Environment Variables

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<your-supabase-anon-key>
```

### Development

```bash
pnpm dev
```

Runs the web app at `http://localhost:3000`.

### Build & Preview

```bash
pnpm build           # Standard production build
pnpm build:gh-pages  # Build + generate index for GitHub Pages
pnpm preview         # Serve the production build locally
```

### Testing

```bash
pnpm test
```

---

## Project Structure (apps/web)

```
src/
├── router.tsx                 # Router setup
├── routeTree.gen.ts           # Auto-generated route tree
├── components/                # UI components
├── integrations/              # Query client provider & devtools
├── lib/                       # Utilities, API, store, supabase, etc.
├── routes/                    # File-based routes (__root, index, login, events)
```

---

## Packages

### data-access

- Supabase client, repositories, IndexedDB fallback
- Used by web app for all data operations

### domain

- Pure TypeScript types, validators, selectors
- No dependencies

### ui

- Shared UI primitives (Button, Dialog, etc.)
- Tailwind, shadcn/ui, Radix, Lucide

---

## Deployment

Build for GitHub Pages:

```bash
GITHUB_PAGES=true pnpm build:gh-pages
```

Outputs static site to `dist/` with `/targetless/` base path.

---

## License

MIT
