# SPEC 06 — Crear publicación (modal)

> **Status:** Implementado
> **Depends on:** SPEC 01
> **Date:** 2026-09-01
> **Objective:** Implementar un modal/overlay que replica `crear-publicacion.dc.html`, disparado desde el botón "Nueva publicación" del sidebar, con validación de destinatario, tipo y descripción obligatorios y cierre al publicar (visual, sin persistencia).

## Scope

**In:**

- Convertir el botón "Nueva publicación" del `Sidebar` (hoy `<a href="#">`) en disparador de un modal/overlay client-side.
- Modal centrado que replica `crear-publicacion.dc.html`: tarjeta `max-width:580px`, cabecera "Cancelar / Nueva publicación / Publicar", fondo oscurecido.
- Sección **PARA**: pills de destinatario (Mateo, Sofía, Benjamín, "Toda la sala") con selección única.
- Sección **TIPO**: pills de tipo (Comida, Siesta, Actividad, Logro, Ánimo, Foto, Anuncio) con selección única, sin valor por defecto.
- Sección **DESCRIPCIÓN**: textarea con placeholder "Contá cómo le fue hoy…".
- Validación al pulsar "Publicar": destinatario, tipo y descripción obligatorios; si falta alguno muestra error y no cierra.
- "Publicar" valida y cierra el modal (mock, sin persistencia). "Cancelar" cierra sin guardar.

**Out of scope (for future specs):**

- Persistencia/creación real de publicaciones (no se agrega nada al feed).
- Sección **FOTOS** del mock (cuadrados de foto/agregar).
- Selección múltiple de destinatarios.
- Edición de publicaciones existentes.

## Data model

Esta feature no introduce estructuras de datos persistentes. Solo constantes locales y estado transitorio del formulario en un componente client:

```ts
// app/components/CreatePostModal.tsx (estado local, no persistente)
type Recipient = {
  id: string;
  label: string;
  avatarColor?: string;
  avatarText?: string;
  initial?: string;
};

const RECIPIENTS: Recipient[] = [
  { id: "mateo", label: "Mateo", avatarColor: "#A9D9E8", avatarText: "#1F7A93", initial: "M" },
  { id: "sofia", label: "Sofía", avatarColor: "#F4B8CC", avatarText: "#C44A7A", initial: "S" },
  { id: "benjamin", label: "Benjamín", avatarColor: "#B9DEC4", avatarText: "#3E8B62", initial: "B" },
  { id: "toda-la-sala", label: "Toda la sala" },
];

type PostType = { id: string; label: string; bg: string; text: string };

const POST_TYPES: PostType[] = [
  { id: "comida", label: "Comida", bg: "#9A7B1E", text: "#fff" },
  { id: "siesta", label: "Siesta", bg: "#E7DCF6", text: "#7B5FC0" },
  { id: "actividad", label: "Actividad", bg: "#2E89A6", text: "#fff" },
  { id: "logro", label: "Logro", bg: "#CFEBD8", text: "#3E9B6C" },
  { id: "animo", label: "Ánimo", bg: "#F9D2DE", text: "#C56486" },
  { id: "foto", label: "Foto", bg: "#FBD8CC", text: "#D9684A" },
  { id: "anuncio", label: "Anuncio", bg: "#CCD8F4", text: "#4E72C8" },
];
```

Convención heredada de SPEC 01/02: código en inglés, texto visible en español. `label` lleva tildes; los `id` no.

## Implementation plan

> Cada step se realiza en un commit independiente.

1. Crear `app/components/CreatePostModal.tsx` (`"use client"`): renderiza el botón disparador (mismo estilo del botón "Nueva publicación" del sidebar: gradiente `#F4977E → #EE8164`, icono `+`) y el overlay con estado `open`.
   - Estado del formulario: `recipientId`, `typeId`, `description`, `errors`, `open`.
   - Prevent scroll del fondo mientras `open` (mismo patrón que `AddChildModal`).
   - Validación en "Publicar": `recipientId` vacío → error "Elegí un destinatario"; `typeId` vacío → error "Elegí un tipo"; `description` vacío/trim → error "La descripción es obligatoria". Si pasa, cierra y resetea el formulario.
   - Overlay con `position:fixed` + backdrop; cierra con "Cancelar" y con clic en el backdrop.
2. Modificar `app/components/Sidebar.tsx`: sustituir el `<a href="#">Nueva publicación</a>` por `<CreatePostModal />`; quitar el helper `PlusIcon` si queda sin uso.

## Acceptance criteria

- [x] `npm run dev` muestra el home en `/` sin errores en consola.
- [x] Clic en "Nueva publicación" del sidebar abre el modal replicando `crear-publicacion.dc.html` (tarjeta `max-width:580px`, cabecera Cancelar/Nueva publicación/Publicar, secciones PARA / TIPO / DESCRIPCIÓN).
- [x] La sección PARA lista Mateo, Sofía, Benjamín y "Toda la sala"; solo uno puede quedar activo y el estilo activo coincide con el mock (fondo oscuro).
- [x] La sección TIPO lista Comida, Siesta, Actividad, Logro, Ánimo, Foto, Anuncio con sus colores del mock; arranca sin selección y solo uno puede quedar activo.
- [x] Con destinatario, tipo o descripción vacíos, "Publicar" muestra error y no cierra.
- [x] Con destinatario, tipo y descripción completos, "Publicar" cierra el modal (sin agregar nada al feed).
- [x] "Cancelar" cierra el modal sin cambios.
- [x] `npx tsc --noEmit` y `npm run lint` pasan sin errores.

## Decisions

- **Sí:** modal/overlay client-side sobre `/`. **No:** ruta dedicada `/nueva-publicacion`.
- **Sí:** destinatarios Mateo, Sofía, Benjamín + "Toda la sala" (replicar el mock). **No:** derivar de `children.ts` (8 niños).
- **Sí:** selección única de destinatario y de tipo. **No:** selección múltiple.
- **Sí:** tipo arranca vacío para que la validación sea significativa. **No:** "Comida" preseleccionado como en el mock.
- **Sí:** omitir la sección FOTOS. **No:** renderizarla como visual no funcional.
- **Sí:** estado/validación en un componente client `CreatePostModal`. **No:** validación en servidor.
- **Sí:** "Publicar" valida y cierra (mock, sin persistencia). **No:** agregar el post al array `posts` ni al feed.

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| Modal centrado sobre `/` con fondo oscurecido | Overlay `position:fixed` + backdrop; cerrar con "Cancelar" o clic en backdrop; `overflow-hidden` en body mientras `open`. |
| Reemplazar el botón del sidebar rompe el render | Sustituir solo el `<a>` por `<CreatePostModal />`; verificar `npx tsc --noEmit` y `npm run lint`. |
| Pills activos difieren del mock visual | Mantener los colores exactos del mock en `POST_TYPES`/`RECIPIENTS`; revisar en Playwright. |
| Next 16 breaking changes | Mantener convenciones de SPEC 01–05; consultar `node_modules/next/dist/docs/` si algo rompe. |

## What is **not** in this spec

- Persistencia/creación real de publicaciones.
- Sección FOTOS del mock.
- Selección múltiple de destinatarios.
- Edición de publicaciones.

Cada una de ellas, si llega, va en su propio spec.
