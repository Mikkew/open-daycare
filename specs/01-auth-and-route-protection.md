# SPEC 01 — Autenticación y protección de rutas

> **Status:** Implementado
> **Depends on:** None
> **Date:** 2026-09-03
> **Objective:** Implementar autenticación con email/password contra Supabase real y proteger todas las rutas excepto /login y /activate, redirigiendo al dashboard principal tras el login.

## Scope

**In:**

- Variables de entorno `.env` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Middleware de protección de rutas: redirige usuarios no autenticados desde rutas protegidas a `/login`, y usuarios autenticados desde `/login` o `/activate` al dashboard `/`.
- Login funcional: el formulario en `/login` envía email/password a Supabase Auth (`signInWithPassword`).
- Activación de cuenta: la página `/activate` permite crear contraseña para un invitado (`signUp` o método equivalente con invitation code).
- Botón de logout accesible desde el layout de la app (`app/(app)/layout.tsx`).
- Manejo de errores de autenticación (credenciales inválidas, sesión expirada) con mensajes visibles en el formulario.
- Sesión sin expiración por ahora (persistent session con Supabase).

**Out of scope (for future specs):**

- Recuperación de contraseña ("olvidé mi contraseña").
- Verificación de email por correo electrónico.
- Gestión de perfil de usuario.
- Roles granulares (por ahora la protección es binaria: autenticado o no).
- El selector de rol (staff/parent) del mock actual se elimina — el rol lo determina la cuenta real en Supabase.

## Data model

No se introducen nuevas tablas. Se usa la tabla `users` existente en Supabase (ya referenciada en `lib/database.types.ts` y en el seed) con la columna `role` que almacena `staff`, `admin`, o `parent`. La autenticación se maneja nativamente con Supabase Auth (`auth.users`).

## Implementation plan

1. **Crear `.env` con las variables de Supabase.** Agregar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con los valores del proyecto real. Manual test: `npm run dev` arranca sin errores de variables faltantes.

2. **Actualizar `lib/supabase/middleware.ts` para incluir protección de rutas.** Cambiar `getClaims()` por `getSession()` para obtener el objeto completo con `user`. Modificar `updateSession` para: (a) definir rutas públicas (`/login`, `/activate`) y todas las demás como protegidas; (b) tras refrescar la sesión, verificar si hay `user`; (c) si la ruta es protegida y no hay sesión, redirigir a `/login`; (d) si la ruta es pública y hay sesión, redirigir a `/`. Manual test: acceder a `/` sin sesión redirige a `/login`; acceder a `/login` con sesión redirige a `/`.

3. **Actualizar `middleware.ts` root.** Quitar `auth/` del matcher (no-op porque `(auth)` es un route group, las rutas reales son `/login` y `/activate` que ya se interceptan). El matcher debe excluir solo `_next/static`, `_next/image`, `favicon.ico`, y archivos estáticos.

4. **Conectar LoginForm a Supabase Auth.** Reemplazar el mock del `LoginForm` componente para: (a) manejar estado de email y password; (b) al hacer submit, llamar `supabase.auth.signInWithPassword({ email, password })`; (c) en éxito, redirigir a `/`; (d) en error, mostrar mensaje de error; (e) eliminar el selector de rol staff/parent — ya no es necesario, el rol viene de la cuenta real. Manual test: login con credenciales válidas redirige al dashboard; credenciales inválidas muestran error.

5. **Conectar ActivatePage a Supabase Auth.** Hacer la página de activación funcional: (a) leer invitation code y email desde la URL (query params); (b) crear usuario con `supabase.auth.signUp({ email, password })`; (c) opcionalmente guardar el invitation code para uso posterior; (d) en éxito, redirigir a `/`. Manual test: completar el flujo de activación crea la cuenta y redirige.

6. **Agregar botón de logout al sidebar o layout.** En `app/(app)/layout.tsx`, agregar un botón de logout que llame `supabase.auth.signOut()` y redirija a `/login`. Manual test: clic en logout cierra sesión y redirige a `/login`.

7. **Crear `app/unauthorized.tsx`.** Página fallback para Next.js 16 que muestra UI de login cuando un usuario no autenticado intenta acceder a una ruta protegida (usando `unauthorized()` de `next/navigation` como respaldo). Esto cubre casos edge donde el middleware no intercepta.

## Acceptance criteria

- [x] El archivo `.env` existe con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- [x] Acceder a `/` sin sesión activa redirige automáticamente a `/login`.
- [x] Acceder a `/login` con sesión activa redirige automáticamente a `/`.
- [x] Acceder a `/activate` con sesión activa redirige automáticamente a `/`.
- [x] El formulario de login acepta email y password, envía a Supabase Auth, y redirige a `/` en caso de éxito.
- [x] El formulario de login muestra un mensaje de error visible cuando las credenciales son inválidas.
- [x] La página de activación crea una cuenta real en Supabase y redirige al dashboard.
- [x] Existe un botón de logout que cierra la sesión y redirige a `/login`.
- [x] Después de logout, acceder a cualquier ruta protegida redirige a `/login`.
- [x] La sesión persiste al recargar la página (no expira).
- [x] `npm run build` compila sin errores.
- [x] `npm run lint` no reporta errores.

## Decisions

- **Yes:** Usar middleware como capa principal de protección de rutas (patrón recomendado por Next.js 16 + Supabase SSR).
- **Yes:** Redirigir autenticados desde rutas públicas a `/` (dashboard principal), no a rutas basadas en rol.
- **Yes:** Eliminar el selector de rol staff/parent del formulario — el rol real viene de Supabase, no lo elige el usuario al login.
- **No:** Implementar recuperación de contraseña en esta spec — va en un spec futuro.
- **No:** Sesiones con expiración por ahora — el requerimiento es que no expiren.
- **Yes:** Usar `parseCookieHeader` de `@supabase/ssr` para el manejo de cookies en middleware (ya está importado).

## Risks

| Risk | Mitigation |
| --- | --- |
| `getClaims()` no devuelve `user`, solo JWT claims — insuficiente para verificar autenticación | Cambiar a `getSession()` en el middleware para obtener `user` completo |
| `auth/` en el matcher del root middleware es un no-op — `(auth)` es route group, no aparece en URL | El matcher actual ya intercepta `/login` y `/activate`; solo se limpia el matcher redundante |
| `setAll` en `createServerClient` del server component está vacío — esto es correcto (el middleware maneja cookies), pero si se usa un cliente con mutación en server component fallará | Mantener `setAll` vacío en server.ts; solo middleware maneja cookie writes |
| La activación de cuenta requiere invitation code que no está implementado en Supabase aún | Por ahora, el activate page puede usar `signUp` directo; la validación del invitation code va en otro spec |

## What is **not** in this spec

- Recuperación de contraseña ("olvidé mi contraseña").
- Verificación de email por correo electrónico.
- Gestión de perfil de usuario.
- Roles granulares en la UI (redirecciones basadas en rol).
- Validación real de invitation codes en la activación.

Cada uno de esos, si llega, va en su propio spec.
