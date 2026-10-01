import type { PublicationValues } from "../publication-validation.ts";
import { parseServiceOffers } from "../service-offers.ts";

function field(form: FormData, name: string, maxLength: number) {
  return String(form.get(name) || "")
    .trim()
    .slice(0, maxLength);
}

export function readPublicationForm(form: FormData) {
  return {
    name: field(form, "name", 90),
    description: field(form, "description", 600),
    comuna: field(form, "comuna", 80),
    whatsapp: field(form, "whatsapp", 30),
    contactEmail: field(form, "contactEmail", 254),
    emailContactEnabled: field(form, "emailContactEnabled", 3),
    title: field(form, "title", 100),
    category: field(form, "category", 70),
    details: field(form, "details", 800),
    operator: form.get("operator"),
    delivery: form.get("delivery"),
    priceKind: field(form, "priceKind", 10) || undefined,
    priceAmount: field(form, "priceAmount", 10),
    priceUnit: field(form, "priceUnit", 10) || undefined,
    services: field(form, "services", 300),
    serviceOffers: field(form, "serviceOffers", 700),
    sector: field(form, "sector", 80),
    locationPrecision: field(form, "locationPrecision", 10) || undefined,
    presentationVariant: field(form, "presentationVariant", 10) || undefined,
  };
}

export function providerFields(data: PublicationValues, whatsapp: string, updatedAt: string) {
  return {
    name: data.name,
    description: data.description,
    comuna: data.comuna,
    whatsapp,
    contactEmail: data.emailContactEnabled === "yes" ? data.contactEmail.toLowerCase() : "",
    updatedAt,
  };
}

export function equipmentFields(data: PublicationValues, imageKeys: string[]) {
  return {
    title: data.title,
    category: data.category,
    description: data.details,
    images: JSON.stringify(imageKeys),
    operator: data.operator,
    delivery: data.delivery,
    priceKind: data.priceKind,
    priceAmount: data.priceKind === "consult" ? null : Number(data.priceAmount),
    priceUnit: data.priceUnit,
    services: JSON.stringify([
      ...data.services
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .slice(0, 8),
      ...(parseServiceOffers(data.serviceOffers) || []),
    ]),
    sector: data.sector,
    locationPrecision: data.locationPrecision,
    presentationVariant: data.presentationVariant,
  };
}

export const imageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function publicationUploads(form: FormData) {
  return form
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

export function invalidPublicationImage(files: File[]) {
  return files.some((file) => !imageTypes[file.type] || file.size > 5_000_000);
}
