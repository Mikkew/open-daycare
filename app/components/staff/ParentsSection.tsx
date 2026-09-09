"use client";

import { useState, useCallback, useEffect } from "react";
import { LinkedParent } from "@/app/lib/children";
import ParentRow from "@/app/components/ParentRow";
import { sendInvitation } from "@/app/actions/invitations";

// ─── Types ──────────────────────────────────────────────────────────────────

type Relation = "Mamá" | "Papá" | "Tutor/a";

const RELATIONS: Relation[] = ["Mamá", "Papá", "Tutor/a"];

// ─── Helpers ────────────────────────────────────────────────────────────────

function capitalizeWords(s: string): string {
  const endsWithSpace = s.endsWith(" ");
  const cleaned = s
    .replace(/[^a-zA-ZÀ-ÿ\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  return endsWithSpace ? cleaned + " " : cleaned;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ─── Component ──────────────────────────────────────────────────────────────

interface ParentsSectionProps {
  childName: string;
  childId: string;
  initialParents: LinkedParent[];
}

export default function ParentsSection({
  childName,
  childId,
  initialParents,
}: ParentsSectionProps) {
  const [parents] = useState<LinkedParent[]>(initialParents);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState<Relation>("Mamá");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(capitalizeWords(e.target.value));
      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
    },
    [errors.name]
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
    },
    [errors.email]
  );

  const handleOpen = useCallback(() => {
    setOpen(true);
    setCode(generateCode());
    setName("");
    setEmail("");
    setRelation("Mamá");
    setErrors({});
    setServerError("");
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setName("");
    setEmail("");
    setRelation("Mamá");
    setErrors({});
    setServerError("");
  }, []);

  const handleSend = useCallback(async () => {
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!email.trim() || !validateEmail(email)) {
      newErrors.email = email.trim()
        ? "El email no tiene un formato válido"
        : "El email es obligatorio";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setServerError("");

    const result = await sendInvitation({
      childId,
      parentName: name,
      parentEmail: email,
      relationship: relation,
    });

    setLoading(false);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    // Don't add to local state — the real parent will appear after reload
    setErrors({});
    setOpen(false);
  }, [name, email, relation, childId]);

  return (
    <>
      {/* Linked parents card */}
      <div className="rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9] p-[16px_18px]">
        <div className="mb-[14px] text-[12.5px] font-extrabold tracking-wide text-[#8A7C6D]">
          PADRES VINCULADOS
        </div>
        <div className="flex flex-col gap-[14px]">
          {parents.map((parent) => (
            <ParentRow key={parent.name} parent={parent} />
          ))}
          <button
            type="button"
            onClick={handleOpen}
            className="flex items-center gap-3 bg-none pt-2"
          >
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border-[1.5px] border-dashed border-[#D8CBBA] text-[#B0A290]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <span className="text-[14.5px] font-extrabold text-[#C5503A]">
              Vincular otro padre
            </span>
          </button>
        </div>
      </div>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-6 py-10"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="w-full max-w-[480px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-[20px]">
              <div>
                <div className="font-fredoka text-[18px] font-semibold text-[#3F362E]">
                  Vincular padre
                </div>
                <div className="text-[13px] text-[#A89A8B]">a {childName}</div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[#F0E6D8] text-[#94887B]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="px-[26px] py-[22px]">
              {/* Info banner */}
              <div className="mb-[20px] flex gap-[11px] rounded-[14px] bg-[#E3ECFB] p-[13px_16px]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4E72C8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-none"
                  style={{ marginTop: "1px" }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span className="text-[13.5px] leading-[1.45] text-[#3F5694]">
                  Le enviaremos un correo con un código para que active su
                  cuenta. Solo verá el feed de {childName}.
                </span>
              </div>

              {/* Nombre del padre/madre */}
              <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                NOMBRE DEL PADRE/MADRE
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                onBlur={() => {
                  if (!name.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      name: "El nombre es obligatorio",
                    }));
                  }
                }}
                placeholder="Ej. Diego Fernández"
                className={`mb-[18px] w-full rounded-[14px] border-[1.5px] px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] ${
                  errors.name
                    ? "border-[#D9583C] bg-white"
                    : "border-[#EADFD0] bg-white"
                }`}
              />
              {errors.name && (
                <p className="-mt-[14px] mb-[18px] text-sm text-[#D9583C]">
                  {errors.name}
                </p>
              )}

              {/* Email */}
              <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => {
                  if (!email.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      email: "El email es obligatorio",
                    }));
                  } else if (!validateEmail(email)) {
                    setErrors((prev) => ({
                      ...prev,
                      email: "El email no tiene un formato válido",
                    }));
                  }
                }}
                placeholder="correo@ejemplo.com"
                className={`mb-[18px] w-full rounded-[14px] border-[1.5px] px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] ${
                  errors.email
                    ? "border-[#D9583C] bg-white"
                    : "border-[#EADFD0] bg-white"
                }`}
              />
              {errors.email && (
                <p className="-mt-[14px] mb-[18px] text-sm text-[#D9583C]">
                  {errors.email}
                </p>
              )}

              {/* Parentesco */}
              <label className="mb-[10px] block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                PARENTESCO
              </label>
              <div className="mb-[20px] flex gap-[9px]">
                {RELATIONS.map((r) => {
                  const isActive = relation === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRelation(r)}
                      className={`flex-1 rounded-full px-3 py-[11px] text-[14px] font-extrabold ${
                        isActive
                          ? "border-[1.5px] border-[#9FB8EC] bg-[#CCD8F4] text-[#4E72C8]"
                          : "border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>

              {/* Código de invitación */}
              <div className="mb-[20px] rounded-[16px] border-[1.5px] border-dashed border-[#E6D08A] bg-[#FBF1D6] p-[18px] text-center">
                <div className="mb-[8px] text-[12px] font-extrabold tracking-[0.7px] text-[#A88526]">
                  CÓDIGO DE INVITACIÓN
                </div>
                <div className="font-fredoka text-[34px] font-semibold tracking-[7px] text-[#8A7234]">
                  {code}
                </div>
                <div className="mt-[6px] text-[13px] text-[#A88526]">
                  Vence en 7 días
                </div>
              </div>

              {/* Enviar invitación */}
              {serverError && (
                <div className="mb-[16px] rounded-[12px] bg-[#FBDAD6] p-[12px_14px] text-[13.5px] text-[#C5413A]">
                  {serverError}
                </div>
              )}
              <button
                type="button"
                onClick={handleSend}
                disabled={loading}
                className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-4 py-[14px] text-[15.5px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] disabled:opacity-60"
              >
                {loading ? (
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      strokeOpacity="0.3"
                    />
                    <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m22 2-7 20-4-9-9-4z" />
                    <path d="M22 2 11 13" />
                  </svg>
                )}
                {loading ? "Enviando..." : "Enviar invitación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
