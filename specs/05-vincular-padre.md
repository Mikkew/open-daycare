# SPEC 05 — Vincular padre/madre/tutor (modal)

> **Status:** Aprobado
> **Depends on:** SPEC 02, SPEC 04
> **Date:** 2026-08-31
> **Objective:** Implementar un modal en `/kids/[id]` que replica `vincular-padre.dc.html` para vincular un padre/madre/tutor, con validación de nombre y email, agregando un padre pendiente al mock del niño.

## Scope

**In:**

- Convertir "Vincular otro padre" de `/kids/[id]` en disparador de un modal/overlay client-side (hoy es `<a href="#">`).
- Modal centrado que replica `vincular-padre.dc.html`: tarjeta `max-width:480px`, cabecera "Vincular padre / a {nombre del niño}" con botón X de cierre.
- Banner informativo azul (`#E3ECFB`): "Le enviaremos un correo con un código para que active su cuenta. Solo verá el feed de {nombre}."
- Campos: **Nombre del padre/madre**, **Email**, selector **Parentesco** (Mamá / Papá / Tutor/a).
- Código de invitación aleatorio (5 caracteres) con "Vence en 7 días".
- Validación: nombre no vacío + solo letras + capitalización; email no vacío y con formato válido.
- "Enviar invitación" valida, agrega un `LinkedParent` con `status: "pending"` a la lista "PADRES VINCULADOS" y cierra el modal. La X cierra sin cambios.
- Todo es mock client-side: el padre pendiente aparece de inmediato y se resetea al recargar.

**Out of scope (for future specs):**

- Persistencia real o backend del vínculo.
- Enviar el correo de invitación (el código es solo visual).
- Editar o eliminar padres ya vinculados.
- Actualizar `parentsCount` en la lista `/kids`.

## Data model

Esta feature no introduce estructuras de datos persistentes. Reutiliza `LinkedParent` de SPEC 02 (`status: "pending"`) y agrega estado local transitorio en un componente client:

```ts
// app/components/ParentsSection.tsx (estado local, no persistente)
type Relation = "Mamá" | "Papá" | "Tutor/a";

const RELATIONS: Relation[] = ["Mamá", "Papá", "Tutor/a"];

const NEW_PARENT_AVATAR_COLOR = "#C9B6E8";
```

`LinkedParent.relation` sigue siendo `string` (sin cambios en `app/lib/children.ts`). Convención heredada de SPEC 01/02: código en inglés, texto visible en español.

## Implementation plan

> Cada step se realiza en un commit independiente.

1. Crear `app/components/ParentsSection.tsx` (`"use client"`): recibe `childName` e `initialParents` (`LinkedParent[]`), seedea el estado `parents`, y renderiza la tarjeta "PADRES VINCULADOS" (lista con `ParentRow` + disparador "Vincular otro padre") y el modal overlay.
   - Helpers inline (como en `AddChildModal`): `capitalizeWords`, `validateEmail` (regex), `generateCode` (5 chars alfanuméricos en mayúscula).
   - Estado del formulario: `name`, `email`, `relation` (default `"Mamá"`), `errors`, `open`, `code` (generado al abrir).
   - Validación en "Enviar invitación": nombre vacío → error; email vacío/inválido → error; si pasa, agrega `{ name, relation, status: "pending", avatarColor: NEW_PARENT_AVATAR_COLOR }` a `parents` y cierra.
2. Modificar `app/(app)/kids/[id]/page.tsx`: sustituir el bloque de padres + el `<a href="#">Vincular otro padre</a>` por `<ParentsSection childName={child.name} initialParents={child.parents ?? []} />`; quitar el import de `ParentRow` y el helper `PlusIcon` que ya no se usan en la página.

## Acceptance criteria

- [x] `npm run dev` muestra `/kids/[id]` sin errores en consola.
- [x] "Vincular otro padre" abre el modal replicando `vincular-padre.dc.html` (tarjeta, cabecera "Vincular padre / a {nombre}", X de cierre, banner azul, campos Nombre/Email, pills de parentesco, código de invitación, botón "Enviar invitación").
- [x] El parentesco lista Mamá / Papá / Tutor/a, con "Mamá" activo por defecto; al hacer clic cambia el estilo activo.
- [x] El código de invitación es aleatorio (5 caracteres) y se muestra junto a "Vence en 7 días".
- [x] El nombre filtra dígitos/símbolos y capitaliza cada palabra.
- [x] Con nombre vacío, "Enviar invitación" muestra error y no cierra.
- [x] Con email vacío o con formato inválido, "Enviar invitación" muestra error y no cierra.
- [x] Con nombre y email válidos, "Enviar invitación" agrega el padre a "PADRES VINCULADOS" con badge PENDIENTE y cierra el modal.
- [x] La X cierra el modal sin cambios.
- [x] Recargar la página restaura la lista original (sin persistencia).
- [x] `npx tsc --noEmit` y `npm run lint` pasan sin errores.

## Decisions

- **Sí:** modal/overlay client-side sobre `/kids/[id]` (igual que SPEC 04). **No:** ruta dedicada `/kids/[id]/vincular-padre`.
- **Sí:** estado local client para mostrar el padre pendiente de inmediato (mock, sin persistencia). **No:** mutar el array estático `children` ni backend.
- **Sí:** código de invitación aleatorio de 5 caracteres. **No:** código fijo `7K4P9` del diseño.
- **Sí:** validar nombre (no vacío + letras + capitalizar) y email (regex). **No:** validación solo de no-vacío.
- **Sí:** parentesco Mamá/Papá/Tutor/a con "Mamá" activo por defecto. **No:** solo Mamá/Papá.
- **Sí:** color de avatar fijo `#C9B6E8`. **No:** color según parentesco.
- **Sí:** componente client `ParentsSection` que agrupa tarjeta + modal. **No:** pasar estado al server component.

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| Mover la lista de padres a un componente client rompe el render del server | Seedear el estado desde la prop `initialParents`; verificar `npx tsc --noEmit`. |
| Modal centrado sobre el perfil con fondo oscurecido | Overlay `position:fixed` + backdrop; `overflow-hidden` en body mientras `open` (como en SPEC 04). |
| Código aleatorio difiere del mock visual `7K4P9` | Intencional por decisión; el diseño solo ilustra el formato. |
| Next 16 breaking changes | Mantener convenciones de SPEC 01–04; consultar `node_modules/next/dist/docs/` si algo rompe. |

## What is **not** in this spec

- Persistencia real / backend del vínculo.
- Envío real del correo de invitación.
- Editar o eliminar padres ya vinculados.
- Actualizar `parentsCount` en la lista `/kids`.

Cada una de ellas, si llega, va en su propio spec.
