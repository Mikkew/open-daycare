import { LinkedParent, parentStatusLabels, parentStatusBadgeColors } from "@/app/lib/children";

interface ParentRowProps {
  parent: LinkedParent;
}

export default function ParentRow({ parent }: ParentRowProps) {
  const initial = parent.name.charAt(0);
  const statusLabel = parentStatusLabels[parent.status];
  const badgeColors = parentStatusBadgeColors[parent.status];

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 flex-none items-center justify-center rounded-full font-fredoka text-base font-semibold text-white"
        style={{ backgroundColor: parent.avatarColor }}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-extrabold text-[#3F362E]">
          {parent.name}
        </div>
        <div className="text-[12.5px] text-[#A89A8B]">
          {parent.relation} ·{" "}
          {parent.status === "active" ? "activa" : "invitación enviada"}
        </div>
      </div>
      <span
        className="flex-none rounded-full px-[9px] py-1 text-[10.5px] font-extrabold"
        style={{
          backgroundColor: badgeColors.bg,
          color: badgeColors.text,
        }}
      >
        {statusLabel}
      </span>
    </div>
  );
}
