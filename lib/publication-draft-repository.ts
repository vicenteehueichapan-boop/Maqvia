import { type PublicationValues } from "./publication-validation";

const key = "maquinal_publication_draft_v2";
const photosKey = "maquinal_publication_photos_v2";
export type SavedPhoto = { name: string; dataUrl: string };

export function readPublicationDraft(): PublicationValues | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") throw new Error("El borrador no tiene el formato esperado.");
    const allowed = ["name", "whatsapp", "comuna", "description", "title", "category", "details", "operator", "delivery"] as const;
    const entries = allowed.map(field => [field, (data as Record<string, unknown>)[field]] as const);
    if (entries.some(([, value]) => typeof value !== "string" || value.length > 800)) throw new Error("El borrador contiene datos inválidos.");
    const result = Object.fromEntries(entries) as PublicationValues;
    if (!["yes", "no"].includes(result.operator) || !["yes", "no"].includes(result.delivery)) throw new Error("El borrador contiene opciones inválidas.");
    return result;
  } catch (error) {
    console.warn("No pudimos recuperar el borrador.", error);
    try { sessionStorage.removeItem(key); } catch (removeError) { console.warn("No pudimos quitar el borrador dañado.", removeError); }
    return null;
  }
}

export function writePublicationDraft(values: PublicationValues): boolean {
  try { sessionStorage.setItem(key, JSON.stringify(values)); return true; }
  catch (error) { console.warn("No pudimos guardar el borrador.", error); return false; }
}

export function clearPublicationDraft(): void {
  try { sessionStorage.removeItem(key); sessionStorage.removeItem(photosKey); }
  catch (error) { console.warn("No pudimos borrar el borrador.", error); }
}

export function readPublicationPhotos(): SavedPhoto[] {
  try {
    const raw = sessionStorage.getItem(photosKey);
    const value: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(value)) throw new Error("Fotos inválidas.");
    return value.slice(0, 4).filter((item): item is SavedPhoto => item && typeof item.name === "string" && item.name.length < 120 && typeof item.dataUrl === "string" && /^data:image\/jpeg;base64,/.test(item.dataUrl) && item.dataUrl.length < 400_000);
  } catch (error) { console.warn("No pudimos recuperar las fotos del borrador.", error); return []; }
}

export function writePublicationPhotos(photos: SavedPhoto[]): boolean {
  try { sessionStorage.setItem(photosKey, JSON.stringify(photos)); return true; }
  catch (error) { console.warn("No pudimos conservar las fotos del borrador.", error); return false; }
}

export function readAssistantHandoff(): { values: Partial<PublicationValues>; photos: SavedPhoto[] } | null {
  try {
    const raw = sessionStorage.getItem("maquinal_draft");
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    const allowed = ["name", "comuna", "description", "title", "category", "details", "operator", "delivery"] as const;
    const values = Object.fromEntries(allowed.filter(field => typeof (data as Record<string, unknown>)[field] === "string").map(field => [field, (data as Record<string, string>)[field].slice(0, 800)])) as Partial<PublicationValues>;
    const imageRaw = sessionStorage.getItem("maquinal_images");
    const imageData: unknown = imageRaw ? JSON.parse(imageRaw) : [];
    const photos = Array.isArray(imageData) ? imageData.slice(0, 4).filter((item): item is { name: string; url: string } => item && typeof item.name === "string" && typeof item.url === "string" && /^data:image\/jpeg;base64,/.test(item.url) && item.url.length < 400_000).map(item => ({ name: item.name, dataUrl: item.url })) : [];
    return { values, photos };
  } catch (error) { console.warn("No pudimos recuperar la vista previa.", error); return null; }
}

export function clearAssistantHandoff(): void {
  try { sessionStorage.removeItem("maquinal_draft"); sessionStorage.removeItem("maquinal_images"); }
  catch (error) { console.warn("No pudimos limpiar la vista previa local.", error); }
}

export function writeAssistantHandoff(values: Partial<PublicationValues>, photos: SavedPhoto[]): boolean {
  try {
    sessionStorage.setItem("maquinal_draft", JSON.stringify(values));
    sessionStorage.setItem("maquinal_images", JSON.stringify(photos.map(photo => ({ name: photo.name, url: photo.dataUrl }))));
    return true;
  } catch (error) { console.warn("No pudimos conservar la vista previa.", error); return false; }
}
