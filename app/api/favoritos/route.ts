import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { equipment, favorites } from "@/db/schema";
import { and, eq } from "drizzle-orm";

async function equipmentIdFrom(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("equipmentId" in body)) return null;
  const id = (body as { equipmentId: unknown }).equipmentId;
  return typeof id === "string" && id.length > 0 && id.length <= 80 ? id : null;
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Inicia sesión." }, { status: 401 });
  const rows = await getDb()
    .select({ id: favorites.equipmentId })
    .from(favorites)
    .innerJoin(equipment, eq(favorites.equipmentId, equipment.id))
    .where(and(eq(favorites.userId, user.userId), eq(equipment.status, "active")));
  return Response.json({ ids: rows.map((row) => row.id) });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Inicia sesión." }, { status: 401 });
  const equipmentId = await equipmentIdFrom(request);
  if (!equipmentId) return Response.json({ error: "Publicación inválida." }, { status: 400 });
  const rows = await getDb()
    .select({ id: equipment.id })
    .from(equipment)
    .where(and(eq(equipment.id, equipmentId), eq(equipment.status, "active")))
    .limit(1);
  if (!rows.length) return Response.json({ error: "Publicación no disponible." }, { status: 404 });
  await getDb()
    .insert(favorites)
    .values({ userId: user.userId, equipmentId, createdAt: new Date().toISOString() })
    .onConflictDoNothing();
  return Response.json({ saved: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Inicia sesión." }, { status: 401 });
  const equipmentId = await equipmentIdFrom(request);
  if (!equipmentId) return Response.json({ error: "Publicación inválida." }, { status: 400 });
  await getDb()
    .delete(favorites)
    .where(and(eq(favorites.userId, user.userId), eq(favorites.equipmentId, equipmentId)));
  return Response.json({ saved: false });
}
