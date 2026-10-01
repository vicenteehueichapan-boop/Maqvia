import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { equipment, providers } from "@/db/schema";
import { findOwnedEquipment } from "@/lib/marketplace";
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
import { and, eq } from "drizzle-orm";

type Context = { params: Promise<{ id: string }> };

function value(form: FormData, key: string, max: number) {
  return String(form.get(key) || "")
    .trim()
    .slice(0, max);
}

function retainedKeys(form: FormData, original: string): string[] | null {
  let requested: unknown;
  let saved: unknown;
  try {
    requested = JSON.parse(value(form, "existingImages", 5000));
    saved = JSON.parse(original);
  } catch {
    return null;
  }
  if (!Array.isArray(requested) || !Array.isArray(saved)) return null;
  const allowed = new Set(saved.filter((key): key is string => typeof key === "string"));
  const keys = requested.map((url) => {
    if (typeof url !== "string" || !url.startsWith("/api/imagenes/")) return null;
    try {
      return decodeURIComponent(url.slice("/api/imagenes/".length));
    } catch {
      return null;
    }
  });
  if (keys.some((key) => !key || !allowed.has(key)) || new Set(keys).size !== keys.length)
    return null;
  return keys as string[];
}

export async function PATCH(request: Request, context: Context) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      const user = await getChatGPTUser();
      if (!user) return Response.json({ error: "Inicia sesión." }, { status: 401 });
      const { id } = await context.params;
      const body: unknown = await request.json().catch(() => null);
      const status = body && typeof body === "object" && "status" in body ? body.status : null;
      if (status !== "active" && status !== "paused" && status !== "archived")
        return Response.json({ error: "Estado inválido." }, { status: 400 });
      const owned = await findOwnedEquipment(id, user.userId);
      if (!owned) return Response.json({ error: "Publicación no encontrada." }, { status: 404 });
      await getDb()
        .update(equipment)
        .set({ status })
        .where(and(eq(equipment.id, id), eq(equipment.providerId, owned.provider.id)));
      return Response.json({ status });
    } catch (error) {
      console.error("change_equipment_status_error", error);
      return Response.json(
        { error: "No pudimos cambiar el estado. Intenta nuevamente." },
        { status: 500 },
      );
    }
  }
  if (!contentType.includes("multipart/form-data"))
    return Response.json({ error: "Formato inválido." }, { status: 415 });
  const newKeys: string[] = [];
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "Inicia sesión." }, { status: 401 });
    const { id } = await context.params;
    const owned = await findOwnedEquipment(id, user.userId);
    if (!owned) return Response.json({ error: "Publicación no encontrada." }, { status: 404 });
    const form = await request.formData();
    const raw = readPublicationForm(form);
    const parsed = publicationSchema.safeParse(raw);
    if (!parsed.success)
      return Response.json(
        { error: parsed.error.issues[0]?.message || "Revisa los datos." },
        { status: 400 },
      );
    const phone = normalizeChileanWhatsApp(raw.whatsapp);
    if (!phone) return Response.json({ error: "WhatsApp inválido." }, { status: 400 });
    const keys = retainedKeys(form, owned.item.images);
    if (!keys) return Response.json({ error: "Fotos existentes inválidas." }, { status: 400 });
    const uploads = publicationUploads(form);
    if (keys.length + uploads.length < 1 || keys.length + uploads.length > 4)
      return Response.json({ error: "Mantén entre 1 y 4 fotos." }, { status: 400 });
    if (invalidPublicationImage(uploads))
      return Response.json(
        { error: "Cada foto debe ser JPG, PNG o WebP y pesar menos de 5 MB." },
        { status: 400 },
      );
    const bucket = env.BUCKET;
    if (uploads.length && !bucket)
      return Response.json(
        { error: "El almacenamiento de imágenes no está disponible." },
        { status: 503 },
      );
    for (const file of uploads) {
      const key = crypto.randomUUID() + "." + imageTypes[file.type];
      await bucket!.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
      newKeys.push(key);
    }
    const db = getDb();
    const providerWrite = db
      .update(providers)
      .set(providerFields(parsed.data, phone, new Date().toISOString()))
      .where(and(eq(providers.id, owned.provider.id), eq(providers.ownerId, user.userId)));
    const equipmentWrite = db
      .update(equipment)
      .set(equipmentFields(parsed.data, [...keys, ...newKeys]))
      .where(and(eq(equipment.id, id), eq(equipment.providerId, owned.provider.id)));
    await db.batch([providerWrite, equipmentWrite]);
    return Response.json({ url: "/maquinaria/" + id, itemUrl: "/maquinaria/" + id });
  } catch (error) {
    console.error("edit_equipment_error", error);
    if (newKeys.length) {
      const cleanup = await Promise.allSettled(newKeys.map((key) => env.BUCKET!.delete(key)));
      if (cleanup.some((result) => result.status === "rejected"))
        console.error("edit_image_cleanup_error", cleanup);
    }
    return Response.json({ error: "No pudimos guardar los cambios." }, { status: 500 });
  }
}
