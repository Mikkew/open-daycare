# SPEC 08 — Publicación real con imagen opcional

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 06
> **Date:** 2026-09-08
> **Objective:** Persistir publicaciones en la DB (posts + post_children + post_photos) con subida opcional de una imagen a Supabase Storage, asociando la publicación a todos los niños activos de la sala del staff.

## Scope

**In:**

- Agregar columna `room_id` a `users` para vincular staff a su sala.
- Campo **TÍTULO** en el modal (nuevo input de texto, obligatorio).
- Sección **FOTOS** en el modal: selector de 1 imagen con preview. Formatos: jpg, png, webp, heic, gif, bmp. Mínimo 5MB, máximo 10MB.
- Server action `createPost` que:
  - Sube la imagen a Supabase Storage (bucket `post-photos`) si existe.
  - Inserta la fila en `posts` con `author_id`, `room_id` del staff, `type`, `title`, `body`.
  - Inserta filas en `post_children` para cada niño activo de la sala del staff.
  - Inserta fila en `post_photos` con la URL de la imagen subida.
- `CreatePostModal` pasa de mock a funcional: llama al server action, muestra loading state, maneja errores.
- Revalidar el feed tras publicar (el usuario permanece en la misma página).

**Out of scope (for future specs):**

- Selección individual de niños como destinatarios (siempre "Toda la sala").
- Múltiples fotos por publicación.
- Edición/eliminación de publicaciones existentes.
- Compresión de imágenes en el cliente.
- Visualización de fotos en el feed (el feed es estático hoy).
- Notificaciones push a padres.

## Data model

```ts
// Migración: agregar room_id a users
ALTER TABLE users ADD COLUMN room_id uuid REFERENCES rooms(id) ON DELETE SET NULL;

// Migración: crear bucket de Storage "post-photos" si no existe
// (se hace vía SQL con insert en storage.buckets o via MCP tool)
```

El resto de las tablas (`posts`, `post_children`, `post_photos`) ya existen en la DB y los TypeScript types ya están generados en `lib/database.types.ts`.

## Implementation plan

1. **Migración de base de datos.** Crear `supabase/migrations/NN_add_room_id_to_users.sql`: agregar `room_id uuid REFERENCES rooms(id)` a `users`. Crear migración para bucket `post-photos` en Supabase Storage si no existe. Manual test: `users` tiene columna `room_id`, bucket `post-photos` visible en Supabase dashboard.

2. **Server action `createPost`.** Crear `app/actions/posts.ts` (`"use server"`) con función `createPost` que recibe:
   ```ts
   {
     type: string;       // post_type enum value
     title: string;
     body: string;
     image?: File | null;
   }
   ```
   La acción obtiene el usuario autenticado vía `getServerActionClient()`, lee su `room_id`, inserta en `posts`, consulta niños activos de esa sala e inserta en `post_children`, y si hay imagen la sube a `post-photos/{userId}/{postId}/{timestamp}.{ext}` e inserta en `post_photos`. Manual test: llamar la acción desde la consola o un formulario de prueba crea las filas correctas.

3. **Agregar campo TÍTULO al modal.** Añadir input de texto con placeholder "Título de la publicación…" antes de la sección PARA. Validación obligatoria en `handlePublish`. Agregar `title` al estado del formulario.

4. **Agregar sección FOTOS al modal.** Input file oculto activado por un botón "Agregar foto". Al seleccionar: validar formato y tamaño (5–10MB), mostrar preview con thumbnail. Botón "Quitar foto" para cancelar la selección. Actualizar estado del formulario con `selectedImage: File | null`.

5. **Conectar modal al server action.** Reemplazar el `handlePublish` mock: validar todos los campos (title, recipient, type, description), llamar `createPost` con `FormData` o pasando el `File` directamente, mostrar estado de loading (botón "Publicar" deshabilitado + spinner), y manejar errores mostrando toast o mensaje inline. En éxito, cerrar y resetear el formulario.

6. **Actualizar TypeScript types.** Regenerar `lib/database.types.ts` si la migración de `room_id` en `users` lo requiere. Actualizar `POST_TYPES` para que los `id` coincidan con el enum `post_type` de la DB (`meal`, `nap`, `activity`, `achievement`, `announcement`). El tipo `animo` del mock se mapea a `activity` o se omite hasta que el enum lo soporte.

7. **RLS policies.** Agregar políticas de RLS para `posts`, `post_children`, `post_photos`: staff puede insertar, padres pueden leer publicaciones de la sala de sus hijos. Manual test: intentar insertar como usuario sin rol `staff` falla con permiso denegado.

## Acceptance criteria

- [x] `users` tiene columna `room_id` nullable con FK a `rooms`.
- [x] Bucket `post-photos` existe en Supabase Storage.
- [x] El modal incluye campo TÍTULO (obligatorio) antes de PARA.
- [x] El modal incluye sección FOTOS con botón "Agregar foto", preview de la imagen seleccionada y botón "Quitar foto".
- [x] Validación de formato (jpg/png/webp/heic/gif/bmp) y tamaño (mínimo 5MB, máximo 10MB) con mensaje de error visible.
- [x] Al pulsar "Publicar" con todos los campos válidos, se crea una fila en `posts`, filas en `post_children` (todos los niños activos de la sala del staff) y opcionalmente fila en `post_photos`.
- [x] La imagen se sube a `post-photos/{userId}/{postId}/...` en Supabase Storage.
- [x] El botón "Publicar" muestra estado de loading y se deshabilita durante la subida.
- [x] Errores del server action se muestran inline sin cerrar el modal.
- [x] En éxito, el modal se cierra y el feed se revalida.
- [x] RLS: solo staff puede crear publicaciones; padres solo pueden leer las de su sala.
- [x] `npx tsc --noEmit` y `npm run lint` pasan sin errores.

## Decisions

- **Sí:** 1 foto máxima por publicación. Simplifica UI y storage.
- **No:** compresión de imágenes. Se suben en crudo como pidió el usuario.
- **Sí:** tamaño mínimo 5MB y máximo 10MB. Validación en cliente y servidor.
- **Sí:** todos los formatos de imagen aceptados (jpg, png, webp, heic, gif, bmp). No restringir.
- **Sí:** `room_id` en `users` para saber la sala del staff. Necesario para etiquetar niños automáticamente.
- **Sí:** título obligatorio en el formulario. El campo `title` de `posts` ya existe como nullable.
- **Sí:** "Toda la sala" es el único destinatario. Se etiquetan todos los niños activos de la sala del staff.
- **No:** selección múltiple de niños en este spec. Va en un spec futuro si se necesita.
- **Sí:** el usuario permanece en la misma página tras publicar. No hay redirección.

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| `room_id` es null para usuarios de staff existentes | La migración agrega la columna como nullable; el staff debe tener `room_id` asignado antes de crear publicaciones. Agregar validación en el server action. |
| Imágenes >10MB pasan validación del cliente si el usuario manipula JS | Re-validar tamaño en el server action antes de subir. |
| Supabase Storage bucket no existe | Crear el bucket vía SQL en la migración o manualmente antes de probar. |
| RLS policies bloquean inserciones legítimas | Testear con usuario staff y parent separadamente; ajustar políticas. |
| El enum `post_type` no incluye `animo` pero el mock lo tiene | Mapear `animo` a un tipo existente o agregar al enum en migración futura. |

## What is **not** in this spec

- Selección individual de niños como destinatarios.
- Múltiples fotos por publicación.
- Edición/eliminación de publicaciones.
- Compresión de imágenes en el cliente.
- Visualización de fotos en el feed.
- Notificaciones push.

Cada una de ellas, si llega, va en su propio spec.
