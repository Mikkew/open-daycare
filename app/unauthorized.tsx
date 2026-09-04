import Link from "next/link";

function SunIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#F2937A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF9] px-6">
      <div className="flex flex-col items-center text-center">
        <SunIcon />
        <h1 className="mt-6 font-fredoka text-2xl font-semibold text-[#3F362E]">
          Debes iniciar sesión
        </h1>
        <p className="mt-2 max-w-sm text-[15px] leading-[1.55] text-[#94887B]">
          Necesitas una sesión activa para acceder a esta página. Inicia sesión
          o activá tu cuenta si recibiste una invitación.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/login"
            className="rounded-[15px] px-6 py-[14px] text-center text-[15px] font-extrabold text-white"
            style={{
              background: "linear-gradient(180deg,#F4977E,#EE8164)",
              boxShadow: "0 10px 22px -8px rgba(238,129,100,.7)",
            }}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/activate"
            className="rounded-[15px] border-[1.5px] border-[#EADFD0] bg-white px-6 py-[14px] text-center text-[15px] font-semibold text-[#6E6359]"
          >
            Activar cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
