## Purpose

Defines the behavior of the staff panel — the management interface for daycare personnel to create posts, manage children and rooms, and monitor daily activity. All routes are under `/staff/*` and require the user role to be `staff` or `admin`.

## ADDED Requirements

### Requirement: Staff panel routing
The system SHALL serve all staff functionality under the `/staff/*` route prefix. The panel is accessible only to users with role `staff` or `admin`.

#### Scenario: Staff user accesses /staff
- **WHEN** a user with role `staff` navigates to `/staff`
- **THEN** the staff feed page is displayed with the staff sidebar

#### Scenario: Admin user accesses /staff
- **WHEN** a user with role `admin` navigates to `/staff`
- **THEN** the staff feed page is displayed with the staff sidebar

#### Scenario: Parent user tries to access /staff
- **WHEN** a user with role `parent` navigates to `/staff`
- **THEN** the system redirects them to `/family`

### Requirement: Staff sidebar navigation
The staff panel SHALL display a sidebar with the following navigation items: Feed, Niños, Salas, Avisos, Mi cuenta. Each item links to its corresponding route under `/staff/*`.

#### Scenario: Sidebar renders all navigation items
- **WHEN** a staff user views any page under `/staff/*`
- **THEN** the sidebar shows Feed, Niños, Salas, Avisos, and Mi cuenta links

#### Scenario: Active navigation item is highlighted
- **WHEN** a staff user is on `/staff/kids`
- **THEN** the "Niños" navigation item is visually highlighted as active

### Requirement: Create post CTA in sidebar
The staff sidebar SHALL display a "Nueva publicación" button with an orange gradient style. Clicking it opens the post creation modal.

#### Scenario: Create post button is visible
- **WHEN** a staff user views any page under `/staff/*`
- **THEN** the "Nueva publicación" button is visible in the sidebar above navigation items

### Requirement: Staff feed page
The staff feed (`/staff`) SHALL display all posts from the daycare in reverse chronological order, with a "Compartí un momento…" prompt and a children counter. Each post shows the child name, type badge, body, and photos. Posts without child targets display "Para: toda la sala".

#### Scenario: Feed displays posts
- **WHEN** a staff user visits `/staff`
- **THEN** posts are displayed in reverse chronological order with type badges (LOGRO, ACTIVIDAD, ANUNCIO)

#### Scenario: Feed shows create prompt
- **WHEN** a staff user visits `/staff`
- **THEN** a "Compartí un momento…" prompt with a camera icon is shown above the posts

### Requirement: Staff user profile in sidebar
The sidebar SHALL display the current user's name, role label (Maestra/Admin), and room name. A logout button signs out and redirects to `/login`.

#### Scenario: User info displays correctly
- **WHEN** a staff user views the sidebar
- **THEN** their full name, role label, and room name are displayed

### Requirement: Staff children management page
The `/staff/kids` page SHALL display a grid of all active children in the daycare with search functionality, and allow adding new children, editing child details, and archiving children.

#### Scenario: Children grid displays
- **WHEN** a staff user visits `/staff/kids`
- **THEN** all active children are displayed in a grid with name, age, room, and allergy tags

#### Scenario: Search filters children
- **WHEN** a staff user types in the search field on `/staff/kids`
- **THEN** the grid filters to show only children whose names match the query

### Requirement: Staff rooms management page
The `/staff/rooms` page SHALL display all rooms in the daycare with their child counts and allow managing room assignments.

#### Scenario: Rooms display with counts
- **WHEN** a staff user visits `/staff/rooms`
- **THEN** all rooms are displayed with their names and number of enrolled children
