"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { archiveChild } from "@/app/actions/children";

interface ChildActionsProps {
  childId: string;
  childName: string;
  onArchived?: () => void;
  onError?: (message: string) => void;
}

export default function ChildActions({ childId, childName, onArchived, onError }: ChildActionsProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    };
    if (open || confirming) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [open, confirming]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
    setConfirming(false);
  }, []);

  const handleArchiveClick = useCallback(() => {
    setOpen(false);
    setConfirming(true);
  }, []);

  const handleConfirmArchive = useCallback(async () => {
    setArchiving(true);
    try {
      await archiveChild(childId);
      setConfirming(false);
      onArchived?.();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error al archivar";
      onError?.(message);
      setConfirming(false);
    } finally {
      setArchiving(false);
    }
  }, [childId, onArchived, onError]);

  const handleCancelConfirm = useCallback(() => {
    setConfirming(false);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="rounded-full p-1 text-[#A89A8B] transition-colors hover:text-[#3F362E]"
        aria-label="Acciones"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-[12px] border border-[#ECE0D0] bg-white shadow-lg">
          <button
            type="button"
            onClick={handleArchiveClick}
            className="w-full rounded-[12px] px-3 py-2 text-left text-[13px] font-bold text-[#D9583C] hover:bg-[#FFF3F0]"
          >
            Archivar
          </button>
        </div>
      )}

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancelConfirm();
          }}
        >
          <div className="w-full max-w-[360px] rounded-[20px] border border-[#ECE0D0] bg-[#FBF4EC] p-6 shadow-xl">
            <p className="mb-4 text-[15px] font-semibold text-[#3F362E]">
              ¿Archivar a {childName}?
            </p>
            <p className="mb-6 text-[13px] text-[#94887B]">
              El niño desaparecerá de la lista de niños activos.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelConfirm}
                className="flex-1 rounded-[12px] border border-[#ECE0D0] bg-white px-4 py-2 text-[14px] font-bold text-[#6E6359]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                disabled={archiving}
                className="flex-1 rounded-[12px] bg-[#D9583C] px-4 py-2 text-[14px] font-bold text-white disabled:opacity-50"
              >
                {archiving ? "Archivando..." : "Archivar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
