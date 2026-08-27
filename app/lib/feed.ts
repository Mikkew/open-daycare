export type PostKind = "achievement" | "activity" | "announcement";

export interface Post {
  id: string;
  kind: PostKind;
  author: string; // "Mateo" | "Anuncio general"
  time: string; // "14:20"
  audience: string; // "Para: familia de Mateo" | "Para: toda la sala"
  body: string;
  photoLabel?: string; // "Foto · pintando con témperas" (activity only)
  likes: number;
  comments: number;
}

export const posts: Post[] = [
  {
    id: "post-1",
    kind: "achievement",
    author: "Mateo",
    time: "14:20",
    audience: "Para: familia de Mateo",
    body: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    likes: 3,
    comments: 1,
  },
  {
    id: "post-2",
    kind: "activity",
    author: "Mateo",
    time: "09:40",
    audience: "Para: familia de Mateo",
    body: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    photoLabel: "Foto · pintando con témperas",
    likes: 5,
    comments: 2,
  },
  {
    id: "post-3",
    kind: "announcement",
    author: "Anuncio general",
    time: "07:50",
    audience: "Para: toda la sala",
    body: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
    likes: 8,
    comments: 0,
  },
];
