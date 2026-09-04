"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CreatePostModal from "./CreatePostModal";

function SunIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function KidsIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 20a5 5 0 0 1 5.5-4.9" />
    </svg>
  );
}

function RoomsIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3h18v14H3zM3 10h18M9 3v14M15 3v14" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

const navItems = [
  { label: "Feed", href: "/", icon: <HomeIcon /> },
  { label: "Niños", href: "/kids", icon: <KidsIcon /> },
  { label: "Salas", href: "/rooms", icon: <RoomsIcon /> },
  { label: "Avisos", href: "#", icon: <BellIcon /> },
  { label: "Mi cuenta", href: "#", icon: <UserIcon /> },
];

const roleLabels: Record<string, string> = {
  staff: "Maestra",
  parent: "Padre",
  admin: "Admin",
};

export default function Sidebar({
  user,
}: {
  user?: {
    full_name: string;
    role: string;
    room?: string | null;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();

  const displayName = user?.full_name || "Caro Giménez";
  const displayRole = user ? roleLabels[user.role] || user.role : "Maestra";
  const displayRoom = user?.room || "Soles";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] flex-none flex-col border-r border-[#ECE0D0] bg-[#FFFDF9] px-4 py-6">
      <a href="#" className="flex items-center gap-[11px] px-2 pb-[22px] pt-1">
        <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl bg-[linear-gradient(155deg,#F8C3A8,#F2937A)]">
          <SunIcon />
        </div>
        <div>
          <div className="font-fredoka text-[17px] font-semibold leading-none text-[#3F362E]">
            OpenDayCare
          </div>
          <div className="mt-0.5 text-[11.5px] text-[#A89A8B]">Sala Soles</div>
        </div>
      </a>

      <CreatePostModal />

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href !== "#" &&
            (pathname === item.href ||
              (item.href === "/" && pathname === "/") ||
              (item.href === "/kids" && pathname?.startsWith("/kids")) ||
              (item.href === "/rooms" && pathname?.startsWith("/rooms")));

          return (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-[11px] text-[14.5px] ${
                isActive
                  ? "bg-[#FBE3D8] font-extrabold text-[#D9583C]"
                  : "bg-transparent font-semibold text-[#6E6359]"
              }`}
            >
              {item.icon}
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="mt-[10px] border-t border-[#ECE0D0] pt-[14px]">
        <div className="flex items-center gap-[11px] px-2 py-1.5">
          <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-[#F2937A] font-fredoka text-base font-semibold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold text-[#3F362E]">
              {displayName}
            </div>
            <div className="text-xs text-[#A89A8B]">
              {displayRole} · {displayRoom}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-[#F6ECDF] text-[#94887B] cursor-pointer"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}
