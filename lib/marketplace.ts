import { getDb } from "@/db";
import { providers, equipment } from "@/db/schema";
import { and, desc, eq, like, or } from "drizzle-orm";
export type Provider=typeof providers.$inferSelect;
export type Equipment=typeof equipment.$inferSelect;
export async function findProviderByOwner(ownerId:string){const rows=await getDb().select().from(providers).where(eq(providers.ownerId,ownerId)).limit(1);return rows[0]??null}
export async function findProviderBySlug(slug:string){const rows=await getDb().select().from(providers).where(eq(providers.slug,slug)).limit(1);return rows[0]??null}
export async function findEquipmentById(id:string){const rows=await getDb().select({item:equipment,provider:providers}).from(equipment).innerJoin(providers,eq(equipment.providerId,providers.id)).where(eq(equipment.id,id)).limit(1);return rows[0]??null}
export async function listProviderEquipment(providerId:string){return getDb().select().from(equipment).where(eq(equipment.providerId,providerId)).orderBy(desc(equipment.createdAt)).limit(100)}
export async function searchEquipment(q:string,comuna:string){const conditions=[];if(q)conditions.push(or(like(equipment.title,"%"+q+"%"),like(equipment.category,"%"+q+"%"),like(equipment.description,"%"+q+"%")));if(comuna)conditions.push(eq(providers.comuna,comuna));return getDb().select({item:equipment,provider:providers}).from(equipment).innerJoin(providers,eq(equipment.providerId,providers.id)).where(conditions.length?and(...conditions):undefined).orderBy(desc(equipment.createdAt)).limit(100)}
export function imageUrls(raw:string){try{const keys=JSON.parse(raw);return Array.isArray(keys)?keys.filter((x):x is string=>typeof x==="string").map(x=>"/api/imagenes/"+encodeURIComponent(x)):[]}catch{return []}}
export function whatsappLink(phone:string,message:string){return "https://wa.me/"+phone.replace(/\D/g,"")+"?text="+encodeURIComponent(message)}
