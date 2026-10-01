import Link from "next/link";
import { ArrowUpRight, LogOut, Plus, Search, UserRound } from "lucide-react";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { ListingCard } from "@/components/listing-card";
import { SiteFooter } from "@/components/site-footer";
import { realListing } from "@/lib/listing-view";
import {
  findProviderByOwner,
  countEquipmentFavorites,
  listFavoriteEquipment,
  listProviderEquipment,
  type Equipment,
} from "@/lib/marketplace";
import { EquipmentActions } from "./equipment-actions";
export const dynamic = "force-dynamic";

const statusDetails = {
  active: { label: "Activa", className: "border-[#b9d88b7a] bg-[#1d3025e8] text-[#d6ecbd]" },
  paused: { label: "Pausada", className: "border-[#e5c78a7a] bg-[#3c3323e8] text-[#f3dda9]" },
  archived: { label: "Retirada", className: "border-[#b3aaa27a] bg-[#302b29e8] text-[#dfd5cd]" },
} as const;

function listingStatus(status: Equipment["status"]) {
  return statusDetails[status as keyof typeof statusDetails] ?? statusDetails.archived;
}

export default async function AccountPage() {
  const user = await requireChatGPTUser("/cuenta");
  const provider = await findProviderByOwner(user.userId);
  const listings = provider ? await listProviderEquipment(provider.id) : [];
  const activeCount = listings.filter((item) => item.status === "active").length;
  const pausedCount = listings.filter((item) => item.status === "paused").length;
  const archivedCount = listings.filter((item) => item.status === "archived").length;
  const saved = await listFavoriteEquipment(user.userId);
  const favoriteCounts = await countEquipmentFavorites(listings.map((item) => item.id));
  return (
    <main className="min-h-screen">
      <div className="container-shell py-13 md:py-18">
        <p className="eyebrow">Tu espacio en Maqvia</p>
        <h1 className="display mt-4 text-[clamp(3rem,5vw,5rem)]">
          Hola,{" "}
          <span className="serif-accent text-[#bfd6a1]">
            {user.fullName?.split(" ")[0] || "bienvenido"}.
          </span>
        </h1>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
          <p className="muted-copy max-w-xl">
            Consulta tus publicaciones y vuelve a los equipos que guardaste.
          </p>
          <Link
            href="/maquinaria"
            className="action-secondary inline-flex items-center gap-2 text-sm"
          >
            <Search size={17} /> Explorar maquinaria
          </Link>
        </div>
        {provider ? (
          <section className="mt-10" aria-labelledby="my-equipment-heading">
            <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#39483e] pb-6">
              <div>
                <p className="eyebrow">Mi vitrina · {provider.name}</p>
                <h2
                  id="my-equipment-heading"
                  className="mt-2 text-3xl font-bold tracking-[-.04em] md:text-4xl"
                >
                  Tus publicaciones
                </h2>
                <p className="muted-copy mt-2 text-sm">
                  Revisa cómo se ven tus equipos y controla cuáles aparecen en el catálogo.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {activeCount > 0 ? (
                  <Link
                    href={`/proveedores/${provider.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#d1e5bd] hover:text-white"
                  >
                    Ver mi vitrina pública <ArrowUpRight size={16} />
                  </Link>
                ) : null}
                <Link href="/publicar" className="action-primary text-sm">
                  <Plus size={17} /> Añadir equipo
                </Link>
              </div>
            </div>
            <div
              className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#c9d5c7]"
              aria-label="Resumen de tus publicaciones"
            >
              <span>
                <strong className="mr-1.5 text-xl text-white">{activeCount}</strong> activas
              </span>
              <span>
                <strong className="mr-1.5 text-xl text-white">{pausedCount}</strong> pausadas
              </span>
              <span>
                <strong className="mr-1.5 text-xl text-white">{archivedCount}</strong> retiradas
              </span>
            </div>
            {listings.length ? (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((item) => {
                  const status = listingStatus(item.status);
                  return (
                    <ListingCard
                      key={item.id}
                      listing={realListing(item, provider)}
                      inert={item.status !== "active"}
                      badge={
                        <span
                          className={`rounded-full border px-3 py-1.5 text-xs font-bold shadow-lg ${status.className}`}
                        >
                          {status.label}
                        </span>
                      }
                      actions={
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#aebfad]">
                            <span>
                              Publicada{" "}
                              {new Intl.DateTimeFormat("es-CL", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }).format(new Date(item.createdAt))}
                            </span>
                            <span>
                              {favoriteCounts.get(item.id) ?? 0} guardado
                              {(favoriteCounts.get(item.id) ?? 0) === 1 ? "" : "s"}
                            </span>
                            {item.status === "active" ? (
                              <Link
                                href={`/maquinaria/${item.id}`}
                                className="font-bold text-[#d1e5bd] hover:text-white"
                              >
                                Ver ficha ↗
                              </Link>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/publicar?editar=${encodeURIComponent(item.id)}`}
                              className="action-secondary text-xs"
                            >
                              Editar ficha
                            </Link>
                            <EquipmentActions id={item.id} status={item.status} />
                          </div>
                        </div>
                      }
                    />
                  );
                })}
              </div>
            ) : (
              <div className="mt-7 rounded-[24px] border border-[#405044] bg-[#1b2621] p-7 md:p-10">
                <p className="text-xl font-bold">Tu vitrina está lista para su primer equipo.</p>
                <p className="muted-copy mt-2">
                  Añade fotos y datos de tu maquinaria para que pueda aparecer en el catálogo.
                </p>
              </div>
            )}
          </section>
        ) : (
          <section
            className="mt-10 rounded-[26px] premium-panel p-7 md:p-10"
            aria-labelledby="start-provider-heading"
          >
            <p className="eyebrow">¿Ofreces maquinaria o servicios?</p>
            <h2 id="start-provider-heading" className="mt-2 text-3xl font-bold tracking-[-.04em]">
              Crea tu vitrina
            </h2>
            <p className="muted-copy mt-3 max-w-xl">
              Presenta tus equipos con fotos, datos y una página propia para que te encuentren en
              Santiago.
            </p>
            <Link
              href="/publicar"
              className="action-primary mt-6 inline-flex items-center gap-2 text-sm"
            >
              <Plus size={17} /> Publicar mi primer equipo
            </Link>
          </section>
        )}
        <section className="mt-12" aria-labelledby="favorites-heading">
          <p className="eyebrow">Para volver fácilmente</p>
          <h2 id="favorites-heading" className="mt-2 text-3xl font-bold tracking-[-.04em]">
            Maquinaria guardada
          </h2>
          {saved.length ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {saved.map(({ item, provider: seller }) => (
                <ListingCard key={item.id} listing={realListing(item, seller)} />
              ))}
            </div>
          ) : (
            <p className="muted-copy mt-5">Guarda equipos del catálogo para encontrarlos aquí.</p>
          )}
        </section>
        <div className="mt-11 pt-5 border-t border-[#37453a] flex flex-wrap justify-between gap-4 text-sm text-[#a5b3a1]">
          <span className="inline-flex items-center gap-2">
            <UserRound size={16} />
            {user.email}
          </span>
          <a
            href={chatGPTSignOutPath("/")}
            className="inline-flex items-center gap-2 hover:text-white"
          >
            <LogOut size={16} /> Cerrar sesión
          </a>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
