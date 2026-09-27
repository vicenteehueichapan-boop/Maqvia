import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin, Search } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { CatalogGrid } from "@/components/catalog-grid";
import { CatalogSavedActions } from "@/components/catalog-saved-actions";
import { RouterGetForm } from "@/components/router-get-form";
import { ListingCard } from "@/components/listing-card";
import { getChatGPTUser, chatGPTSignInPath } from "@/app/chatgpt-auth";
import { searchEquipment } from "@/lib/marketplace";
import { demoEquipment, providerForDemoEquipment } from "@/lib/demo-fixtures";
import { demoListing, realListing } from "@/lib/listing-view";
export const dynamic = "force-dynamic";
const communes = [
  "Santiago",
  "Maipú",
  "Pudahuel",
  "Quilicura",
  "Las Condes",
  "Puente Alto",
  "San Bernardo",
  "Cerrillos",
];
const categories = [
  "Movimiento de tierra",
  "Carga y traslado",
  "Nivelación",
  "Servicio con maquinaria",
];
export default async function Buscar({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; comuna?: string; category?: string }>;
}) {
  const p = await searchParams;
  const q = (p.q || "").trim().slice(0, 100),
    comuna = (p.comuna || "").trim().slice(0, 80),
    category = (p.category || "").trim().slice(0, 80);
  let rows: Awaited<ReturnType<typeof searchEquipment>> = [];
  let error = false;
  try {
    rows = await searchEquipment(q, comuna, category);
  } catch (e) {
    console.error("search_error", e);
    error = true;
  }
  const user = await getChatGPTUser();
  const signInUrl = chatGPTSignInPath(
    "/maquinaria?q=" +
      encodeURIComponent(q) +
      "&comuna=" +
      encodeURIComponent(comuna) +
      "&category=" +
      encodeURIComponent(category),
  );
  const normalized = q.toLocaleLowerCase("es-CL");
  const examples = demoEquipment.filter(
    (item) =>
      (!comuna || item.comuna === comuna) &&
      (!category || item.category === category) &&
      (!normalized ||
        [
          item.title,
          item.category,
          item.description || "",
          providerForDemoEquipment(item).name,
        ].some((value) => value.toLocaleLowerCase("es-CL").includes(normalized))),
  );
  return (
    <main className="min-h-screen">
      <section className="relative isolate overflow-hidden border-b border-[#405347] bg-[#171e1b]">
        <img
          src="/hero-cargador.jpg"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#111814f7_0%,#111814da_52%,#11181483_100%)]" />
        <div className="container-shell py-15 md:py-23">
          <p className="eyebrow">Catálogo · Santiago</p>
          <h1 className="display mt-4 max-w-3xl text-[clamp(3rem,5vw,5rem)]">
            Encuentra lo que mueve tu obra.
          </h1>
          <p className="mt-5 max-w-xl text-[#d4dfd1]">
            Busca equipos y servicios por nombre o comuna. Abre cada ficha para conocer al
            proveedor.
          </p>
          <RouterGetForm
            key={`search:${q}:${comuna}:${category}`}
            action="/maquinaria"
            className="mt-9 grid gap-2 rounded-2xl border border-[#8ea1847a] bg-[#1b2520]/95 p-2 shadow-[0_18px_70px_#0008] backdrop-blur-xl md:grid-cols-[1fr_230px_auto]"
          >
            <label className="flex items-center gap-2 px-4">
              <Search size={19} className="shrink-0 text-[#b9d88b]" />
              <input
                name="q"
                defaultValue={q}
                aria-label="Maquinaria o servicio"
                placeholder="¿Qué equipo o servicio necesitas?"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-[#a5b3a0]"
              />
            </label>
            <label className="flex items-center gap-2 border-t border-[#667565] px-4 md:border-t-0 md:border-l">
              <MapPin size={18} className="shrink-0 text-[#b9d88b]" />
              <select
                name="comuna"
                defaultValue={comuna}
                aria-label="Comuna"
                className="h-12 w-full bg-transparent text-sm outline-none"
              >
                <option value="">Todo Santiago</option>
                {communes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <input type="hidden" name="category" value={category} />
            <button className="action-primary text-sm">
              Buscar maquinaria <ArrowRight size={17} />
            </button>
          </RouterGetForm>
          <RouterGetForm
            key={`category:${q}:${comuna}:${category}`}
            action="/maquinaria"
            className="mt-4 flex flex-wrap items-center gap-3"
          >
            <input type="hidden" name="q" value={q} />
            <input type="hidden" name="comuna" value={comuna} />
            <label htmlFor="catalog-category" className="text-xs font-bold text-[#d9e4d2]">
              Categoría
            </label>
            <select
              id="catalog-category"
              name="category"
              defaultValue={category}
              className="rounded-xl border border-[#73836e] bg-[#19231d] px-4 py-2.5 text-sm"
            >
              <option value="">Todas las categorías</option>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <button className="rounded-xl border border-[#73836e] px-4 py-2.5 text-sm font-bold hover:border-[#b9d88b]">
              Aplicar filtro
            </button>
          </RouterGetForm>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category}
                href={"/maquinaria?category=" + encodeURIComponent(category)}
                className="rounded-full border border-[#a1b59a70] bg-[#15211ad6] px-3 py-1.5 text-xs text-[#dce8d6] hover:border-[#b9d88b]"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CatalogSavedActions
        userId={user?.userId || null}
        q={q}
        comuna={comuna}
        category={category}
        signInUrl={signInUrl}
      />
      <section className="container-shell py-13 md:py-17">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Publicaciones activas</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">
              {error
                ? "No pudimos cargar el catálogo"
                : rows.length + " resultado" + (rows.length === 1 ? "" : "s")}
            </h2>
          </div>
          {q || comuna || category ? (
            <Link href="/maquinaria" className="text-sm font-semibold text-[#bed6aa]">
              Limpiar búsqueda ↗
            </Link>
          ) : null}
        </div>
        {error ? (
          <p role="alert" className="premium-panel rounded-2xl p-7">
            No pudimos cargar las publicaciones reales. Prueba de nuevo más tarde.
          </p>
        ) : rows.length ? (
          <CatalogGrid
            listings={rows.map((row) => realListing(row.item, row.provider))}
            userId={user?.userId || null}
            signInUrl={signInUrl}
          />
        ) : (
          <div className="premium-panel rounded-2xl p-7">
            <p className="font-bold">No encontramos equipos reales con esos filtros.</p>
            <p className="muted-copy mt-2 text-sm">
              Prueba con otra comuna o categoría. Los ejemplos de abajo muestran cómo se verán las
              publicaciones.
            </p>
          </div>
        )}
        <div className="mt-16 border-t border-[#48564a] pt-10">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Recorrido de producto · ejemplos ficticios</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-.05em]">
                Así se verá el catálogo.
              </h2>
              <p className="muted-copy mt-3 max-w-2xl text-sm">
                Estas fichas no corresponden a equipos disponibles. Las fotografías son ilustrativas
                y el contacto se prueba sin enviar mensajes.
              </p>
            </div>
            <Link
              href="/como-funciona"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#d4e6c0]"
            >
              Cómo funciona Maquinal <ArrowUpRight size={17} />
            </Link>
          </div>
          {examples.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {examples.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={demoListing(item, providerForDemoEquipment(item))}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#adbbaa]">
              No hay ejemplos para esos filtros. Limpia la búsqueda para explorar todas las fichas.
            </p>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
