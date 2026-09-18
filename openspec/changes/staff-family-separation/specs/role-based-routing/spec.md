## Purpose

Defines the proxy-based routing system that authenticates users and routes them to the correct panel (`/staff` or `/family`) based on their role, preventing cross-role access and ensuring automatic redirection.

## ADDED Requirements

### Requirement: Proxy replaces middleware
The system SHALL use `proxy.ts` in the project root instead of `lib/supabase/middleware.ts` for request interception. The exported function SHALL be named `proxy` (not `updateSession`).

#### Scenario: Proxy intercepts protected routes
- **WHEN** a request is made to any route except static assets, API routes, and images
- **THEN** the proxy function executes and evaluates the request

#### Scenario: Middleware file is removed
- **WHEN** the change is deployed
- **THEN** `lib/supabase/middleware.ts` no longer exists

### Requirement: Root path redirects by role
The root path `/` SHALL redirect to `/staff` for users with role `staff` or `admin`, and to `/family` for users with role `parent`.

#### Scenario: Staff user at root
- **WHEN** a user with role `staff` navigates to `/`
- **THEN** they are redirected to `/staff`

#### Scenario: Admin user at root
- **WHEN** a user with role `admin` navigates to `/`
- **THEN** they are redirected to `/staff`

#### Scenario: Parent user at root
- **WHEN** a user with role `parent` navigates to `/`
- **THEN** they are redirected to `/family`

#### Scenario: Unauthenticated user at root
- **WHEN** an unauthenticated user navigates to `/`
- **THEN** they are redirected to `/login`

### Requirement: Staff routes require staff or admin role
Routes under `/staff/*` SHALL only be accessible to users with role `staff` or `admin`. Users with role `parent` SHALL be redirected to `/family`.

#### Scenario: Staff accesses staff route
- **WHEN** a user with role `staff` navigates to `/staff/kids`
- **THEN** the page loads normally

#### Scenario: Admin accesses staff route
- **WHEN** a user with role `admin` navigates to `/staff/kids`
- **THEN** the page loads normally

#### Scenario: Parent blocked from staff route
- **WHEN** a user with role `parent` navigates to `/staff/kids`
- **THEN** they are redirected to `/family`

### Requirement: Family routes require parent role
Routes under `/family/*` SHALL only be accessible to users with role `parent`. Users with role `staff` or `admin` SHALL be redirected to `/staff`.

#### Scenario: Parent accesses family route
- **WHEN** a user with role `parent` navigates to `/family/resumen-dia`
- **THEN** the page loads normally

#### Scenario: Staff blocked from family route
- **WHEN** a user with role `staff` navigates to `/family`
- **THEN** they are redirected to `/staff`

#### Scenario: Admin blocked from family route
- **WHEN** a user with role `admin` navigates to `/family`
- **THEN** they are redirected to `/staff`

### Requirement: Public routes bypass authentication
Routes `/login` and `/activate` SHALL be accessible without authentication. No role check SHALL be performed on these routes.

#### Scenario: Unauthenticated user accesses login
- **WHEN** an unauthenticated user navigates to `/login`
- **THEN** the login page is displayed

#### Scenario: Authenticated user at public route
- **WHEN** an authenticated user navigates to `/login`
- **THEN** they are redirected to their panel (`/staff` or `/family` based on role)

### Requirement: Role lookup uses users table
The proxy SHALL determine the user's role by querying the `users` table with the authenticated user's ID from the Supabase session.

#### Scenario: Role lookup succeeds
- **WHEN** an authenticated user with a valid session accesses any protected route
- **THEN** the proxy queries `users.role` where `id = session.user.id` and uses the result for routing

#### Scenario: User not found in users table
- **WHEN** an authenticated user has no corresponding row in the `users` table
- **THEN** they are redirected to `/login`

### Requirement: Proxy matcher excludes static assets
The proxy SHALL NOT run on `_next/static`, `_next/image`, `.png` files, `favicon.ico`, or API routes (`/api/*`).

#### Scenario: Static assets bypass proxy
- **WHEN** a request is made for `/_next/static/chunks/main.js`
- **THEN** the proxy does not intercept the request

#### Scenario: API routes bypass proxy
- **WHEN** a request is made to `/api/some-endpoint`
- **THEN** the proxy does not intercept the request
