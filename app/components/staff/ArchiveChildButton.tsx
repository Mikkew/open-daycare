"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { archiveChild } from "@/app/actions/children";

interface ArchiveButtonProps {
  childId: string;
  onArchived?: () => void;
}

export default function ArchiveButton({ childId, onArchived }: ArchiveButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const router = useRouter();

  const handleArchive = async () => {
    setArchiving(true);
    try {
      await archiveChild(childId);
      onArchived?.();
      router.push("/kids");
    } catch {
    } finally {
      setArchiving(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="inline-flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-[12px] border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] px-4 py-[9px] text-[14px] font-bold text-[#6E6359]"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleArchive}
          disabled={archiving}
          className="rounded-[12px] bg-[#D9583C] px-4 py-[9px] text-[14px] font-bold text-white disabled:opacity-50"
        >
          {archiving ? "Archivando..." : "Confirmar"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded-[12px] border-[1.5px] border-[#D9583C] bg-[#FFFDF9] px-4 py-[9px] text-[14px] font-bold text-[#D9583C]"
    >
      Archivar
    </button>
  );
}
