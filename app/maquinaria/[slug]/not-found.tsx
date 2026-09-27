import Link from "next/link";

export default function DetailNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#101313] px-5 text-[#eae9e2]">
      <div className="max-w-xl rounded-[26px] border border-[#5c6b5d] bg-[#1b2320] p-8 md:p-12">
        <p className="eyebrow">Publicación no encontrada</p>
        <h1 className="mt-4 text-3xl font-bold tracking-[-.05em]">
          Esta ficha no está disponible.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#b4c3b1]">
          Puede haber cambiado de dirección o dejado de estar publicada.
        </p>
        <Link href="/maquinaria" className="action-primary mt-7 text-sm">
          Explorar maquinaria
        </Link>
      </div>
    </main>
  );
}
