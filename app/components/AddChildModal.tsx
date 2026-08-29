"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { rooms } from "@/app/lib/children";

// ─── Helpers ────────────────────────────────────────────────────────────────

function capitalizeWords(s: string): string {
  return s
    .replace(/[^a-zA-ZÀ-ÿ\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function normalizeAllergies(s: string): string {
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join(", ");
}

function isValidDate(dd: string, mm: string, yyyy: string): boolean {
  const d = parseInt(dd, 10);
  const m = parseInt(mm, 10);
  const y = parseInt(yyyy, 10);
  if (m < 1 || m > 12) return false;
  if (d < 1) return false;
  const daysInMonth = new Date(y, m, 0).getDate();
  if (d > daysInMonth) return false;
  return true;
}

function formatDateMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  let result = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) result += "/";
    result += digits[i];
  }
  return result;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AddChildModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [room, setRoom] = useState("");
  const [allergies, setAllergies] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    birthDate?: string;
    room?: string;
  }>({});
  const modalRef = useRef<HTMLDivElement>(null);

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
    },
    []
  );

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBirthDate(formatDateMask(e.target.value));
    },
    []
  );

  const handleAllergiesBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setAllergies(normalizeAllergies(e.target.value));
    },
    []
  );

  const handleSave = useCallback(() => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    const dateParts = birthDate.split("/");
    if (!birthDate.trim()) {
      newErrors.birthDate = "La fecha es obligatoria";
    } else if (birthDate.length < 10) {
      newErrors.birthDate = "Formato: dd/mm/aaaa";
    } else if (!isValidDate(dateParts[0], dateParts[1], dateParts[2])) {
      newErrors.birthDate = "Fecha inválida";
    }

    if (!room) {
      newErrors.room = "La sala es obligatoria";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setOpen(false);
    setName("");
    setBirthDate("");
    setRoom("");
    setAllergies("");
    setNotes("");
  }, [name, birthDate, room]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    setErrors({});
    setName("");
    setBirthDate("");
    setRoom("");
    setAllergies("");
    setNotes("");
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setErrors({});
  }, []);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-[18px] py-[11px] text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.7)]"
      >
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
        Agregar niño
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-6 py-10"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancel();
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-[520px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]"
          >
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
                Agregar niño
              </span>
              <button
                type="button"
                onClick={handleSave}
                className="text-[15px] font-extrabold text-[#D9583C]"
              >
                Guardar
              </button>
            </div>

            {/* Form fields */}
            <div className="px-[26px] py-[24px]">
              {/* Nombre completo */}
              <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                NOMBRE COMPLETO
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Ej. Martina López"
                className={`mb-[18px] w-full rounded-[14px] border bg-[length:100%_100%] px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] ${
                  errors.name
                    ? "border-[#D9583C]"
                    : "border-[#EADFD0] bg-white"
                }`}
              />
              {errors.name && (
                <p className="-mt-[14px] mb-[18px] text-sm text-[#D9583C]">
                  {errors.name}
                </p>
              )}

              {/* Fecha de nacimiento + Sala */}
              <div className="mb-[18px] flex gap-[14px]">
                <div className="flex-1">
                  <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                    FECHA DE NACIMIENTO
                  </label>
                  <input
                    type="text"
                    value={birthDate}
                    onChange={handleDateChange}
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                    className={`w-full rounded-[14px] border px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] ${
                      errors.birthDate
                        ? "border-[#D9583C]"
                        : "border-[#EADFD0] bg-white"
                    }`}
                  />
                  {errors.birthDate && (
                    <p className="mt-1 text-sm text-[#D9583C]">
                      {errors.birthDate}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                    SALA
                  </label>
                  <div className="relative">
                    <select
                      value={room}
                      onChange={(e) => {
                        setRoom(e.target.value);
                        if (errors.room) setErrors((prev) => ({ ...prev, room: undefined }));
                      }}
                      className={`w-full appearance-none rounded-[14px] border px-4 py-[13px] pr-10 text-[15px] font-bold text-[#3F362E] ${
                        errors.room
                          ? "border-[#D9583C]"
                          : "border-[#EADFD0] bg-white"
                      } ${!room ? "text-[#B6A99B]" : ""}`}
                    >
                      <option value="" disabled>
                        Seleccionar sala
                      </option>
                      {rooms.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B0A290]">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                  {errors.room && (
                    <p className="mt-1 text-sm text-[#D9583C]">{errors.room}</p>
                  )}
                </div>
              </div>

              {/* Alergias */}
              <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                ALERGIAS (ETIQUETAS)
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                onBlur={handleAllergiesBlur}
                placeholder="Ej. Maní, Lactosa"
                className="mb-[18px] w-full rounded-[14px] border border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]"
              />

              {/* Notas médicas */}
              <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                NOTAS MÉDICAS
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Indicaciones, medicación, contactos…"
                className="min-h-[90px] w-full resize-y rounded-[14px] border border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] leading-relaxed text-[#3F362E] placeholder:text-[#B6A99B]"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
