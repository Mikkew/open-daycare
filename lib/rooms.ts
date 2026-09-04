import { getServerClient } from "@/lib/supabase/server";

export interface Room {
  id: string;
  name: string;
}

export async function getRooms(): Promise<Room[]> {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data ?? [];
}
