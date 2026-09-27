import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { demoEquipment, providerForDemoEquipment } from "@/lib/demo-fixtures";
import { demoListing } from "@/lib/listing-view";

const guides = [
  {
    image: "/demo/obra.jpg",
    label: "Guía para buscar",
    title: "Qué revisar antes de consultar por una máquina",
    body: "Comuna, fotos, operador y traslado: la información que ayuda a comparar opciones.",
    href: "/como-funciona#encontrar",
  },
  {
    image: "/demo/industrial.jpg",
    label: "Novedad del producto",
    title: "Tu vitrina reúne equipos y servicios",
    body: "Conoce cómo se presenta un negocio y cómo se abre cada publicación.",
    href: "/crear-vitrina",
  },
  {
    image: "/demo/retroexcavadora.jpg",
    label: "Guía para publicar",
    title: "Una ficha clara parte por buenas fotos",
    body: "Prueba la vista previa con tus datos antes de crear una publicación.",
    href: "/crear-vitrina#vista-previa",
  },
];

export function HomeEditorial() {
  const featured = [demoEquipment[0], demoEquipment[3], demoEquipment[6]];
  return (
    <>
      <section className="container-shell py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Equipos destacados · demostración</p>
            <h2 className="display mt-4 text-[clamp(2.8rem,4.5vw,4.8rem)]">
              Una mejor vitrina
              <br />
              para cada equipo.
            </h2>
          </div>
          <p className="muted-copy max-w-sm text-sm">
            Estos ejemplos muestran cómo podrían aparecer publicaciones en Inicio. Son datos
            ficticios; todavía no existe una promoción pagada.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {featured.map((item) => (
            <ListingCard
              key={item.id}
              listing={demoListing(item, providerForDemoEquipment(item))}
            />
          ))}
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-[#465549] pt-6">
          <p className="max-w-xl text-xs leading-relaxed text-[#9eac9f]">
            Más adelante, una publicación destacada podría ocupar este espacio con identificación
            clara y condiciones transparentes para el proveedor.
          </p>
          <Link
            href="/maquinaria"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#d3e6bd]"
          >
            Explorar el catálogo <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="border-y border-[#ffffff17] bg-[radial-gradient(circle_at_78%_15%,#47634a30,transparent_45%),#17201c]">
        <div className="container-shell py-20 md:py-25">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow">Actualidad y recursos</p>
              <h2 className="display mt-4 text-[clamp(2.8rem,4.5vw,4.8rem)]">
                Ideas para mover
                <br />
                tu próximo proyecto.
              </h2>
            </div>
            <p className="muted-copy max-w-sm text-sm">
              Guías y novedades propias de Maquinal para entender mejor cómo buscar, comparar y
              publicar.
            </p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.title}
                href={guide.href}
                className="group border-t border-[#70806f80] pt-5"
              >
                <div className="aspect-[1.65] overflow-hidden rounded-2xl bg-[#26332b]">
                  <img
                    src={guide.image}
                    alt="Fotografía ilustrativa de maquinaria"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="eyebrow mt-5">{guide.label}</p>
                <h3 className="mt-3 max-w-sm text-xl font-bold leading-tight tracking-[-.04em]">
                  {guide.title}
                </h3>
                <p className="muted-copy mt-3 text-sm">{guide.body}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#d5e5c5]">
                  Leer más <ArrowUpRight size={16} />
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-7 text-xs text-[#9ca99f]">
            Fotografías ilustrativas proporcionadas para la demostración del producto.
          </p>
        </div>
      </section>
    </>
  );
}
