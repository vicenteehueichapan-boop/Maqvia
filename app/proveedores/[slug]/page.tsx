import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, LockKeyhole, MessageCircle } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { ProviderShowcase } from "@/components/provider-showcase";
import { findProviderBySlug, listProviderEquipment } from "@/lib/marketplace";
import { realListing, realProviderView } from "@/lib/listing-view";
import { getChatGPTUser } from "@/app/chatgpt-auth";
export const dynamic = "force-dynamic";
export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const provider = await findProviderBySlug(slug);
  if (!provider) notFound();
  const items = await listProviderEquipment(provider.id);
  const user = await getChatGPTUser();
  return (
    <main className="min-h-screen">
      <div className="container-shell py-10 md:py-13">
        <Link
          href="/maquinaria"
          className="inline-flex items-center gap-2 text-sm text-[#aeb9aa] hover:text-white"
        >
          <ArrowLeft size={16} /> Volver al catálogo
        </Link>
        <div className="mt-8">
          <ProviderShowcase
            provider={realProviderView(provider)}
            listings={items.map((item) => realListing(item, provider))}
            contact={
              <Link
                href={"/contactar/proveedor/" + encodeURIComponent(slug)}
                className="action-primary shrink-0 text-sm"
              >
                {user ? <MessageCircle size={18} /> : <LockKeyhole size={18} />}{" "}
                {user ? "Consultar al proveedor" : "Ingresar para consultar"}{" "}
                <ArrowUpRight size={17} />
              </Link>
            }
          />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
