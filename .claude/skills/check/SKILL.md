---
name: check
description: Run typecheck then build across the targetless monorepo. Use when asked to "check", "validate", "pre-commit check", or "verify the build".
---

# /check

Run TypeScript type checking followed by a full monorepo build.

## Instructions

1. Run `pnpm typecheck` at the project root.
   - If it fails, report the errors clearly and stop. Do not proceed to build.
2. If typecheck passes, run `pnpm build`.
   - If it fails, report the errors clearly.
3. Report the final result — whether both steps passed, or which step failed and why.
