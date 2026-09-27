import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, LockKeyhole, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingDetail } from "@/components/listing-detail";
import { ListingCard } from "@/components/listing-card";
import { DemoInquiryDisclosure } from "@/components/demo-inquiry-disclosure";
import { FavoriteAction } from "@/components/favorite-action";
import {
  demoEquipment,
  equipmentForDemoProvider,
  providerForDemoEquipment,
} from "@/lib/demo-fixtures";
import { demoListing, realListing } from "@/lib/listing-view";
import { findEquipmentById, listProviderEquipment } from "@/lib/marketplace";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function MachineryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = demoEquipment.find((item) => item.id === slug);
  const row = demo ? null : await findEquipmentById(slug);
  if (!demo && !row) notFound();

  const user = await getChatGPTUser();
  const provider = demo ? providerForDemoEquipment(demo) : null;
  const listing =
    demo && provider ? demoListing(demo, provider) : realListing(row!.item, row!.provider);
  const related =
    demo && provider
      ? equipmentForDemoProvider(provider.slug)
          .filter((item) => item.id !== slug)
          .slice(0, 3)
          .map((item) => demoListing(item, provider))
      : row
        ? (await listProviderEquipment(row.provider.id))
            .filter((item) => item.id !== slug)
            .slice(0, 3)
            .map((item) => realListing(item, row.provider))
        : [];
  const contactHref = `/contactar/equipo/${encodeURIComponent(slug)}`;
  const signInHref = chatGPTSignInPath(
    demo ? `/maquinaria/${encodeURIComponent(slug)}` : contactHref,
  );
  const favoriteSignInHref = chatGPTSignInPath(`/maquinaria/${encodeURIComponent(slug)}`);

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="container-shell py-10 md:py-13">
        <nav
          aria-label="Ruta de navegación"
          className="flex flex-wrap items-center gap-2 text-sm text-[#b9c6b5]"
        >
          <Link href="/maquinaria" className="inline-flex items-center gap-2 hover:text-white">
            <ArrowLeft size={16} /> Maquinaria
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-[#e7ece2]">
            {listing.title}
          </span>
        </nav>
        <div className="mt-8">
          <ListingDetail
            listing={listing}
            contact={
              <>
                {demo && (
                  <p className="mt-3 text-xs text-[#b6c6ad]">
                    Publicación de ejemplo. No representa un equipo disponible.
                  </p>
                )}
                {user ? (
                  demo ? (
                    <DemoInquiryDisclosure subject={listing.title} draftKey={listing.id} />
                  ) : (
                    <Link href={contactHref} className="action-primary mt-5 w-full text-sm">
                      <MessageCircle size={18} /> Consultar por esta máquina{" "}
                      <ArrowUpRight size={17} />
                    </Link>
                  )
                ) : (
                  <a href={signInHref} target="_top" className="action-primary mt-5 w-full text-sm">
                    <LockKeyhole size={18} /> Ingresa para consultar <ArrowUpRight size={17} />
                  </a>
                )}
                {!demo && (
                  <FavoriteAction
                    id={slug}
                    userId={user?.userId || null}
                    signInUrl={favoriteSignInHref}
                  />
                )}
                <p className="mt-3 text-center text-xs text-[#9eac9b]">
                  Las condiciones de arriendo se acuerdan directamente con el proveedor.
                </p>
              </>
            }
          />
        </div>
        {related.length > 0 && (
          <section className="mt-16 border-t border-[#3d493f] pt-10">
            <p className="eyebrow">Más del mismo proveedor</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-.04em]">Otras publicaciones</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </section>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
