export type PostKind = "achievement" | "activity" | "announcement";

export interface Post {
  id: string;
  kind: PostKind;
  author: string;
  time: string;
  audience: string;
  body: string;
  photoLabel?: string;
  likes: number;
  comments: number;
}
