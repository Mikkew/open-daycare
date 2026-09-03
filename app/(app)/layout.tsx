import Sidebar from "@/app/components/Sidebar";
import { getServerClient } from "@/lib/supabase/server";

interface StaffUserWithDaycare {
  full_name: string;
  role: string;
  daycares: { name: string } | null;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerClient();

  // Demo: fetch staff user from seed data for display
  const { data: user } = await supabase
    .from("users")
    .select("full_name, role, daycares(name)")
    .eq("role", "staff")
    .single() as { data: StaffUserWithDaycare | null; error: unknown };

  const sidebarUser = user
    ? {
        full_name: user.full_name,
        role: user.role,
        room: user.daycares?.name || undefined,
      }
    : undefined;

  return (
    <div className="flex min-h-screen">
      <Sidebar user={sidebarUser} />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
