"use client";

import Link from "next/link";

export default function DetailError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#101313] px-5 text-[#eae9e2]">
      <div className="max-w-xl rounded-[26px] border border-[#5c6b5d] bg-[#1b2320] p-8 md:p-12">
        <p className="eyebrow">Publicación</p>
        <h1 className="mt-4 text-3xl font-bold tracking-[-.05em]">No pudimos abrir esta ficha.</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#b4c3b1]">
          El catálogo sigue disponible. Intenta cargar la ficha otra vez.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="action-primary text-sm">
            Intentar de nuevo
          </button>
          <Link href="/maquinaria" className="action-secondary text-sm">
            Volver al catálogo
          </Link>
        </div>
      </div>
    </main>
  );
}
