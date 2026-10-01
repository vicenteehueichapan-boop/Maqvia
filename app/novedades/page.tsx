import { EditorialCard } from "@/components/editorial-card";
import { SiteFooter } from "@/components/site-footer";
import { getPublishedArticles } from "@/lib/editorial";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Novedades y guías | Maqvia",
  description: "Guías para buscar y publicar maquinaria, novedades del sector y mejoras de Maqvia.",
};

export default function NovedadesPage() {
  const articles = getPublishedArticles();
  return (
    <main className="min-h-screen">
      <section className="editorial-section">
        <div className="container-shell py-20 md:py-24">
          <p className="eyebrow">Novedades y guías</p>
          <h1 className="display mt-5 max-w-3xl text-[clamp(2.8rem,5vw,5rem)]">
            Información que ayuda a avanzar.
          </h1>
          <p className="muted-copy mt-6 max-w-xl">
            Consejos para buscar equipos, presentar tu maquinaria y conocer lo nuevo. Cada noticia
            incluye sus fuentes; las guías se identifican como orientación práctica.
          </p>
          {articles.length ? (
            <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <EditorialCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <p className="muted-copy mt-12">Estamos preparando las primeras lecturas.</p>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
