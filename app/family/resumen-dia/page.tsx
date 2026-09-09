import { getServerClient } from "@/lib/supabase/server";

interface ChildData {
  id: string;
  full_name: string;
}

function formatSleepMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}`;
}

export default async function ResumenDiaPage() {
  const supabase = await getServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  let children: ChildData[] = [];

  if (session) {
    const { data: parentChildren } = await supabase
      .from("parent_children")
      .select("child_id, children(id, full_name)")
      .eq("parent_id", session.user.id);

    children = (parentChildren?.map((pc) => pc.children as ChildData | null).filter((c): c is ChildData => c !== null)) || [];
  }

  const firstChildId = children[0]?.id;

  let summary: {
    meal_count: number;
    sleep_minutes: number;
    activity_count: number;
    mood: string | null;
    highlights: string | null;
  } | null = null;

  if (firstChildId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("daily_summaries")
      .select("meal_count, sleep_minutes, activity_count, mood, highlights")
      .eq("child_id", firstChildId)
      .gte("date", today.toISOString().split("T")[0])
      .single();

    summary = data;
  }

  return (
    <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-[34px]">
      <div className="mb-6">
        <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
          RESUMEN
        </div>
        <h1 className="font-fredoka text-[30px] font-semibold text-[#3F362E]">
          Resumen del día
        </h1>
      </div>

      {children.length > 1 && (
        <div className="mb-6 flex gap-2">
          {children.map((child) => (
            <button
              key={child.id}
              className="rounded-full border border-[#E7DAC8] bg-[#FFFDF9] px-4 py-1.5 text-sm font-semibold text-[#6E6359]"
            >
              {child.full_name}
            </button>
          ))}
        </div>
      )}

      {!summary ? (
        <div className="rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9] p-8 text-center">
          <p className="text-[15px] text-[#94887B]">
            No hay resumen disponible aún para hoy.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9] p-5">
            <div className="mb-2 text-2xl">🍽️</div>
            <div className="text-[24px] font-extrabold text-[#3F362E]">
              {summary.meal_count}
            </div>
            <div className="text-sm text-[#94887B]">Comidas</div>
          </div>

          <div className="rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9] p-5">
            <div className="mb-2 text-2xl">😴</div>
            <div className="text-[24px] font-extrabold text-[#3F362E]">
              {formatSleepMinutes(summary.sleep_minutes)}
            </div>
            <div className="text-sm text-[#94887B]">Sueño</div>
          </div>

          <div className="rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9] p-5">
            <div className="mb-2 text-2xl">🎨</div>
            <div className="text-[24px] font-extrabold text-[#3F362E]">
              {summary.activity_count}
            </div>
            <div className="text-sm text-[#94887B]">Actividades</div>
          </div>

          <div className="rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9] p-5">
            <div className="mb-2 text-2xl">😊</div>
            <div className="text-[16px] font-extrabold text-[#3F362E]">
              {summary.mood || "Sin datos"}
            </div>
            <div className="text-sm text-[#94887B]">Estado de ánimo</div>
          </div>
        </div>
      )}

      {summary?.highlights && (
        <div className="mt-4 rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9] p-5">
          <h3 className="mb-2 text-sm font-extrabold text-[#8A7C6D]">DESTACADOS</h3>
          <p className="text-[14.5px] leading-[1.5] text-[#3F362E]">
            {summary.highlights}
          </p>
        </div>
      )}
    </div>
  );
}
