import ChildrenList from "@/app/components/ChildrenList";
import AddChildModal from "@/app/components/AddChildModal";

export default function KidsPage() {
  return (
    <div className="mx-auto w-full max-w-[880px] px-10 py-[34px] pb-20">
      <div className="mb-[22px] flex items-end justify-between gap-4">
        <div>
          <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
            GESTIÓN
          </div>
          <h1 className="m-0 font-fredoka text-[30px] font-semibold text-[#3F362E]">
            Niños
          </h1>
        </div>
        <AddChildModal />
      </div>

      <ChildrenList />
    </div>
  );
}
