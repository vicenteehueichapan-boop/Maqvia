import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Camera,
  Check,
  MapPin,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { ProfileAssistantV2 } from "@/components/profile-assistant-v2";

export const metadata: Metadata = {
  title: "Crear mi vitrina | Maquinal",
  description:
    "Presenta tu maquinaria y servicios en Santiago con fotos, fichas claras y contacto directo por WhatsApp.",
};
export const dynamic = "force-dynamic";

const stages = [
  {
    number: "01",
    title: "Muestra quién eres",
    body: "Agrega el nombre de tu negocio, tu comuna, una descripción breve y el WhatsApp en el que recibirás consultas.",
    icon: UserRound,
  },
  {
    number: "02",
    title: "Explica cada equipo",
    body: "Sube fotos, elige una categoría y describe características, operador, traslado y zonas de trabajo. Una ficha clara ayuda a decidir.",
    icon: Camera,
  },
  {
    number: "03",
    title: "Recibe consultas directas",
    body: "Tu vitrina reúne las publicaciones. Quien inicie sesión podrá abrir tu contacto y hablar contigo sin pasar el arriendo por Maquinal.",
    icon: MessageCircle,
  },
];

export default function CreateShowcasePage() {
  return (
    <main className="min-h-screen overflow-x-clip">
      <section className="relative isolate overflow-hidden border-b border-[#ffffff17] bg-[#17201d]">
        <img
          src="/hero-telescopico.jpg"
          alt="Maquinaria elevando materiales en una obra de Santiago"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[60%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#101513f7_0%,#111916dc_43%,#1119165c_100%)]" />
        <div className="container-shell flex min-h-[690px] items-center py-18 md:min-h-[760px]">
          <div className="max-w-[710px]">
            <p className="eyebrow">Para quienes ofrecen maquinaria y servicios</p>
            <h1 className="display mt-6 text-[clamp(3.4rem,6.7vw,7rem)]">
              Que tu trabajo se vea <span className="text-[#d0e5b6]">tan bien como se hace.</span>
            </h1>
            <p className="mt-7 max-w-[540px] text-base leading-relaxed text-[#d9e1d5] md:text-xl">
              Crea un perfil con tus equipos, sus fotos y la información que un cliente necesita
              para encontrarte en Santiago.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/publicar" className="action-primary text-sm">
                Comenzar mi vitrina <ArrowUpRight size={17} />
              </Link>
              <a href="#vista-previa" className="action-secondary text-sm">
                Probar una vista previa <ArrowDown size={17} />
              </a>
            </div>
            <p className="mt-5 text-xs text-[#bdcbb8]">
              Puedes probar la vista previa antes de ingresar. Necesitas una cuenta para publicar.
            </p>
          </div>
        </div>
      </section>
      <section className="container-shell py-20 md:py-28">
        <div className="grid gap-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div>
            <p className="eyebrow">Tu espacio en Maquinal</p>
            <h2 className="display mt-4 text-[clamp(2.7rem,4.8vw,5rem)]">
              Cada dato tiene un propósito.
            </h2>
          </div>
          <p className="muted-copy max-w-xl text-base md:ml-auto md:text-lg">
            La vitrina presenta tu negocio; las fichas explican qué ofrece cada máquina o servicio.
            El objetivo es que el cliente llegue a tu WhatsApp con una idea más clara de lo que
            necesita.
          </p>
        </div>
        <div className="mt-14 grid gap-0 border-t border-[#60715d70] md:grid-cols-3">
          {stages.map((stage, index) => (
            <article
              key={stage.number}
              className="border-b border-[#60715d70] px-1 py-8 md:border-b-0 md:px-8 md:py-10 first:md:pl-0 last:md:pr-0 md:[&+article]:border-l md:[&+article]:border-[#60715d70]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-[.2em] text-[#b9d88b]">
                  {stage.number}
                </span>
                <stage.icon size={22} className="text-[#b9d88b]" />
              </div>
              <h3 className="mt-12 text-2xl font-bold tracking-[-.045em]">{stage.title}</h3>
              <p className="muted-copy mt-3 text-sm">{stage.body}</p>
              {index === 2 ? (
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#cce0bd]">
                  <Check size={15} /> Trato directo con el cliente
                </span>
              ) : null}
            </article>
          ))}
        </div>
      </section>
      <section className="border-y border-[#ffffff17] bg-[#18211d]">
        <div className="container-shell grid gap-0 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative isolate min-h-[440px] overflow-hidden lg:min-h-[620px]">
            <img
              src="/hero-maquinaria.webp"
              alt="Maquinaria de ejemplo para una vitrina de proveedor"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 -z-20 h-full w-full object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#101513eb] via-transparent to-transparent" />
            <span className="absolute bottom-7 left-7 rounded-full border border-[#d4e3c376] bg-[#16221be0] px-3 py-1.5 text-[11px] font-bold tracking-[.12em] text-[#d9ebc8]">
              VITRINA DEMOSTRATIVA
            </span>
          </div>
          <div className="flex flex-col justify-center px-6 py-14 md:px-12 lg:px-16">
            <p className="eyebrow">Así podría presentarse tu negocio</p>
            <h2 className="mt-5 text-[clamp(2.5rem,4vw,4.5rem)] font-bold leading-[1.08] tracking-[-.06em]">
              Una página que trabaja por tus equipos.
            </h2>
            <p className="muted-copy mt-6 max-w-md">
              Un nombre reconocible, tu zona de trabajo, una explicación del servicio y fichas que
              muestran cada equipo. Todo en un lugar fácil de explorar.
            </p>
            <div className="mt-8 space-y-3 border-t border-[#5b6c5a] pt-6 text-sm text-[#d0dccc]">
              <p className="flex items-center gap-3">
                <Camera size={17} className="text-[#b9d88b]" /> Fotos que muestran el equipo
              </p>
              <p className="flex items-center gap-3">
                <MapPin size={17} className="text-[#b9d88b]" /> Comuna y datos relevantes
              </p>
              <p className="flex items-center gap-3">
                <MessageCircle size={17} className="text-[#b9d88b]" /> Contacto directo al ingresar
              </p>
            </div>
            <Link
              href="/demo/proveedores/andes-maquinarias-demo"
              className="action-text mt-8 self-start text-sm"
            >
              Explorar vitrina de ejemplo <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      <div id="vista-previa">
        <ProfileAssistantV2 />
      </div>
      <section className="container-shell py-18 md:py-24">
        <div className="grid gap-9 rounded-[28px] border border-[#72876980] bg-[radial-gradient(circle_at_80%_10%,#819e6940,transparent_48%),#202a22] p-7 md:grid-cols-[1fr_auto] md:items-end md:p-12">
          <div>
            <p className="eyebrow">Cuando estés listo</p>
            <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-[-.05em] md:text-5xl">
              De la vista previa a una publicación real.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#bdccbb]">
              Ingresa con tu cuenta, completa la información y revisa tu perfil antes de publicar.
              Tu primera vitrina es gratuita en esta etapa.
            </p>
          </div>
          <Link href="/publicar" className="action-primary text-sm">
            Ir al formulario de publicación <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
