<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
<!-- END:nextjs-agent-rules -->

## Project

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + TypeScript. Package manager: npm (`package-lock.json`).

- `@/*` path alias maps to the repo root (see `tsconfig.json`).
- `app/` is still the `create-next-app` starter — feature work has not started. The product is "Open DayCare" (a daycare app).
- `references/Open-DayCare/` holds design mockups (`.dc.html` screens + `screenshots/`) in Spanish. They are reference designs only — not app code, not imported. Build the app from these.

## Commands

- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` — production build (runs type checking)
- `npm run lint` — ESLint (`eslint.config.mjs`)
- No test or typecheck scripts. Type-check directly with `npx tsc --noEmit`.

## Workflow (spec-driven)

Specs live in `specs/` (created on demand). Use the bundled skills:

- `/spec` — design a spec section-by-section; saves to `specs/NN-slug.md` (state `Draft`). Never mark it `Approved` yourself.
- `/spec-impl NN-slug` — implements only when state means Approved; creates branch `spec-NN-slug`; never commits automatically.
- Branch creation is controlled by `specs/.spec-config.yml` (`AutoCreateBranch`, default `true`).

## MCPs

- Playwright: screenshots and anything Playwright-related go in `.playwright-mcp/` (git-ignored).
- Context7: use it to fetch up-to-date framework docs.