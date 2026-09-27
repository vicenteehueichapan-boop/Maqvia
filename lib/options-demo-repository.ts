export type OptionsDemoDraft = {
  mode: "automatic" | "manual";
  priceKind: "consult" | "fixed" | "from";
  amount: string;
  unit: "" | "hour" | "day" | "week" | "month";
  operator: boolean;
  operatorKind: "included" | "consult" | "fixed" | "from";
  operatorAmount: string;
  operatorUnit: "" | "hour" | "day" | "week" | "month";
  comuna: string;
  sector: string;
};
const key = "maquinal_options_demo_v1";
export function readOptionsDemoDraft(): OptionsDemoDraft | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const item = value as Record<string, unknown>;
    if (!(["automatic", "manual"].includes(String(item.mode)) && ["consult", "fixed", "from"].includes(String(item.priceKind)) && ["included", "consult", "fixed", "from"].includes(String(item.operatorKind)) && typeof item.operator === "boolean")) return null;
    for (const field of ["amount", "unit", "operatorAmount", "operatorUnit", "comuna", "sector"]) if (typeof item[field] !== "string" || item[field].length > 80) return null;
    if (!["", "hour", "day", "week", "month"].includes(String(item.unit)) || !["", "hour", "day", "week", "month"].includes(String(item.operatorUnit))) return null;
    return item as OptionsDemoDraft;
  } catch (error) { console.warn("No pudimos recuperar las opciones de ejemplo.", error); return null; }
}
export function writeOptionsDemoDraft(value: OptionsDemoDraft): boolean {
  try { sessionStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (error) { console.warn("No pudimos conservar las opciones de ejemplo.", error); return false; }
}
