"use client";

import { useState } from "react";
import { children } from "@/app/lib/children";
import ChildCard from "@/app/components/ChildCard";

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

export default function ChildrenList() {
  const [query, setQuery] = useState("");

  const filtered = children.filter((child) =>
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
        {filtered.map((child) => (
          <ChildCard key={child.id} child={child} />
        ))}
      </div>
    </>
  );
}
