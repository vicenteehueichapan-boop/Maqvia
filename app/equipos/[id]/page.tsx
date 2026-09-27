import { redirect } from "next/navigation";

export default async function LegacyEquipment({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/maquinaria/${encodeURIComponent(id)}`);
}
