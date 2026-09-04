import { Suspense } from "react";
import ActivateForm from "./ActivateForm";

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-[40px] py-[40px]">
      <div className="w-full max-w-[440px] text-center text-[15px] text-[#94887B]">
        Cargando...
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-[40px] py-[40px]">
      <Suspense fallback={<LoadingFallback />}>
        <ActivateForm />
      </Suspense>
    </div>
  );
}
