import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  LockKeyhole,
  MessageCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Cómo funciona | Maquinal",
  description:
    "Aprende a buscar maquinaria en Santiago, comparar fichas y crear tu propia vitrina con fotos y contacto directo.",
};
export const dynamic = "force-dynamic";

type GuideStep = {
  number: string;
  eyebrow: string;
  title: string;
  body: string;
  detail: string;
  image: string;
  alt: string;
  label: string;
  href: string;
  action: string;
  secondaryImage?: string;
  secondaryAlt?: string;
};

const searchSteps: GuideStep[] = [
  {
    number: "01",
    eyebrow: "Busca",
    title: "Parte por el equipo y la comuna.",
    body: "Escribe lo que necesitas y elige una zona de Santiago. Puedes comenzar con una búsqueda amplia y ajustar los filtros después.",
    detail:
      "El catálogo distingue las publicaciones reales de los ejemplos que sirven para conocer la experiencia.",
    image: "/guia/buscar.jpg",
    alt: "Captura del buscador de maquinaria de Maquinal",
    label: "Catálogo de Maquinal",
    href: "/maquinaria",
    action: "Abrir catálogo",
  },
  {
    number: "02",
    eyebrow: "Evalúa",
    title: "Abre fichas y compara opciones.",
    body: "Cada ficha reúne fotos, ubicación, características y el nombre de quien ofrece el equipo. Revisa si incluye operador o traslado antes de consultar.",
    detail:
      "Selecciona hasta tres fichas para contrastar precio, comuna y servicios. Los ejemplos solo enseñan el funcionamiento.",
    image: "/guia/comparar.jpg",
    alt: "Captura de la comparación de equipos de ejemplo en Maquinal",
    label: "Comparación demostrativa",
    href: "/maquinaria/miniexcavadora-3t",
    action: "Ver ficha de ejemplo",
  },
  {
    number: "03",
    eyebrow: "Contacta",
    title: "Habla directamente con el proveedor.",
    body: "Al encontrar una opción, inicia sesión para abrir el contacto. La conversación continúa por WhatsApp con la persona que publicó el equipo.",
    detail:
      "Disponibilidad, condiciones, arriendo y pago se acuerdan entre ustedes. Maquinal facilita el encuentro.",
    image: "/guia/ficha.jpg",
    alt: "Captura de una ficha de equipo de ejemplo en Maquinal",
    label: "Ficha demostrativa",
    href: "/maquinaria",
    action: "Explorar opciones",
  },
];

const publishSteps: GuideStep[] = [
  {
    number: "01",
    eyebrow: "Imagina",
    title: "Describe lo que quieres mostrar.",
    body: "Cuéntanos qué maquinaria o servicio ofreces. Puedes agregar fotos y probar una vista previa antes de crear una cuenta.",
    detail:
      "La vista previa es local y sirve para explorar cómo podría verse tu publicación; no la publica automáticamente.",
    image: "/guia/vista-previa.jpg",
    alt: "Captura del asistente de vista previa de Maquinal",
    label: "Vista previa interactiva",
    href: "/crear-vitrina#vista-previa",
    action: "Probar mi vista previa",
  },
  {
    number: "02",
    eyebrow: "Configura",
    title: "Completa tu perfil y tu primera ficha.",
    body: "Al ingresar, añade nombre comercial, comuna y WhatsApp. Después indica el equipo o servicio, sus fotos, características, operador y traslado.",
    detail: "Completa cada paso a tu ritmo. Al final revisarás una vista previa antes de publicar.",
    image: "/guia/configurar.jpg",
    alt: "Captura del formulario real de datos del proveedor",
    label: "Datos del proveedor",
    secondaryImage: "/guia/configurar-equipo.jpg",
    secondaryAlt: "Captura del formulario real para añadir fotos y características del equipo",
    href: "/publicar",
    action: "Empezar publicación",
  },
  {
    number: "03",
    eyebrow: "Presenta",
    title: "Comparte una vitrina que explique bien tu trabajo.",
    body: "Tu perfil reúne la información del negocio y las fichas de tus equipos. Quien busca puede abrirlas, conocer el servicio e ingresar para contactarte.",
    detail:
      "Tú recibes y atiendes las consultas directamente; puedes añadir más publicaciones desde tu cuenta.",
    image: "/guia/proveedor.jpg",
    alt: "Captura de una vitrina demostrativa de proveedor en Maquinal",
    label: "Perfil demostrativo",
    href: "/demo/proveedores/andes-maquinarias-demo",
    action: "Ver vitrina de ejemplo",
  },
];

function GuideSection({
  id,
  title,
  description,
  steps,
  accent,
}: {
  id: string;
  title: string;
  description: string;
  steps: GuideStep[];
  accent: "green" | "warm";
}) {
  return (
    <section id={id} className="guide-section container-shell py-20 md:py-30">
      <div className="max-w-[780px]">
        <p className="eyebrow">{accent === "green" ? "Para quien busca" : "Para quien publica"}</p>
        <h2 className="display mt-4 text-[clamp(2.8rem,5vw,5.1rem)]">{title}</h2>
        <p className="muted-copy mt-6 max-w-2xl text-base md:text-lg">{description}</p>
      </div>
      <div className="mt-14 md:mt-20 space-y-18 md:space-y-28">
        {steps.map((step, index) => (
          <article
            key={step.number}
            className="grid items-center gap-8 md:gap-12 lg:grid-cols-[.78fr_1.22fr]"
          >
            <div className={index % 2 ? "lg:order-2" : ""}>
              <div className="flex items-center gap-4">
                <span className="text-5xl font-bold tracking-[-.08em] text-[#b9d88b66]">
                  {step.number}
                </span>
                <span className="eyebrow">{step.eyebrow}</span>
              </div>
              <h3 className="mt-6 max-w-md text-[clamp(1.8rem,3vw,3rem)] font-bold leading-[1.1] tracking-[-.055em]">
                {step.title}
              </h3>
              <p className="mt-5 max-w-md text-base leading-relaxed text-[#d1d9cd]">{step.body}</p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#a5b3a4]">{step.detail}</p>
              <Link href={step.href} className="action-text mt-6 text-sm">
                {step.action} <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className={"space-y-4 " + (index % 2 ? "lg:order-1" : "")}>
              <figure className="guide-shot relative overflow-hidden rounded-[24px] border border-[#6673625c] bg-[#1b2320] shadow-[0_28px_90px_#0006]">
                <div className="flex items-center justify-between gap-4 border-b border-[#ffffff16] bg-[#1a211e] px-4 py-3">
                  <span className="flex items-center gap-1.5" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="text-[11px] font-semibold text-[#aebbaa]">
                    {step.label} · pantalla de Maquinal
                  </span>
                </div>
                <img
                  src={step.image}
                  alt={step.alt}
                  className="block aspect-[1.55] w-full object-cover object-top"
                  loading="lazy"
                />
                <figcaption className="border-t border-[#ffffff13] bg-[#1a211e] px-4 py-3 text-xs text-[#a8b5a5]">
                  Las publicaciones identificadas como ejemplo son demostrativas.
                </figcaption>
              </figure>
              {step.secondaryImage ? (
                <figure className="guide-shot relative overflow-hidden rounded-[24px] border border-[#6673625c] bg-[#1b2320] shadow-[0_28px_90px_#0006]">
                  <div className="flex items-center justify-between gap-4 border-b border-[#ffffff16] bg-[#1a211e] px-4 py-3">
                    <span className="flex items-center gap-1.5" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="text-[11px] font-semibold text-[#aebbaa]">
                      Ficha del equipo · pantalla de Maquinal
                    </span>
                  </div>
                  <img
                    src={step.secondaryImage}
                    alt={step.secondaryAlt || "Configuración del equipo"}
                    className="block aspect-[1.55] w-full object-cover object-top"
                    loading="lazy"
                  />
                  <figcaption className="border-t border-[#ffffff13] bg-[#1a211e] px-4 py-3 text-xs text-[#a8b5a5]">
                    El segundo paso pide título, categoría y descripción. Las fotografías y
                    servicios se agregan después.
                  </figcaption>
                </figure>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen overflow-x-clip">
      <section className="relative isolate overflow-hidden border-b border-[#ffffff16] bg-[#151b18]">
        <img
          src="/hero-cargador.jpg"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#101313f5_0%,#101313d8_52%,#1013135e_100%)]" />
        <div className="container-shell grid min-h-[590px] items-center gap-10 py-19 md:grid-cols-[1fr_.48fr] md:py-24">
          <div className="max-w-[780px]">
            <p className="eyebrow">Maquinal · guía de uso</p>
            <h1 className="display mt-6 text-[clamp(3.3rem,6.5vw,6.8rem)]">
              De la búsqueda al contacto. <span className="text-[#cce3af]">Sin vueltas.</span>
            </h1>
            <p className="mt-7 max-w-[590px] text-base leading-relaxed text-[#d3dcd0] md:text-xl">
              Conoce qué hacer en cada pantalla: encuentra maquinaria para tu proyecto o crea una
              vitrina para mostrar la tuya.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#encontrar" className="action-primary text-sm">
                <Search size={17} /> Quiero encontrar maquinaria
              </a>
              <a href="#publicar" className="action-secondary text-sm">
                Quiero publicar <ArrowDown size={17} />
              </a>
            </div>
          </div>
          <div className="hidden md:block justify-self-end max-w-[240px] border-l border-[#d5e3ca50] pl-6 text-sm leading-relaxed text-[#d4dfd0]">
            <span className="eyebrow block mb-3">La idea central</span>Una cuenta para explorar y
            publicar. El contacto se abre al ingresar, y los acuerdos se hacen directamente con el
            proveedor.
          </div>
        </div>
      </section>
      <div className="border-b border-[#ffffff12]">
        <GuideSection
          id="encontrar"
          title="Encuentra el equipo adecuado."
          description="Desde la primera búsqueda hasta el contacto, sabes qué información mirar y qué ocurre al avanzar."
          steps={searchSteps}
          accent="green"
        />
      </div>
      <GuideSection
        id="publicar"
        title="Haz visible tu maquinaria."
        description="Prueba cómo se verá tu oferta, completa lo necesario y publícala con una ficha clara para cada equipo."
        steps={publishSteps}
        accent="warm"
      />
      <section className="border-t border-[#ffffff17] bg-[#19211d]">
        <div className="container-shell grid gap-10 py-16 md:grid-cols-[.85fr_1.15fr] md:items-end md:py-21">
          <div>
            <p className="eyebrow">Antes de empezar</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-.05em] md:text-5xl">
              Un recorrido simple, con responsabilidades claras.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <p className="flex gap-3 text-sm leading-relaxed text-[#c8d3c5]">
              <LockKeyhole size={20} className="shrink-0 text-[#b9d88b]" /> Puedes explorar sin
              cuenta. Para abrir el contacto e iniciar una publicación debes ingresar.
            </p>
            <p className="flex gap-3 text-sm leading-relaxed text-[#c8d3c5]">
              <MessageCircle size={20} className="shrink-0 text-[#b9d88b]" /> El contacto va al
              WhatsApp del proveedor. El arriendo y el pago no se gestionan en Maquinal.
            </p>
            <p className="flex gap-3 text-sm leading-relaxed text-[#c8d3c5]">
              <Check size={20} className="shrink-0 text-[#b9d88b]" /> Las vistas de ejemplo te dejan
              entender el sitio antes de publicar o contactar.
            </p>
            <p className="flex gap-3 text-sm leading-relaxed text-[#c8d3c5]">
              <ShieldCheck size={20} className="shrink-0 text-[#b9d88b]" /> Una misma cuenta sirve
              para buscar equipos y gestionar tu propia vitrina.
            </p>
          </div>
        </div>
      </section>
      <section className="container-shell py-18 md:py-24">
        <div className="flex flex-col gap-7 rounded-[28px] border border-[#6b8061] bg-[radial-gradient(circle_at_80%_5%,#809c6829,transparent_44%),#202a22] p-7 md:flex-row md:items-end md:justify-between md:p-12">
          <div>
            <p className="eyebrow">Elige por dónde partir</p>
            <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-[-.05em] md:text-5xl">
              La siguiente pantalla tiene una tarea concreta.
            </h2>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/maquinaria" className="action-secondary text-sm">
              Explorar maquinaria <ArrowRight size={17} />
            </Link>
            <Link href="/crear-vitrina" className="action-primary text-sm">
              Crear mi vitrina <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
