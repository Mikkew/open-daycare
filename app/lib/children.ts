// app/lib/children.ts — UI constants and types only (no mock data)

export type ParentStatus = "active" | "pending";

export interface LinkedParent {
  name: string;
  relation: string;
  status: ParentStatus;
  avatarColor: string;
}

export type AllergyTag = "peanut" | "lactose" | "gluten";

const allergyUiLabels: Record<string, string> = {
  peanut: "MANÍ",
  lactose: "LACTOSA",
  gluten: "GLUTEN",
};

const allergyUiColors: Record<string, { bg: string; text: string }> = {
  peanut: { bg: "#FBD8CC", text: "#D9684A" },
  lactose: { bg: "#FBD8CC", text: "#D9684A" },
  gluten: { bg: "#FBD8CC", text: "#D9684A" },
};

export function getAllergyLabel(tag: AllergyTag): string {
  return allergyUiLabels[tag] || tag.toUpperCase();
}

export function getAllergyBadgeColors(tag: AllergyTag): { bg: string; text: string } {
  return allergyUiColors[tag] || { bg: "#FBD8CC", text: "#D9684A" };
}

export interface Child {
  id: string;
  name: string;
  age: number;
  room: string;
  avatarColor: string;
  avatarText: string;
  parentsCount: number;
  allergies?: AllergyTag[];
  allergy?: AllergyTag;
  linkPrompt?: boolean;
  birthDate?: string;
  joinedDate?: string;
  notes?: string;
  parents?: LinkedParent[];
}

export const parentStatusLabels: Record<ParentStatus, string> = {
  active: "ACTIVA",
  pending: "PENDIENTE",
};

export const parentStatusBadgeColors: Record<ParentStatus, { bg: string; text: string }> = {
  active: { bg: "#CFEBD8", text: "#3E9B6C" },
  pending: { bg: "#F7E7A6", text: "#9A7B1E" },
};

// Rooms come from DB — use getRooms() from "@/lib/rooms"
