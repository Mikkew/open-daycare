# SPEC 04 — Agregar niño (modal de alta)

> **Status:** Aprobado
> **Depends on:** SPEC 02, SPEC 03
> **Date:** 2026-08-29
> **Objective:** Implementar el botón "Agregar niño" de `/kids` como un modal/overlay que replica `agregar-nino.dc.html`, con campos obligatorios y máscaras de formato.

## Scope

**In:**

- Convertir el botón "Agregar niño" (gradiente) de `/kids` en disparador de un modal/overlay client-side.
- Modal centrado que replica `agregar-nino.dc.html`: tarjeta `max-width:520px`, cabecera "Cancelar / Agregar niño / Guardar", fondo oscurecido sobre `/kids`.
- Campos: **Nombre completo**, **Fecha de nacimiento** (`dd/mm/aaaa`), **Sala** (dropdown), Alergias (etiquetas), Notas médicas (textarea).
- Obligatorios: nombre completo, fecha de nacimiento y sala. Opcionales: alergias y notas médicas.
- Máscaras: fecha `dd/mm/aaaa` (auto-inserta `/`), nombre (solo letras/espacios, mayúscula inicial por palabra), alergias (etiquetas separadas por coma, normalizadas).
- "Guardar" valida obligatorios y cierra el modal (mock, sin persistencia). "Cancelar" cierra sin guardar.

**Out of scope (for future specs):**

- Persistencia/creación real de niños (sin base de datos, consistente con SPEC 02).
- Editar/borrar niños.
- Vincular padres.
- Subida de foto.

## Data model

Esta feature no introduce estructuras persistentes. Solo una constante de salas y estado local transitorio del formulario:

```ts
// app/lib/children.ts
export const rooms: string[] = ["Soles", "Lunas", "Estrellas"];
```

```ts
// app/components/AddChildModal.tsx (estado local, no persistente)
type ChildForm = {
  name: string;
  birthDate: string; // "dd/mm/aaaa"
  room: string;
  allergies: string;
  notes: string;
};
```

Convención heredada de SPEC 01/02: código en inglés, texto visible en español.

## Implementation plan

1. Añadir `export const rooms = ["Soles", "Lunas", "Estrellas"]` a `app/lib/children.ts`.
2. Crear `app/components/AddChildModal.tsx` (`"use client"`): renderiza el botón "Agregar niño" + overlay con estado `open`, campos y errores.
   - Máscara fecha: solo dígitos, auto-inserta `/` tras 2 y 4 dígitos, máx. 10 caracteres; valida fecha completa y real.
   - Máscara nombre: elimina dígitos/símbolos, capitaliza primera letra de cada palabra.
   - Máscara alergias: al blur, separa por coma, trim y capitaliza cada etiqueta.
   - Validación obligatorios en "Guardar": si falta nombre/fecha/sala, muestra error y no cierra.
3. Modificar `app/(app)/kids/page.tsx`: quitar el `<a>` "Agregar niño" y renderizar `<AddChildModal />` en su lugar.

## Acceptance criteria

- [ ] `npm run dev` muestra `/kids` sin errores en consola.
- [ ] Clic en "Agregar niño" abre el modal replicando `agregar-nino.dc.html` (tarjeta, cabecera Cancelar/Agregar niño/Guardar, 5 campos).
- [ ] El dropdown "Sala" lista **Soles, Lunas, Estrellas**.
- [ ] "Fecha de nacimiento" acepta solo dígitos y auto-inserta `/` (formato `dd/mm/aaaa`, máx. 10 caracteres).
- [ ] "Nombre completo" filtra dígitos/símbolos y capitaliza cada palabra.
- [ ] "Alergias" normaliza etiquetas separadas por coma.
- [ ] Con nombre/fecha/sala vacíos, "Guardar" muestra error y no cierra.
- [ ] Con nombre/fecha/sala completos, "Guardar" cierra el modal y vuelve a `/kids` (sin persistir).
- [ ] "Cancelar" cierra el modal sin cambios.
- [ ] `npx tsc --noEmit` y `npm run lint` pasan sin errores.

## Decisions

- **Sí:** modal/overlay client-side sobre `/kids`. **No:** ruta dedicada `/kids/new`.
- **Sí:** salas `["Soles", "Lunas", "Estrellas"]`. **No:** solo "Soles".
- **Sí:** máscaras en fecha, nombre y alergias. **No:** texto libre sin formato.
- **Sí:** "Guardar" valida y cierra (mock, sin persistencia). **No:** crear el niño en el array ni en base de datos.
- **Sí:** estado/validación en un componente client. **No:** validación en servidor.

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| Modal centrado sobre `/kids` con fondo oscurecido | Overlay con `position:fixed` + `backdrop`; cerrar con "Cancelar". |
| Máscara de fecha compleja | Aislar lógica en helpers dentro de `AddChildModal.tsx`; validar fecha real con `Date`. |
| Foco/scroll del fondo mientras el modal está abierto | `overflow-hidden` en body mientras `open`; revisar en Playwright. |
| Next 16 breaking changes | Mantener convenciones de SPEC 01–03; consultar `node_modules/next/dist/docs/` si algo rompe. |

## What is **not** in this spec

- Persistencia/creación real de niños.
- Editar/borrar/vincular padres.
- Subida de foto.

Cada una de ellas, si llega, va en su propio spec.
