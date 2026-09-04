"use server";

import { getServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const allergyMap: Record<string, string> = {
  maní: "peanut",
  lactosa: "lactose",
  gluten: "gluten",
};

function parseBirthDate(ddmmyyyy: string): string {
  const [dd, mm, yyyy] = ddmmyyyy.split("/");
  return `${yyyy}-${mm}-${dd}`;
}

export async function addChild(data: {
  fullName: string;
  birthDate: string;
  roomId: string;
  allergies: string;
  medicalNotes: string;
}) {
  const supabase = await getServerClient();

  const { data: child, error: childError } = await supabase
    .from("children")
    .insert({
      full_name: data.fullName,
      birth_date: parseBirthDate(data.birthDate),
      enrolled_at: new Date().toISOString().split("T")[0],
      room_id: data.roomId,
      medical_notes: data.medicalNotes || null,
    })
    .select()
    .single();

  if (childError) throw childError;

  const allergyTags = data.allergies
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .map((t) => allergyMap[t] || t)
    .filter(Boolean);

  if (allergyTags.length > 0) {
    const { error: allergyError } = await supabase.from("child_allergy_tags").insert(
      allergyTags.map((tag) => ({
        child_id: child.id,
        tag,
      }))
    );

    if (allergyError) throw allergyError;
  }

  revalidatePath("/kids");
  return { childId: child.id };
}

export async function updateChild(data: {
  childId: string;
  fullName: string;
  birthDate: string;
  roomId: string;
  allergies: string;
  medicalNotes: string;
}) {
  const supabase = await getServerClient();

  const { error: childError } = await supabase
    .from("children")
    .update({
      full_name: data.fullName,
      birth_date: parseBirthDate(data.birthDate),
      room_id: data.roomId,
      medical_notes: data.medicalNotes || null,
    })
    .eq("id", data.childId);

  if (childError) throw childError;

  await supabase.from("child_allergy_tags").delete().eq("child_id", data.childId);

  const allergyTags = data.allergies
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .map((t) => allergyMap[t] || t)
    .filter(Boolean);

  if (allergyTags.length > 0) {
    const { error: allergyError } = await supabase.from("child_allergy_tags").insert(
      allergyTags.map((tag) => ({
        child_id: data.childId,
        tag,
      }))
    );

    if (allergyError) throw allergyError;
  }

  revalidatePath("/kids");
  revalidatePath(`/kids/${data.childId}`);
  return { childId: data.childId };
}

export async function archiveChild(childId: string) {
  const supabase = await getServerClient();

  const { error } = await supabase
    .from("children")
    .update({ status: "archived" })
    .eq("id", childId);

  if (error) throw error;

  revalidatePath("/kids");
  return { childId };
}
