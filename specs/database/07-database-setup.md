# SPEC 07 — Base de datos: primer día (migraciones + conexión UI)

> **Status:** Implementado
> **Depends on:** SPEC 01, SPEC 02, SPEC 03, SPEC 04, SPEC 05, SPEC 06
> **Date:** 2026-09-02
> **Objective:** Crear las tablas core de Supabase con migraciones (DDL + RLS + seed) y conectar las pantallas existentes (`/`, `/kids`, `/kids/[id]`) a datos reales desde la base de datos, eliminando los arrays estáticos mock.

## Scope

**In:**

- Instalar `@supabase/ssr` y `@supabase/supabase-js`.
- Configurar cliente Supabase en `lib/supabase/` (server + middleware cookies).
- Variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env`.
- Migraciones para el core mínimo funcional (8 tablas + enums): `daycares`, `users` (perfiles), `rooms`, `children`, `parent_children`, `posts`, `post_children`, `post_photos`.
- Enums en inglés: `user_role`, `user_status`, `relationship_type`, `post_type`, `child_status`.
- RLS habilitada en todas las tablas con políticas de lectura/escritura según rol (staff puede CRUD, parents solo lectura de sus hijos).
- Trigger `AFTER INSERT` en `auth.users` para crear fila en `users` automáticamente.
- Seed data: 1 daycare ("Guardería Sala Soles"), 3 salas (Soles, Lunas, Estrellas), 8 niños (mismos nombres del mock), 1 usuario staff ("Caro Giménez"), 3 posts de ejemplo.
- Convertir `app/(app)/page.tsx` (feed) a server component con query real de Supabase (posts + children).
- Convertir `app/(app)/kids/page.tsx` (lista) a server component con query real (children + rooms + parent count).
- Convertir `app/(app)/kids/[id]/page.tsx` (perfil) a server component con query real (child details + allergies + linked parents).
- Actualizar `Sidebar` para mostrar datos reales del usuario staff logueado.
- Mantener el diseño visual idéntico (colores, badges, layouts).
- Modales de SPEC 04/05/06 siguen siendo mock (no persisten todavía — se dejarán para specs futuros).

**Out of scope (for future specs):**

- `reactions`, `comments`, `daily_summaries`, `invitations`, `devices`.
- Autenticación real con Supabase Auth (SPEC 03 ya cubre la UI mock, auth real vendrá aparte).
- CRUD funcional de posts/niños/padres desde los modales existentes.
- Subida real de fotos (Supabase Storage).
- Notificaciones push.
- Feed del padre (`familia-feed.dc.html`).
- Resumen del día.

## Data model

Tablas a crear (en orden de dependencia):

### 1. ENUMs
```sql
user_role: staff | parent | admin
user_status: pending | active
relationship_type: father | mother | guardian
post_type: meal | nap | activity | achievement | photo | announcement
child_status: active | archived
```

### 2. `daycares`
| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `name` | `text` | |
| `created_at` | `timestamptz` | `now()` |

### 3. `users` (perfiles)
| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `uuid` PK | FK → `auth.users(id)` ON DELETE CASCADE |
| `daycare_id` | `uuid` FK → `daycares` | |
| `role` | `user_role` | |
| `status` | `user_status` | default `active` |
| `full_name` | `text` | |
| `avatar_url` | `text` | nullable |
| `notify_on_post` | `boolean` | default `true` |
| `daily_summary_enabled` | `boolean` | default `true` |
| `created_at` / `updated_at` | `timestamptz` | |

### 4. `rooms`
| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `uuid` PK | |
| `daycare_id` | `uuid` FK → `daycares` | |
| `name` | `text` | "Soles", "Lunas", "Estrellas" |
| `created_at` | `timestamptz` | |

### 5. `children`
| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `uuid` PK | |
| `room_id` | `uuid` FK → `rooms` | nullable |
| `full_name` | `text` | |
| `birth_date` | `date` | |
| `enrolled_at` | `date` | |
| `medical_notes` | `text` | nullable |
| `photo_consent` | `boolean` | default `true` |
| `status` | `child_status` | default `active` |
| `created_at` / `updated_at` | `timestamptz` | |

### 6. `child_allergy_tags` (allergies normalizadas)
| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `uuid` PK | |
| `child_id` | `uuid` FK → `children` | |
| `tag` | `text` | valores en inglés: "peanut", "lactose", "gluten" |
| UNIQUE(`child_id`, `tag`) | | |

### 7. `parent_children`
| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `uuid` PK | |
| `parent_id` | `uuid` FK → `users` | |
| `child_id` | `uuid` FK → `children` | |
| `relationship` | `relationship_type` | |
| `created_at` | `timestamptz` | |
| UNIQUE(`parent_id`, `child_id`) | | |

### 8. `posts`
| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `uuid` PK | |
| `author_id` | `uuid` FK → `users` | staff que publica |
| `room_id` | `uuid` FK → `rooms` | nullable (anuncios de sala) |
| `type` | `post_type` | |
| `title` | `text` | nullable |
| `body` | `text` | |
| `published_at` | `timestamptz` | |
| `created_at` / `updated_at` | `timestamptz` | |

### 9. `post_children`
| Campo | Tipo | Notas |
|-------|------|-------|
| `post_id` | `uuid` FK → `posts` | PK compuesta |
| `child_id` | `uuid` FK → `children` | PK compuesta |

### 10. `post_photos`
| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `uuid` PK | |
| `post_id` | `uuid` FK → `posts` | |
| `url` | `text` | |
| `width` / `height` | `int` | nullable |
| `position` | `int` | orden |
| `created_at` | `timestamptz` | |

**RLS Policies:**
- Staff (`role = 'staff'`): lectura/escritura en todas las tablas.
- Parent (`role = 'parent'`): solo lectura de `children` vinculados (vía `parent_children`), `posts` de sus hijos + announcements de su sala, `users` de su daycare.
- Todos: solo lectura de `rooms`, `daycares` de su mismo daycare.

**Convención:** DB columnas en inglés (snake_case), código en inglés, UI visible en español. Mapeo `post_type → badge label` en capas de UI.

## Implementation plan

> Cada step se verifica con `npx tsc --noEmit` + `npm run lint` antes de continuar.

1. **Instalar dependencias y configurar entorno:**
   - `npm install @supabase/ssr @supabase/supabase-js`
   - `.env`: `NEXT_PUBLIC_SUPABASE_URL=https://wfieadupkizxwxvkaosz.supabase.co` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Er8LaaKjwkDL4pYTc03Pw_Fz8Rgd1L`
   - Crear `lib/supabase/server.ts` con `createClient()` para App Router (cookies).
   - Crear `lib/supabase/middleware.ts` para refrescar sesión.
   - Crear `middleware.ts` en raíz (llama a `supabase/middleware`).

2. **Crear archivos de migración** (en `supabase/migrations/`, orden secuencial):
   - `create_enums.sql` — los 5 enums.
   - `create_daycares_table.sql`
   - `create_users_table.sql` — con FK a `auth.users`, trigger function.
   - `create_rooms_table.sql`
   - `create_children_table.sql`
   - `create_child_allergy_tags_table.sql` — tabla normalizada en vez de `text[]`.
   - `create_parent_children_table.sql` — con UNIQUE constraint.
   - `create_posts_table.sql`
   - `create_post_children_table.sql` — PK compuesta.
   - `create_post_photos_table.sql`
   - `enable_rls_and_policies.sql` — RLS + políticas por rol.
   - `create_profile_trigger.sql` — trigger `AFTER INSERT` en `auth.users`.
   - `seed_initial_data.sql` — seed con los datos del mock.

3. **Aplicar migraciones con `supabase_apply_migration`** en el orden anterior. Verificar con `supabase_list_tables` y `supabase_execute_sql`.

4. **Crear tipos TypeScript generados:**
   - Ejecutar `supabase_generate_typescript_types` o crear `lib/database.types.ts` manualmente.
   - Los tipos reflejan las columnas reales de la DB.

5. **Reescribir `app/(app)/page.tsx` (feed):**
   - Convertir a async server component.
   - Query: `posts` JOIN `users` (author) + `post_children` JOIN `children` (tagged) + `post_photos` (si hay).
   - Ordenar por `published_at DESC`.
   - Mapear `post_type` → `kind` → badge labels.
   - Formatear `published_at` → "HH:MM".
   - Eliminar import de `app/lib/feed.ts` mock.

6. **Reescribir `app/(app)/kids/page.tsx` (lista):**
   - Async server component.
   - Query: `children` JOIN `rooms` + subquery `COUNT(parent_children)` para `parentsCount`.
   - Query `child_allergy_tags` para badges.
   - Filtrar por `status = 'active'`.
   - Eliminar import de `app/lib/children.ts` mock.

7. **Reescribir `app/(app)/kids/[id]/page.tsx` (perfil):**
   - Async server component.
   - Query: child por ID + `child_allergy_tags` + `parent_children` JOIN `users` (linked parents).
   - Calcular `age` desde `birth_date`.
   - Formatear fechas para UI.
   - Si no existe → `notFound()`.

8. **Actualizar `Sidebar`:**
   - Hacerla async o recibir props del layout.
   - Fetch datos del usuario logueado (o usar datos del seed para demo).
   - Mostrar `full_name`, `role`, `room` reales.

9. **Eliminar archivos mock:**
   - Quitar `app/lib/feed.ts` y `app/lib/children.ts` (o reducirlos a constantes de UI como colores/badges que no vienen de la DB).
   - Mantener mapeos de `post_type → label` y `allergy tag → label` como constantes de UI.

10. **Verificación final:**
    - `npx tsc --noEmit` sin errores.
    - `npm run lint` sin errores.
    - `npm run build` exitoso.
    - Seed data visible en `/`, `/kids`, `/kids/[id]`.

## Acceptance criteria

- [x] `npm run dev` muestra `/`, `/kids`, `/kids/[id]` sin errores en consola.
- [x] Las 10 tablas (`daycares`, `users`, `rooms`, `children`, `child_allergy_tags`, `parent_children`, `posts`, `post_children`, `post_photos` + enums) existen en Supabase con RLS habilitada.
- [x] Las migraciones se aplicaron sin errores y están versionadas.
- [x] El seed data incluye: 1 daycare, 3 salas, 8 niños, 1 usuario staff, 3 posts.
- [x] `/` muestra posts desde la base de datos (no desde array estático), con badges correctos (LOGRO, ACTIVIDAD, ANUNCIO) y contadores de likes/comments.
- [x] `/kids` muestra la lista de niños activos desde la base de datos, con badges de alergia y conteo de padres vinculados.
- [x] `/kids/[id]` (p. ej. perfil de Mateo) muestra datos del niño desde la base de datos: alergias, notas, fecha de nacimiento, sala, padres vinculados.
- [x] La Sidebar muestra el nombre y rol del usuario staff desde la base de datos.
- [x] Los modales de agregar niño, vincular padre y crear publicación siguen siendo mock (no persisten), consistentes con SPEC 04/05/06.
- [x] `npx tsc --noEmit` y `npm run lint` pasan sin errores.
- [x] `npm run build` completa exitosamente.

## Decisions

- **Sí:** `@supabase/ssr` con cookie-based auth para App Router. **No:** `@supabase/supabase-js` solo en cliente.
- **Sí:** `child_allergy_tags` como tabla normalizada (1 fila por alergia). **No:** `text[]` en `children` (como sugiere el schema doc).
- **Sí:** migraciones en archivos SQL separados en `supabase/migrations/`. **No:** migración monolítica.
- **Sí:** seed data en SQL (`INSERT` con IDs hardcodeados para referencias). **No:** herramienta externa de seeding.
- **Sí:** server components async para data fetching en páginas. **No:** `useEffect` + client-side fetching.
- **Sí:** RLS con políticas por rol (staff CRUD, parent read-only de sus hijos). **No:** RLS deshabilitado.
- **Sí:** mapeo `post_type → badge label` en capa de UI (constantes locales). **No:** guardar labels en español en la DB.
- **Sí:** mantener modales como mock (SPEC 04/05/06). **No:** hacerlos persistir todavía.
- **Sí:** tipos TypeScript generados o manuales que reflejan la DB real. **No:** tipado manual desincronizado.

## Risks

| Risk | Mitigation |
|------|------------|
| Supabase Auth requerido para las queries RLS | Usar el cliente de servidor con cookies; para desarrollo, seed con usuario y simular sesión. |
| Migraciones con errores de sintaxis SQL | Aplicar una por una con `supabase_apply_migration`, verificar con `supabase_list_tables` entre cada una. |
| RLS policies demasiado restrictivas bloquean la UI | Probar con usuario staff primero; políticas de staff = full access a todo en su daycare. |
| Next 16 breaking changes con server components async | Mantener el patrón `async function Page({ params }: { params: Promise<T> })` como en SPEC 02. |
| El `npm run build` falla por tipos de Supabase | Generar tipos con `supabase_generate_typescript_types` o crear manualmente `Database` type. |
| Los modales mock pierden acceso a los datos del niño | Pasar los datos necesarios como props a los componentes client desde el server component. |

## What is **not** in this spec

- Autenticación real con Supabase Auth (login funcional).
- CRUD funcional de posts/niños/padres (los modales siguen mock).
- Tablas `reactions`, `comments`, `daily_summaries`, `invitations`, `devices`.
- Subida real de fotos a Supabase Storage.
- Feed del padre (`familia-feed.dc.html`).
- Resumen del día.
- Notificaciones push.

Cada una de ellas, si llega, va en su propio spec.
