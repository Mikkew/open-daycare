"use client";

import { useState } from "react";
import ChildCard from "@/app/components/ChildCard";
import type { AllergyTag } from "@/app/lib/children";

const avatarColors = [
  { bg: "#A9D9E8", text: "#1F7A93" },
  { bg: "#F4B8CC", text: "#C44A7A" },
  { bg: "#B9DEC4", text: "#3E8B62" },
  { bg: "#F4DC8E", text: "#9A7B1E" },
  { bg: "#C9B6E8", text: "#7B5FC0" },
  { bg: "#A9C7E8", text: "#4A7CB5" },
];

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#B0A290"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

interface ChildData {
  id: string;
  name: string;
  room: string;
  birthDate: string;
  enrolledAt: string;
  allergies: string[];
  parentsCount: number;
}

export default function ChildrenList({ kids }: { kids: ChildData[] }) {
  const [query, setQuery] = useState("");

  const filtered = kids.filter((child) =>
    child.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="mb-[22px] flex items-center gap-[11px] rounded-[14px] border border-[#ECE0D0] bg-[#FFFDF9] px-4 py-3">
        <SearchIcon />
        <input
          placeholder="Buscar niño…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-none bg-none text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none"
        />
      </div>

      <div className="mb-[14px] flex items-center gap-3">
        <span className="text-[12.5px] font-extrabold tracking-wide text-[#3F362E]">
          SALA SOLES
        </span>
        <span className="text-[13px] text-[#A89A8B]">
          {filtered.length} {filtered.length === 1 ? "niño" : "niños"}
        </span>
        <span className="flex-1 h-[1px] bg-[#E7DAC8]" />
      </div>

      <div className="grid grid-cols-2 gap-[14px]">
        {filtered.map((child, i) => {
          const colors = avatarColors[i % avatarColors.length];
          const age = calculateAge(child.birthDate);
          const isLinked = child.parentsCount === 0;
          return (
            <ChildCard
              key={child.id}
              child={{
                id: child.id,
                name: child.name,
                age,
                room: child.room,
                parentsCount: child.parentsCount,
                allergies: child.allergies as AllergyTag[],
                linkPrompt: isLinked,
                avatarColor: colors.bg,
                avatarText: colors.text,
              }}
            />
          );
        })}
      </div>
    </>
  );
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
