import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, LockKeyhole } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProviderShowcase } from "@/components/provider-showcase";
import { demoProviders, equipmentForDemoProvider } from "@/lib/demo-fixtures";
import { demoListing, demoProviderView } from "@/lib/listing-view";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export default async function DemoProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const provider = demoProviders.find((candidate) => candidate.slug === slug);
  if (!provider) notFound();
  const listings = equipmentForDemoProvider(slug).map((item) => demoListing(item, provider));
  const user = await getChatGPTUser();
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="container-shell py-10 md:py-13">
        <Link
          href="/maquinaria"
          className="inline-flex items-center gap-2 text-sm text-[#aeb9aa] hover:text-white"
        >
          <ArrowLeft size={16} /> Volver al catálogo
        </Link>
        <div className="mt-8">
          <ProviderShowcase
            provider={demoProviderView(provider)}
            listings={listings}
            contact={
              <Link href={`/demo/contactar/proveedor/${slug}`} className="action-quiet text-sm">
                <LockKeyhole size={17} /> {user ? "Probar consulta" : "Ingresar para consultar"}{" "}
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
