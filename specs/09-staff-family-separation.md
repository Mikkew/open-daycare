# SPEC 09 — Separación Staff / Family

> **Status:** Approved
> **Depends on:** Spec 01 (Auth & Route Protection)
> **Date:** 2026-09-08
> **Objective:** Separar el panel actual en dos rutas independientes: `/staff/*` para el personal de la guardería y `/family/*` para las familias, con redirección automática basada en el rol del usuario.

---

## Context

Actualmente toda la app vive en `app/(app)/*` y está construida exclusivamente desde la perspectiva del staff. Los mockups de referencia muestran dos paneles distintos:

- **Staff:** Feed con creación de posts, gestión de niños, salas, avisos, mi-cuenta
- **Family:** Feed con filtros por hijo, resumen del día, mi-cuenta (con hijos vinculados)

El middleware de autenticación actual (`lib/supabase/middleware.ts`) solo verifica sesión — no roles. Next.js 16 reemplaza `middleware` por `proxy`.

---

## Scope

**In:**

- Renombrar `lib/supabase/middleware.ts` a `proxy.ts` en la raíz con role-based routing
- Mover `app/(app)/*` → `app/staff/*`
- Crear `app/family/` con layout, feed, resumen del día y mi-cuenta
- Refactorizar `Sidebar.tsx` para aceptar navItems y CTA como props
- Mover componentes de gestión a `components/staff/`
- Crear helper `getUserRole()` en `lib/supabase/`
- Redirección automática `/` → `/staff` o `/family` según rol
- Redirección cruzada: `parent` en `/staff/*` → `/family`, `staff` en `/family/*` → `/staff`
- Admin siempre accede a `/staff`

**Out of scope:**

- Página `/staff/avisos` (mockup existe pero no se implementa ahora)
- Página `/staff/mi-cuenta` (mockup existe pero no se implementa ahora)
- Likes/comments reales (placeholders por ahora)
- Notificaciones push
- Página de detalle de publicación
- `pokemon/` se mantiene fuera de esta separación

---

## Data Model

No se crean nuevas tablas. Se utilizan las existentes del esquema:

| Tabla | Uso en este spec |
|-------|------------------|
| `users` | Obtener `role` (`staff`, `parent`, `admin`) |
| `parent_children` | Obtener hijos vinculados de un parent para el feed y pills |
| `children` | Datos de los hijos para mostrar en UI |
| `posts` | Feed filtrado por rol |
| `post_children` | Filtrar posts del family feed por hijos del padre |
| `post_photos` | Fotos en posts del feed |
| `daily_summaries` | Stats del resumen del día (meals_count, sleep_minutes, activities_count, mood, highlight) |
| `rooms` | Sala del niño para mostrar en resumen |

### Query del Family Feed

El feed de family filtra posts diferente al staff:

```
Posts donde:
  1. El post tiene un child_id que está en los hijos del padre (post_children + parent_children)
  2. O el post es tipo 'announcement' de la sala del niño
```

### Query del Resumen del Día

```
SELECT * FROM daily_summaries
WHERE child_id = {child_id} AND date = {today}
```

Se agrega JOIN con `children` para obtener el nombre y con `rooms` para la sala.

---

## Arquitectura de Rutas

```
ANTES:
  /login          → público
  /activate       → público
  /               → autenticado (siempre staff)
  /kids           → autenticado
  /rooms          → autenticado

DESPUÉS:
  /login          → público
  /activate       → público
  /               → autenticado → redirect /staff o /family según role
  /staff/*        → role staff o admin (parent → redirect /family)
  /family/*       → role parent (staff/admin → redirect /staff)
```

### Estructura de directorios

```
app/
  staff/                    ← Panel Staff (migrado de (app))
    layout.tsx              ← Sidebar con staffNav
    page.tsx                ← Feed staff
    kids/
      page.tsx
      [id]/
        page.tsx
    rooms/
      page.tsx
  family/                   ← Panel Family (nuevo)
    layout.tsx              ← Sidebar con familyNav
    page.tsx                ← Feed family
    resumen-dia/
      page.tsx              ← Resumen del día con stats
    mi-cuenta/
      page.tsx              ← Mi cuenta familia
  (auth)/                   ← Se queda igual
    login/
    activate/
  components/
    Sidebar.tsx             ← Refactorizado (navItems como props)
    LoginForm.tsx           ← Compartido
    ChildCard.tsx           ← Compartido
    PokemonCard.tsx         ← Compartido
    staff/                  ← Solo staff
      AddChildModal.tsx
      ArchiveChildButton.tsx
      ChildActions.tsx
      ChildrenList.tsx
      CreatePostModal.tsx
      EditChildModal.tsx
      RoomManager.tsx
      ParentsSection.tsx
      Counter.tsx
  unauthorized.tsx
  layout.tsx                ← Root, se queda
proxy.ts                    ← Renombrado de middleware.ts + role checks
lib/
  supabase/
    client.ts
    server.ts
  database.types.ts
```

---

## Navigation

### Staff Nav

```ts
const staffNav = [
  { label: "Feed", href: "/staff", icon: HomeIcon },
  { label: "Niños", href: "/staff/kids", icon: KidsIcon },
  { label: "Salas", href: "/staff/rooms", icon: RoomsIcon },
  { label: "Avisos", href: "/staff/avisos", icon: BellIcon },
  { label: "Mi cuenta", href: "/staff/mi-cuenta", icon: UserIcon },
];
```

CTA: Botón "Nueva publicación" (gradiente naranja) — siempre visible en sidebar.

### Family Nav

```ts
const familyNav = [
  { label: "Feed", href: "/family", icon: HomeIcon },
  { label: "Resumen del día", href: "/family/resumen-dia", icon: SunIcon },
  { label: "Mi cuenta", href: "/family/mi-cuenta", icon: UserIcon },
];
```

CTA: Ninguno.

---

## Implementation Plan

### Paso 1: Crear helper `getUserRole` en `lib/supabase/`

Nueva función utilitaria:

```ts
export async function getUserRole(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
  return data?.role as 'staff' | 'parent' | 'admin' | undefined;
}
```

Manual test: llamar con un user ID válido, devuelve el role correcto.

### Paso 2: Crear `proxy.ts` en la raíz

- Mover contenido de `lib/supabase/middleware.ts` a `proxy.ts` en la raíz
- Renombrar `updateSession` a `proxy`
- Agregar lógica de role-based routing:
  - Si la ruta es `/staff/*` y el user es `parent` → redirect `/family`
  - Si la ruta es `/family/*` y el user es `staff` o `admin` → redirect `/staff`
  - Si la ruta es `/` → redirect a `/staff` (staff/admin) o `/family` (parent)
- Mantener protección de autenticación existente
- Matcher: `/((?!api|_next/static|_next/image|.*\\.png$|favicon\\.ico$).*)`

Manual test:
- Acceder a `/staff/kids` como parent → redirige a `/family`
- Acceder a `/family` como staff → redirige a `/staff`
- Acceder a `/` como parent → redirige a `/family`
- Acceder a `/` como staff → redirige a `/staff`
- Acceder a `/login` sin sesión → funciona normal
- Acceder a `/` sin sesión → redirige a `/login`

### Paso 3: Eliminar `lib/supabase/middleware.ts`

Después de confirmar que `proxy.ts` funciona.

### Paso 4: Mover `app/(app)/*` → `app/staff/*`

- Crear `app/staff/`
- Mover `page.tsx`, `layout.tsx`, `kids/`, `rooms/`
- Eliminar `app/(app)/` vacío
- Actualizar imports en los archivos movidos:
  - `@/app/components/X` → `@/app/components/staff/X` para componentes de staff
  - Mantener `@/app/components/X` para componentes compartidos

Manual test: `/staff` muestra el mismo feed que `/` mostraba antes.

### Paso 5: Refactorizar `Sidebar.tsx`

Cambiar la interfaz:

```ts
interface SidebarProps {
  user: {
    full_name: string;
    role: string;
    room?: string;
    displayName?: string;  // override para "Mamá de Mateo"
  };
  navItems: { label: string; href: string; icon: ReactNode }[];
  ctaButton?: ReactNode;
}
```

- Eliminar navItems hardcodeados del componente
- Eliminar import directo de `CreatePostModal`
- Renderizar `ctaButton` si se proporciona
- Usar `displayName` si está disponible, sino `full_name`

Manual test: Sidebar renderiza correctamente con navItems pasados como props.

### Paso 6: Crear `app/staff/layout.tsx`

- Importa `Sidebar` refactorizado
- Pasa `staffNav` como navItems
- Pasa botón "Nueva publicación" como `ctaButton`
- Hardcodea `user.role = "staff"` (confirmado por proxy)

### Paso 7: Crear `components/staff/` y mover componentes

Mover archivos:
- `AddChildModal.tsx`
- `ArchiveChildButton.tsx`
- `ChildActions.tsx`
- `ChildrenList.tsx`
- `CreatePostModal.tsx`
- `EditChildModal.tsx`
- `RoomManager.tsx`
- `ParentsSection.tsx`
- `Counter.tsx`

Dejar en `components/` (compartidos):
- `LoginForm.tsx`
- `ChildCard.tsx`
- `PokemonCard.tsx`

Actualizar imports en todos los componentes movidos y en los archivos que los importan.

Manual test: `npm run build` compila sin errores.

### Paso 8: Crear `app/family/layout.tsx`

- Importa `Sidebar` refactorizado
- Pasa `familyNav` como navItems
- Sin `ctaButton`
- Obtiene user info desde Supabase (role = parent)
- Para `displayName`, buscar en `parent_children` → "Madre/Padre de {child_name}"

Manual test: `/family` renderiza con sidebar family, sin botón de crear post.

### Paso 9: Crear `app/family/page.tsx` (Family Feed)

- Header: "TU FAMILIA" / "Hola, {nombre}" / "Así va el día de hoy"
- Child filter pills: obtener hijos desde `parent_children` para el usuario logueado
- Posts filtrados: posts con `child_id` en los hijos del padre + announcements de la sala
- Sin CTA "Compartí un momento…"
- Posts muestran: nombre del niño, hora, maestra, sala, badge de tipo (LOGRO, ACTIVIDAD, ANUNCIO)
- Likes/comments como placeholders (0)
- Cada post es un link a detalle (por ahora `href="#"`)

Manual test:
- Parent con 2 hijos ve pills de ambos hijos
- Solo ve posts de sus hijos + announcements
- No ve botón de crear post

### Paso 10: Crear `app/family/resumen-dia/page.tsx`

- Child filter pills (mismo mecanismo que el feed)
- Header con gradiente: "RESUMEN DEL DÍA" / "El día de {child_name}" / fecha
- Stats cards desde `daily_summaries`:
  - Comidas: `meals_count` (card amarilla)
  - Siesta: `sleep_minutes` formateado (card violeta)
  - Momentos: `activities_count` (card azul)
- Mood card: `mood` (card rosa)
- "Lo más lindo de hoy": `highlight` con lista de posts destacados
- Si no hay `daily_summary` para hoy, mostrar "Sin resumen aún"

Manual test:
- Seleccionar hijo muestra su resumen
- Stats se calculan correctamente desde la BD
- Si no hay datos, muestra mensaje apropiado

### Paso 11: Crear `app/family/mi-cuenta/page.tsx`

- Card de perfil: avatar (inicial), nombre, email, "Madre/Padre de {hijos}"
- Sección "Mis hijos": lista desde `parent_children` con nombre, edad, sala, toggle de fotos
- Sección "Notificaciones": toggles para `notify_on_post` y `daily_summary_enabled`
- Links: Cambiar contraseña, Ayuda y soporte
- Botón "Cerrar sesión" (rojo/salmon)

Manual test:
- Perfil muestra datos correctos del usuario
- Hijos vinculados se muestran correctamente
- Toggles reflejan valores reales de la BD

### Paso 12: Actualizar `unauthorized.tsx`

- Cambiar redirect de `/login` a mantener `/login` (no cambia)
- Verificar que el mensaje sea correcto para ambos paneles

### Paso 13: Verificar build y lint

- `npm run build` compila sin errores
- `npm run lint` no reporta errores
- `npx tsc --noEmit` sin errores de tipos

---

## Acceptance Criteria

- [ ] `proxy.ts` existe en la raíz con role-based routing
- [ ] `lib/supabase/middleware.ts` fue eliminado
- [ ] Acceder a `/` sin sesión redirige a `/login`
- [ ] Acceder a `/` como staff redirige a `/staff`
- [ ] Acceder a `/` como parent redirige a `/family`
- [ ] Acceder a `/staff/*` como parent redirige a `/family`
- [ ] Acceder a `/family/*` como staff redirige a `/staff`
- [ ] `/staff` muestra el feed de staff con sidebar staff (Feed, Niños, Salas, Avisos, Mi cuenta)
- [ ] `/staff` tiene botón "Nueva publicación" en sidebar
- [ ] `/staff/kids` y `/staff/rooms` funcionan como antes
- [ ] `/family` muestra el feed family con sidebar family (Feed, Resumen del día, Mi cuenta)
- [ ] `/family` NO tiene botón de crear publicación
- [ ] `/family` muestra child filter pills para los hijos del padre
- [ ] `/family/resumen-dia` muestra stats desde `daily_summaries`
- [ ] `/family/mi-cuenta` muestra perfil, hijos vinculados y notificaciones
- [ ] `components/staff/` contiene los componentes de gestión
- [ ] `components/Sidebar.tsx` acepta navItems y ctaButton como props
- [ ] `npm run build` compila sin errores
- [ ] `npm run lint` no reporta errores
- [ ] `npx tsc --noEmit` sin errores de tipos

---

## Decisions

- **Route groups `(app)` eliminados:** Ya no se necesitan — `staff/` y `family/` son route segments directos
- **`proxy.ts` en la raíz:** Next.js 16 usa `proxy.ts` en vez de `middleware.ts`; el archivo se mueve a la raíz
- **Sidebar refactorizado con props:** En vez de duplicar el componente, se parametriza con navItems y ctaButton
- **Componentes de staff en subcarpeta:** `components/staff/` para claridad y evitar imports incorrectos desde family
- **Child filter pills funcionales:** Se obtienen de `parent_children` — el usuario puede filtrar el feed y resumen por hijo
- **Resumen del día con datos reales:** Usa la tabla `daily_summaries` del esquema
- **Admin → siempre /staff:** Los admins tienen acceso al panel de gestión completo
- **Redirección automática vs. error page:** Si un usuario intenta acceder a un panel que no le corresponde, se le redirige automáticamente al correcto — no se muestra página de error

## Risks

| Risk | Mitigation |
|------|-----------|
| `proxy.ts` no puede hacer queries DB directamente (es Node runtime) | Usar `getSession()` para obtener user ID, luego crear un Supabase client dentro del proxy para consultar `users.role` |
| El feed de family necesita joins complejos (`parent_children` + `post_children`) | Construir la query con Supabase client usando `.select()` con joins anidados |
| `daily_summaries` puede no existir aún en la BD | Verificar que la tabla existe antes de implementar; si no, crear migration |
| Los componentes movidos pueden tener imports relativos rotos | Verificar cada import después de mover; `npm run build` lo detectará |
| `pokemon/` queda huérfano | Mantenerlo en `app/staff/pokemon/` o eliminarlo — fuera de scope de este spec |

---

## What is **not** in this spec

- Página de avisos para staff (`/staff/avisos`)
- Página de mi-cuenta para staff (`/staff/mi-cuenta`)
- Página de detalle de publicación
- Likes/comments reales (interactivos)
- Notificaciones push
- Gestión de perfil (editar nombre, email, avatar)
- Cambio de contraseña funcional
- `daily_summaries` auto-calculado desde posts (se asume que se guarda manualmente o por trigger)
