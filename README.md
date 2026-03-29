# Targetless Monorepo

This repository is now a pnpm workspace monorepo.

## Workspace Layout

- `apps/web`: Existing TanStack Start web app (migrated from root)
- `packages/domain`: Cross-platform domain types and pure business rules
- `packages/core`: Usecases and repository interfaces
- `packages/adapters-web`: Web adapters (Supabase + IndexedDB + fallback strategy)
- `packages/shared`: Cross-platform shared utilities

## Commands

- `pnpm dev`: Run the web app (`apps/web`)
- `pnpm build`: Build all workspace packages and apps
- `pnpm test`: Run web tests
- `pnpm typecheck`: Type-check all workspaces

## Web App Env

Create `apps/web/.env` based on `apps/web/.env.example`:

```env
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<your-supabase-anon-key>
```
