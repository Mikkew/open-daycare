import Link from "next/link";

function SunIcon() {
  return (
    <svg
      width="30"
      height="30"
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

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ActivatePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-[40px] py-[40px]">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div
          className="mb-[22px] flex h-[58px] w-[58px] items-center justify-center rounded-[18px]"
          style={{
            background: "linear-gradient(155deg,#F8C3A8,#F2937A)",
            boxShadow: "0 12px 26px -10px rgba(238,129,100,.65)",
          }}
        >
          <SunIcon />
        </div>

        {/* Title + subtitle */}
        <h1 className="mb-[8px] font-fredoka text-[32px] font-semibold leading-[1.15] text-[#3F362E]">
          Bienvenida a OpenDayCare
        </h1>
        <p className="mb-[26px] text-[15.5px] leading-[1.55] text-[#94887B]">
          Te invitaron a seguir el día de tu hijo. Creá tu contraseña para
          activar la cuenta.
        </p>

        {/* Invitation card */}
        <div className="mb-[22px] flex items-center gap-[14px] rounded-[16px] border-[1.5px] border-[#EADFD0] bg-white px-[16px] py-[14px]">
          <div
            className="flex h-[44px] w-[44px] items-center justify-center rounded-full font-fredoka text-[19px] font-semibold"
            style={{ background: "#A9D9E8", color: "#1F7A93" }}
          >
            M
          </div>
          <div>
            <div className="text-[13px] text-[#94887B]">
              Te invitaron a seguir a
            </div>
            <div className="font-fredoka text-[17px] font-semibold text-[#3F362E]">
              Mateo · Sala Soles
            </div>
          </div>
        </div>

        {/* Code */}
        <div className="mb-[8px] text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
          CÓDIGO DE INVITACIÓN
        </div>
        <input
          value="7K4P9"
          readOnly
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-[16px] py-[14px] font-fredoka text-[18px] font-bold tracking-[3px] text-[#3F362E]"
        />

        {/* Email */}
        <div className="mb-[8px] text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
          EMAIL
        </div>
        <input
          type="email"
          value="lucia.fernandez@gmail.com"
          readOnly
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-[16px] py-[14px] text-[15px] text-[#3F362E]"
        />

        {/* Password */}
        <div className="mb-[8px] text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
          CREAR CONTRASEÑA
        </div>
        <input
          type="password"
          placeholder="••••••••"
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#F2A78E] bg-white px-[16px] py-[14px] text-[15px] text-[#3F362E]"
        />

        {/* Authorization checkbox */}
        <label
          className="mb-[24px] flex cursor-pointer items-start gap-[12px] rounded-[14px] px-[16px] py-[14px]"
          style={{ background: "#FBF1D6" }}
        >
          <span
            className="mt-[1px] flex h-[24px] w-[24px] flex-none items-center justify-center rounded-[8px]"
            style={{ background: "#5FB97E" }}
          >
            <CheckIcon />
          </span>
          <span className="text-[14px] leading-[1.45]" style={{ color: "#8A7234" }}>
            Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro
            de la app.
          </span>
        </label>

        {/* Activate button */}
        <Link
          href="/"
          className="block w-full rounded-[15px] px-[15px] py-[15px] text-center text-[16px] font-extrabold text-white"
          style={{
            background: "linear-gradient(180deg,#F4977E,#EE8164)",
            boxShadow: "0 10px 22px -8px rgba(238,129,100,.7)",
          }}
        >
          Activar mi cuenta
        </Link>

        {/* Login link */}
        <p className="mt-[22px] text-center text-[14.5px] text-[#94887B]">
          ¿Ya tenés cuenta?{" "}
          <Link href="/auth/login" className="font-extrabold text-[#C5503A]">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
