"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Room } from "@/lib/rooms";
import { updateChild } from "@/app/actions/children";

interface EditChildModalProps {
  child: {
    id: string;
    fullName: string;
    birthDate: string;
    roomId: string | null;
    medicalNotes: string | null;
    allergies: string[];
  };
  rooms: Room[];
  onUpdated?: () => void;
  onError?: (message: string) => void;
}

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

function normalizeAllergies(s: string): string {
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join(", ");
}

function validateDate(value: string): string | undefined {
  if (!value.trim()) return "La fecha es obligatoria";
  if (value.length < 10) return "Formato: dd/mm/aaaa";
  const parts = value.split("/");
  if (parts.length !== 3) return "Formato: dd/mm/aaaa";
  const [dd, mm, yyyy] = parts;
  const d = parseInt(dd, 10);
  const m = parseInt(mm, 10);
  const y = parseInt(yyyy, 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return "Fecha inválida";
  if (m < 1 || m > 12) return "Mes inválido (1-12)";
  if (d < 1) return "Día inválido";
  const daysInMonth = new Date(y, m, 0).getDate();
  if (d > daysInMonth) return `Día inválido para el mes (máx. ${daysInMonth})`;
  return undefined;
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

function isoToDdmmyyyy(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

export default function EditChildModal({ child, rooms, onUpdated, onError }: EditChildModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(child.fullName);
  const [birthDate, setBirthDate] = useState(isoToDdmmyyyy(child.birthDate));
  const [room, setRoom] = useState(child.roomId || "");
  const [allergies, setAllergies] = useState(child.allergies.join(", "));
  const [notes, setNotes] = useState(child.medicalNotes || "");
  const [errors, setErrors] = useState<{
    name?: string;
    birthDate?: string;
    room?: string;
  }>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBirthDate(formatDateMask(e.target.value));
      if (errors.birthDate) setErrors((prev) => ({ ...prev, birthDate: undefined }));
    },
    [errors.birthDate]
  );

  const handleDateBlur = useCallback(() => {
    const err = validateDate(birthDate);
    if (err) setErrors((prev) => ({ ...prev, birthDate: err }));
  }, [birthDate]);

  const handleNameBlur = useCallback(() => {
    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: "El nombre es obligatorio" }));
    } else if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  }, [name, errors.name]);

  const handleAllergiesBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setAllergies(normalizeAllergies(e.target.value));
    },
    []
  );

  const handleSave = useCallback(async () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    const dateErr = validateDate(birthDate);
    if (dateErr) {
      newErrors.birthDate = dateErr;
    }

    if (!room) {
      newErrors.room = "La sala es obligatoria";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      await updateChild({
        childId: child.id,
        fullName: name.trim(),
        birthDate,
        roomId: room,
        allergies,
        medicalNotes: notes,
      });

      setErrors({});
      setOpen(false);
      onUpdated?.();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error al guardar";
      setSaveError(message);
      onError?.(message);
    } finally {
      setSaving(false);
    }
  }, [child.id, name, birthDate, room, allergies, notes, onUpdated, onError]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    setErrors({});
    setSaveError(null);
    setName(child.fullName);
    setBirthDate(isoToDdmmyyyy(child.birthDate));
    setRoom(child.roomId || "");
    setAllergies(child.allergies.join(", "));
    setNotes(child.medicalNotes || "");
  }, [child]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setErrors({});
    setSaveError(null);
    setName(child.fullName);
    setBirthDate(isoToDdmmyyyy(child.birthDate));
    setRoom(child.roomId || "");
    setAllergies(child.allergies.join(", "));
    setNotes(child.medicalNotes || "");
  }, [child]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-[12px] border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] px-4 py-[9px] text-[14px] font-bold text-[#6E6359]"
      >
        Editar
      </button>

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
            <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-[20px]">
              <button
                type="button"
                onClick={handleCancel}
                className="text-[15px] font-bold text-[#94887B]"
              >
                Cancelar
              </button>
              <span className="font-fredoka text-[18px] font-semibold text-[#3F362E]">
                Editar niño
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="text-[15px] font-extrabold text-[#D9583C] disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>

            <div className="px-[26px] py-[24px]">
              {saveError && (
                <p className="mb-[18px] rounded-[10px] border border-[#D9583C] bg-[#FFF3F0] px-4 py-3 text-sm text-[#D9583C]">
                  {saveError}
                </p>
              )}

              <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                NOMBRE COMPLETO
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
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

              <div className="mb-[18px] flex gap-[14px]">
                <div className="flex-1">
                  <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                    FECHA DE NACIMIENTO
                  </label>
                  <input
                    type="text"
                    value={birthDate}
                    onChange={handleDateChange}
                    onBlur={handleDateBlur}
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
                        <option key={r.id} value={r.id}>
                          {r.name}
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
