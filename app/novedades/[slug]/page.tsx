import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { EditorialCard, editorialLabels } from "@/components/editorial-card";
import { formatEditorialDate, getArticleBySlug, getPublishedArticles } from "@/lib/editorial";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const article = getArticleBySlug((await params).slug);
  return article
    ? { title: `${article.title} | Maqvia`, description: article.summary }
    : { title: "Artículo no encontrado | Maqvia" };
}

export default async function ArticlePage({ params }: Props) {
  const article = getArticleBySlug((await params).slug);
  if (!article) notFound();
  const related = getPublishedArticles()
    .filter((item) => item.slug !== article.slug)
    .slice(0, 2);
  return (
    <main className="min-h-screen">
      <article className="container-shell pb-16 pt-14 md:pt-20">
        <Link
          href="/novedades"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-[#bdcbb8] hover:text-white"
        >
          <ArrowLeft aria-hidden="true" size={17} /> Todas las lecturas
        </Link>
        <header className="mx-auto mt-8 max-w-3xl">
          <p className="eyebrow">{editorialLabels[article.type]}</p>
          <h1 className="display mt-4 text-[clamp(2.3rem,4.5vw,4rem)]">{article.title}</h1>
          <p className="muted-copy mt-6 text-lg">{article.summary}</p>
          <p className="mt-5 text-xs text-[#a7b3a5]">
            {article.author} ·{" "}
            <time dateTime={article.publishedAt}>{formatEditorialDate(article.publishedAt)}</time>
          </p>
        </header>
        <figure className="mx-auto mt-9 max-w-4xl">
          <img
            src={article.image}
            alt={article.imageAlt}
            className="aspect-[1.8] w-full rounded-2xl object-cover"
          />
          <figcaption className="mt-3 text-xs text-[#98a596]">
            Imagen ilustrativa. No representa una publicación disponible para arriendo.
          </figcaption>
        </figure>
        <div className="mx-auto mt-10 max-w-3xl">
          {article.sections.map((section) => (
            <section key={section.heading} className="mt-8">
              <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} className="mt-4 text-base leading-8 text-[#bfc9bf]">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
          {article.sources.length > 0 && (
            <aside
              className="mt-10 border-t border-[#3a493c] pt-6"
              aria-label="Fuentes del artículo"
            >
              <h2 className="text-lg font-semibold">Fuentes para profundizar</h2>
              <ul className="mt-4 space-y-3">
                {article.sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#cde3b6] underline underline-offset-4"
                    >
                      {source.title}
                      <ArrowUpRight aria-hidden="true" size={16} />
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
          {article.action && (
            <div className="mt-10 rounded-2xl border border-[#43533d] bg-[#1a251d] p-6">
              <p className="mb-4 text-sm text-[#bccabb]">Lleva esta lectura a tu próximo paso.</p>
              <Link href={article.action.href} className="action-primary text-sm">
                {article.action.label}
                <ArrowUpRight aria-hidden="true" size={17} />
              </Link>
            </div>
          )}
        </div>
      </article>
      {related.length > 0 && (
        <section className="container-shell pb-16" aria-labelledby="related-title">
          <h2 id="related-title" className="text-2xl font-semibold">
            Sigue explorando
          </h2>
          <div className="mt-7 grid max-w-4xl gap-8 md:grid-cols-2">
            {related.map((item) => (
              <EditorialCard key={item.slug} article={item} />
            ))}
          </div>
        </section>
      )}
      <SiteFooter />
    </main>
  );
}
