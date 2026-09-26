import { notFound } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { ContactDestination } from "@/components/contact-destination";
import { findProviderContactBySlug, whatsappLink } from "@/lib/marketplace";
export const dynamic="force-dynamic";
export default async function ContactProvider({params}:{params:Promise<{slug:string}>}){const {slug}=await params;await requireChatGPTUser("/contactar/proveedor/"+encodeURIComponent(slug));const provider=await findProviderContactBySlug(slug);if(!provider)notFound();const url=whatsappLink(provider.whatsapp,"Hola, encontré tu vitrina en Maquinal y quiero consultar por tu maquinaria.");return <ContactDestination back={"/proveedores/"+slug} name={provider.name} subject={"los equipos y servicios disponibles"} url={url}/>}
