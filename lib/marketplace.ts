import { getDb } from "@/db";
import { providers, equipment, favorites } from "@/db/schema";
import { and, count, desc, eq, inArray, like, or, type SQL } from "drizzle-orm";
export { imageUrls } from "@/lib/image-urls";
export type Provider = typeof providers.$inferSelect;
export type PublicProvider = Pick<Provider, "id" | "slug" | "name" | "description" | "comuna">;
export type Equipment = typeof equipment.$inferSelect;
const publicProvider = {
  id: providers.id,
  slug: providers.slug,
  name: providers.name,
  description: providers.description,
  comuna: providers.comuna,
};
export async function findProviderByOwner(ownerId: string) {
  const rows = await getDb()
    .select()
    .from(providers)
    .where(eq(providers.ownerId, ownerId))
    .limit(1);
  return rows[0] ?? null;
}
export async function findProviderBySlug(slug: string) {
  const rows = await getDb()
    .select(publicProvider)
    .from(providers)
    .where(eq(providers.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}
export async function findProviderContactBySlug(slug: string) {
  const rows = await getDb()
    .select({
      name: providers.name,
      whatsapp: providers.whatsapp,
      contactEmail: providers.contactEmail,
    })
    .from(providers)
    .innerJoin(
      equipment,
      and(eq(equipment.providerId, providers.id), eq(equipment.status, "active")),
    )
    .where(eq(providers.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}
export async function findEquipmentById(id: string) {
  const rows = await getDb()
    .select({ item: equipment, provider: publicProvider })
    .from(equipment)
    .innerJoin(providers, eq(equipment.providerId, providers.id))
    .where(and(eq(equipment.id, id), eq(equipment.status, "active")))
    .limit(1);
  return rows[0] ?? null;
}
export async function findEquipmentContactById(id: string) {
  const rows = await getDb()
    .select({
      title: equipment.title,
      name: providers.name,
      whatsapp: providers.whatsapp,
      contactEmail: providers.contactEmail,
    })
    .from(equipment)
    .innerJoin(providers, eq(equipment.providerId, providers.id))
    .where(and(eq(equipment.id, id), eq(equipment.status, "active")))
    .limit(1);
  return rows[0] ?? null;
}
export async function listProviderEquipment(providerId: string) {
  return getDb()
    .select()
    .from(equipment)
    .where(eq(equipment.providerId, providerId))
    .orderBy(desc(equipment.createdAt))
    .limit(100);
}
export async function countEquipmentFavorites(equipmentIds: string[]) {
  if (!equipmentIds.length) return new Map<string, number>();
  const rows = await getDb()
    .select({ equipmentId: favorites.equipmentId, total: count() })
    .from(favorites)
    .where(inArray(favorites.equipmentId, equipmentIds))
    .groupBy(favorites.equipmentId);
  return new Map(rows.map(({ equipmentId, total }) => [equipmentId, total]));
}
export async function listPublicProviderEquipment(providerId: string) {
  return getDb()
    .select()
    .from(equipment)
    .where(and(eq(equipment.providerId, providerId), eq(equipment.status, "active")))
    .orderBy(desc(equipment.createdAt))
    .limit(100);
}
export async function findOwnedEquipment(id: string, ownerId: string) {
  const rows = await getDb()
    .select({ item: equipment, provider: providers })
    .from(equipment)
    .innerJoin(providers, eq(equipment.providerId, providers.id))
    .where(and(eq(equipment.id, id), eq(providers.ownerId, ownerId)))
    .limit(1);
  return rows[0] ?? null;
}
export async function listFavoriteEquipment(userId: string) {
  return getDb()
    .select({ item: equipment, provider: publicProvider })
    .from(favorites)
    .innerJoin(equipment, eq(favorites.equipmentId, equipment.id))
    .innerJoin(providers, eq(equipment.providerId, providers.id))
    .where(and(eq(favorites.userId, userId), eq(equipment.status, "active")))
    .orderBy(desc(favorites.createdAt))
    .limit(100);
}
export async function searchEquipment(q: string, comuna: string, category = "") {
  const conditions: SQL[] = [eq(equipment.status, "active")];
  if (q)
    conditions.push(
      or(
        like(equipment.title, "%" + q + "%"),
        like(equipment.category, "%" + q + "%"),
        like(equipment.description, "%" + q + "%"),
      )!,
    );
  if (comuna) conditions.push(eq(providers.comuna, comuna));
  if (category) conditions.push(eq(equipment.category, category));
  return getDb()
    .select({ item: equipment, provider: publicProvider })
    .from(equipment)
    .innerJoin(providers, eq(equipment.providerId, providers.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(equipment.createdAt))
    .limit(100);
}
export function whatsappLink(phone: string, message: string) {
  return "https://wa.me/" + phone.replace(/\D/g, "") + "?text=" + encodeURIComponent(message);
}
