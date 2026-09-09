import Sidebar from "@/app/components/Sidebar";
import { getServerClient } from "@/lib/supabase/server";
import CreatePostModal from "@/app/components/staff/CreatePostModal";

interface StaffUserWithDaycare {
  full_name: string;
  role: string;
  daycares: { name: string } | null;
  rooms: { name: string } | null;
}

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerClient();

  const { data: user } = await supabase
    .from("users")
    .select("full_name, role, daycares(name), rooms(name)")
    .eq("role", "staff")
    .single() as { data: StaffUserWithDaycare | null; error: unknown };

  const sidebarUser = user
    ? {
        full_name: user.full_name,
        role: user.role,
        room: user.daycares?.name || user.rooms?.name || undefined,
      }
    : undefined;

  return (
    <div className="flex min-h-screen">
      <CreatePostModal />
      <Sidebar
        user={sidebarUser}
        navItems={[
          { label: "Feed", href: "/staff" },
          { label: "Niños", href: "/staff/kids" },
          { label: "Salas", href: "/staff/rooms" },
          { label: "Avisos", href: "#" },
          { label: "Mi cuenta", href: "#" },
        ]}
        ctaButton={{ label: "Nueva publicación" }}
      />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
