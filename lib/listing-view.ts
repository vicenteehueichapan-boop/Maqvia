import type { Equipment, PublicProvider } from "@/lib/marketplace";
import { imageUrls } from "@/lib/image-urls";
import type { DemoEquipment, DemoProvider } from "@/lib/demo-fixtures";
import { serviceOffersSchema, visibleServiceNotes, type ServiceOffer } from "@/lib/service-offers";

export type ListingView = {
  id: string;
  href?: string;
  title: string;
  category: string;
  comuna: string;
  images: string[];
  description?: string;
  priceLabel?: string;
  operator?: string;
  delivery?: string;
  services: string[];
  serviceOffers?: ServiceOffer[];
  location: "none" | "approx" | "exact-demo";
  sector?: string;
  specs?: string[];
  providerName: string;
  providerHref?: string;
  esEjemplo: boolean;
  presentationVariant?: "editorial" | "visual" | "technical";
};
export type ProviderView = {
  name: string;
  comuna: string;
  description?: string;
  services: string[];
  serviceAreas: string[];
  cover?: string;
  esEjemplo: boolean;
  email?: string;
};
export const priceLabel = (price?: DemoEquipment["price"]) =>
  price
    ? `${price.from ? "Desde " : ""}${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(price.amount)} / ${price.unit}`
    : "Consultar precio";
export function demoListing(item: DemoEquipment, provider: DemoProvider): ListingView {
  return {
    ...item,
    href: `/maquinaria/${item.id}`,
    providerName: provider.name,
    providerHref: `/demo/proveedores/${provider.slug}`,
    priceLabel: priceLabel(item.price),
  };
}
export function realListing(item: Equipment, provider: PublicProvider): ListingView {
  let services: string[] = [];
  let serviceOffers: ServiceOffer[] = [];
  try {
    const parsed: unknown = JSON.parse(item.services);
    if (Array.isArray(parsed)) {
      services = parsed.filter((value): value is string => typeof value === "string");
      const offers = serviceOffersSchema.safeParse(
        parsed.filter((value) => value && typeof value === "object"),
      );
      if (offers.success) serviceOffers = offers.data;
    }
  } catch (error) {
    console.warn("No pudimos leer los servicios de una publicación.", error);
  }
  const amount = item.priceAmount;
  const unit =
    (
      { hour: "hora", day: "día", week: "semana", month: "mes", service: "servicio" } as Record<
        string,
        string
      >
    )[item.priceUnit] || "día";
  const priceLabel =
    item.priceKind === "consult" || amount === null
      ? "Consultar precio"
      : `${item.priceKind === "from" ? "Desde " : ""}${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(amount)} / ${unit}`;
  return {
    id: item.id,
    href: `/maquinaria/${item.id}`,
    title: item.title,
    category: item.category,
    comuna: provider.comuna,
    images: imageUrls(item.images),
    description: item.description,
    priceLabel,
    operator:
      item.operator === "yes" && !serviceOffers.some((offer) => offer.name === "Operador")
        ? "A consultar"
        : undefined,
    delivery:
      item.delivery === "yes" && !serviceOffers.some((offer) => offer.name === "Traslado")
        ? "A consultar"
        : undefined,
    services: visibleServiceNotes(services, serviceOffers),
    serviceOffers,
    location: item.locationPrecision === "approx" ? "approx" : "none",
    sector: item.sector || undefined,
    providerName: provider.name,
    providerHref: `/proveedores/${provider.slug}`,
    esEjemplo: false,
    presentationVariant:
      item.presentationVariant === "visual" || item.presentationVariant === "technical"
        ? item.presentationVariant
        : "editorial",
  };
}
export function demoProviderView(provider: DemoProvider): ProviderView {
  return {
    name: provider.name,
    comuna: provider.comuna,
    description: provider.description,
    services: provider.services,
    serviceAreas: provider.serviceAreas,
    cover: provider.cover,
    esEjemplo: true,
    email: provider.email,
  };
}
export function realProviderView(provider: PublicProvider): ProviderView {
  return {
    name: provider.name,
    comuna: provider.comuna,
    description: provider.description,
    services: [],
    serviceAreas: [provider.comuna],
    esEjemplo: false,
  };
}
