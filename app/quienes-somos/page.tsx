import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";

export const metadata = {
  title: "Quiénes somos | Maqvia",
  description:
    "Conoce el propósito de Maqvia: facilitar la búsqueda de maquinaria y el contacto directo con proveedores en Santiago.",
};

export default function QuienesSomos() {
  return (
    <main className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden border-b border-[#343d38] bg-[#101313]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_60%,#2a3d2f38,transparent_62%)]" />
        <div className="container-shell grid items-center gap-10 py-24 md:grid-cols-[1.05fr_.95fr] md:gap-14 md:py-32">
          <div>
            <p className="eyebrow">Quiénes somos</p>
            <h1 className="display mt-5 max-w-3xl text-[clamp(2.8rem,5vw,5rem)]">
              Maquinaria y personas, <span className="text-gradient">más cerca.</span>
            </h1>
            <p className="muted-copy mt-7 max-w-xl text-base leading-relaxed md:text-lg">
              Maqvia es una vitrina para encontrar maquinaria y servicios en Santiago. Reúne
              información de cada publicación en un solo lugar y permite que clientes y proveedores
              conversen directamente sobre el arriendo.
            </p>
          </div>
          <figure className="relative overflow-hidden rounded-[24px] border border-[#6f826c55] bg-[#1b2420]">
            <img
              src="/hero-cargador.jpg"
              alt="Maquinaria trabajando en una obra"
              className="aspect-[4/3] h-full w-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0e1412ed] to-transparent px-5 pb-5 pt-12 text-xs text-[#e1e9dc]">
              Imagen ilustrativa de maquinaria en obra.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── El problema ── */}
      <section className="container-shell py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <p className="eyebrow">El problema</p>
            <h2 className="display mt-5 text-[clamp(2rem,3.5vw,3.2rem)]">
              Encontrar maquinaria era difícil.
            </h2>
            <p className="muted-copy mt-5 text-sm md:text-base leading-relaxed">
              Encontrar un equipo para una obra puede exigir llamadas, mensajes y búsquedas
              dispersas. Para quien ofrece maquinaria, explicar cada equipo una y otra vez también
              toma tiempo.
            </p>
            <p className="muted-copy mt-4 text-sm md:text-base leading-relaxed">
              Maqvia organiza las publicaciones por equipo y comuna. Cada proveedor agrega sus
              propias fotos, condiciones y datos de contacto para que los interesados puedan evaluar
              y consultar directamente.
            </p>
          </div>
          <div className="premium-panel rounded-2xl p-8 md:p-10">
            <ul className="space-y-6">
              {[
                {
                  n: "01",
                  t: "Búsqueda por equipo y comuna",
                  d: "Filtra por lo que necesitas y dónde lo necesitas.",
                },
                {
                  n: "02",
                  t: "Fichas con fotos y detalles",
                  d: "Las publicaciones muestran las imágenes y los detalles aportados por cada proveedor.",
                },
                {
                  n: "03",
                  t: "Contacto directo",
                  d: "Hablas directamente con el proveedor por los medios de contacto que publique.",
                },
              ].map((item) => (
                <li key={item.n} className="flex gap-5">
                  <span className="eyebrow mt-0.5">{item.n}</span>
                  <div>
                    <p className="font-semibold text-sm">{item.t}</p>
                    <p className="muted-copy text-sm mt-1">{item.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Para dos lados ── */}
      <section className="border-t border-[#343d38] bg-[#0e1210]">
        <div className="container-shell py-20 md:py-28 grid md:grid-cols-2 gap-10">
          <div className="premium-panel rounded-2xl p-8 md:p-10">
            <p className="eyebrow">Para quienes buscan</p>
            <h3 className="mt-4 text-xl font-semibold tracking-tight leading-snug">
              Encuentra el equipo que mueve tu proyecto.
            </h3>
            <p className="muted-copy mt-4 text-sm leading-relaxed">
              Busca por tipo de máquina, categoría o comuna. Revisa las fichas, compara opciones e
              ingresa para ver el contacto del proveedor. El arriendo se coordina directamente.
            </p>
            <Link href="/maquinaria" className="action-quiet mt-7 inline-flex text-sm">
              Explorar catálogo →
            </Link>
          </div>
          <div className="premium-panel rounded-2xl p-8 md:p-10">
            <p className="eyebrow">Para quienes ofrecen</p>
            <h3 className="mt-4 text-xl font-semibold tracking-tight leading-snug">
              Transforma tus equipos en una vitrina profesional.
            </h3>
            <p className="muted-copy mt-4 text-sm leading-relaxed">
              Sube fotos y detalles de cada máquina. Tu vitrina aparece en el catálogo y los
              interesados te contactan directamente para acordar los detalles.
            </p>
            <Link href="/crear-vitrina" className="action-quiet mt-7 inline-flex text-sm">
              Crear mi vitrina →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Valores ── */}
      <section className="container-shell py-20 md:py-28">
        <p className="eyebrow text-center">Nuestra forma de trabajar</p>
        <h2 className="display mt-5 text-center text-[clamp(1.8rem,3vw,2.8rem)] max-w-xl mx-auto">
          Simple. Directo. Sin vueltas.
        </h2>
        <div className="mt-14 grid sm:grid-cols-3 gap-6">
          {[
            {
              t: "Acuerdo entre personas",
              d: "Las condiciones del arriendo y el pago se acuerdan directamente entre cliente y proveedor.",
            },
            {
              t: "Información para decidir",
              d: "Cada ficha reúne fotos y detalles entregados por quien publica. Confirma disponibilidad y condiciones antes de contratar.",
            },
            {
              t: "Contacto real",
              d: "Al ingresar puedes abrir los medios de contacto que cada proveedor haya indicado.",
            },
          ].map((item) => (
            <div key={item.t} className="premium-surface rounded-2xl p-7">
              <h3 className="font-semibold text-sm">{item.t}</h3>
              <p className="muted-copy mt-3 text-sm leading-relaxed">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-[#343d38] bg-[#0e1210]">
        <div className="container-shell py-20 md:py-28 text-center">
          <h2 className="display text-[clamp(2rem,3.5vw,3.2rem)] max-w-2xl mx-auto">
            ¿Listo para empezar?
          </h2>
          <p className="muted-copy mt-5 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            Busca maquinaria disponible o publica la tuya. Sin registro previo para explorar.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/maquinaria" className="action-primary text-sm px-6 py-3">
              Explorar catálogo
            </Link>
            <Link href="/publicar" className="action-quiet text-sm px-6 py-3">
              Publicar mi maquinaria
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
