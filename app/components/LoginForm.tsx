"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-[8px] text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
          EMAIL
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-[16px] py-[14px] text-[15px] text-[#3F362E]"
          required
        />

        <div className="mb-[8px] text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
          CONTRASEÑA
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mb-[10px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-[16px] py-[14px] text-[15px] text-[#3F362E]"
          required
        />

        {error && (
          <div className="mb-[14px] rounded-[12px] bg-[#FDE8E4] px-[14px] py-[10px] text-[13px] font-medium text-[#C5503A]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="block w-full rounded-[15px] px-[15px] py-[15px] text-center text-[16px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: "linear-gradient(180deg,#F4977E,#EE8164)",
            boxShadow: "0 10px 22px -8px rgba(238,129,100,.7)",
          }}
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="mt-[24px] text-center text-[14.5px] text-[#94887B]">
        ¿Te invitó la guardería?{" "}
        <Link href="/activate" className="font-extrabold text-[#C5503A]">
          Activá tu cuenta
        </Link>
      </p>
    </>
  );
}
