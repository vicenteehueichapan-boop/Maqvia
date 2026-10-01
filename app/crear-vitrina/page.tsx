import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Images, MessageCircle } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { QuickListingPreview } from "@/components/quick-listing-preview";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";

export const metadata: Metadata = {
  title: "Publicar maquinaria | Maqvia",
  description:
    "Publica tu maquinaria en Maqvia en minutos. Sube fotos, describe el equipo y recibe consultas directas por WhatsApp desde Santiago.",
};
export const dynamic = "force-dynamic";

export default async function CreateShowcasePage() {
  const user = await getChatGPTUser();
  const continueHref = user ? "/publicar" : chatGPTSignInPath("/publicar");

  return (
    <main className="min-h-screen overflow-x-clip">
      {/* ── Hero de entrada: impacto inmediato ── */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_60%_0%,#2a4a3520,transparent_55%)]" />
        <div className="container-shell pt-12 pb-8 md:pt-10 md:pb-8">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#b9d88b33] bg-[#b9d88b0d] px-4 py-2 text-xs font-semibold text-[#a8cd7e]">
              Publicaciones de maquinaria en Santiago
            </div>
            <h1 className="display text-[clamp(2.8rem,5vw,4rem)]">
              Presenta tu maquinaria <br />
              <span className="text-gradient">con claridad.</span>
            </h1>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-[#cdd5c9] md:text-lg">
              Prueba cómo se verá tu equipo en el catálogo. Después completa tu perfil, revisa la
              ficha y decide si quieres publicarla. Las consultas llegan directamente a ti.
            </p>

            {/* Trust indicators */}
            <div className="mt-5 flex flex-wrap gap-5 text-sm text-[#9eaa9b]">
              <span className="flex items-center gap-2">
                <Shield size={15} className="text-[#b9d88b]" /> Vista previa privada
              </span>
              <span className="flex items-center gap-2">
                <Images size={15} className="text-[#b9d88b]" /> Fotos y datos ajustables
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle size={15} className="text-[#b9d88b]" /> Contacto directo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Wizard: la experiencia central ── */}
      <section
        id="vista-previa"
        className="scroll-mt-16 border-t border-[#1e2b22] bg-[#0c100e] pb-24"
      >
        <QuickListingPreview continueHref={continueHref} />
      </section>

      {/* ── Por qué Maqvia (para los que dudan) ── */}
      <section className="border-t border-[#1e2b22]">
        <div className="container-shell py-20 md:py-28">
          <p className="eyebrow text-center">Para quienes ofrecen maquinaria</p>
          <h2 className="display mt-5 text-center text-[clamp(2rem,3.5vw,3.5rem)] max-w-xl mx-auto">
            ¿Por qué publicar en Maqvia?
          </h2>
          <div className="mt-14 grid sm:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                t: "Sin intermediarios",
                d: "El cliente te habla directamente. Tú acuerdas el precio, las condiciones y el horario. No gestionamos el arriendo.",
              },
              {
                n: "02",
                t: "Tu vitrina siempre activa",
                d: "Una vez publicado, tu equipo aparece en búsquedas las 24 horas. No necesitas estar en línea para recibir consultas.",
              },
              {
                n: "03",
                t: "Creces con nosotros",
                d: "Puedes presentar cada equipo con fotos, servicios y condiciones para que quien lo busque entienda tu oferta.",
              },
            ].map((item) => (
              <div key={item.n} className="premium-surface rounded-2xl p-7">
                <p className="eyebrow">{item.n}</p>
                <h3 className="mt-4 font-semibold tracking-tight">{item.t}</h3>
                <p className="muted-copy mt-3 text-sm leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA secundario ── */}
      <section className="border-t border-[#1e2b22] bg-[#0c100e]">
        <div className="container-shell py-14 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="eyebrow">¿Prefieres ver el catálogo?</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Explora la maquinaria disponible en Santiago.
            </h2>
          </div>
          <Link href="/maquinaria" className="action-secondary flex-none text-sm">
            Ver catálogo <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
