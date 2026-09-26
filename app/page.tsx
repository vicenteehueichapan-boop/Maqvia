import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroCarousel } from "@/components/hero-carousel";
import { HomeDemo } from "@/components/home-demo";
import { ProfileAssistant } from "@/components/profile-assistant";
export const dynamic="force-dynamic";
const paths=[
 {href:"/buscar",image:"/hero-cargador.jpg",alt:"Minicargador en una obra",eyebrow:"Para tu proyecto",title:"Encuentra maquinaria.",body:"Busca por equipo y comuna. Compara opciones e ingresa para contactar al proveedor.",action:"Explorar catálogo"},
 {href:"/publicar",image:"/hero-telescopico.jpg",alt:"Manipulador telescópico en una obra",eyebrow:"Para quienes ofrecen equipos",title:"Publica tus equipos.",body:"Sube fotos y detalles. Tu vitrina muestra tu maquinaria y tus servicios.",action:"Crear mi vitrina"}
];
export default function Home(){return <main className="min-h-screen overflow-x-hidden"><SiteHeader/><HeroCarousel/>
<section id="como-funciona" className="relative overflow-hidden pt-20 md:pt-28 pb-12 md:pb-20"><div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_80%,#324a4938,transparent_64%)]"/><div className="container-shell relative"><div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-6 md:mb-10"><div><p className="eyebrow">Dos formas de empezar</p><h2 className="display mt-4 text-[clamp(2.5rem,4.6vw,4.7rem)]">Maquinaria para avanzar.</h2></div><p className="muted-copy max-w-[360px] text-sm md:text-base">Encuentra el equipo que buscas o da visibilidad a los tuyos. El arriendo se acuerda directamente con cada proveedor.</p></div>
<div className="pathway-stage relative grid md:grid-cols-2 min-h-[830px] md:min-h-[560px]">{paths.map(item=><Link key={item.href} href={item.href} className="group relative isolate min-h-[420px] md:min-h-[560px] overflow-hidden"><img src={item.image} alt={item.alt} className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"/><div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#101313fa] via-[#101313a6] to-[#10131322]"/><div className="absolute inset-0 flex flex-col justify-end px-5 md:px-10 lg:px-12 pb-14 md:pb-16"><p className="text-xs font-bold tracking-[.13em] uppercase text-[#d0e4b9]">{item.eyebrow}</p><h3 className="mt-3 text-[clamp(2rem,3vw,3.2rem)] font-bold leading-tight tracking-[-.05em]">{item.title}</h3><p className="mt-3 max-w-sm text-sm md:text-base leading-relaxed text-[#e0e4dc]">{item.body}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#d5e9ba]">{item.action} <ArrowUpRight size={18}/></span></div></Link>)}</div><p className="mt-1 text-xs text-[#899789]">Imágenes ilustrativas. Las condiciones de arriendo se acuerdan directamente con cada proveedor.</p></div></section>
<HomeDemo/><ProfileAssistant/><SiteFooter/></main>}