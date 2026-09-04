# SPEC 09 — CRUD de niños y salas

> **Status:** Implemented
> **Depends on:** SPEC 02, SPEC 04, SPEC 07
> **Date:** 2026-09-03
> **Objective:** Implementar CRUD completo de niños (crear, editar, archivar) y salas (crear, editar, eliminar) con salas por defecto Soles, Estrellas y Arcoiris, y la tabla children limpia de datos seed.

## Scope

**In:**

- Modal "Agregar niño" funcional (persiste en `children` + `child_allergy_tags`).
- Modal "Editar niño" funcional desde el botón "Editar" en `/kids/[id]`.
- Archivar niño (soft delete vía `status = 'archived'`) desde la tarjeta en `/kids` y desde `/kids/[id]`.
- CRUD de salas: UI para crear, editar nombre, y eliminar salas.
- Migración: renombrar "Lunas" → "Arcoiris", limpiar los 8 niños seed.
- Room selector en modales tira datos reales de la tabla `rooms`.
- Agrupación de la lista `/kids` por sala (divisores por cada sala).
- Tabla `children` sin datos seed al iniciar.

**Out of scope (for future specs):**

- CRUD de padres/vínculos (`parent_children`).
- Subida real de fotos (Supabase Storage).
- Resumen del día funcional.
- Feed del padre (`familia-feed.dc.html`).
- Reacciones y comentarios funcionales.

## Data model

Se reutilizan las tablas existentes de SPEC 07. No se crean tablas nuevas.

### `children` (existente)
- `status`: `active` / `archived` — soft delete. Solo se muestran `active` en `/kids`.

### `rooms` (existente)
- Sin campo status — eliminación hard (con validación: no eliminar si tiene niños activos).

### `child_allergy_tags` (existente)
- Tabla normalizada: 1 fila por alergia por niño.
- Al editar niño: se reemplazan todas las tags del niño.

### Salas por defecto
| Sala | Acción en migración |
|------|-------------------|
| Soles | Se mantiene |
| Lunas | Se renombra → **Arcoiris** |
| Estrellas | Se mantiene |

## Implementation plan

> Cada step se verifica con `npx tsc --noEmit` + `npm run lint` antes de continuar.

### Step 1 — Migración: renombrar rooms y limpiar seed

1. Crear migración `rename_rooms_and_clean_seed.sql`:
   - `UPDATE rooms SET name = 'Arcoiris' WHERE name = 'Lunas'`.
   - `DELETE FROM child_allergy_tags` (limpiar alergias seed).
   - `DELETE FROM parent_children` (limpiar vínculos seed).
   - `DELETE FROM children` (limpiar niños seed).
2. Aplicar con `supabase_apply_migration`.
3. Verificar con `supabase_execute_sql`: rooms = Soles, Estrellas, Arcoiris; children = 0 rows.

### Step 2 — Room selector dinámico desde DB

1. Modificar `app/lib/children.ts`: eliminar `export const rooms` (array estático).
2. Crear función `getRooms()` en un nuevo archivo `app/lib/rooms.ts`:
   - Query a `rooms` filtrando por `daycare_id`, ordenando por `name`.
   - Retorna `{ id, name }[]`.
3. Actualizar `AddChildModal` para recibir `rooms` como prop desde el padre.

### Step 3 — Modal "Agregar niño" funcional

1. Modificar `app/(app)/kids/page.tsx`:
   - Fetch rooms desde DB.
   - Pasar `rooms` como prop a `AddChildModal`.
   - Agregar callback `onChildAdded` que haga `revalidatePath('/kids')`.
2. En `AddChildModal`:
   - `handleSave` hace INSERT en `children` (`full_name`, `birth_date`, `enrolled_at` = hoy, `room_id`, `medical_notes`).
   - Si hay alergias (campo texto separado por comas), parsear y hacer INSERTs en `child_allergy_tags` (tags en inglés: `peanut`, `lactose`, `gluten`).
   - Mapeo UI→DB: "Maní" → `peanut`, "Lactosa" → `lactose`, "Gluten" → `gluten`.
   - Al éxito: cerrar modal, limpiar form, notificar al padre para revalidar.
   - Al error: mostrar mensaje de error en el modal.

### Step 4 — Modal "Editar niño" (nuevo componente)

1. Crear `app/components/EditChildModal.tsx`:
   - Similar a `AddChildModal` pero pre-lleno con datos del niño.
   - Campos: nombre, fecha nacimiento, sala, alergias, notas médicas.
   - `handleSave` hace UPDATE en `children` + reemplaza `child_allergy_tags`.
   - Botón "Editar" desde `/kids/[id]` abre este modal.
2. Modificar `app/(app)/kids/[id]/page.tsx`:
   - Convertir botón "Editar" de `<a href="#">` a `<button>` que abre el modal.
   - Hacer la página client en la zona del botón o usar un client wrapper.
   - Fetch rooms desde DB y pasar como prop.

### Step 5 — Archivar niño desde la lista y el perfil

1. Crear `app/components/ChildActions.tsx` (client component):
   - Menú de acciones en cada `ChildCard` (tres puntos o icono de menú).
   - Opción "Archivar" → PATCH/UPDATE `status = 'archived'`.
   - Confirmación antes de archivar ("¿Archivar a {nombre}?").
2. Agregar botón "Archivar" también en `/kids/[id]` (al lado de "Editar").
3. Modificar query en `app/(app)/kids/page.tsx`:
   - Ya filtra `status = 'active'` — correcto, los archivados desaparecen.
4. Opcional: sección "Niños archivados" colapsable al final de la lista (deferido si mucho trabajo).

### Step 6 — CRUD de salas (UI)

1. Crear página `app/(app)/rooms/page.tsx`:
   - Lista de salas actuales (nombre, cantidad de niños activos).
   - Botón "Agregar sala" → modal con campo nombre.
   - Cada sala: botón editar (renombrar) y eliminar.
   - Validación: no eliminar sala con niños activos.
2. Crear `app/components/RoomManager.tsx` (client):
   - Modal crear sala: INSERT en `rooms`.
   - Modal editar sala: UPDATE `name`.
   - Eliminar: DELETE con confirmación + validación.
3. Agregar enlace "Salas" al Sidebar.
4. Crear migración de seed si es necesario (ya se hizo en Step 1).

### Step 7 — Agrupación por sala en `/kids`

1. Modificar `app/components/ChildrenList.tsx`:
   - Agrupar niños por `room` (en vez de solo "SALA SOLES").
   - Mostrar un divisor por cada sala: "SALA {NOMBRE} · {N} niños".
   - Orden: salas alfabéticamente, niños por nombre dentro de cada sala.
2. Si una sala no tiene niños activos, no mostrar divisor.

### Step 8 — Verificación final

1. `npx tsc --noEmit` sin errores.
2. `npm run lint` sin errores.
3. `npm run build` exitoso.
4. Verificar en la UI:
   - `/kids` muestra salas Soles, Estrellas, Arcoiris sin niños.
   - "Agregar niño" crea y persiste.
   - "Editar" modifica y persiste.
   - "Archivar" oculta de la lista.
   - Salas se pueden crear/editar/eliminar.

## Acceptance criteria

- [x] `npm run dev` muestra `/kids` sin errores en consola.
- [x] La tabla `children` no tiene datos seed (0 rows activas al inicio).
- [x] Las rooms son: Soles, Estrellas, Arcoiris (sin "Lunas").
- [x] "Agregar niño" abre el modal, guarda en la DB, y el niño aparece en la lista.
- [x] Las alergias se guardan en `child_allergy_tags` (no como texto libre).
- [x] "Editar" en `/kids/[id]` abre modal pre-llenado, guarda cambios, y se reflejan en la UI.
- [x] "Archivar" cambia `status` a `archived` y el niño desaparece de `/kids`.
- [x] La lista `/kids` agrupa por sala con divisores "SALA {NOMBRE} · {N} niños".
- [x] El selector de sala en los modales tira datos de la tabla `rooms`.
- [x] Se pueden crear salas nuevas desde la UI.
- [x] Se pueden renombrar salas existentes desde la UI.
- [x] No se puede eliminar una sala con niños activos.
- [x] `npx tsc --noEmit` y `npm run lint` pasan sin errores.
- [x] `npm run build` completa exitosamente.

## Decisions

- **Sí:** Soft delete para niños (`status = 'archived'`). **No:** hard delete (se pierde el historial de posts/vínculos).
- **Sí:** Rooms como hard delete (no tiene sentido mantener salas borradas). **No:** soft delete en rooms.
- **Sí:** Alergias normalizadas en `child_allergy_tags`. **No:** campo `text[]` o texto libre.
- **Sí:** Mapeo UI español → DB inglés para alergias (`Maní` → `peanut`). **No:** guardar en español en la DB.
- **Sí:** Room manager en página separada `/rooms`. **No:** mezclar rooms con la UI de niños (demasiado clutter).
- **Sí:** Agrupación por sala en `/kids`. **No:** lista plana sin contexto de sala.
- **Sí:** `enrolled_at` = hoy por defecto al crear. **No:** pedir fecha de ingreso manualmente.

## Risks

| Risk | Mitigation |
|------|------------|
| Migración borra datos que el usuario quería conservar | La migración solo borra seed data (IDs hardcodeados `d0000000-*`); datos reales tienen UUIDs diferentes. |
| Eliminar sala con niños rompe referencias FK | Validación antes del DELETE: contar niños activos en la sala; mostrar error si > 0. |
| Modal de editar no recibe datos del niño | Usar el mismo fetch del perfil (`kids/[id]/page.tsx`) y pasar props al modal client. |
| RLS bloquea inserts/updates | Políticas de SPEC 07 ya dan CRUD a staff; verificar con usuario staff logueado. |
| Next 16 server/client component mixing | Mantener páginas como server, modales como client; usar props para pasar datos. |

## What is **not** in this spec

- CRUD de padres/vínculos (`parent_children`).
- Subida real de fotos a Supabase Storage.
- Resumen del día funcional.
- Feed del padre (`familia-feed.dc.html`).
- Reacciones y comentarios funcionales.
- Sección de "niños archivados" para ver/restaurar.
- Notificaciones push.

Cada una de ellas, si llega, va en su propio spec.
