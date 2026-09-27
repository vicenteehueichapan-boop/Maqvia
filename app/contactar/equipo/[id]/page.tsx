import { notFound } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { ContactDestination } from "@/components/contact-destination";
import { findEquipmentContactById } from "@/lib/marketplace";
export const dynamic="force-dynamic";
export default async function ContactEquipment({params}:{params:Promise<{id:string}>}){const {id}=await params;await requireChatGPTUser("/contactar/equipo/"+encodeURIComponent(id));const item=await findEquipmentContactById(id);if(!item)notFound();return <ContactDestination back={"/equipos/"+id} name={item.name} subject={item.title} phone={item.whatsapp}/>}
