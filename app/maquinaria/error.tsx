"use client";

import Link from "next/link";

export default function CatalogError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#101313] px-5 text-[#eae9e2]">
      <div className="max-w-xl rounded-[26px] border border-[#5c6b5d] bg-[#1b2320] p-8 md:p-12">
        <p className="eyebrow">Catálogo</p>
        <h1 className="mt-4 text-3xl font-bold tracking-[-.05em]">
          No pudimos cargar la maquinaria.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#b4c3b1]">
          Tus filtros siguen en la dirección de la página. Puedes volver a intentarlo.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="action-primary text-sm">
            Intentar de nuevo
          </button>
          <Link href="/" className="action-secondary text-sm">
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
