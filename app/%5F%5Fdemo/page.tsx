import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { ListingCard } from "@/components/listing-card";
import { demoEquipment, demoProviders } from "@/lib/demo-fixtures";
import { demoListing } from "@/lib/listing-view";

export default function DemoLab() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main>
      <section className="container-shell py-14">
        <p className="eyebrow">Laboratorio visual · contenido ficticio</p>
        <h1 className="display mt-4 text-[clamp(3rem,5vw,5rem)]">Escenarios de Maqvia.</h1>
        <p className="muted-copy mt-5 max-w-2xl">
          Prueba perfiles completos y mínimos, fotos, precios, ubicación y contacto sin enviar
          mensajes reales.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          {demoProviders.map((provider) => (
            <Link
              key={provider.slug}
              href={`/demo/proveedores/${provider.slug}`}
              className="action-quiet text-sm"
            >
              {provider.name} ↗
            </Link>
          ))}
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {demoEquipment.map((item) => (
            <ListingCard
              key={item.id}
              listing={demoListing(
                item,
                demoProviders.find((provider) => provider.slug === item.providerSlug)!,
              )}
            />
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
