import { z } from "zod";
import { normalizeChileanWhatsApp } from "./contact-inquiry.ts";
import { parseServiceOffers } from "./service-offers.ts";

export const publicationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Escribe el nombre de tu negocio.")
      .max(90, "Usa un nombre de hasta 90 caracteres."),
    whatsapp: z
      .string()
      .refine(
        (value) => normalizeChileanWhatsApp(value) !== null,
        "Ingresa un WhatsApp chileno válido, por ejemplo +56 9 1234 5678.",
      ),
    comuna: z.string().min(1, "Selecciona una comuna."),
    description: z
      .string()
      .trim()
      .min(20, "Describe tu negocio con al menos 20 caracteres.")
      .max(600, "Usa hasta 600 caracteres."),
    title: z
      .string()
      .trim()
      .min(5, "Escribe un título de al menos 5 caracteres.")
      .max(100, "Usa un título de hasta 100 caracteres."),
    category: z.string().min(1, "Selecciona una categoría."),
    details: z
      .string()
      .trim()
      .min(20, "Describe el equipo o servicio con al menos 20 caracteres.")
      .max(800, "Usa hasta 800 caracteres."),
    operator: z.enum(["yes", "no"]),
    delivery: z.enum(["yes", "no"]),
    priceKind: z.enum(["consult", "fixed", "from"]).default("consult"),
    priceAmount: z.string().trim().max(10).default(""),
    priceUnit: z.enum(["day", "hour", "week", "month", "service"]).default("day"),
    services: z.string().trim().max(300).default(""),
    serviceOffers: z.string().trim().max(700).default(""),
    sector: z.string().trim().max(80).default(""),
    locationPrecision: z.enum(["none", "approx"]).default("none"),
    presentationVariant: z.enum(["editorial", "visual", "technical"]).default("editorial"),
  })
  .superRefine((value, context) => {
    if (
      value.priceKind !== "consult" &&
      (!/^\d+$/.test(value.priceAmount) || Number(value.priceAmount) <= 0)
    )
      context.addIssue({
        code: "custom",
        path: ["priceAmount"],
        message: "Ingresa un precio mayor que $0.",
      });
    if (value.locationPrecision === "approx" && !value.comuna)
      context.addIssue({
        code: "custom",
        path: ["comuna"],
        message: "Selecciona una comuna para mostrar la ubicación aproximada.",
      });
    if (parseServiceOffers(value.serviceOffers) === null)
      context.addIssue({
        code: "custom",
        path: ["serviceOffers"],
        message: "Revisa el precio de los servicios seleccionados.",
      });
  });

export type PublicationValues = z.infer<typeof publicationSchema>;

const billingUnitSchema = z.enum(["hour", "day", "week", "month", "service"], {
  errorMap: () => ({ message: "Selecciona cómo se cobra: hora, día, semana, mes o servicio." }),
});

export const priceSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("consult"),
    amount: z.number().optional(),
    unit: z.string().optional(),
  }),
  z.object({
    kind: z.literal("fixed"),
    amount: z.number().positive("Ingresa un monto mayor que $0."),
    unit: billingUnitSchema,
  }),
  z.object({
    kind: z.literal("from"),
    amount: z.number().positive("Ingresa un monto mayor que $0."),
    unit: billingUnitSchema,
  }),
]);

export const locationSchema = z
  .object({
    comuna: z.string(),
    sector: z.string(),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
    showExact: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.sector.trim() && !value.comuna.trim())
      context.addIssue({
        code: "custom",
        path: ["comuna"],
        message: "Selecciona una comuna para indicar el sector.",
      });
    if (value.showExact && (value.latitude === null || value.longitude === null))
      context.addIssue({
        code: "custom",
        path: ["showExact"],
        message: "Marca un punto válido antes de mostrar la ubicación exacta.",
      });
  });

export const serviceSchema = z
  .object({
    enabled: z.boolean(),
    price: z.union([z.object({ kind: z.literal("included") }), priceSchema]).optional(),
  })
  .superRefine((value, context) => {
    if (value.enabled && !value.price)
      context.addIssue({
        code: "custom",
        path: ["price"],
        message: "Indica si el servicio está incluido, tiene precio o se consulta.",
      });
  });
