import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerClient } from "@/lib/supabase/server";
import { getRooms } from "@/lib/rooms";
import ParentsSection from "@/app/components/ParentsSection";
import { getAllergyLabel, getAllergyBadgeColors } from "@/app/lib/children";
import type { AllergyTag } from "@/app/lib/children";
import EditChildModal from "@/app/components/EditChildModal";
import ArchiveButton from "@/app/components/ArchiveChildButton";

function ArrowLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function SunSmallIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

const avatarColors = [
  { bg: "#A9D9E8", text: "#1F7A93" },
  { bg: "#F4B8CC", text: "#C44A7A" },
  { bg: "#B9DEC4", text: "#3E8B62" },
  { bg: "#F4DC8E", text: "#9A7B1E" },
  { bg: "#C9B6E8", text: "#7B5FC0" },
];

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

interface Params {
  id: string;
}

export default async function KidProfilePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const supabase = await getServerClient();

  const [childResult, rooms] = await Promise.all([
    supabase
      .from("children")
      .select(
        `
        id,
        full_name,
        birth_date,
        enrolled_at,
        room_id,
        medical_notes,
        photo_consent,
        status,
        rooms (name),
        child_allergy_tags (tag),
        parent_children (
          id,
          relationship,
          users!parent_children_parent_id_fkey (id, full_name, role, status)
        )
      `
      )
      .eq("id", id)
      .single(),
    getRooms(),
  ]);

  const { data: child, error } = childResult;

  if (error || !child) {
    notFound();
  }

  const allergies = child.child_allergy_tags?.map((t: { tag: string }) => t.tag as AllergyTag) || [];
  const linkedParents = (child.parent_children || []).map((pc: { relationship: string; users: { id: string; full_name: string; role: string; status: string } }, i: number) => ({
    name: pc.users.full_name,
    relation: pc.relationship === "father" ? "Papá" : pc.relationship === "mother" ? "Mamá" : "Tutor",
    status: (pc.users.status === "active" ? "active" : "pending") as "active" | "pending",
    avatarColor: avatarColors[i % avatarColors.length].bg,
  }));

  const age = calculateAge(child.birth_date);
  const initial = child.full_name.charAt(0);
  const colorIndex = child.full_name.charCodeAt(0) % avatarColors.length;
  const colors = avatarColors[colorIndex];

  return (
    <div className="mx-auto w-full max-w-[820px] px-10 py-[34px] pb-20">
      <Link
        href="/kids"
        className="mb-5 flex items-center gap-[7px] text-[14px] font-bold text-[#94887B]"
      >
        <ArrowLeftIcon />
        Volver a Niños
      </Link>

      <div className="flex flex-wrap items-start gap-[26px]">
        {/* Left column */}
        <div className="flex min-w-[300px] flex-1 flex-col gap-[18px]">
          {/* Header */}
          <div className="flex items-center gap-[18px]">
            <div
              className="flex h-[84px] w-[84px] flex-none items-center justify-center rounded-full font-fredoka text-[34px] font-semibold"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {initial}
            </div>
            <div className="flex-1">
              <h1 className="m-0 font-fredoka text-[28px] font-semibold text-[#3F362E]">
                {child.full_name}
              </h1>
              <p className="mt-[3px] text-[15px] text-[#94887B]">
                {age} años · Sala {child.rooms?.name || ""}
              </p>
            </div>
            <EditChildModal
              child={{
                id: child.id,
                fullName: child.full_name,
                birthDate: child.birth_date,
                roomId: child.room_id,
                medicalNotes: child.medical_notes,
                allergies: child.child_allergy_tags?.map((t: { tag: string }) => t.tag as string) || [],
              }}
              rooms={rooms}
            />
            <ArchiveButton
              childId={child.id}
            />
          </div>

          {/* Allergy badges */}
          {allergies.length > 0 && (
            <div className="flex flex-wrap gap-[8px]">
              {allergies.map((tag: AllergyTag) => (
                <span
                  key={tag}
                  className="rounded-full px-[11px] py-[6px] text-[12px] font-extrabold"
                  style={{
                    backgroundColor: getAllergyBadgeColors(tag).bg,
                    color: getAllergyBadgeColors(tag).text,
                  }}
                >
                  {getAllergyLabel(tag)}
                </span>
              ))}
            </div>
          )}

          {/* Medical notes */}
          {child.medical_notes && (
            <div className="flex gap-[14px] rounded-[16px] bg-[#FBDAD6] p-[16px_18px]">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-[#F4A8A0]">
                <AlertIcon />
              </div>
              <div>
                <div className="mb-[2px] text-[15px] font-extrabold text-[#C5413A]">
                  Alergias y notas
                </div>
                <div className="text-[14.5px] leading-[1.5] text-[#B25249]">
                  {child.medical_notes}
                </div>
              </div>
            </div>
          )}

          {/* Data table */}
          <div className="overflow-hidden rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9]">
            <div className="flex justify-between border-b border-[#F0E6D8] px-[18px] py-[15px]">
              <span className="text-[14.5px] text-[#94887B]">
                Fecha de nacimiento
              </span>
              <span className="text-[14.5px] font-extrabold text-[#3F362E]">
                {formatDate(child.birth_date)}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#F0E6D8] px-[18px] py-[15px]">
              <span className="text-[14.5px] text-[#94887B]">Sala</span>
              <span className="text-[14.5px] font-extrabold text-[#3F362E]">
                {child.rooms?.name || "—"}
              </span>
            </div>
            <div className="flex justify-between px-[18px] py-[15px]">
              <span className="text-[14.5px] text-[#94887B]">Ingreso</span>
              <span className="text-[14.5px] font-extrabold text-[#3F362E]">
                {formatDate(child.enrolled_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex w-[300px] flex-none flex-col gap-[14px]">
          {/* Day summary button */}
          <a
            href="#"
            className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-[#3F362E] px-3 py-[13px] text-[15px] font-extrabold text-white"
          >
            <SunSmallIcon />
            Resumen del día
          </a>

          {/* Linked parents */}
          <ParentsSection
            childName={child.full_name}
            initialParents={linkedParents}
          />
        </div>
      </div>
    </div>
  );
}
