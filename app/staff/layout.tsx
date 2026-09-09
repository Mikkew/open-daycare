"use client";

import Sidebar from "@/app/components/Sidebar";
import CreatePostModal from "@/app/components/staff/CreatePostModal";
import { useState } from "react";

interface StaffUserWithDaycare {
  full_name: string;
  role: string;
  daycares: { name: string } | null;
  rooms: { name: string } | null;
}

// Datos de ejemplo - en producción vendrían de Supabase
const MOCK_USER = {
  full_name: "Caro Giménez",
  role: "staff",
  room: "Soles",
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <CreatePostModal open={modalOpen} onOpenChange={setModalOpen} />
      <Sidebar
        user={MOCK_USER}
        navItems={[
          { label: "Feed", href: "/staff" },
          { label: "Niños", href: "/staff/kids" },
          { label: "Salas", href: "/staff/rooms" },
          { label: "Avisos", href: "#" },
          { label: "Mi cuenta", href: "#" },
        ]}
        ctaButton={{ label: "Nueva publicación", onClick: () => setModalOpen(true) }}
      />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
