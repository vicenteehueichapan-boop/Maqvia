import Link from "next/link";
import { ArrowLeft, Check, MessageCircle, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { InquiryForm } from "@/components/inquiry-form";

export function ContactDestination({ back, name, subject, phone }: { back: string; name: string; subject: string; phone: string }) {
  return <main className="min-h-screen"><SiteHeader/><div className="container-shell max-w-4xl py-13 md:py-19">
    <Link href={back} className="inline-flex items-center gap-2 text-sm text-[#aeb9aa] hover:text-white"><ArrowLeft size={16}/> Volver a la ficha</Link>
    <div className="mt-8 rounded-[30px] premium-panel p-7 md:p-12 relative overflow-hidden ambient-warm"><div className="relative max-w-2xl">
      <span className="grid place-items-center w-13 h-13 rounded-2xl bg-[#b9d88b22] text-[#c8e3a8]"><MessageCircle size={25}/></span>
      <p className="eyebrow mt-7">Consulta directa</p>
      <h1 className="display mt-4 text-[clamp(2.8rem,5vw,4.8rem)]">Consulta a <span className="serif-accent text-[#bfd6a1]">{name}.</span></h1>
      <p className="muted-copy mt-5">Prepara una consulta breve por {subject}. Revisarás el texto antes de abrir WhatsApp.</p>
      <InquiryForm subject={subject} phone={phone} draftKey={back} kind={back.startsWith("/proveedores/") ? "provider" : "item"}/>
      <div className="mt-9 pt-6 border-t border-[#4b5b4d] grid sm:grid-cols-2 gap-5"><p className="flex items-start gap-3 text-xs leading-relaxed text-[#adbdab]"><Check size={17} className="shrink-0 text-[#b9d88b]"/> Tu cuenta permite contactar sin otro registro.</p><p className="flex items-start gap-3 text-xs leading-relaxed text-[#adbdab]"><ShieldCheck size={17} className="shrink-0 text-[#b9d88b]"/> El acuerdo de arriendo y el pago se hacen directamente con el proveedor.</p></div>
    </div></div>
  </div><SiteFooter/></main>;
}
