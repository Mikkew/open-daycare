import { getServerClient } from "@/lib/supabase/server";
import ChildrenList from "@/app/components/ChildrenList";
import AddChildModal from "@/app/components/AddChildModal";

export default async function KidsPage() {
  const supabase = await getServerClient();

  const { data: children, error } = await supabase
    .from("children")
    .select(
      `
      id,
      full_name,
      birth_date,
      enrolled_at,
      room_id,
      status,
      rooms (name),
      child_allergy_tags (tag),
      parent_children (id)
    `
    )
    .eq("status", "active")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Error fetching children:", error);
  }

  const mappedChildren = (children || []).map((child) => ({
    id: child.id,
    name: child.full_name,
    room: child.rooms?.name || "",
    birthDate: child.birth_date,
    enrolledAt: child.enrolled_at,
    allergies: child.child_allergy_tags?.map((t: { tag: string }) => t.tag) || [],
    parentsCount: child.parent_children?.length || 0,
  }));

  return (
    <div className="mx-auto w-full max-w-[880px] px-10 py-[34px] pb-20">
      <div className="mb-[22px] flex items-end justify-between gap-4">
        <div>
          <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
            GESTIÓN
          </div>
          <h1 className="m-0 font-fredoka text-[30px] font-semibold text-[#3F362E]">
            Niños
          </h1>
        </div>
        <AddChildModal />
      </div>

      <ChildrenList kids={mappedChildren} />
    </div>
  );
}
