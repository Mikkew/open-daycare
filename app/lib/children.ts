// app/lib/children.ts

export type ParentStatus = "active" | "pending";

export interface LinkedParent {
  name: string;
  relation: string;
  status: ParentStatus;
  avatarColor: string;
}

export type AllergyTag = "mani" | "lactosa";

export interface Child {
  id: string;
  name: string;
  age: number;
  room: string;
  avatarColor: string;
  avatarText: string;
  parentsCount: number;
  allergy?: AllergyTag;
  linkPrompt?: boolean;
  birthDate?: string;
  joinedDate?: string;
  notes?: string;
  parents?: LinkedParent[];
}

export const allergyLabels: Record<AllergyTag, string> = {
  mani: "MANÍ",
  lactosa: "LACTOSA",
};

export const allergyBadgeColors: Record<AllergyTag, { bg: string; text: string }> = {
  mani: { bg: "#FBD8CC", text: "#D9684A" },
  lactosa: { bg: "#FBD8CC", text: "#D9684A" },
};

export const parentStatusLabels: Record<ParentStatus, string> = {
  active: "ACTIVA",
  pending: "PENDIENTE",
};

export const parentStatusBadgeColors: Record<ParentStatus, { bg: string; text: string }> = {
  active: { bg: "#CFEBD8", text: "#3E9B6C" },
  pending: { bg: "#F7E7A6", text: "#9A7B1E" },
};

export const children: Child[] = [
  {
    id: "mateo-fernandez",
    name: "Mateo Fernández",
    age: 3,
    room: "Soles",
    avatarColor: "#A9D9E8",
    avatarText: "#1F7A93",
    parentsCount: 2,
    allergy: "mani",
    birthDate: "12 mar 2022",
    joinedDate: "feb 2025",
    notes: "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.",
    parents: [
      {
        name: "Lucía Fernández",
        relation: "Mamá",
        status: "active",
        avatarColor: "#C9B6E8",
      },
      {
        name: "Diego Fernández",
        relation: "Papá",
        status: "pending",
        avatarColor: "#A9C7E8",
      },
    ],
  },
  {
    id: "sofia-mendez",
    name: "Sofía Méndez",
    age: 2,
    room: "Soles",
    avatarColor: "#F4B8CC",
    avatarText: "#C44A7A",
    parentsCount: 1,
  },
  {
    id: "benjamin-ruiz",
    name: "Benjamín Ruiz",
    age: 3,
    room: "Soles",
    avatarColor: "#B9DEC4",
    avatarText: "#3E8B62",
    parentsCount: 2,
  },
  {
    id: "valentina-soto",
    name: "Valentina Soto",
    age: 2,
    room: "Soles",
    avatarColor: "#F4DC8E",
    avatarText: "#9A7B1E",
    parentsCount: 0,
    linkPrompt: true,
  },
  {
    id: "tomas-diaz",
    name: "Tomás Díaz",
    age: 3,
    room: "Soles",
    avatarColor: "#C9B6E8",
    avatarText: "#7B5FC0",
    parentsCount: 1,
    allergy: "lactosa",
  },
  {
    id: "emma-castro",
    name: "Emma Castro",
    age: 2,
    room: "Soles",
    avatarColor: "#F4B8CC",
    avatarText: "#C44A7A",
    parentsCount: 1,
  },
  {
    id: "lucas-romero",
    name: "Lucas Romero",
    age: 3,
    room: "Soles",
    avatarColor: "#A9D9E8",
    avatarText: "#1F7A93",
    parentsCount: 1,
  },
  {
    id: "olivia-vega",
    name: "Olivia Vega",
    age: 2,
    room: "Soles",
    avatarColor: "#B9DEC4",
    avatarText: "#3E8B62",
    parentsCount: 1,
  },
];
