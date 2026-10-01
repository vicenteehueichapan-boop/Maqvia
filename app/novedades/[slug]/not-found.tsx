import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <main className="container-shell min-h-[65vh] py-24">
      <p className="eyebrow">Novedades y guías</p>
      <h1 className="display mt-5 max-w-2xl text-4xl">Esta lectura no está disponible.</h1>
      <p className="muted-copy mt-5 max-w-xl">
        Puede que el enlace haya cambiado o que el artículo todavía no esté publicado.
      </p>
      <Link href="/novedades" className="action-primary mt-8">
        Ver todas las lecturas
      </Link>
    </main>
  );
}
