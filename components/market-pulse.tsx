import Link from "next/link";
import { ArrowUpRight, Camera, MapPin, MessageCircle } from "lucide-react";

const checks = [
  {
    title: "Ubicación y traslado",
    description:
      "Revisa la comuna de trabajo y consulta si el traslado está incluido antes de coordinar el arriendo.",
    icon: MapPin,
  },
  {
    title: "Fotos y características",
    description:
      "Compara las imágenes, la capacidad y los servicios indicados en cada publicación.",
    icon: Camera,
  },
  {
    title: "Acuerdo directo",
    description:
      "Al ingresar podrás contactar al proveedor para confirmar disponibilidad, precio y condiciones.",
    icon: MessageCircle,
  },
];

export function MarketPulse() {
  return (
    <section className="relative isolate border-t border-[#1e2b22] bg-[#0c100e]">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-full max-w-2xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,#b9d88b0a,transparent_60%)]" />
      <div className="container-shell relative py-20 md:py-28">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Antes de elegir</p>
            <h2 className="display mt-4 text-[clamp(2rem,3.5vw,3.5rem)] leading-none">
              Una búsqueda más clara.
            </h2>
          </div>
          <p className="muted-copy max-w-sm text-sm">
            Tres datos que conviene revisar en una ficha antes de conversar con quien ofrece el
            equipo.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {checks.map(({ title, description, icon: Icon }, index) => (
            <div key={title} className="premium-surface rounded-2xl p-6 lg:p-8">
              <div className="flex items-center justify-between">
                <Icon aria-hidden="true" size={22} className="text-[#b9d88b]" />
                <span className="eyebrow">0{index + 1}</span>
              </div>
              <h3 className="mt-7 text-lg font-semibold tracking-tight">{title}</h3>
              <p className="muted-copy mt-3 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
        <Link
          href="/maquinaria"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#d5e9ba] hover:text-white"
        >
          Explorar maquinaria <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </section>
  );
}
