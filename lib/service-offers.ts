import { z } from "zod";

export const serviceNames = [
  "Operador",
  "Traslado",
  "Combustible",
  "Montaje",
  "Otro servicio",
] as const;
export type ServiceName = (typeof serviceNames)[number];

export const serviceOffersSchema = z
  .array(
    z
      .object({
        name: z.enum(serviceNames),
        kind: z.enum(["included", "fixed", "from", "consult"]),
        amount: z.number().int().positive().max(999_999_999).optional(),
      })
      .superRefine((offer, context) => {
        if ((offer.kind === "fixed" || offer.kind === "from") && !offer.amount)
          context.addIssue({
            code: "custom",
            path: ["amount"],
            message: "Ingresa un monto mayor que $0 para este servicio.",
          });
      }),
  )
  .max(serviceNames.length)
  .refine((offers) => new Set(offers.map((offer) => offer.name)).size === offers.length, {
    message: "Cada servicio debe aparecer una sola vez.",
  });

export type ServiceOffer = z.infer<typeof serviceOffersSchema>[number];

const draftSchema = z.array(
  z.object({
    name: z.enum(serviceNames),
    kind: z.enum(["included", "fixed", "from", "consult"]),
    amount: z.number().optional(),
  }),
);

export function readServiceOffersDraft(raw: string): ServiceOffer[] {
  try {
    const result = draftSchema.safeParse(raw ? JSON.parse(raw) : []);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function parseServiceOffers(raw: string): ServiceOffer[] | null {
  if (!raw) return [];
  try {
    const result = serviceOffersSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function serviceOfferLabel(offer: ServiceOffer): string {
  if (offer.kind === "included") return "Incluido";
  if (offer.kind === "consult") return "A consultar";
  const price = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(offer.amount || 0);
  return offer.kind === "from" ? `Desde ${price}` : price;
}

export function visibleServiceNotes(notes: string[], offers: ServiceOffer[]): string[] {
  const structuredNames = new Set(offers.map((offer) => offer.name));
  return notes.filter((note) => {
    if (
      structuredNames.has("Operador") &&
      /^operador (disponible|a consultar|incluido)$/i.test(note)
    )
      return false;
    if (
      structuredNames.has("Traslado") &&
      /^traslado (disponible|a consultar|incluido)$/i.test(note)
    )
      return false;
    return true;
  });
}
