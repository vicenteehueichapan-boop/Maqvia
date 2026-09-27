import { redirect } from "next/navigation";

export default async function LegacySearch({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const key of ["q", "comuna", "category"]) {
    const value = params[key];
    if (typeof value === "string" && value.trim()) query.set(key, value.trim());
  }
  redirect(`/maquinaria${query.size ? `?${query.toString()}` : ""}`);
}
