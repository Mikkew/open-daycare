import Sidebar from "@/app/components/Sidebar";
import { getServerClient } from "@/lib/supabase/server";

interface FamilyUserData {
  full_name: string;
  role: string;
  parent_children: {
    relationship: string;
    children: { full_name: string } | null;
  }[];
}

export default async function FamilyLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  let displayName: string | undefined;
  let childNames: string[] = [];

  if (session) {
    const { data: user } = await supabase
      .from("users")
      .select("full_name, role, parent_children(relationship, children(full_name))")
      .eq("id", session.user.id)
      .single() as { data: FamilyUserData | null; error: unknown };

    if (user) {
      childNames = user.parent_children
        ?.filter((pc) => pc.children)
        .map((pc) => pc.children!.full_name) || [];

      if (childNames.length > 0) {
        const rel = user.parent_children?.[0]?.relationship;
        const relLabel = rel === "mother" ? "Mamá" : rel === "father" ? "Papá" : "Tutor";
        if (childNames.length === 1) {
          displayName = `${relLabel} de ${childNames[0]}`;
        } else {
          displayName = `Madre/Padre de ${childNames.join(" y ")}`;
        }
      } else {
        displayName = user.full_name;
      }
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={displayName ? { full_name: displayName, role: "parent" } : undefined}
        navItems={[
          { label: "Feed", href: "/family" },
          { label: "Resumen del día", href: "/family/resumen-dia" },
          { label: "Mi cuenta", href: "/family/mi-cuenta" },
        ]}
        displayName={displayName}
      />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
