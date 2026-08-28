import { notFound } from "next/navigation";
import Link from "next/link";
import { children, allergyLabels } from "@/app/lib/children";
import ParentRow from "@/app/components/ParentRow";

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

function PlusIcon() {
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

interface Params {
  id: string;
}

export default async function KidProfilePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const child = children.find((c) => c.id === id);

  if (!child) {
    notFound();
  }

  const initial = child.name.charAt(0);

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
              style={{ backgroundColor: child.avatarColor, color: child.avatarText }}
            >
              {initial}
            </div>
            <div className="flex-1">
              <h1 className="m-0 font-fredoka text-[28px] font-semibold text-[#3F362E]">
                {child.name}
              </h1>
              <p className="mt-[3px] text-[15px] text-[#94887B]">
                {child.age} años · Sala {child.room}
              </p>
            </div>
            <a
              href="#"
              className="rounded-[12px] border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] px-4 py-[9px] text-[14px] font-bold text-[#6E6359]"
            >
              Editar
            </a>
          </div>

          {/* Allergies & notes */}
          {child.notes && (
            <div className="flex gap-[14px] rounded-[16px] bg-[#FBDAD6] p-[16px_18px]">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-[#F4A8A0]">
                <AlertIcon />
              </div>
              <div>
                <div className="mb-[2px] text-[15px] font-extrabold text-[#C5413A]">
                  Alergias y notas
                </div>
                <div className="text-[14.5px] leading-[1.5] text-[#B25249]">
                  {child.notes}
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
                {child.birthDate || "—"}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#F0E6D8] px-[18px] py-[15px]">
              <span className="text-[14.5px] text-[#94887B]">Sala</span>
              <span className="text-[14.5px] font-extrabold text-[#3F362E]">
                {child.room}
              </span>
            </div>
            <div className="flex justify-between px-[18px] py-[15px]">
              <span className="text-[14.5px] text-[#94887B]">Ingreso</span>
              <span className="text-[14.5px] font-extrabold text-[#3F362E]">
                {child.joinedDate || "—"}
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
          <div className="rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9] p-[16px_18px]">
            <div className="mb-[14px] text-[12.5px] font-extrabold tracking-wide text-[#8A7C6D]">
              PADRES VINCULADOS
            </div>
            <div className="flex flex-col gap-[14px]">
              {child.parents &&
                child.parents.map((parent) => (
                  <ParentRow key={parent.name} parent={parent} />
                ))}
              <a
                href="#"
                className="flex items-center gap-3 pt-2"
              >
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border-[1.5px] border-dashed border-[#D8CBBA] text-[#B0A290]">
                  <PlusIcon />
                </span>
                <span className="text-[14.5px] font-extrabold text-[#C5503A]">
                  Vincular otro padre
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
