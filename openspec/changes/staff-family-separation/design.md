## Context

See `proposal.md` for motivation. Current state: all app logic lives in `app/(app)/*` with a sidebar hardcoded for staff navigation. Auth middleware (`lib/supabase/middleware.ts`) only checks session existence — no role validation. Next.js 16 replaces `middleware` filename with `proxy`. The DB schema includes `users.role`, `parent_children`, and `daily_summaries` tables that enable role-based routing and family features.

## Goals / Non-Goals

**Goals:**
- Separate staff and family experiences into distinct route trees
- Enforce role-based access at the proxy layer (Node runtime)
- Reuse the Sidebar component via props instead of duplication
- Build family feed and summary with real data from existing tables
- Maintain backward compatibility for auth flow (login/activate)

**Non-Goals:**
- Implementing real-time likes/comments (placeholders)
- Staff avisos and mi-cuenta pages (deferred)
- Auto-calculating daily_summaries from posts
- Push notifications
- Profile editing or password change functionality

## Decisions

### 1. Proxy in root vs. route-level protection
**Decision:** Single `proxy.ts` in the project root handles all routing logic.
**Rationale:** Next.js 16 recommends `proxy.ts` at root for cross-cutting concerns. Role-based routing affects all protected routes, making a single intercept point cleaner than per-route guards.
**Alternatives considered:**
- Route-level `layout.tsx` redirects — would require role check in every layout, redundant DB queries
- Separate proxy files per route group — more complex matcher config, harder to maintain

### 2. Role lookup inside proxy
**Decision:** Create a Supabase client inside `proxy()` using `createServerClient` from `@supabase/ssr` (same pattern as `lib/supabase/server.ts`) to query `users.role`.
**Rationale:** The proxy runs in Node runtime, so it can use the server client. `getSession()` gives us `user.id` which is the PK of `users`.
**Alternatives considered:**
- Store role in JWT claims — requires modifying Supabase Auth hooks, adds complexity
- Cache role in cookie — stale data risk, sync complexity

### 3. Sidebar as shared component with props
**Decision:** Refactor `Sidebar` to accept `navItems` and `ctaButton` as props rather than creating separate `StaffSidebar` and `FamilySidebar`.
**Rationale:** The visual design is identical — only the content changes. Duplication would create maintenance burden when updating styles or adding features.
**Alternatives considered:**
- Separate components — clearer separation but 90% code duplication
- Context-based navItems — over-engineering for two variants

### 4. Component organization: `components/staff/` vs. colocation
**Decision:** Move staff-only components to `components/staff/` subdirectory.
**Rationale:** Makes it explicit which components are staff-only and prevents accidental imports from family pages. Import paths are still clean (`@/app/components/staff/X`).
**Alternatives considered:**
- Colocate in `app/staff/components/` — harder to share if needed later
- Keep all in `components/` — risk of family importing staff components by accident

### 5. Family feed query strategy
**Decision:** Use Supabase `.select()` with nested joins: `parent_children → post_children → posts` to filter the feed.
**Rationale:** Supabase supports nested selects with foreign key relationships. This avoids raw SQL and leverages the existing FK constraints.
**Alternatives considered:**
- RPC function — more control but requires DB migration
- Client-side filtering — loads all posts, inefficient

### 6. Route structure: flat segments vs. route groups
**Decision:** Use flat route segments `app/staff/` and `app/family/` — no route groups.
**Rationale:** No need for shared layouts between staff and family. Each has its own `layout.tsx`. Flat segments give clean URLs (`/staff/kids`, `/family/resumen-dia`).
**Alternatives considered:**
- `app/(staff)/staff/` — redundant, no benefit
- `app/dashboard/staff/` — adds unnecessary nesting

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Proxy runs on every request — role query adds latency | Session is cached by Supabase client; role query is a single-row lookup by PK index |
| `daily_summaries` table may not exist yet in the deployed DB | Verify with `supabase list_tables` before implementation; create migration if needed |
| Moving components may break relative imports | `npm run build` will catch broken imports; update imports systematically |
| Parent with no linked children sees empty feed | Show a friendly message: "Aún no tenés niños vinculados" |
| Admin role has access to both panels but only `/staff` is built | Admin redirect to `/staff` is intentional; if admin needs family view later, add a toggle |
| `pokemon/` route becomes orphaned at `app/staff/pokemon/` | Acceptable — it's experimental and outside this spec's scope |

## Migration Plan

1. Create `getUserRole` helper (non-breaking addition)
2. Create `proxy.ts` alongside existing `middleware.ts` — test both coexist
3. Create `app/staff/` with moved files — old `app/(app)/` still works
4. Create `app/family/` with new pages
5. Refactor `Sidebar` — update both old and new layouts
6. Delete `app/(app)/` — all traffic now on `/staff/` and `/family/`
7. Delete `lib/supabase/middleware.ts` — proxy handles everything
8. Update matcher in any root-level config

**Rollback:** If issues arise, restore `lib/supabase/middleware.ts` and revert `app/(app)/` from git. The old structure is preserved until step 6-7.
