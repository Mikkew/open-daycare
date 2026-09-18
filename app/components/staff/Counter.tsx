"use client";

import { useState } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-4 rounded-[18px] border border-[#ECE0D0] bg-[#FFFDF9] px-6 py-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)]">
      <button
        onClick={() => setCount((c) => c - 1)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2937A] font-fredoka text-xl font-semibold text-white transition hover:bg-[#E0654A]"
        aria-label="Decrementar contador"
      >
        −
      </button>
      <span className="min-w-[60px] text-center font-fredoka text-[28px] font-semibold text-[#3F362E]">
        {count}
      </span>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2937A] font-fredoka text-xl font-semibold text-white transition hover:bg-[#E0654A]"
        aria-label="Incrementar contador"
      >
        +
      </button>
    </div>
  );
};

export default Counter;
