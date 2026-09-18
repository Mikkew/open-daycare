import { getServerClient } from "@/lib/supabase/server";

interface FamilyAccountData {
  full_name: string;
  email?: string;
  role: string;
  notify_on_post: boolean;
  daily_summary_enabled: boolean;
  parent_children: {
    relationship: string;
    children: {
      id: string;
      full_name: string;
      birth_date: string;
      rooms: { name: string } | null;
      photo_consent: boolean;
    } | null;
  }[];
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

export default async function MiCuentaPage() {
  const supabase = await getServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const { data: user } = await supabase
    .from("users")
    .select("full_name, role, notify_on_post, daily_summary_enabled, parent_children(relationship, children(id, full_name, birth_date, rooms(name), photo_consent))")
    .eq("id", session.user.id)
    .single() as { data: FamilyAccountData | null; error: unknown };

  if (!user) {
    return null;
  }

  const linkedChildren = (user.parent_children || [])
    .map((pc) => pc.children)
    .filter(Boolean);

  const relLabel = (rel: string) => rel === "mother" ? "Madre" : rel === "father" ? "Padre" : "Tutor";
  const firstRel = user.parent_children?.[0]?.relationship;
  const parentLabel = firstRel ? `${relLabel(firstRel)} de` : "Padre/Madre de";
  const childNames = linkedChildren.map((c) => c!.full_name).join(", ");

  return (
    <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-[34px]">
      <div className="mb-6">
        <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
          CUENTA
        </div>
        <h1 className="font-fredoka text-[30px] font-semibold text-[#3F362E]">
          Mi cuenta
        </h1>
      </div>

      {/* Profile */}
      <div className="mb-6 rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9] p-6">
        <h2 className="mb-4 text-lg font-extrabold text-[#3F362E]">Perfil</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[14.5px] text-[#94887B]">Nombre</span>
            <span className="text-[14.5px] font-extrabold text-[#3F362E]">{user.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[14.5px] text-[#94887B]">Email</span>
            <span className="text-[14.5px] font-extrabold text-[#3F362E]">{session.user.email || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[14.5px] text-[#94887B]">Rol</span>
            <span className="text-[14.5px] font-extrabold text-[#3F362E]">{parentLabel} {childNames}</span>
          </div>
        </div>
      </div>

      {/* Linked children */}
      <div className="mb-6 rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9] p-6">
        <h2 className="mb-4 text-lg font-extrabold text-[#3F362E]">Hijos vinculados</h2>
        {linkedChildren.length === 0 ? (
          <p className="text-[14.5px] text-[#94887B]">No tenés niños vinculados aún.</p>
        ) : (
          <div className="space-y-3">
            {linkedChildren.map((child) => (
              <div key={child!.id} className="flex items-center justify-between rounded-xl border border-[#ECE0D0] bg-white p-4">
                <div>
                  <div className="font-semibold text-[#3F362E]">{child!.full_name}</div>
                  <div className="text-sm text-[#94887B]">
                    {calculateAge(child!.birth_date)} años · Sala {child!.rooms?.name || "—"}
                  </div>
                </div>
                <div className="text-sm text-[#94887B]">
                  Fotos: {child!.photo_consent ? "Sí" : "No"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification preferences */}
      <div className="mb-6 rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9] p-6">
        <h2 className="mb-4 text-lg font-extrabold text-[#3F362E]">Notificaciones</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#3F362E]">Notificar nuevas publicaciones</div>
              <div className="text-sm text-[#94887B]">Recibir alertas cuando se publique algo de tus hijos</div>
            </div>
            <div className={`h-6 w-11 rounded-full ${user.notify_on_post ? "bg-[#F2937A]" : "bg-[#E7DAC8]"}`}>
              <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${user.notify_on_post ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#3F362E]">Resumen diario</div>
              <div className="text-sm text-[#94887B]">Recibir el resumen del día al final de la jornada</div>
            </div>
            <div className={`h-6 w-11 rounded-full ${user.daily_summary_enabled ? "bg-[#F2937A]" : "bg-[#E7DAC8]"}`}>
              <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${user.daily_summary_enabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9] p-6">
        <h2 className="mb-4 text-lg font-extrabold text-[#3F362E]">Opciones</h2>
        <div className="space-y-2">
          <a href="#" className="block rounded-xl px-4 py-3 text-[14.5px] font-semibold text-[#6E6359] hover:bg-[#F6ECDF]">
            Cambiar contraseña
          </a>
          <a href="#" className="block rounded-xl px-4 py-3 text-[14.5px] font-semibold text-[#6E6359] hover:bg-[#F6ECDF]">
            Ayuda
          </a>
          <button
            onClick={async () => {
              "use server";
            }}
            className="w-full rounded-xl px-4 py-3 text-left text-[14.5px] font-semibold text-[#D9583C] hover:bg-[#FBDAD6]"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
