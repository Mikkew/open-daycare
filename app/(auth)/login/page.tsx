import LoginForm from "@/app/components/LoginForm";

function SunIcon() {
  return (
    <svg
      width="26"
      height="26"
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

export default function LoginPage() {
  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: "1.05fr 1fr" }}>
      {/* Left panel */}
      <div
        className="relative flex flex-col justify-between px-[60px] py-[56px] text-white"
        style={{
          background: "linear-gradient(155deg,#F6A98E 0%,#F2937A 45%,#EC7E62 100%)",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full"
          style={{
            width: 420,
            height: 420,
            background: "rgba(255,255,255,.12)",
            top: -140,
            right: -120,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            background: "rgba(255,255,255,.10)",
            bottom: -110,
            left: -80,
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-[13px]">
          <div
            className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px]"
            style={{ background: "rgba(255,255,255,.22)" }}
          >
            <SunIcon />
          </div>
          <span
            className="font-fredoka text-[21px] font-semibold tracking-[0.5px]"
          >
            OpenDayCare
          </span>
        </div>

        {/* Title + subtitle */}
        <div className="relative">
          <h1
            className="mb-[18px] font-fredoka text-[42px] font-semibold leading-[1.12]"
          >
            El día de cada niño,
            <br />
            compartido con su familia.
          </h1>
          <p
            className="max-w-[430px] text-[17px] leading-[1.6]"
            style={{ color: "rgba(255,255,255,.92)" }}
          >
            Publicá momentos, gestioná las salas y mantené a las familias cerca,
            desde un solo lugar.
          </p>
        </div>

        {/* Footer */}
        <div className="relative text-[14px]" style={{ color: "rgba(255,255,255,.9)" }}>
          🌿 Guardería Sala Soles
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center px-[40px] py-[40px]">
        <div className="w-full max-w-[392px]">
          <h2 className="mb-[6px] font-fredoka text-[30px] font-semibold text-[#3F362E]">
            Iniciar sesión
          </h2>
          <p className="mb-[28px] text-[15px] text-[#94887B]">
            Ingresá para ver el día de hoy.
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
