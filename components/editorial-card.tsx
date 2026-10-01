import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { EditorialArticle } from "@/lib/editorial";
import { formatEditorialDate } from "@/lib/editorial-format";

export type EditorialSummary = Pick<
  EditorialArticle,
  "slug" | "type" | "title" | "summary" | "image" | "imageAlt" | "publishedAt"
>;

export const editorialLabels = { guia: "Guía práctica", producto: "En Maqvia", noticia: "Sector" };

export function EditorialCard({ article }: { article: EditorialSummary }) {
  return (
    <article className="editorial-card h-full">
      <Link href={`/novedades/${article.slug}`} className="group flex h-full flex-col">
        <div className="relative aspect-[1.6] overflow-hidden rounded-2xl bg-[#26332b]">
          <img
            src={article.image}
            alt={article.imageAlt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transition-none"
          />
          <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-[#101a15]/90 px-3 py-1.5 text-xs font-semibold text-[#d4e6c6] backdrop-blur-md">
            {editorialLabels[article.type]}
          </span>
        </div>
        <div className="flex flex-1 flex-col pt-5">
          <time dateTime={article.publishedAt} className="text-xs text-[#a5b1a7]">
            {formatEditorialDate(article.publishedAt)}
          </time>
          <h3 className="mt-3 text-xl font-semibold leading-snug tracking-[-.025em] text-[#eef2e9] group-hover:text-[#cfe5b5]">
            {article.title}
          </h3>
          <p className="muted-copy mt-3 text-sm leading-relaxed">{article.summary}</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-[#d5e5c5]">
            Leer artículo <ArrowUpRight aria-hidden="true" size={16} />
          </span>
        </div>
      </Link>
    </article>
  );
}
