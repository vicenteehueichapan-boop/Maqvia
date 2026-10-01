import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, LockKeyhole } from "lucide-react";
import { WhatsAppMark } from "@/components/whatsapp-mark";
import { SiteFooter } from "@/components/site-footer";
import { ListingDetail } from "@/components/listing-detail";
import { ListingCard } from "@/components/listing-card";
import { FavoriteAction } from "@/components/favorite-action";
import { realListing } from "@/lib/listing-view";
import { findEquipmentById, listPublicProviderEquipment } from "@/lib/marketplace";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function MachineryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await findEquipmentById(slug);
  if (!row) notFound();

  const user = await getChatGPTUser();
  const listing = realListing(row.item, row.provider);
  const related = (await listPublicProviderEquipment(row.provider.id))
    .filter((item) => item.id !== slug)
    .slice(0, 3)
    .map((item) => realListing(item, row.provider));
  const contactHref = `/contactar/equipo/${encodeURIComponent(slug)}`;
  const signInHref = chatGPTSignInPath(contactHref);
  const favoriteSignInHref = chatGPTSignInPath(`/maquinaria/${encodeURIComponent(slug)}`);

  return (
    <main className="min-h-screen">
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
                {user ? (
                  <Link href={contactHref} className="action-primary mt-5 w-full text-sm">
                    <WhatsAppMark className="size-[18px]" /> Consultar por esta máquina{" "}
                    <ArrowUpRight size={17} />
                  </Link>
                ) : (
                  <a href={signInHref} target="_top" className="action-primary mt-5 w-full text-sm">
                    <LockKeyhole size={18} /> Ingresa para consultar <ArrowUpRight size={17} />
                  </a>
                )}
                <div className="mt-3 flex justify-center">
                  <FavoriteAction
                    equipmentId={listing.id}
                    authenticated={Boolean(user)}
                    signInHref={favoriteSignInHref}
                  />
                </div>
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
