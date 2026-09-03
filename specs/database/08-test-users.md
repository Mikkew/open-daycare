# SPEC 08 — Usuarios de prueba: staff + admin con Supabase Auth real

> **Status:** Implementado
> **Depends on:** SPEC 03, SPEC 07
> **Date:** 2026-09-02
> **Objective:** Crear usuarios staff y admin reales con Supabase Auth funcional (email + password confirmados) para poder probar login y la relación 1:N daycare → users.

## Scope

**In:**

- Crear 2 usuarios reales en Supabase Auth con emails y passwords funcionales:
  - **Staff:** `caro@guarderia.com` con rol `staff`, nombre "Caro Giménez"
  - **Admin:** `admin@guarderia.com` con rol `admin`, nombre "Admin Soles"
- Ambos vinculados al daycare "Guardería Sala Soles" (id `a0000000-0000-0000-0000-000000000001`).
- Verificar que el trigger `handle_new_user` crea automáticamente la fila en `users` al registrarse.
- Seed SQL que inserta usuarios en `auth.users` con emails confirmados (sin necesidad de verificar email).
- Validar que RLS funciona: staff tiene acceso de lectura/escritura, admin tiene acceso total.
- Documentar credenciales de prueba para desarrollo.

**Out of scope (for future specs):**

- Login UI funcional (SPEC 03 ya cubre la UI mock, el login real vendrá aparte).
- Flujo de invitación de padres (SPEC 05).
- Activación de cuenta con código (SPEC 03).
- Gestión de roles desde la UI.
- Recuperación de contraseña.
- Múltiples daycares o usuarios en otros daycares.

## Data model

No se crean tablas nuevas. Se utilizan las existentes:

### `auth.users` (Supabase Auth)
| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `uuid` PK | Generado por Supabase Auth |
| `email` | `text` | Email de login |
| `email_confirmed_at` | `timestamptz` | Confirmado automáticamente para dev |
| `raw_user_meta_data` | `jsonb` | Contiene `daycare_id`, `role`, `full_name` |

### `public.users` (perfiles de dominio)
| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `uuid` PK | FK → `auth.users(id)` ON DELETE CASCADE |
| `daycare_id` | `uuid` FK → `daycares` | Mismo daycare para ambos |
| `role` | `user_role` | `staff` / `admin` |
| `status` | `user_status` | Default `active` |
| `full_name` | `text` | |
| `avatar_url` | `text` | nullable |
| `notify_on_post` | `boolean` | default `true` |
| `daily_summary_enabled` | `boolean` | default `true` |
| `created_at` / `updated_at` | `timestamptz` | |

### Relación daycare → users
Un `daycare` tiene muchos `users` (1:N). La FK `users.daycare_id → daycares.id` ya existe. Este spec valida que funciona correctamente con usuarios reales de Auth.

### Datos de prueba
| Rol | Email | Password | full_name | daycare |
|-----|-------|----------|-----------|---------|
| staff | `caro@guarderia.com` | `Test1234!` | Caro Giménez | Sala Soles |
| admin | `admin@guarderia.com` | `Test1234!` | Admin Soles | Sala Soles |

## Implementation plan

> Cada step se verifica con `npx tsc --noEmit` + `npm run lint` antes de continuar.

1. **Verificar el trigger `handle_new_user`:**
   - Leer la migración `create_profile_trigger.sql` para confirmar que lee `raw_user_meta_data` y crea la fila en `users`.
   - Si el trigger no pasa `daycare_id`, `role`, o `full_name` correctamente, crear una migración de fix.

2. **Crear migración de seed de usuarios reales:**
   - Archivo: `supabase/migrations/seed_test_users.sql`
   - Usar la función `auth.create_user()` o `auth.admin_create_user()` para crear usuarios reales en Supabase Auth.
   - Pasar `raw_user_meta_data` con `daycare_id`, `role`, `full_name`.
   - Emails confirmados automáticamente (`email_confirmed_at = now()`).
   - Si ya existen (por seed anterior), usar `UPSERT` o limpiar y re-crear.

3. **Aplicar migración con `supabase_apply_migration`.**

4. **Verificar que los usuarios existen en `auth.users` y `public.users`:**
   ```sql
   SELECT u.id, u.email, p.role, p.full_name, p.daycare_id
   FROM auth.users u
   JOIN public.users p ON p.id = u.id;
   ```

5. **Verificar RLS policies:**
   - Ejecutar queries simulando rol `staff` y `admin`.
   - Confirmar que staff puede leer/escribir posts, children, rooms de su daycare.
   - Confirmar que admin tiene acceso total.

6. **Documentar credenciales:**
   - Agregar un bloque `.env.example` o `README.md` con las credenciales de prueba.
   - Nunca commitear passwords reales en `.env`.

7. **Verificación final:**
   - `npx tsc --noEmit` sin errores.
   - `npm run lint` sin errores.
   - Los usuarios aparecen en `auth.users` y `public.users` vinculados correctamente.
   - Ambos pueden autenticarse con Supabase Auth (probar con `supabase.auth.signInWithPassword`).

## Acceptance criteria

- [x] El usuario `caro@guarderia.com` existe en `auth.users` con rol `staff` y fila en `public.users`.
- [x] El usuario `admin@guarderia.com` existe en `auth.users` con rol `admin` y fila en `public.users`.
- [x] Ambos usuarios están vinculados al daycare "Guardería Sala Soles" (`daycare_id` correcto).
- [x] El trigger `handle_new_user` crea automáticamente la fila en `public.users` al crear un auth user.
- [x] Los emails están confirmados (`email_confirmed_at IS NOT NULL`).
- [x] RLS permite que staff tenga acceso de lectura/escritura a posts, children, rooms de su daycare.
- [x] RLS permite que admin tenga acceso total.
- [x] Las credenciales de prueba están documentadas para desarrollo.
- [x] `npx tsc --noEmit` y `npm run lint` pasan sin errores.

## Decisions

- **Sí:** usar `auth.admin_create_user()` en seed SQL para crear usuarios con emails confirmados. **No:** flujo de signup manual que requiere confirmación de email.
- **Sí:** passwords simples para desarrollo (`Test1234!`). **No:** complejidad innecesaria para un entorno de prueba.
- **Sí:** trigger existente `handle_new_user` maneja la creación de perfiles. **No:** insertar manualmente en `public.users` sin pasar por auth.
- **Sí:** 2 usuarios de prueba (staff + admin). **No:** múltiples usuarios o daycares distintos en este spec.

## Risks

| Risk | Mitigation |
|------|------------|
| `auth.admin_create_user()` no está disponible en SQL directo | Usar la Management API o la función `supabase_functions_auth` si existe; alternativamente, crear con `auth.users` insert directo + trigger. |
| El trigger `handle_new_user` no lee `raw_user_meta_data` correctamente | Crear migración de fix que actualice la función para extraer `daycare_id`, `role`, `full_name`. |
| Seed falla porque los usuarios ya existen | Usar `ON CONFLICT` o limpiar antes de insertar. |
| RLS bloquea queries de verificación | Usar `SET ROLE` o `supabase_execute_sql` con contexto de admin para verificar. |

## What is **not** in this spec

- Login UI funcional (viene en spec futuro).
- Flujo de invitación y activación de padres.
- Gestión de roles o permisos desde la UI.
- Múltiples daycares.
- Recuperación de contraseña.

Cada una de ellas, si llega, va en su propio spec.
