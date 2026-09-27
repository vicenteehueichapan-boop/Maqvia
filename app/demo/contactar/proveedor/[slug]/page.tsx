import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { InquiryForm } from "@/components/inquiry-form";
import { demoProviders } from "@/lib/demo-fixtures";
import { requireChatGPTUser } from "@/app/chatgpt-auth";

export default async function DemoProviderInquiry({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireChatGPTUser(`/demo/contactar/proveedor/${encodeURIComponent(slug)}`);
  const provider = demoProviders.find((item) => item.slug === slug);
  if (!provider) notFound();
  return (
    <main>
      <SiteHeader />
      <div className="container-shell max-w-3xl py-12 md:py-20">
        <Link
          href={`/demo/proveedores/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-[#b8c9b2]"
        >
          <ArrowLeft size={16} /> Volver a la vitrina
        </Link>
        <p className="eyebrow mt-10">Contacto de demostración</p>
        <h1 className="display mt-3 text-[clamp(2.8rem,5vw,4.8rem)]">
          Consulta a {provider.name}.
        </h1>
        <p className="muted-copy mt-5">
          Prueba el formulario y revisa el mensaje que se generaría. No se abrirá ningún WhatsApp ni
          se enviará una consulta real.
        </p>
        <div className="premium-panel mt-8 rounded-[24px] p-6 md:p-9">
          <InquiryForm subject={provider.name} draftKey={slug} demo />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
