## Purpose

Defines the behavior of the family panel — the interface for parents to view their children's daily activity, see summaries, and manage their account. All routes are under `/family/*` and require the user role to be `parent`.

## ADDED Requirements

### Requirement: Family panel routing
The system SHALL serve all family functionality under the `/family/*` route prefix. The panel is accessible only to users with role `parent`.

#### Scenario: Parent user accesses /family
- **WHEN** a user with role `parent` navigates to `/family`
- **THEN** the family feed page is displayed with the family sidebar

#### Scenario: Staff user tries to access /family
- **WHEN** a user with role `staff` or `admin` navigates to `/family`
- **THEN** the system redirects them to `/staff`

### Requirement: Family sidebar navigation
The family panel SHALL display a sidebar with the following navigation items: Feed, Resumen del día, Mi cuenta. The sidebar SHALL NOT include a "Nueva publicación" button.

#### Scenario: Sidebar renders family navigation items
- **WHEN** a parent user views any page under `/family/*`
- **THEN** the sidebar shows Feed, Resumen del día, and Mi cuenta links

#### Scenario: No create post button
- **WHEN** a parent user views the sidebar
- **THEN** no "Nueva publicación" button is displayed

### Requirement: Family feed page
The family feed (`/family`) SHALL display posts only for the parent's linked children, filtered by `parent_children` and `post_children` joins, plus announcements from the child's room. The page SHALL show child filter pills to filter posts by a specific child.

#### Scenario: Feed shows only parent's children posts
- **WHEN** a parent user visits `/family`
- **THEN** only posts linked to their children via `parent_children` are displayed, plus room announcements

#### Scenario: Child filter pills display
- **WHEN** a parent with multiple children visits `/family`
- **THEN** filter pills are shown for each child, plus a "Todos" option

#### Scenario: Filtering by child
- **WHEN** a parent clicks a child's filter pill
- **THEN** the feed updates to show only posts for that specific child

#### Scenario: No create prompt
- **WHEN** a parent user visits `/family`
- **THEN** no "Compartí un momento…" prompt is shown

### Requirement: Family feed post display
Each post in the family feed SHALL show the child's name and initial avatar, timestamp, teacher name, room name, type badge (LOGRO, ACTIVIDAD, ANUNCIO), body text, and any attached photos. Posts SHALL display like and comment counts (placeholders at 0 for now).

#### Scenario: Post shows teacher and room
- **WHEN** a parent views a post in the family feed
- **THEN** the post displays the teacher name and room (e.g., "14:20 · Maestra Caro · Sala Soles")

#### Scenario: Achievement post displays badge
- **WHEN** a parent views an achievement post
- **THEN** a green "LOGRO" badge is displayed

### Requirement: Daily summary page
The `/family/resumen-dia` page SHALL display a daily summary for a selected child with stats from `daily_summaries`: meal count, sleep duration, activity count, mood, and highlights.

#### Scenario: Summary displays stats
- **WHEN** a parent selects a child on the resumen del día page
- **THEN** cards showing meals count, sleep duration, and activities count are displayed with appropriate icons and colors

#### Scenario: Sleep duration formatting
- **WHEN** the `sleep_minutes` value is 90
- **THEN** the display shows "1h 30"

#### Scenario: Mood display
- **WHEN** a daily summary exists with a mood value
- **THEN** the mood is displayed in a dedicated card (e.g., "Contento y participativo")

#### Scenario: No summary available
- **WHEN** no `daily_summary` exists for the selected child today
- **THEN** a message indicating no summary is available yet is displayed

### Requirement: Family account page
The `/family/mi-cuenta` page SHALL display the parent's profile (name, email, linked children), notification preferences (`notify_on_post`, `daily_summary_enabled`), and links to change password, help, and logout.

#### Scenario: Profile displays with children
- **WHEN** a parent visits `/family/mi-cuenta`
- **THEN** their profile shows name, email, and "Madre/Padre de {child names}"

#### Scenario: Linked children display
- **WHEN** a parent visits `/family/mi-cuenta`
- **THEN** their linked children from `parent_children` are listed with name, age, room, and photo consent toggle

#### Scenario: Notification toggles reflect DB values
- **WHEN** a parent visits `/family/mi-cuenta`
- **THEN** the `notify_on_post` and `daily_summary_enabled` toggles match the values in the database

### Requirement: Family user display name
The family sidebar SHALL display a contextual display name based on the parent's relationship to their children (e.g., "Mamá de Mateo" for a mother, "Papá de Sofía" for a father), derived from the `parent_children.relationship` field.

#### Scenario: Display name shows relationship
- **WHEN** a parent with relationship `mother` to child "Mateo" views the sidebar
- **THEN** the display shows "Mamá de Mateo"

#### Scenario: Multiple children display
- **WHEN** a parent has multiple linked children
- **THEN** the display shows "Madre/Padre de {child1} y {child2}"
