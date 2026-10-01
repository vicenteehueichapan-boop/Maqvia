import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { providers, equipment } from "@/db/schema";
import { findProviderByOwner } from "@/lib/marketplace";
import { eq } from "drizzle-orm";
import { publicationSchema } from "@/lib/publication-validation";
import { normalizeChileanWhatsApp } from "@/lib/contact-inquiry";
import {
  equipmentFields,
  imageTypes,
  invalidPublicationImage,
  providerFields,
  publicationUploads,
  readPublicationForm,
} from "@/lib/server/publication-payload";
function slugify(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "proveedor"
  );
}
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Inicia sesión para publicar." }, { status: 401 });
  const uploadedKeys: string[] = [];
  try {
    const form = await request.formData();
    const parsed = publicationSchema.safeParse(readPublicationForm(form));
    if (!parsed.success)
      return Response.json(
        { error: parsed.error.issues[0]?.message || "Revisa los datos de la publicación." },
        { status: 400 },
      );
    const cleanPhone = normalizeChileanWhatsApp(parsed.data.whatsapp);
    if (!cleanPhone)
      return Response.json({ error: "Ingresa un WhatsApp chileno válido." }, { status: 400 });
    const uploads = publicationUploads(form);
    if (uploads.length < 1 || uploads.length > 4)
      return Response.json({ error: "Sube entre 1 y 4 fotos de la máquina." }, { status: 400 });
    if (invalidPublicationImage(uploads))
      return Response.json(
        { error: "Las fotos deben ser JPG, PNG o WebP y pesar menos de 5 MB cada una." },
        { status: 400 },
      );
    if (!env.BUCKET)
      return Response.json(
        { error: "El almacenamiento de imágenes no está disponible." },
        { status: 503 },
      );
    for (const file of uploads) {
      const key = crypto.randomUUID() + "." + imageTypes[file.type];
      await env.BUCKET.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
      uploadedKeys.push(key);
    }
    const now = new Date().toISOString();
    const db = getDb();
    const existingProvider = await findProviderByOwner(user.userId);
    const id = crypto.randomUUID();
    const provider = existingProvider ?? {
      id,
      ownerId: user.userId,
      slug: slugify(parsed.data.name) + "-" + id.slice(0, 6),
      ...providerFields(parsed.data, cleanPhone, now),
      createdAt: now,
    };
    const providerWrite = existingProvider
      ? db
          .update(providers)
          .set(providerFields(parsed.data, cleanPhone, now))
          .where(eq(providers.id, existingProvider.id))
      : db.insert(providers).values(provider);
    const itemId = crypto.randomUUID();
    const equipmentWrite = db.insert(equipment).values({
      id: itemId,
      providerId: provider.id,
      ...equipmentFields(parsed.data, uploadedKeys),
      createdAt: now,
    });
    await db.batch([providerWrite, equipmentWrite]);
    return Response.json(
      { url: "/proveedores/" + provider.slug, itemUrl: "/maquinaria/" + itemId },
      { status: 201 },
    );
  } catch (error) {
    console.error("publish_error", error);
    if (uploadedKeys.length) {
      const cleanup = await Promise.allSettled(uploadedKeys.map((key) => env.BUCKET!.delete(key)));
      if (cleanup.some((result) => result.status === "rejected"))
        console.error("publish_image_cleanup_error", cleanup);
    }
    return Response.json(
      { error: "No pudimos guardar la publicación. Inténtalo nuevamente." },
      { status: 500 },
    );
  }
}
