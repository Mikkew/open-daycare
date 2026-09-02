"use client";

import { useState, useCallback, useEffect } from "react";

// ─── Data ───────────────────────────────────────────────────────────────────

type Recipient = {
  id: string;
  label: string;
  avatarColor?: string;
  avatarText?: string;
  initial?: string;
};

const RECIPIENTS: Recipient[] = [
  { id: "mateo", label: "Mateo", avatarColor: "#A9D9E8", avatarText: "#1F7A93", initial: "M" },
  { id: "sofia", label: "Sofía", avatarColor: "#F4B8CC", avatarText: "#C44A7A", initial: "S" },
  { id: "benjamin", label: "Benjamín", avatarColor: "#B9DEC4", avatarText: "#3E8B62", initial: "B" },
  { id: "toda-la-sala", label: "Toda la sala" },
];

type PostType = { id: string; label: string; bg: string; text: string };

const POST_TYPES: PostType[] = [
  { id: "comida", label: "Comida", bg: "#9A7B1E", text: "#fff" },
  { id: "siesta", label: "Siesta", bg: "#E7DCF6", text: "#7B5FC0" },
  { id: "actividad", label: "Actividad", bg: "#2E89A6", text: "#fff" },
  { id: "logro", label: "Logro", bg: "#CFEBD8", text: "#3E9B6C" },
  { id: "animo", label: "Ánimo", bg: "#F9D2DE", text: "#C56486" },
  { id: "foto", label: "Foto", bg: "#FBD8CC", text: "#D9684A" },
  { id: "anuncio", label: "Anuncio", bg: "#CCD8F4", text: "#4E72C8" },
];

function PlusIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CreatePostModal() {
  const [open, setOpen] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{
    recipient?: string;
    type?: string;
    description?: string;
  }>({});

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

  const handleOpen = useCallback(() => {
    setOpen(true);
    setErrors({});
  }, []);

  const handleCancel = useCallback(() => {
    setOpen(false);
    setErrors({});
    setRecipientId("");
    setTypeId("");
    setDescription("");
  }, []);

  const handlePublish = useCallback(() => {
    const newErrors: typeof errors = {};

    if (!recipientId) {
      newErrors.recipient = "Elegí un destinatario";
    }

    if (!typeId) {
      newErrors.type = "Elegí un tipo";
    }

    if (!description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setOpen(false);
    setRecipientId("");
    setTypeId("");
    setDescription("");
  }, [recipientId, typeId, description]);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        className="mb-[18px] flex w-full items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-3 py-3 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.75)]"
      >
        <PlusIcon />
        Nueva publicación
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-6 py-10"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancel();
          }}
        >
          <div className="w-full max-w-[580px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-[20px]">
              <button
                type="button"
                onClick={handleCancel}
                className="text-[15px] font-bold text-[#94887B]"
              >
                Cancelar
              </button>
              <span className="font-fredoka text-[18px] font-semibold text-[#3F362E]">
                Nueva publicación
              </span>
              <button
                type="button"
                onClick={handlePublish}
                className="text-[15px] font-extrabold text-[#D9583C]"
              >
                Publicar
              </button>
            </div>

            {/* Form */}
            <div className="px-[26px] py-[24px]">
              {/* PARA */}
              <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                PARA
              </div>
              <div className="mb-[22px] flex flex-wrap gap-[9px]">
                {RECIPIENTS.map((r) => {
                  const active = recipientId === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setRecipientId(r.id);
                        if (errors.recipient) {
                          setErrors((prev) => ({ ...prev, recipient: undefined }));
                        }
                      }}
                      style={{
                        borderColor: active ? "#3F362E" : "#ECE0D0",
                        background: active ? "#3F362E" : "#FFFDF9",
                        color: active ? "#fff" : "#6E6359",
                      }}
                      className={`flex items-center gap-[8px] rounded-full border-[1.5px] py-[6px] text-[14px] font-bold ${
                        r.avatarColor ? "pl-[6px] pr-[14px]" : "px-[16px]"
                      }`}
                    >
                      {r.avatarColor && (
                        <span
                          style={{ background: r.avatarColor, color: r.avatarText }}
                          className="flex h-[26px] w-[26px] items-center justify-center rounded-full font-fredoka text-[13px] font-semibold"
                        >
                          {r.initial}
                        </span>
                      )}
                      {r.label}
                    </button>
                  );
                })}
              </div>
              {errors.recipient && (
                <p className="-mt-[14px] mb-[18px] text-sm text-[#D9583C]">
                  {errors.recipient}
                </p>
              )}

              {/* TIPO */}
              <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                TIPO
              </div>
              <div className="mb-[22px] flex flex-wrap gap-[9px]">
                {POST_TYPES.map((t) => {
                  const active = typeId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTypeId(t.id);
                        if (errors.type) {
                          setErrors((prev) => ({ ...prev, type: undefined }));
                        }
                      }}
                      style={{
                        background: t.bg,
                        color: t.text,
                        boxShadow: active ? "0 0 0 1.5px #3F362E" : undefined,
                      }}
                      className="rounded-full px-[16px] py-[8px] text-[13.5px] font-extrabold"
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
              {errors.type && (
                <p className="-mt-[14px] mb-[18px] text-sm text-[#D9583C]">
                  {errors.type}
                </p>
              )}

              {/* DESCRIPCIÓN */}
              <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                DESCRIPCIÓN
              </div>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) {
                    setErrors((prev) => ({ ...prev, description: undefined }));
                  }
                }}
                placeholder="Contá cómo le fue hoy…"
                className={`mb-[22px] min-h-[120px] w-full resize-y rounded-[14px] border-[1.5px] px-4 py-[14px] text-[15px] leading-relaxed text-[#3F362E] placeholder:text-[#B6A99B] ${
                  errors.description ? "border-[#D9583C]" : "border-[#EADFD0] bg-white"
                }`}
              />
              {errors.description && (
                <p className="-mt-[14px] text-sm text-[#D9583C]">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
