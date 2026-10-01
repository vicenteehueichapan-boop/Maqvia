import { type PublicationValues } from "./publication-validation.ts";

const key = "maquinal_publication_draft_v2";
const photosKey = "maquinal_publication_photos_v2";
// Keep the existing prefixes so a preview made before sign-in survives the rename.
const scopedKey = (prefix: string, ownerId?: string, editId?: string) =>
  ownerId
    ? `${prefix}:owner:${encodeURIComponent(ownerId)}${editId ? `:edit:${encodeURIComponent(editId)}` : ""}`
    : prefix;
const draftKeyFor = (ownerId?: string, editId?: string) => scopedKey(key, ownerId, editId);
const photosKeyFor = (ownerId?: string, editId?: string) => scopedKey(photosKey, ownerId, editId);
export type SavedPhoto = { name: string; dataUrl: string; sourceUrl?: string };

/** Move the anonymous preview into the first account that continues it. */
export function claimAnonymousPublicationDraft(ownerId: string): boolean {
  try {
    const draft = sessionStorage.getItem(key);
    const photos = sessionStorage.getItem(photosKey);
    if (draft === null && photos === null) return true;
    const ownedDraftKey = draftKeyFor(ownerId);
    const ownedPhotosKey = photosKeyFor(ownerId);
    // An existing account draft takes precedence over a leftover anonymous preview.
    if (sessionStorage.getItem(ownedDraftKey) === null) {
      if (draft !== null) sessionStorage.setItem(ownedDraftKey, draft);
      if (photos !== null) sessionStorage.setItem(ownedPhotosKey, photos);
    }
    sessionStorage.removeItem(key);
    sessionStorage.removeItem(photosKey);
    return true;
  } catch (error) {
    console.warn("No pudimos transferir la vista previa a tu cuenta.", error);
    return false;
  }
}

function migrateLegacyEditDraft(ownerId?: string, editId?: string): void {
  if (!ownerId || !editId) return;
  try {
    for (const prefix of [key, photosKey]) {
      const legacyKey = `${prefix}:${editId}`;
      const nextKey = scopedKey(prefix, ownerId, editId);
      const legacyValue = sessionStorage.getItem(legacyKey);
      if (legacyValue !== null && sessionStorage.getItem(nextKey) === null)
        sessionStorage.setItem(nextKey, legacyValue);
      if (legacyValue !== null) sessionStorage.removeItem(legacyKey);
    }
  } catch (error) {
    console.warn("No pudimos recuperar un borrador anterior.", error);
  }
}

export function readPublicationDraft(ownerId?: string, editId?: string): PublicationValues | null {
  migrateLegacyEditDraft(ownerId, editId);
  try {
    const raw = sessionStorage.getItem(draftKeyFor(ownerId, editId));
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object")
      throw new Error("El borrador no tiene el formato esperado.");
    const allowed = [
      "name",
      "whatsapp",
      "contactEmail",
      "emailContactEnabled",
      "comuna",
      "description",
      "title",
      "category",
      "details",
      "operator",
      "delivery",
      "priceKind",
      "priceAmount",
      "priceUnit",
      "services",
      "serviceOffers",
      "sector",
      "locationPrecision",
      "presentationVariant",
    ] as const;
    const defaults: Record<string, string> = {
      priceKind: "consult",
      contactEmail: "",
      emailContactEnabled: "no",
      priceAmount: "",
      priceUnit: "day",
      services: "",
      serviceOffers: "",
      sector: "",
      locationPrecision: "none",
      presentationVariant: "editorial",
    };
    const entries = allowed.map(
      (field) => [field, (data as Record<string, unknown>)[field] ?? defaults[field]] as const,
    );
    if (entries.some(([, value]) => typeof value !== "string" || value.length > 800))
      throw new Error("El borrador contiene datos inválidos.");
    const result = Object.fromEntries(entries) as PublicationValues;
    if (!["yes", "no"].includes(result.operator) || !["yes", "no"].includes(result.delivery))
      throw new Error("El borrador contiene opciones inválidas.");
    return result;
  } catch (error) {
    console.warn("No pudimos recuperar el borrador.", error);
    try {
      sessionStorage.removeItem(draftKeyFor(ownerId, editId));
    } catch (removeError) {
      console.warn("No pudimos quitar el borrador dañado.", removeError);
    }
    return null;
  }
}

export function writePublicationDraft(
  values: PublicationValues,
  ownerId?: string,
  editId?: string,
): boolean {
  try {
    sessionStorage.setItem(draftKeyFor(ownerId, editId), JSON.stringify(values));
    return true;
  } catch (error) {
    console.warn("No pudimos guardar el borrador.", error);
    return false;
  }
}

export function clearPublicationDraft(ownerId?: string, editId?: string): void {
  try {
    sessionStorage.removeItem(draftKeyFor(ownerId, editId));
    sessionStorage.removeItem(photosKeyFor(ownerId, editId));
  } catch (error) {
    console.warn("No pudimos borrar el borrador.", error);
  }
}

export function readPublicationPhotos(ownerId?: string, editId?: string): SavedPhoto[] {
  migrateLegacyEditDraft(ownerId, editId);
  try {
    const raw = sessionStorage.getItem(photosKeyFor(ownerId, editId));
    const value: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(value)) throw new Error("Fotos inválidas.");
    return value
      .slice(0, 4)
      .filter(
        (item): item is SavedPhoto =>
          item &&
          typeof item.name === "string" &&
          item.name.length < 120 &&
          typeof item.dataUrl === "string" &&
          ((/^data:image\/jpeg;base64,/.test(item.dataUrl) && item.dataUrl.length < 400_000) ||
            (typeof item.sourceUrl === "string" &&
              /^\/api\/imagenes\/[a-zA-Z0-9._%-]+$/.test(item.sourceUrl) &&
              item.dataUrl === item.sourceUrl)),
      );
  } catch (error) {
    console.warn("No pudimos recuperar las fotos del borrador.", error);
    return [];
  }
}

export function writePublicationPhotos(
  photos: SavedPhoto[],
  ownerId?: string,
  editId?: string,
): boolean {
  try {
    sessionStorage.setItem(photosKeyFor(ownerId, editId), JSON.stringify(photos));
    return true;
  } catch (error) {
    console.warn("No pudimos conservar las fotos del borrador.", error);
    return false;
  }
}
