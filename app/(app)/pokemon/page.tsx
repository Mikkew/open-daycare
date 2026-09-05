import PokemonCard from "@/app/components/PokemonCard";

export default function PokemonPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F6F1] p-8">
      <div className="w-full max-w-lg">
        <h1 className="mb-6 text-center font-fredoka text-4xl font-bold text-[#3F362E]">
          Pokedex
        </h1>
        <PokemonCard />
      </div>
    </div>
  );
}
