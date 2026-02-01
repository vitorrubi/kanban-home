# Copilot Instructions — cursorproject

Purpose
- Provide concise, actionable instructions for AI/code assistants (Copilot, Copilot-like agents)
  working on this repository.

Project summary
- Next.js (App Router) + TypeScript + React 19
- Tailwind CSS + shadcn/ui for components
- Supabase for Auth and Postgres persistence
- dnd-kit for drag-and-drop
- TanStack Query (v5) for server-state
- Deployed on Vercel

Key principles
- Be conservative: prefer small, focused changes and preserve existing APIs.
- Avoid committing secrets. If you find `.env.local` or keys in git, remove them and
  instruct the user to rotate the keys.
- When making DB changes, prefer migrations or explicit SQL schema changes rather
  than automatic schema inference.
- Run the TypeScript type-check (`npx tsc --noEmit`) before proposing or committing
  changes; fix anyTS errors you introduce.

Local development (commands)
- Install: `npm install`
- Dev server: `npm run dev` (Next runs on available port; may choose 3002 if 3000 used)
- Build: `npm run build`
- Type-check only: `npx tsc --noEmit`

Environment variables (required)
- NEXT_PUBLIC_SUPABASE_URL — public Supabase URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon key (public client key)
- (Optional server-only) SUPABASE_SERVICE_ROLE_KEY — only add as a Vercel secret; never expose client-side

Coding conventions & patterns
- Keep changes minimal and follow existing file structure under `src/`.
- Use the existing `src/lib/supabase.ts` client for Supabase access.
- Prefer Supabase calls without over-constraining generic types when the SDK typings
  conflict; if necessary, use narrow casts and add a code comment explaining why.
- For optimistic updates use TanStack Query's `queryClient.setQueryData` and invalidate
  queries on failure.
- For DnD, follow the current `dnd-kit` pattern: `DndContext` at board level, `useDroppable`
  for columns and `useSortable` for cards.

Testing & CI
- This repo may not include test runner devDeps. If adding tests, add required devDependencies
  (e.g., `vitest`) and a `test` script in `package.json`.
- Keep tests fast and focused; add E2E tests only if CI environment supports a headless browser.

Pull requests and commits
- Use descriptive commit messages and small PRs.
- Update `README.md` when adding or changing major setup steps or environment requirements.
- Run `npx tsc --noEmit` and `npm run build` locally before opening a PR.

Security & secrets
- Never commit `SUPABASE_SERVICE_ROLE_KEY` to the repo.
- Ensure `.env.local` is gitignored; if leaked, instruct user to rotate keys immediately.

When to ask the user
- If a change affects database schema, deployment, or auth redirects, ask before committing.
- If you need to add a devDependency or change build scripts, explain the rationale and risk.

Agent workflow expectations
- Use the repo's patch tooling to make edits (apply focused diffs).
- When making multi-step changes, create a short todo plan and update it as steps complete.
- After edits, run the TypeScript check and a dev build (where feasible) and report results.

Files of interest (start here)
- `src/components/Board.tsx` — DnD orchestration and optimistic persistence
- `src/components/Column.tsx` — droppable containers + card create/delete
- `src/components/Card.tsx` — sortable item implementation
- `src/lib/reorder.ts` — algorithm for computing positions when dragging
- `src/lib/supabase.ts` — Supabase client instantiation
- `src/app/api/cards/route.ts` — server API for card CRUD

Notes (project-specific)
- Supabase TypeScript typing can be strict; earlier work removed strict client generics
  to avoid heavy typing conflicts. If you reintroduce stricter typing, validate end-to-end builds.
- Vercel deployment requires the public Supabase env vars in Project Settings and the
  Supabase Auth Redirect URLs configured to the Vercel domain.

Contact the maintainer if: you need new infra privileges, must rotate keys, or plan a major
refactor (e.g., replace dnd-kit or change state-management approach).

---
Generated: keep this file up-to-date; update versions and guidance as dependencies change.

