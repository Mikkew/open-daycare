# SPEC 03 — Autenticación: login y activación de cuenta

> **Status:** Implementado
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-08-28
> **Objective:** Implementar las pantallas `login.dc.html` y `activar-cuenta.dc.html` como `/login` y `/activate`, full-page (sin sidebar), con estilo visual idéntico.

## Scope

**In:**

- Route groups `(app)`/`(auth)`: extraer `Sidebar` + `<main>` a `(app)`, crear `(auth)` sin sidebar.
- `/login`: panel izquierdo con gradiente (logo, titular, subtítulo, "🌿 Guardería Sala Soles") + formulario con selector **Personal / Familia** interactivo (toggle + email prellenado), email, contraseña, "¿Olvidaste tu contraseña?", "Iniciar sesión", "¿Te invitó la guardería? Activá tu cuenta" → `/activate`.
- `/activate`: tarjeta centrada (logo, "Bienvenida a OpenDayCare", invitación "Mateo · Sala Soles", código `7K4P9`, email, contraseña, checkbox autorización, "Activar mi cuenta", "¿Ya tenés cuenta? Iniciar sesión" → `/login`).
- Fondo `#FBF4EC`; fuentes Fredoka/Nunito (ya configuradas).

**Out of scope (for future specs):**

- Autenticación real, validación de formularios, backend o persistencia de sesión.
- Pantalla de "restablecer contraseña".
- Feed de familia (`familia-feed.dc.html`).
- Login social (Google/Apple) o cualquier método alternativo.

## Data model

Esta feature no introduce estructuras de datos persistentes. Solo un estado local transitorio en el formulario de login:

```ts
// app/components/LoginForm.tsx (estado local, no persistente)
type Role = "staff" | "parent";

const ROLE_EMAIL: Record<Role, string> = {
  staff: "caro@opendaycare.com",
  parent: "lucia.fernandez@gmail.com",
};
```

Convención heredada de SPEC 01/02: código en inglés, texto visible en español. El mapeo `role → email` y los colores del botón activo se resuelven con mapas internos.

## Implementation plan

1. Crear `app/(app)/layout.tsx` con el shell actual (`Sidebar` + `<main>`) importando `@/app/components/Sidebar`.
2. Simplificar `app/layout.tsx` para que quede solo `html/body` + fuentes + metadata (quitar `Sidebar` y el wrapper flex).
3. Mover `app/page.tsx` → `app/(app)/page.tsx` y `app/kids/` → `app/(app)/kids/` (los imports `@/app/...` no cambian).
4. Crear `app/(auth)/layout.tsx` (full-page: `min-h-screen` con fondo `#FBF4EC`, sin sidebar).
5. Crear `app/components/LoginForm.tsx` (`"use client"`): selector Personal/Familia con estado `role`, email prellenado, contraseña, "¿Olvidaste tu contraseña?", botón "Iniciar sesión" (Link → `/`) y "Activá tu cuenta" (Link → `/activate`).
6. Crear `app/(auth)/login/page.tsx`: grid de dos columnas (panel izquierdo con gradiente + formulario derecho usando `<LoginForm />`).
7. Crear `app/(auth)/activate/page.tsx`: tarjeta centrada con los campos estáticos (código, email, contraseña, checkbox), botón "Activar mi cuenta" (Link → `/`) y "Iniciar sesión" (Link → `/login`).

## Acceptance criteria

- [x] `npm run dev` muestra `/login` y `/activate` sin errores en consola y **sin** sidebar.
- [x] `/login` replica el panel izquierdo: gradiente, logo "OpenDayCare", titular, subtítulo y "🌿 Guardería Sala Soles".
- [x] El selector Personal/Familia alterna el estilo activo y prellena el email (`caro@opendaycare.com` / `lucia.fernandez@gmail.com`) al hacer clic.
- [x] "Iniciar sesión" navega a `/` (ambos roles, mock).
- [x] "¿Te invitó la guardería? Activá tu cuenta" navega a `/activate`.
- [x] `/activate` replica: logo, "Bienvenida a OpenDayCare", tarjeta "Mateo · Sala Soles", código `7K4P9`, email prellenado, crear contraseña, checkbox de autorización, "Activar mi cuenta" y "¿Ya tenés cuenta? Iniciar sesión" → `/login`.
- [x] "Activar mi cuenta" navega a `/` (mock).
- [x] `/` y `/kids` siguen funcionando con sidebar tras el refactor de route groups.
- [x] Fondo `#FBF4EC` en ambas pantallas; Fredoka en títulos/logo, Nunito en el cuerpo.
- [x] `npx tsc --noEmit` y `npm run lint` pasan sin errores.

## Decisions

- **Sí:** route groups `(auth)` y `(app)` para ocultar el sidebar en autenticación. **No:** condicional con `usePathname` en el layout raíz.
- **Sí:** slugs en inglés `/login` y `/activate`. **No:** `/activar-cuenta`.
- **Sí:** "Iniciar sesión" navega a `/` para ambos roles (mock). **No:** crear una ruta para `familia-feed.dc.html` todavía.
- **Sí:** "Activar mi cuenta" navega a `/` (mock). **No:** dejar el enlace roto o a `#`.
- **Sí:** solo UI mock, sin validación/backend/persistencia. **No:** auth real.
- **Sí:** fondo `#FBF4EC` solo en `(auth)` (no alterar el `#F6ECDF` global).
- **Sí:** `LoginForm` como componente client para el toggle de rol. **No:** estado en el server component.

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| Next 16 route groups + layouts tipados (`LayoutProps<"/">`) con breaking changes | Mantener convenciones de SPEC 01/02 y leer `node_modules/next/dist/docs/` si algo rompe. |
| Mover `page.tsx`/`kids/` a `(app)` puede romper imports relativos | Los imports ya usan el alias `@/app/...`; verificar `npx tsc --noEmit`. |
| Fondo `#FBF4EC` distinto al global `#F6ECDF` | Definir el color solo en `(auth)/layout.tsx` y no en `globals.css`. |
| SVG inline sin librería | Copiar los SVG inline del HTML (sin dependencias nuevas), como en specs previos. |

## What is **not** in this spec

- Autenticación real, validación de formularios, backend o persistencia de sesión.
- Pantalla de "restablecer contraseña".
- Feed de familia (`familia-feed.dc.html`).

Cada una de ellas, si llega, va en su propio spec.
