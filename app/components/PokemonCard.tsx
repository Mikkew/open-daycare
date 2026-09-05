"use client";

import Image from "next/image";
import { useState } from "react";

interface PokemonStats {
  name: string;
  id: number;
  image: string;
  types: string[];
  height: number;
  weight: number;
  abilities: string[];
}

const typeColors: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-300",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-yellow-700",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-600",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
  dark: "bg-gray-700",
};

const PokemonCard = () => {
  const [pokemonId, setPokemonId] = useState(1);
  const [pokemon, setPokemon] = useState<PokemonStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPokemon = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!res.ok) throw new Error(`Pokemon #${id} no encontrado`);
      const data = await res.json();
      setPokemon({
        name: data.name,
        id: data.id,
        image: data.sprites.other?.["official-artwork"]?.front_default || data.sprites.front_default,
        types: data.types.map((t: { type: { name: string } }) => t.type.name),
        height: data.height,
        weight: data.weight,
        abilities: data.abilities.map((a: { ability: { name: string } }) => a.ability.name),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setPokemon(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (pokemonId > 1) {
      const newId = pokemonId - 1;
      setPokemonId(newId);
      fetchPokemon(newId);
    }
  };

  const handleNext = () => {
    const newId = pokemonId + 1;
    setPokemonId(newId);
    fetchPokemon(newId);
  };

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-[#ECE0D0] bg-[#FFFDF9] p-8 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)]">
      <div className="flex w-full items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={pokemonId <= 1 || loading}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F2937A] font-fredoka text-2xl font-semibold text-white transition hover:bg-[#E0654A] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Pokemon anterior"
        >
          ←
        </button>
        <h2 className="font-fredoka text-2xl font-semibold text-[#3F362E]">
          #{pokemonId}
        </h2>
        <button
          onClick={handleNext}
          disabled={loading}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F2937A] font-fredoka text-2xl font-semibold text-white transition hover:bg-[#E0654A] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Siguiente Pokemon"
        >
          →
        </button>
      </div>

      {loading && (
        <div className="py-8 font-fredoka text-xl text-[#3F362E]">
          Cargando...
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-100 px-6 py-4 font-fredoka text-lg text-red-700">
          {error}
        </div>
      )}

      {pokemon && !loading && (
        <div className="flex w-full flex-col items-center gap-4">
          <Image
            src={pokemon.image}
            alt={pokemon.name}
            width={192}
            height={192}
            className="h-48 w-48 object-contain"
          />
          <h3 className="font-fredoka text-3xl font-semibold capitalize text-[#3F362E]">
            {pokemon.name}
          </h3>
          <div className="flex gap-2">
            {pokemon.types.map((type) => (
              <span
                key={type}
                className={`rounded-full px-4 py-1 font-fredoka text-sm font-semibold text-white ${typeColors[type] || "bg-gray-400"}`}
              >
                {type}
              </span>
            ))}
          </div>
          <div className="grid w-full grid-cols-2 gap-4">
            <div className="rounded-lg bg-[#F7F3ED] px-4 py-3 text-center">
              <p className="font-fredoka text-sm text-[#8B7D6B]">Altura</p>
              <p className="font-fredoka text-xl font-semibold text-[#3F362E]">
                {pokemon.height / 10} m
              </p>
            </div>
            <div className="rounded-lg bg-[#F7F3ED] px-4 py-3 text-center">
              <p className="font-fredoka text-sm text-[#8B7D6B]">Peso</p>
              <p className="font-fredoka text-xl font-semibold text-[#3F362E]">
                {pokemon.weight / 10} kg
              </p>
            </div>
          </div>
          <div className="w-full rounded-lg bg-[#F7F3ED] px-4 py-3">
            <p className="mb-2 font-fredoka text-sm text-[#8B7D6B]">Habilidades</p>
            <div className="flex flex-wrap gap-2">
              {pokemon.abilities.map((ability) => (
                <span
                  key={ability}
                  className="rounded-full bg-[#E8DFD4] px-3 py-1 font-fredoka text-sm capitalize text-[#3F362E]"
                >
                  {ability.replace("-", " ")}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {!pokemon && !loading && !error && (
        <button
          onClick={() => fetchPokemon(pokemonId)}
          className="rounded-full bg-[#F2937A] px-8 py-3 font-fredoka text-lg font-semibold text-white transition hover:bg-[#E0654A]"
        >
          Buscar Pokemon #{pokemonId}
        </button>
      )}
    </div>
  );
};

export default PokemonCard;
