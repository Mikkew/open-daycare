## 1. Helper y Proxy

- [x] 1.1 Create `getUserRole()` helper in `lib/supabase/server.ts` that queries `users.role` by user ID, and verify by calling it with a known user ID from a test script or REPL
- [x] 1.2 Create `proxy.ts` in project root with auth protection (session check) for public routes `/login` and `/activate`, and verify: unauthenticated request to `/` redirects to `/login`, authenticated request to `/login` redirects to `/staff`
- [x] 1.3 Add role-based routing to `proxy.ts`: `/staff/*` requires staff/admin, `/family/*` requires parent, `/` redirects by role, and verify each redirect case with different role users
- [x] 1.4 Delete `lib/supabase/middleware.ts` and verify `npm run dev` starts without errors

## 2. Mover Staff Routes

- [x] 2.1 Create `app/staff/` directory and move `app/(app)/page.tsx` to `app/staff/page.tsx`, update internal imports, and verify `/staff` renders the same feed as `/` did before
- [x] 2.2 Create `app/staff/layout.tsx` with staff sidebar (navItems: Feed, Niños, Salas, Avisos, Mi cuenta + CTA "Nueva publicación"), and verify sidebar renders with correct navigation
- [x] 2.3 Move `app/(app)/kids/` to `app/staff/kids/` and verify `/staff/kids` loads the children page
- [x] 2.4 Move `app/(app)/rooms/` to `app/staff/rooms/` and verify `/staff/rooms` loads the rooms page
- [x] 2.5 Delete empty `app/(app)/` directory and verify no broken imports remain

## 3. Refactorizar Sidebar

- [x] 3.1 Refactor `components/Sidebar.tsx` to accept `navItems`, `ctaButton`, and `displayName` as props, and verify it still renders correctly when passed staff nav items from a test wrapper
- [x] 3.2 Update `app/staff/layout.tsx` to pass staff nav items and CTA to Sidebar, and verify `/staff` sidebar matches the previous hardcoded version
- [x] 3.3 Move staff-only components to `components/staff/`: AddChildModal, ArchiveChildButton, ChildActions, ChildrenList, CreatePostModal, EditChildModal, RoomManager, ParentsSection, Counter, and verify `npm run build` compiles without errors
- [x] 3.4 Update all imports in staff pages and components to point to `@/app/components/staff/X`, and verify `npx tsc --noEmit` passes

## 4. Crear Panel Family

- [x] 4.1 Create `app/family/layout.tsx` with family sidebar (navItems: Feed, Resumen del día, Mi cuenta, no CTA), fetch user info with `displayName` from `parent_children`, and verify `/family` renders with family navigation
- [x] 4.2 Create `app/family/page.tsx` (family feed) with child filter pills from `parent_children`, posts filtered by child + announcements, and verify: parent sees only their children's posts, filter pills work, no create post prompt
- [x] 4.3 Create `app/family/resumen-dia/page.tsx` with child filter pills and stats from `daily_summaries` (meals, sleep, activities, mood), and verify: stats display with correct formatting, "no summary" message when data is missing
- [x] 4.4 Create `app/family/mi-cuenta/page.tsx` with profile info, linked children list, notification toggles, and verify: profile shows correct data, children list matches `parent_children`, toggles match DB values

## 5. Verificación Final

- [x] 5.1 Run `npm run build` and verify zero errors
- [x] 5.2 Run `npm run lint` and verify zero errors
- [x] 5.3 Run `npx tsc --noEmit` and verify zero type errors
- [x] 5.4 Manual test: access `/` as staff → redirects to `/staff`, as parent → redirects to `/family`, unauthenticated → redirects to `/login`
- [x] 5.5 Manual test: access `/staff/kids` as parent → redirects to `/family`, access `/family` as staff → redirects to `/staff`
