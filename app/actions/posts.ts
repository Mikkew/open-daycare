"use server";

import { getServerActionClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const typeMap: Record<string, "meal" | "nap" | "activity" | "achievement" | "photo" | "announcement"> = {
  comida: "meal",
  siesta: "nap",
  actividad: "activity",
  logro: "achievement",
  animo: "achievement",
  foto: "photo",
  anuncio: "announcement",
};

export async function createPost(data: {
  recipientId: string;
  typeId: string;
  description: string;
}) {
  const supabase = await getServerActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado");

  const { data: staffUser, error: staffError } = await supabase
    .from("users")
    .select("id, room_id")
    .eq("id", user.id)
    .single();

  if (staffError || !staffUser) throw new Error("Usuario no encontrado");

  const postType = typeMap[data.typeId] || "activity";

  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      author_id: staffUser.id,
      room_id: staffUser.room_id,
      type: postType,
      body: data.description.trim(),
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (postError) throw postError;

  if (data.recipientId !== "toda-la-sala") {
    const { error: childrenError } = await supabase
      .from("post_children")
      .insert({
        post_id: post.id,
        child_id: data.recipientId,
      });

    if (childrenError) throw childrenError;
  }

  revalidatePath("/staff");
  return { postId: post.id };
}
