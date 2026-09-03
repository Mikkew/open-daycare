import Link from "next/link";
import { Child, getAllergyLabel, getAllergyBadgeColors } from "@/app/lib/children";

function ChevronIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#CBB89F"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

interface ChildCardProps {
  child: Child;
}

export default function ChildCard({ child }: ChildCardProps) {
  const parentLabel =
    child.parentsCount === 0
      ? "sin padres vinculados"
      : child.parentsCount === 1
        ? "1 padre vinculado"
        : `${child.parentsCount} padres vinculados`;

  const initial = child.name.charAt(0);

  return (
    <Link
      href={`/kids/${child.id}`}
      className="flex min-w-0 items-center gap-[14px] rounded-[18px] border border-[#ECE0D0] bg-[#FFFDF9] p-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)] transition-all duration-150 hover:border-[#F2A78E] hover:-translate-y-0.5"
    >
      <div
        className="flex h-[48px] w-[48px] flex-none items-center justify-center rounded-full font-fredoka text-[19px] font-semibold"
        style={{ backgroundColor: child.avatarColor, color: child.avatarText }}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-fredoka text-[16px] font-semibold text-[#3F362E]">
          {child.name}
        </div>
        <div className="text-[13px] text-[#A89A8B]">
          {child.age} años · {parentLabel}
        </div>
      </div>
      {child.allergies && child.allergies.length > 0 ? (
        child.allergies.map((tag) => (
          <span
            key={tag}
            className="flex-none rounded-full px-[9px] py-[5px] text-[11px] font-extrabold"
            style={{
              backgroundColor: getAllergyBadgeColors(tag).bg,
              color: getAllergyBadgeColors(tag).text,
            }}
          >
            {getAllergyLabel(tag)}
          </span>
        ))
      ) : child.allergy ? (
        <span
          className="flex-none rounded-full px-[9px] py-[5px] text-[11px] font-extrabold"
          style={{
            backgroundColor: getAllergyBadgeColors(child.allergy).bg,
            color: getAllergyBadgeColors(child.allergy).text,
          }}
        >
          {getAllergyLabel(child.allergy)}
        </span>
      ) : child.linkPrompt ? (
        <span className="flex-none rounded-full bg-[#F9D2DE] px-[9px] py-[5px] text-[11px] font-extrabold text-[#C56486]">
          VINCULAR
        </span>
      ) : (
        <ChevronIcon />
      )}
    </Link>
  );
}
