# SPEC 01 — Home: feed de Open DayCare

> **Status:** Implementado
> **Depends on:** —
> **Date:** 2026-08-25
> **Objective:** Implementar la pantalla `feed.dc.html` como home (`/`) con un estilo visual idéntico al proporcionado.

## Scope

**In:**

- Reemplazar el boilerplate de `app/page.tsx` por el feed de Open DayCare.
- Replicar fielmente el shell de dos paneles: sidebar izquierda fija (248px) + `main` con scroll independiente.
- Sidebar: logo "OpenDayCare · Sala Soles", botón "Nueva publicación" (gradiente), nav (Feed activo, Niños, Avisos, Mi cuenta), bloque de perfil "Caro Giménez · Maestra · Soles" con icono de cerrar sesión.
- Cabecera del feed: "GUARDERÍA · SALA SOLES", "Buenas, Caro", "12 niños · martes 17 jun".
- Composer "Compartí un momento…".
- Divisor "PUBLICADO HOY".
- 3 posts estáticos: logro (Mateo, 14:20), actividad (Mateo, 09:40, con placeholder de foto), anuncio general (07:50), con sus badges (LOGRO/ACTIVIDAD/ANUNCIO), contadores (3/1, 5/2, 8/0) y enlace "Editar".
- Fuentes Fredoka + Nunito vía `next/font/google`.
- Fondo beige `#F6ECDF`, paleta de colores y estilos idénticos a la plantilla.

**Out of scope (for future specs):**

- Autenticación y login.
- Base de datos o persistencia de posts.
- CRUD de publicaciones (crear/editar/borrar).
- Resto de pantallas (niños, avisos, mi cuenta, crear publicación, detalle, perfil niño, etc.).
- Likes/comentarios interactivos.
- Subida y visualización real de fotos.
- Routing hacia las pantallas no implementadas.

## Data model

```ts
// app/lib/feed.ts
export type PostKind = "achievement" | "activity" | "announcement";

export interface Post {
  id: string;
  kind: PostKind;
  author: string;      // "Mateo" | "Anuncio general"
  time: string;        // "14:20"
  audience: string;    // "Para: familia de Mateo" | "Para: toda la sala"
  body: string;
  photoLabel?: string; // "Foto · pintando con témperas" (solo actividad)
  likes: number;
  comments: number;
}

export const posts: Post[] = [ /* the 3 template posts */ ];
```

Convención: todo el código (tipos, identificadores, comentarios) va en inglés. El texto visible en la UI (badges "LOGRO"/"ACTIVIDAD"/"ANUNCIO", audiencias, textos de los posts) se mantiene en español. El mapeo `kind → label` traduce los valores internos a las etiquetas visibles.

Badge (texto + colores) y avatar (inicial/color/icono) se derivan de `kind` mediante mapas internos. Los contadores se muestran como valores estáticos.

## Implementation plan

1. Configurar fuentes y estilos base: añadir Fredoka/Nunito con `next/font/google` en `app/layout.tsx`, actualizar `app/globals.css` (fondo `#F6ECDF`, fuente base Nunito, quitar override dark), metadata "Open DayCare".
2. Crear `app/lib/feed.ts` con el tipo `Post` y el array `posts` (los 3 posts).
3. Crear `app/components/Sidebar.tsx` (logo, botón "Nueva publicación", nav, perfil) con enlaces placeholder `href="#"`.
4. Crear `app/components/PostCard.tsx` que renderiza un `Post` (cabecera con badge, body, foto opcional, footer con likes/comentarios/Editar).
5. Reescribir `app/page.tsx` para renderizar cabecera + composer + divisor + posts mapeados desde `posts`.
6. Montar el shell en `app/layout.tsx`: `<Sidebar />` + `<main>` con scroll, envolviendo `{children}`.

## Acceptance criteria

- [x] `npm run dev` muestra el home en `/` sin errores en consola.
- [x] Fondo beige `#F6ECDF` y fuente Nunito aplicados globalmente.
- [x] Sidebar visible y fija: logo "OpenDayCare · Sala Soles", botón "Nueva publicación" con gradiente, nav con "Feed" resaltado, perfil "Caro Giménez · Maestra · Soles".
- [x] Cabecera "GUARDERÍA · SALA SOLES" / "Buenas, Caro" / "12 niños · martes 17 jun".
- [x] Composer "Compartí un momento…" y divisor "PUBLICADO HOY" presentes.
- [x] Los 3 posts se renderizan en orden con sus badges, contadores (3/1, 5/2, 8/0) y placeholder de foto en el de actividad.
- [x] Fredoka se usa en logo/títulos/nombres; Nunito en el cuerpo.
- [x] El `main` scrollea de forma independiente a la sidebar.
- [x] Los enlaces a pantallas inexistentes son placeholders no navegables (`href="#"`).
- [x] `npx tsc --noEmit` y `npm run lint` pasan sin errores.

## Decisions

- **Sí:** Tailwind CSS v4 para los estilos. Idiomático del proyecto y mantenible. **No:** estilos inline 1:1.
- **Sí:** `next/font/google` para Fredoka/Nunito (auto-hospedadas). **No:** enlace externo a Google Fonts.
- **Sí:** array tipado estático (`app/lib/feed.ts`). **No:** JSX hardcodeado ni base de datos.
- **Sí:** enlaces placeholder no navegables. **No:** routing hacia pantallas no implementadas.
- **Sí:** `Sidebar` como componente reutilizable montado en `app/layout.tsx` (futuras páginas lo heredan). **No:** inline en `page.tsx`.
- **Sí:** actualizar layout/globals global (fondo, fuente base, metadata). **No:** estilos acotados a la página.
- **Sí:** código (tipos, identificadores, comentarios) en inglés. **No:** identificadores en español. El texto visible se mantiene en español.

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| `next/font/google` requiere los pesos correctos (Fredoka 400–700, Nunito 400–800 + italic) | Declarar los `weight` explícitos; si un peso falta, la fuente cae a uno cercano y se revisa visualmente. |
| Next 16 con breaking changes (layout tipado `LayoutProps<"/">`) | Mantener la convención existente de `app/layout.tsx` y leer los docs de `node_modules/next/dist/docs/` si algo rompe. |
| Override dark-mode del starter alteraría el look idéntico | Eliminar el bloque `prefers-color-scheme: dark` de `globals.css`. |
| Iconos SVG inline sin librería instalada | Copiar los SVG inline del HTML dentro de los componentes (sin dependencias nuevas). |

## What is **not** in this spec

- Autenticación/login.
- Base de datos y persistencia.
- CRUD de posts ni interactividad de likes/comentarios.
- Resto de pantallas de la app.

Cada una de ellas, si llega, va en su propio spec.
