## Why

Actualmente la app tiene un único panel (`app/(app)/*`) construido exclusivamente para el staff de la guardería. Los mockups de referencia definen dos paneles distintos — uno para el personal y otro para las familias — con navegación, funcionalidades y flujos diferentes. Sin esta separación, no es posible construir las experiencias de familia (feed filtrado por hijo, resumen del día, mi-cuenta con hijos vinculados) sin mezclar lógica incompatible con la del staff.

Además, el middleware de autenticación actual solo verifica sesión — no valida roles — lo que permite que cualquier usuario autenticado acceda a rutas de gestión de niños y salas.

## What Changes

- **BREAKING**: La ruta `/` deja de ser el dashboard principal — ahora redirige a `/staff` o `/family` según el rol del usuario
- **BREAKING**: El route group `app/(app)/` se elimina — sus rutas migran a `app/staff/`
- **BREAKING**: `lib/supabase/middleware.ts` se reemplaza por `proxy.ts` en la raíz con validación de roles
- Nuevas rutas `/staff/*` con navegación de staff (Feed, Niños, Salas, Avisos, Mi cuenta)
- Nuevas rutas `/family/*` con navegación de familia (Feed, Resumen del día, Mi cuenta)
- Sidebar parametrizado: navItems y CTA se pasan como props en vez de estar hardcodeados
- Componentes de gestión de staff movidos a `components/staff/`
- Redirección automática cruzada: un `parent` en `/staff/*` va a `/family`, un `staff` en `/family/*` va a `/staff`
- Admin siempre accede a `/staff`

## Capabilities

### New Capabilities

- `staff-panel`: Panel de gestión para el personal — feed con creación de posts, gestión de niños, salas, avisos y cuenta. Rutas bajo `/staff/*`.
- `family-panel`: Panel para familias — feed filtrado por hijos, resumen del día con estadísticas reales, mi-cuenta con hijos vinculados y notificaciones. Rutas bajo `/family/*`.
- `role-based-routing`: Proxy con validación de roles — redirección automática a `/staff` o `/family` según el rol del usuario (`staff`, `parent`, `admin`), protección de rutas por rol.

### Modified Capabilities

<!-- No existing specs in openspec/specs to modify -->

## Impact

- **Rutas**: Todas las rutas existentes cambian de `/` a `/staff/*`. Bookmarks y links externos se romperán.
- **Proxy**: `lib/supabase/middleware.ts` se elimina, `proxy.ts` nuevo en la raíz con lógica adicional de role check
- **Sidebar**: Se refactoriza — todos los consumidores deben pasar navItems y ctaButton como props
- **Componentes**: 9 componentes se mueven a `components/staff/` — se actualizan todos los imports
- **Base de datos**: Se requiere que las tablas `daily_summaries` y `parent_children` existan para el panel de familia
- **Auth**: El spec 01 de autenticación se ve afectado — la redirección post-login ya no es a `/` sino al panel correspondiente
