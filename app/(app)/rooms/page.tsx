import { getServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import RoomManager from "@/app/components/RoomManager";

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

export default async function RoomsPage() {
  const supabase = await getServerClient();

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select(
      `
      id,
      name,
      children!children_room_id_fkey (id, status)
    `
    )
    .order("name");

  if (error) {
    console.error("Error fetching rooms:", error);
  }

  const mappedRooms = (rooms || []).map((room) => ({
    id: room.id,
    name: room.name,
    activeChildren: room.children?.filter((c: { status: string }) => c.status === "active").length || 0,
  }));

  return (
    <div className="mx-auto w-full max-w-[880px] px-10 py-[34px] pb-20">
      <Link
        href="/kids"
        className="mb-5 flex items-center gap-[7px] text-[14px] font-bold text-[#94887B]"
      >
        <ArrowLeftIcon />
        Volver a Niños
      </Link>

      <div className="mb-[22px]">
        <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
          GESTIÓN
        </div>
        <h1 className="m-0 font-fredoka text-[30px] font-semibold text-[#3F362E]">
          Salas
        </h1>
      </div>

      <RoomManager rooms={mappedRooms} />
    </div>
  );
}
