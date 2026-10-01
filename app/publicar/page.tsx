import { requireChatGPTUser } from "@/app/chatgpt-auth";
import {
  findOwnedEquipment,
  findProviderByOwner,
  imageUrls,
  listProviderEquipment,
} from "@/lib/marketplace";
import { PublishForm } from "@/components/publish-form";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { notFound } from "next/navigation";
import { readServiceOffersDraft } from "@/lib/service-offers";
export const dynamic = "force-dynamic";
export default async function PublishPage({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const { editar } = await searchParams;
  const user = await requireChatGPTUser(
    editar ? `/publicar?editar=${encodeURIComponent(editar)}` : "/publicar",
  );
  const owned = editar ? await findOwnedEquipment(editar, user.userId) : null;
  if (editar && !owned) notFound();
  const provider = await findProviderByOwner(user.userId);
  const count = provider
    ? (await listProviderEquipment(provider.id)).filter((item) => item.status === "active").length
    : 0;
  return (
    <main className="min-h-screen">
      <div className="container-shell py-12 md:py-17">
        <div className="grid lg:grid-cols-[1fr_.55fr] gap-6 items-end">
          <div>
            <p className="eyebrow">{owned ? "Editar publicación" : "Publicar en Maqvia"}</p>
            <h1 className="display mt-5 text-[clamp(3rem,5.5vw,5.4rem)]">
              {owned ? "Actualiza tu equipo y conserva " : "Una vitrina a la altura de "}{" "}
              <span className="serif-accent text-[#bfd6a1]">tu trabajo.</span>
            </h1>
          </div>
          <p className="muted-copy max-w-sm lg:ml-auto">
            {owned
              ? "Revisa los datos y las fotos. Los cambios quedarán visibles al guardar."
              : "Agrega tus datos, una máquina o servicio y sus fotos. Verás tu perfil publicado al terminar."}
          </p>
        </div>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#b2c0ae]">
          <span className="flex items-center gap-2">
            <Check size={15} className="text-[#b9d88b]" /> Tu primera vitrina es gratis en esta
            etapa
          </span>
          <span className="flex items-center gap-2">
            <Check size={15} className="text-[#b9d88b]" /> Los clientes te contactan directamente
          </span>
        </div>
        {provider ? (
          <div className="mt-8 rounded-2xl border border-[#687c61] bg-[#263328] p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold">
                {count ? "Tu vitrina ya está activa" : "Tu vitrina está creada"}
              </p>
              <p className="mt-1 text-sm text-[#aebfad]">
                {count} {count === 1 ? "publicación" : "publicaciones"} · Puedes agregar otro equipo
                o servicio abajo.
              </p>
            </div>
            {count > 0 ? (
              <Link
                href={"/proveedores/" + provider.slug}
                className="inline-flex items-center gap-1.5 font-bold text-[#cce0b7]"
              >
                Ver mi vitrina <ArrowUpRight size={17} />
              </Link>
            ) : null}
          </div>
        ) : null}
        <PublishForm
          accountId={user.userId}
          editId={owned?.item.id}
          existingEquipment={
            owned
              ? (() => {
                  let services: unknown = [];
                  try {
                    services = JSON.parse(owned.item.services);
                  } catch {
                    /* invalid legacy data */
                  }
                  const entries = Array.isArray(services) ? services : [];
                  return {
                    id: owned.item.id,
                    title: owned.item.title,
                    category: owned.item.category,
                    description: owned.item.description,
                    images: imageUrls(owned.item.images),
                    operator: owned.item.operator,
                    delivery: owned.item.delivery,
                    priceKind: owned.item.priceKind,
                    priceAmount: owned.item.priceAmount,
                    priceUnit: owned.item.priceUnit,
                    services: entries
                      .filter((entry): entry is string => typeof entry === "string")
                      .join(", "),
                    serviceOffers: JSON.stringify(
                      readServiceOffersDraft(
                        JSON.stringify(
                          entries.filter((entry) => typeof entry === "object" && entry !== null),
                        ),
                      ),
                    ),
                    sector: owned.item.sector,
                    locationPrecision: owned.item.locationPrecision,
                    presentationVariant: owned.item.presentationVariant,
                  };
                })()
              : undefined
          }
          accountEmail={user.email}
          accountPhone={user.phone || ""}
          provider={
            provider
              ? {
                  name: provider.name,
                  description: provider.description,
                  comuna: provider.comuna,
                  whatsapp: provider.whatsapp,
                  contactEmail: provider.contactEmail,
                }
              : null
          }
        />
      </div>
      <SiteFooter />
    </main>
  );
}
