import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPublishedArticles } from "@/lib/editorial";
import { EditorialRail } from "@/components/editorial-rail";

export function HomeEditorial() {
  const articles = getPublishedArticles()
    .slice(0, 6)
    .map((article) => ({
      slug: article.slug,
      type: article.type,
      title: article.title,
      summary: article.summary,
      image: article.image,
      imageAlt: article.imageAlt,
      publishedAt: article.publishedAt,
    }));
  if (!articles.length) return null;
  return (
    <section aria-labelledby="editorial-title" className="editorial-section">
      <div className="container-shell py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">El espacio editorial de Maqvia</p>
            <h2 id="editorial-title" className="display mt-4 text-[clamp(2.3rem,4vw,4rem)]">
              Ideas para tu próxima obra.
            </h2>
            <p className="muted-copy mt-4 max-w-xl text-sm md:text-base">
              Guías prácticas, novedades del sector y mejoras de Maqvia. Información para elegir y
              presentar mejor tus equipos.
            </p>
          </div>
          <Link href="/novedades" className="action-secondary text-sm">
            Ver todas <ArrowUpRight aria-hidden="true" size={17} />
          </Link>
        </div>
        <EditorialRail articles={articles} />
        <p className="mt-6 text-xs text-[#9ca99f]">
          Fotografías ilustrativas. Las noticias indican su fecha y sus fuentes; las guías ofrecen
          orientación práctica.
        </p>
      </div>
    </section>
  );
}
