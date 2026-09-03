import Sidebar from "@/app/components/Sidebar";
import { getServerClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = getServerClient();

  // Demo: fetch staff user from seed data for display
  const { data: user } = await supabase
    .from("users")
    .select("full_name, role")
    .eq("role", "staff")
    .single();

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user || undefined} />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
