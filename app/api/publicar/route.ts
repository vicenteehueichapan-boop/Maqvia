import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { providers, equipment } from "@/db/schema";
import { findProviderByOwner } from "@/lib/marketplace";
import { eq } from "drizzle-orm";

function val(form:FormData,key:string,max:number){return String(form.get(key)||"").trim().slice(0,max)}
function slugify(s:string){return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,48)||"proveedor"}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:"Inicia sesión para publicar."},{status:401});
 try{
  const form=await request.formData();const name=val(form,"name",90),description=val(form,"description",600),comuna=val(form,"comuna",80),phone=val(form,"whatsapp",30),title=val(form,"title",100),category=val(form,"category",70),details=val(form,"details",800);
  const cleanPhone=phone.replace(/\D/g,"");if(!name||!description||!comuna||!title||!category||!details||!/^56[0-9]{9}$/.test(cleanPhone))return Response.json({error:"Completa todos los datos y usa un WhatsApp chileno en formato +56 9 XXXX XXXX."},{status:400});
  const uploads=form.getAll("images").filter((x):x is File=>x instanceof File&&x.size>0);if(uploads.length<1||uploads.length>4)return Response.json({error:"Sube entre 1 y 4 fotos de la máquina."},{status:400});
  const types:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};for(const file of uploads){if(!types[file.type]||file.size>5_000_000)return Response.json({error:"Las fotos deben ser JPG, PNG o WebP y pesar menos de 5 MB cada una."},{status:400})}
  if(!env.BUCKET)return Response.json({error:"El almacenamiento de imágenes no está disponible."},{status:503});
  const keys:string[]=[];for(const file of uploads){const key=crypto.randomUUID()+"."+types[file.type];await env.BUCKET.put(key,file.stream(),{httpMetadata:{contentType:file.type}});keys.push(key)}
  const now=new Date().toISOString();const db=getDb();let provider=await findProviderByOwner(user.userId);
  if(provider){await db.update(providers).set({name,description,comuna,whatsapp:cleanPhone,updatedAt:now}).where(eq(providers.id,provider.id))}
  else{const id=crypto.randomUUID();const slug=slugify(name)+"-"+id.slice(0,6);provider={id,ownerId:user.userId,slug,name,description,comuna,whatsapp:cleanPhone,createdAt:now,updatedAt:now};await db.insert(providers).values(provider)}
  const itemId=crypto.randomUUID();await db.insert(equipment).values({id:itemId,providerId:provider.id,title,category,description:details,images:JSON.stringify(keys),operator:form.get("operator")==="yes"?"yes":"no",delivery:form.get("delivery")==="yes"?"yes":"no",createdAt:now});
  return Response.json({url:"/proveedores/"+provider.slug,itemUrl:"/equipos/"+itemId},{status:201});
 }catch(error){console.error("publish_error",error);return Response.json({error:"No pudimos guardar la publicación. Inténtalo nuevamente."},{status:500})}
}
