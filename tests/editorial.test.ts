import test from "node:test";
import assert from "node:assert/strict";
import {
  editorialArticles,
  formatEditorialDate,
  getArticleBySlug,
  getPublishedArticles,
  validateEditorialCatalog,
} from "../lib/editorial.ts";

const article = editorialArticles[0];
const now = new Date("2026-09-30T12:00:00Z");

test("el inicio y los artículos excluyen borradores y publicaciones futuras", () => {
  const catalog = [
    { ...article, slug: "borrador", status: "draft" as const },
    { ...article, slug: "futuro", publishedAt: "2026-10-01" },
    { ...article, slug: "anterior", publishedAt: "2026-09-29" },
    { ...article, slug: "actual" },
  ];
  assert.deepEqual(
    getPublishedArticles(now, catalog).map((item) => item.slug),
    ["actual", "anterior"],
  );
  assert.equal(getArticleBySlug("borrador", now, catalog), undefined);
  assert.equal(getArticleBySlug("futuro", now, catalog), undefined);
  assert.equal(getArticleBySlug("actual", now, catalog)?.slug, "actual");
});

test("el orden es determinista para publicaciones de la misma fecha y no muta el catálogo", () => {
  const catalog = [
    { ...article, slug: "zeta" },
    { ...article, slug: "alfa" },
  ];
  assert.deepEqual(
    getPublishedArticles(now, catalog).map((item) => item.slug),
    ["alfa", "zeta"],
  );
  assert.equal(catalog[0].slug, "zeta");
});

test("las noticias necesitan fuente HTTPS y los slugs no pueden repetirse", () => {
  assert.throws(() => validateEditorialCatalog([{ ...article, type: "noticia", sources: [] }]));
  assert.throws(() =>
    validateEditorialCatalog([
      { ...article, sources: [{ title: "Fuente", url: "http://example.com" }] },
    ]),
  );
  assert.throws(() => validateEditorialCatalog([article, article]));
  assert.equal(
    validateEditorialCatalog([
      {
        ...article,
        type: "noticia",
        sources: [{ title: "Fuente", url: "https://example.com/noticia" }],
      },
    ]).length,
    1,
  );
});

test("el catálogo rechaza fechas imposibles y acciones hacia destinos externos", () => {
  assert.throws(() => validateEditorialCatalog([{ ...article, publishedAt: "2026-02-30" }]));
  for (const href of ["//example.com", "/\\example.com", "https://example.com"]) {
    assert.throws(() =>
      validateEditorialCatalog([{ ...article, action: { href, label: "Abrir" } }]),
    );
  }
});

test("la fecha editorial conserva el día al mostrarse en español", () => {
  assert.match(formatEditorialDate("2026-09-30"), /30.*septiembre.*2026/);
});
