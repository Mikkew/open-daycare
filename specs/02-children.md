# SPEC 02 — Niños: lista y perfil

> **Status:** Aprovado
> **Depends on:** SPEC 01
> **Date:** 2026-08-27
> **Objective:** Implementar las pantallas `ninos.dc.html` y `perfil-nino.dc.html` como `/kids` y `/kids/[id]`, con un estilo visual idéntico al proporcionado.

## Scope

**In:**

- Pantalla `/kids` (lista) replicando `ninos.dc.html`: cabecera "GESTIÓN / Niños", botón "Agregar niño" (gradiente), campo de búsqueda con filtrado client-side, divisor "SALA SOLES · 8 niños", grilla de 8 tarjetas.
- Tarjeta de niño: avatar (inicial + color), nombre, "X años · N padres vinculados", badge de alergia (MANÍ/LACTOSA) o "VINCULAR", chevron en los que no tienen badge. Cada tarjeta enlaza a `/kids/[id]`.
- Pantalla `/kids/[id]` (perfil dinámico por niño) replicando `perfil-nino.dc.html`: "Volver a Niños", cabecera con avatar/nombre/edad/Editar, bloque "Alergias y notas", tabla (Fecha de nacimiento/Sala/Ingreso), botón "Resumen del día", "PADRES VINCULADOS" con estado ACTIVA/PENDIENTE y "Vincular otro padre".
- Sidebar con estado activo correcto y enlaces reales (Feed → `/`, Niños → `/kids`).

**Out of scope (for future specs):**

- CRUD de niños (los botones "Agregar niño"/"Editar" son placeholders `#`).
- "Resumen del día", "Vincular otro padre" y "Cerrar sesión" funcionales.
- Autenticación, base de datos, persistencia, búsqueda con backend.

## Data model

```ts
// app/lib/children.ts
export type ParentStatus = "active" | "pending";

export interface LinkedParent {
  name: string;        // "Lucía Fernández"
  relation: string;    // "Mamá" | "Papá"
  status: ParentStatus;
  avatarColor: string; // "#C9B6E8"
}

export type AllergyTag = "mani" | "lactosa";

export interface Child {
  id: string;          // "mateo-fernandez"
  name: string;        // "Mateo Fernández"
  age: number;         // 3
  room: string;        // "Soles"
  avatarColor: string; // "#A9D9E8"
  avatarText: string;  // "#1F7A93"
  parentsCount: number;
  allergy?: AllergyTag;  // badge MANÍ/LACTOSA
  linkPrompt?: boolean;  // badge VINCULAR (sin padres)
  birthDate?: string;    // "12 mar 2022"
  joinedDate?: string;   // "feb 2025"
  notes?: string;
  parents?: LinkedParent[];
}

export const children: Child[] = [ /* los 8 niños */ ];
```

Convención heredada de SPEC 01: código en inglés, texto visible en español. El mapeo `allergy→label`, `ParentStatus→label` y colores de badges se resuelven con mapas internos.

## Implementation plan

1. Crear `app/lib/children.ts` con tipos + array `children` (8 niños, perfil de Mateo).
2. Modificar `app/components/Sidebar.tsx`: añadir `"use client"`, derivar item activo con `usePathname()`, cablear Feed→`/` y Niños→`/kids` (Avisos/Mi cuenta → `#`).
3. Crear `app/components/ChildCard.tsx` (tarjeta de la grilla, enlaza a `/kids/[id]`).
4. Crear `app/components/ParentRow.tsx` (fila de padre con badge de estado).
5. Crear `app/components/ChildrenList.tsx` (client): campo "Buscar niño…" con estado + filtrado por nombre + grilla de `ChildCard`.
6. Crear `app/kids/page.tsx`: cabecera + "Agregar niño" + `<ChildrenList />`.
7. Crear `app/kids/[id]/page.tsx`: perfil dinámico por niño (busca por `id` en `children.ts`).

## Acceptance criteria

- [ ] `npm run dev` muestra `/kids` sin errores en consola.
- [ ] `/kids` replica la cabecera "GESTIÓN / Niños", botón "Agregar niño", campo "Buscar niño…" y divisor "SALA SOLES · 8 niños".
- [ ] La grilla muestra los 8 niños con avatares/nombres/edades/conteo y badges correctos (MANÍ en Mateo, VINCULAR en Valentina, LACTOSA en Tomás; resto con chevron).
- [ ] Escribir en el buscador filtra la grilla por nombre (client-side).
- [ ] `/kids/[id]` (p. ej. `/kids/mateo-fernandez`) replica cabecera "Mateo Fernández · 3 años · Sala Soles", bloque de alergias, tabla de datos, "Resumen del día", padres vinculados (Lucía ACTIVA, Diego PENDIENTE) y "Vincular otro padre".
- [ ] "Volver a Niños" navega a `/kids`.
- [ ] Sidebar resalta "Niños" en ambas rutas y "Feed" en `/`; enlaces Feed/Niños reales; resto `#`.
- [ ] "Agregar niño", "Editar", "Resumen del día", "Vincular otro padre" y "Cerrar sesión" son `#`.
- [ ] `npx tsc --noEmit` y `npm run lint` pasan sin errores.

## Decisions

- **Sí:** rutas en inglés `/kids` y `/kids/[id]`. **No:** `/ninos`.
- **Sí:** `usePathname()` en `Sidebar` para el estado activo. **No:** prop `active` desde cada página (el Sidebar vive en el layout compartido).
- **Sí:** array tipado `app/lib/children.ts`. **No:** JSX hardcodeado ni backend.
- **Sí:** búsqueda client-side por nombre. **No:** llamadas a API.
- **Sí:** perfil dinámico por niño (`/kids/[id]` con lookup por `id`). **No:** base de datos.
- **Sí:** enlaces a pantallas no implementadas como `#`. **No:** routing hacia screens inexistentes.
- **Sí:** código en inglés, UI en español (heredado de SPEC 01).

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| Convertir `Sidebar` a client (`usePathname`) | Solo SVG inline, sin lógica de servidor; verificar `npm run build`. |
| Búsqueda client-side requiere estado | Estado aislado en `ChildrenList` (client); la página queda server. |
| Duplicar estilos de avatares/badges lista vs perfil | Mapas de colores/badges en `children.ts` + componentes `ChildCard`/`ParentRow`. |
| Perfil dinámico `/kids/[id]` con lookup | Lookup por `id` en array `children.ts`; si no encuentra → 404. |
| Next 16 breaking changes | Mantener convenciones de SPEC 01; consultar `node_modules/next/dist/docs/` si algo rompe. |

## What is **not** in this spec

- CRUD de niños.
- "Resumen del día", "Vincular otro padre", "Agregar niño" y "Cerrar sesión" funcionales.
- Autenticación, base de datos, persistencia, búsqueda con backend.

Cada una de ellas, si llega, va en su propio spec.
