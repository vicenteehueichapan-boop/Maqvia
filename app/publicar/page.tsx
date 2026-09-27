import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { findProviderByOwner, listProviderEquipment } from "@/lib/marketplace";
import { PublishForm } from "@/components/publish-form";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function PublishPage() {
  const user = await requireChatGPTUser("/publicar");
  const provider = await findProviderByOwner(user.userId);
  const count = provider ? (await listProviderEquipment(provider.id)).length : 0;
  return (
    <main className="min-h-screen">
      <div className="container-shell py-12 md:py-17">
        <div className="grid lg:grid-cols-[1fr_.55fr] gap-6 items-end">
          <div>
            <p className="eyebrow">Publicar en Maquinal</p>
            <h1 className="display mt-5 text-[clamp(3rem,5.5vw,5.4rem)]">
              Una vitrina a la altura de{" "}
              <span className="serif-accent text-[#bfd6a1]">tu trabajo.</span>
            </h1>
          </div>
          <p className="muted-copy max-w-sm lg:ml-auto">
            Agrega tus datos, una máquina o servicio y sus fotos. Verás tu perfil publicado al
            terminar.
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
              <p className="font-bold">Tu vitrina ya está activa</p>
              <p className="mt-1 text-sm text-[#aebfad]">
                {count} {count === 1 ? "publicación" : "publicaciones"} · Puedes agregar otro equipo
                o servicio abajo.
              </p>
            </div>
            <Link
              href={"/proveedores/" + provider.slug}
              className="inline-flex items-center gap-1.5 font-bold text-[#cce0b7]"
            >
              Ver mi vitrina <ArrowUpRight size={17} />
            </Link>
          </div>
        ) : null}
        <PublishForm
          provider={
            provider
              ? {
                  name: provider.name,
                  description: provider.description,
                  comuna: provider.comuna,
                  whatsapp: provider.whatsapp,
                }
              : null
          }
        />
      </div>
      <SiteFooter />
    </main>
  );
}
