"use client";

import { useState } from "react";
import Link from "next/link";

type Role = "staff" | "parent";

const ROLE_EMAIL: Record<Role, string> = {
  staff: "caro@opendaycare.com",
  parent: "lucia.fernandez@gmail.com",
};

const ROLE_ACTIVE: Record<Role, { bg: string; border: string; fg: string }> = {
  staff: { bg: "#FBE3D8", border: "#F2937A", fg: "#D9583C" },
  parent: { bg: "#FBE3D8", border: "#F2937A", fg: "#D9583C" },
};

const ROLE_INACTIVE = { bg: "#fff", border: "#EADFD0", fg: "#6E6359" };

function StaffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function FamilyIcon() {
  return (
    <svg
      width="18"
      height="18"
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

export default function LoginForm() {
  const [role, setRole] = useState<Role>("staff");
  const [email, setEmail] = useState(ROLE_EMAIL.staff);

  const handleRole = (newRole: Role) => {
    setRole(newRole);
    setEmail(ROLE_EMAIL[newRole]);
  };

  const activeStyle = ROLE_ACTIVE[role];
  const inactiveStyle = ROLE_INACTIVE;

  return (
    <>
      <div className="mb-[9px] text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
        INGRESO COMO
      </div>
      <div className="mb-[22px] flex gap-[10px]">
        <button
          type="button"
          onClick={() => handleRole("staff")}
          className="flex flex-1 items-center gap-[9px] rounded-[14px] px-[14px] py-[13px] text-[14px] font-bold transition-[0.15s]"
          style={{
            border: `1.5px solid ${role === "staff" ? activeStyle.border : inactiveStyle.border}`,
            background: role === "staff" ? activeStyle.bg : inactiveStyle.bg,
            color: role === "staff" ? activeStyle.fg : inactiveStyle.fg,
          }}
        >
          <StaffIcon />
          Personal
        </button>
        <button
          type="button"
          onClick={() => handleRole("parent")}
          className="flex flex-1 items-center gap-[9px] rounded-[14px] px-[14px] py-[13px] text-[14px] font-bold transition-[0.15s]"
          style={{
            border: `1.5px solid ${role === "parent" ? activeStyle.border : inactiveStyle.border}`,
            background: role === "parent" ? activeStyle.bg : inactiveStyle.bg,
            color: role === "parent" ? activeStyle.fg : inactiveStyle.fg,
          }}
        >
          <FamilyIcon />
          Familia
        </button>
      </div>

      <div className="mb-[8px] text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
        EMAIL
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-[16px] py-[14px] text-[15px] text-[#3F362E]"
      />

      <div className="mb-[8px] text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
        CONTRASEÑA
      </div>
      <input
        type="password"
        placeholder="••••••••"
        className="mb-[10px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-[16px] py-[14px] text-[15px] text-[#3F362E]"
      />

      <div className="mb-[20px] text-right">
        <span className="cursor-pointer text-[13.5px] font-bold text-[#C5503A]">
          ¿Olvidaste tu contraseña?
        </span>
      </div>

      <Link
        href="/"
        className="block w-full rounded-[15px] px-[15px] py-[15px] text-center text-[16px] font-extrabold text-white"
        style={{
          background: "linear-gradient(180deg,#F4977E,#EE8164)",
          boxShadow: "0 10px 22px -8px rgba(238,129,100,.7)",
        }}
      >
        Iniciar sesión
      </Link>

      <p className="mt-[24px] text-center text-[14.5px] text-[#94887B]">
        ¿Te invitó la guardería?{" "}
        <Link href="/auth/activate" className="font-extrabold text-[#C5503A]">
          Activá tu cuenta
        </Link>
      </p>
    </>
  );
}
