"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createRoom, renameRoom, deleteRoom } from "@/app/actions/rooms";
import { useRouter } from "next/navigation";

interface RoomManagerProps {
  rooms: { id: string; name: string; activeChildren: number }[];
}

export default function RoomManager({ rooms }: RoomManagerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "create" | "edit">("idle");
  const [editingRoom, setEditingRoom] = useState<{ id: string; name: string } | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((mode === "create" || mode === "edit") && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  const openCreate = useCallback(() => {
    setMode("create");
    setName("");
    setError(null);
  }, []);

  const openEdit = useCallback((id: string, currentName: string) => {
    setMode("edit");
    setEditingRoom({ id, name: currentName });
    setName(currentName);
    setError(null);
  }, []);

  const close = useCallback(() => {
    setMode("idle");
    setEditingRoom(null);
    setName("");
    setError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setWorking(true);
    setError(null);

    try {
      if (mode === "create") {
        await createRoom(name.trim());
      } else if (mode === "edit" && editingRoom) {
        await renameRoom(editingRoom.id, name.trim());
      }
      close();
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error al guardar";
      setError(message);
    } finally {
      setWorking(false);
    }
  }, [mode, name, editingRoom, close, router]);

  const openDeleteConfirm = useCallback((id: string) => {
    setConfirmingDelete(id);
    setDeleteError(null);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setConfirmingDelete(null);
    setDeleteError(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!confirmingDelete) return;
    setWorking(true);
    setDeleteError(null);

    try {
      await deleteRoom(confirmingDelete);
      setConfirmingDelete(null);
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error al eliminar";
      setDeleteError(message);
    } finally {
      setWorking(false);
    }
  }, [confirmingDelete, router]);

  return (
    <>
      <div className="overflow-hidden rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9]">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="flex items-center justify-between border-b border-[#F0E6D8] px-[18px] py-[14px] last:border-b-0"
          >
            <div>
              <span className="text-[15px] font-bold text-[#3F362E]">{room.name}</span>
              <span className="ml-3 text-[13px] text-[#A89A8B]">
                {room.activeChildren} {room.activeChildren === 1 ? "niño" : "niños"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(room.id, room.name)}
                className="rounded-[10px] border border-[#ECE0D0] px-3 py-[6px] text-[13px] font-bold text-[#6E6359] hover:bg-[#FBF4EC]"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => openDeleteConfirm(room.id)}
                className="rounded-[10px] border border-[#D9583C] px-3 py-[6px] text-[13px] font-bold text-[#D9583C] hover:bg-[#FFF3F0]"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={openCreate}
          className="rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-[18px] py-[11px] text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.7)]"
        >
          Agregar sala
        </button>
      </div>

      {(mode === "create" || mode === "edit") && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-6 py-10"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-[400px] rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]">
            <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-[20px]">
              <button
                type="button"
                onClick={close}
                className="text-[15px] font-bold text-[#94887B]"
              >
                Cancelar
              </button>
              <span className="font-fredoka text-[18px] font-semibold text-[#3F362E]">
                {mode === "create" ? "Agregar sala" : "Editar sala"}
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={working}
                className="text-[15px] font-extrabold text-[#D9583C] disabled:opacity-50"
              >
                {working ? "Guardando..." : "Guardar"}
              </button>
            </div>
            <div className="px-[26px] py-[24px]">
              {error && (
                <p className="mb-[14px] rounded-[10px] border border-[#D9583C] bg-[#FFF3F0] px-4 py-3 text-sm text-[#D9583C]">
                  {error}
                </p>
              )}
              <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                NOMBRE DE LA SALA
              </label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Ej. Soles"
                className={`w-full rounded-[14px] border px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] ${
                  error ? "border-[#D9583C]" : "border-[#EADFD0] bg-white"
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteConfirm();
          }}
        >
          <div className="w-full max-w-[360px] rounded-[20px] border border-[#ECE0D0] bg-[#FBF4EC] p-6 shadow-xl">
            <p className="mb-4 text-[15px] font-semibold text-[#3F362E]">
              ¿Eliminar esta sala?
            </p>
            <p className="mb-6 text-[13px] text-[#94887B]">
              Esta acción no se puede deshacer.
            </p>
            {deleteError && (
              <p className="mb-4 rounded-[10px] border border-[#D9583C] bg-[#FFF3F0] px-4 py-3 text-sm text-[#D9583C]">
                {deleteError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                className="flex-1 rounded-[12px] border border-[#ECE0D0] bg-white px-4 py-2 text-[14px] font-bold text-[#6E6359]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={working}
                className="flex-1 rounded-[12px] bg-[#D9583C] px-4 py-2 text-[14px] font-bold text-white disabled:opacity-50"
              >
                {working ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
