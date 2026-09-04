"use server";

import { getServerActionClient } from "@/lib/supabase/server";

export async function createRoom(name: string) {
  const supabase = await getServerActionClient();

  const { data: daycare } = await supabase.rpc("get_current_user_daycare_id");

  if (!daycare) throw new Error("No daycare found");

  const { data, error } = await supabase
    .from("rooms")
    .insert({ name, daycare_id: daycare })
    .select()
    .single();

  if (error) throw error;
  return { roomId: data.id };
}

export async function renameRoom(roomId: string, name: string) {
  const supabase = await getServerActionClient();

  const { error } = await supabase
    .from("rooms")
    .update({ name })
    .eq("id", roomId);

  if (error) throw error;
}

export async function deleteRoom(roomId: string) {
  const supabase = await getServerActionClient();

  const { count, error: countError } = await supabase
    .from("children")
    .select("id", { count: "exact", head: true })
    .eq("room_id", roomId)
    .eq("status", "active");

  if (countError) throw countError;

  if (count && count > 0) {
    throw new Error("No se puede eliminar una sala con niños activos");
  }

  const { error } = await supabase
    .from("rooms")
    .delete()
    .eq("id", roomId);

  if (error) throw error;
}
