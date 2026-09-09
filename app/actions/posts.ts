"use server";

import { getServerActionClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/database.types";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/bmp",
];

const MIN_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function createPost(data: {
  type: string;
  title: string;
  body: string;
  image?: File | null;
}) {
  const supabase = await getServerActionClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("No autorizado");
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role, room_id")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    throw new Error("No se pudo obtener el perfil del usuario");
  }

  if (userData.role !== "staff" && userData.role !== "admin") {
    throw new Error("Solo el staff puede crear publicaciones");
  }

  if (!userData.room_id) {
    throw new Error("No tenés una sala asignada. Contactá al administrador.");
  }

  if (!data.title.trim()) {
    throw new Error("El título es obligatorio");
  }

  if (!data.body.trim()) {
    throw new Error("La descripción es obligatoria");
  }

  if (data.image) {
    if (!ALLOWED_IMAGE_TYPES.includes(data.image.type)) {
      throw new Error(
        "Formato de imagen no válido. Formatos aceptados: jpg, png, webp, heic, gif, bmp"
      );
    }

    if (
      data.image.size < MIN_IMAGE_SIZE ||
      data.image.size > MAX_IMAGE_SIZE
    ) {
      throw new Error("La imagen debe tener entre 5MB y 10MB");
    }
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      room_id: userData.room_id,
      type: data.type as Database["public"]["Enums"]["post_type"],
      title: data.title.trim(),
      body: data.body.trim(),
    })
    .select()
    .single();

  if (postError) {
    throw new Error(`Error al crear la publicación: ${postError.message}`);
  }

  const { data: activeChildren, error: childrenError } = await supabase
    .from("children")
    .select("id")
    .eq("room_id", userData.room_id)
    .eq("status", "active");

  if (childrenError) {
    throw new Error(
      `Error al consultar los niños: ${childrenError.message}`
    );
  }

  if (activeChildren && activeChildren.length > 0) {
    const { error: postChildrenError } = await supabase
      .from("post_children")
      .insert(
        activeChildren.map((child) => ({
          post_id: post.id,
          child_id: child.id,
        }))
      );

    if (postChildrenError) {
      throw new Error(
        `Error al asociar los niños: ${postChildrenError.message}`
      );
    }
  }

  if (data.image) {
    const ext = data.image.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const path = `${user.id}/${post.id}/${timestamp}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("post-photos")
      .upload(path, data.image);

    if (uploadError) {
      throw new Error(`Error al subir la imagen: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("post-photos").getPublicUrl(path);

    const { error: photoError } = await supabase
      .from("post_photos")
      .insert({
        post_id: post.id,
        url: publicUrl,
        position: 0,
      });

    if (photoError) {
      throw new Error(
        `Error al registrar la foto: ${photoError.message}`
      );
    }
  }

  revalidatePath("/");

  return { postId: post.id };
}
