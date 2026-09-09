"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { createPost } from "@/app/actions/posts";

type Recipient = {
  id: string;
  label: string;
  avatarColor?: string;
  avatarText?: string;
  initial?: string;
};

const RECIPIENTS: Recipient[] = [
  { id: "toda-la-sala", label: "Toda la sala" },
];

type PostType = { id: string; label: string; bg: string; text: string };

const POST_TYPES: PostType[] = [
  { id: "meal", label: "Comida", bg: "#9A7B1E", text: "#fff" },
  { id: "nap", label: "Siesta", bg: "#E7DCF6", text: "#7B5FC0" },
  { id: "activity", label: "Actividad", bg: "#2E89A6", text: "#fff" },
  { id: "achievement", label: "Logro", bg: "#CFEBD8", text: "#3E9B6C" },
  { id: "announcement", label: "Anuncio", bg: "#CCD8F4", text: "#4E72C8" },
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/bmp",
];

const MIN_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

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

function CameraIcon() {
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
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="mr-2 h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

export default function CreatePostModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    title?: string;
    recipient?: string;
    type?: string;
    description?: string;
    image?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setTitle("");
    setRecipientId("");
    setTypeId("");
    setDescription("");
    setSelectedImage(null);
    setImagePreview(null);
    setIsSubmitting(false);
  }, []);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image:
            "Formato no válido. Aceptados: jpg, png, webp, heic, gif, bmp",
        }));
        return;
      }

      if (file.size < MIN_IMAGE_SIZE || file.size > MAX_IMAGE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          image: "La imagen debe tener entre 5MB y 10MB",
        }));
        return;
      }

      setErrors((prev) => ({ ...prev, image: undefined }));
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    },
    []
  );

  const handleRemoveImage = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [imagePreview]);

  const handlePublish = useCallback(async () => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = "El título es obligatorio";
    }

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

    setIsSubmitting(true);
    setErrors({});

    try {
      await createPost({
        type: typeId,
        title: title.trim(),
        body: description.trim(),
        image: selectedImage,
      });

      setErrors({});
      setOpen(false);
      setTitle("");
      setRecipientId("");
      setTypeId("");
      setDescription("");
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al crear la publicación";
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setIsSubmitting(false);
    }
  }, [title, recipientId, typeId, description, selectedImage]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="mb-[18px] flex w-full items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-3 py-3 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.75)]"
      >
        <PlusIcon />
        Nueva publicación
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-6 py-10"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) handleCancel();
          }}
        >
          <div className="w-full max-w-[580px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]">
            <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-[20px]">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="text-[15px] font-bold text-[#94887B] disabled:opacity-50"
              >
                Cancelar
              </button>
              <span className="font-fredoka text-[18px] font-semibold text-[#3F362E]">
                Nueva publicación
              </span>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting}
                className="text-[15px] font-extrabold text-[#D9583C] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <SpinnerIcon />
                    Publicando…
                  </span>
                ) : (
                  "Publicar"
                )}
              </button>
            </div>

            <div className="px-[26px] py-[24px]">
              {errors.general && (
                <div className="mb-[18px] rounded-lg border border-[#D9583C]/20 bg-[#D9583C]/5 px-4 py-3 text-sm text-[#D9583C]">
                  {errors.general}
                </div>
              )}

              {/* TÍTULO */}
              <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                TÍTULO
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                placeholder="Título de la publicación…"
                className={`mb-[22px] w-full rounded-[14px] border-[1.5px] px-4 py-[10px] text-[15px] leading-relaxed text-[#3F362E] placeholder:text-[#B6A99B] ${
                  errors.title ? "border-[#D9583C]" : "border-[#EADFD0] bg-white"
                }`}
              />
              {errors.title && (
                <p className="-mt-[14px] mb-[18px] text-sm text-[#D9583C]">
                  {errors.title}
                </p>
              )}

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
                          setErrors((prev) => ({
                            ...prev,
                            recipient: undefined,
                          }));
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
                          style={{
                            background: r.avatarColor,
                            color: r.avatarText,
                          }}
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

              {/* FOTOS */}
              <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                FOTOS
              </div>
              <div className="mb-[22px]">
                {!selectedImage ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-[#EADFD0] bg-white px-5 py-[12px] text-[14px] font-bold text-[#94887B] hover:border-[#D9583C]/40 hover:text-[#D9583C]"
                  >
                    <CameraIcon />
                    Agregar foto
                  </button>
                ) : (
                  <div className="relative inline-block">
                    <Image
                      src={imagePreview || ""}
                      alt="Preview"
                      width={128}
                      height={128}
                      className="h-32 w-32 rounded-[14px] border-[1.5px] border-[#EADFD0] object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#D9583C] text-white shadow-sm hover:bg-[#C44A30]"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/gif,image/bmp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {errors.image && (
                  <p className="mt-[8px] text-sm text-[#D9583C]">
                    {errors.image}
                  </p>
                )}
              </div>

              {/* DESCRIPCIÓN */}
              <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                DESCRIPCIÓN
              </div>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) {
                    setErrors((prev) => ({
                      ...prev,
                      description: undefined,
                    }));
                  }
                }}
                placeholder="Contá cómo le fue hoy…"
                className={`mb-[22px] min-h-[120px] w-full resize-y rounded-[14px] border-[1.5px] px-4 py-[14px] text-[15px] leading-relaxed text-[#3F362E] placeholder:text-[#B6A99B] ${
                  errors.description
                    ? "border-[#D9583C]"
                    : "border-[#EADFD0] bg-white"
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
