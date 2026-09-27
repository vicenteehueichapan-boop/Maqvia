export type DemoProvider = {
  esEjemplo: true;
  slug: string;
  name: string;
  comuna: string;
  description?: string;
  email: string;
  services: string[];
  serviceAreas: string[];
  cover?: string;
};
export type DemoEquipment = {
  esEjemplo: true;
  id: string;
  providerSlug: string;
  title: string;
  category: string;
  comuna: string;
  images: string[];
  description?: string;
  price?: { amount: number; unit: "día" | "hora"; from?: boolean };
  operator?: string;
  delivery?: string;
  services: string[];
  location: "none" | "approx" | "exact-demo";
  sector?: string;
  specs?: string[];
  presentationVariant?: "editorial" | "visual" | "technical";
};
export const demoProviders: DemoProvider[] = [
  {
    esEjemplo: true,
    slug: "andes-maquinarias-demo",
    name: "Andes Maquinarias · Demo",
    comuna: "Quilicura",
    description:
      "Arriendo de equipos para excavación y movimiento de tierra en obras de Santiago. Coordinación de operador y traslado según cada proyecto.",
    email: "contacto@andesmaquinarias.example.com",
    services: ["Movimiento de tierra", "Operador a solicitud", "Traslado a obra"],
    serviceAreas: ["Quilicura", "Pudahuel", "Maipú", "Santiago"],
    cover: "/demo/obra.jpg",
  },
  {
    esEjemplo: true,
    slug: "volcan-equipos-demo",
    name: "Equipos El Volcán · Demo",
    comuna: "Maipú",
    description: "Maquinaria compacta para obras y terrenos.",
    email: "hola@volcanequipos.example.com",
    services: ["Equipos compactos"],
    serviceAreas: ["Maipú", "Cerrillos"],
    cover: "/demo/retroexcavadora.jpg",
  },
  {
    esEjemplo: true,
    slug: "ruta-sur-demo",
    name: "Ruta Sur · Demo",
    comuna: "San Bernardo",
    email: "contacto@rutasur.example.com",
    services: [],
    serviceAreas: ["San Bernardo"],
  },
  {
    esEjemplo: true,
    slug: "central-obras-demo",
    name: "Central Obras · Demo",
    comuna: "Santiago",
    description:
      "Equipos para distintas etapas de obra, desde preparación del terreno hasta carga y apoyo logístico.",
    email: "equipo@centralobras.example.com",
    services: ["Excavación", "Carga", "Nivelación"],
    serviceAreas: ["Santiago", "Pudahuel", "Quilicura", "Puente Alto"],
    cover: "/demo/obra.jpg",
  },
];
export const demoEquipment: DemoEquipment[] = [
  {
    esEjemplo: true,
    id: "miniexcavadora-3t",
    providerSlug: "andes-maquinarias-demo",
    title: "Miniexcavadora 3 toneladas",
    category: "Movimiento de tierra",
    comuna: "Quilicura",
    images: ["/equipo-mini.webp", "/demo/excavadora-azul.jpg", "/demo/excavadora-rocas.jpg"],
    description:
      "Equipo compacto para zanjas y excavación en espacios reducidos. Condiciones y disponibilidad sujetas a consulta.",
    price: { amount: 95000, unit: "día" },
    operator: "Disponible a solicitud",
    delivery: "Desde $40.000",
    services: ["Operador", "Traslado a obra"],
    location: "approx",
    sector: "Sector industrial",
    specs: ["Peso operativo: 3 toneladas", "Aplicación: zanjas y excavación"],
  },
  {
    esEjemplo: true,
    id: "excavadora-orugas",
    providerSlug: "andes-maquinarias-demo",
    title: "Excavadora sobre orugas",
    category: "Movimiento de tierra",
    comuna: "Pudahuel",
    images: ["/demo/obra.jpg", "/demo/excavadora-rocas.jpg"],
    description: "Para movimiento de tierra y trabajos de mayor escala.",
    price: { amount: 180000, unit: "día", from: true },
    operator: "Incluido",
    delivery: "A coordinar",
    services: ["Operador incluido", "Traslado a coordinar", "Combustible a consultar"],
    location: "approx",
    sector: "Sector poniente",
    presentationVariant: "visual",
  },
  {
    esEjemplo: true,
    id: "bulldozer-nivelacion",
    providerSlug: "andes-maquinarias-demo",
    title: "Bulldozer para nivelación",
    category: "Movimiento de tierra",
    comuna: "Maipú",
    images: ["/demo/bulldozer.jpg"],
    description: "Equipo de apoyo para nivelación y preparación de terreno.",
    services: ["Nivelación"],
    location: "none",
  },
  {
    esEjemplo: true,
    id: "retroexcavadora-hora",
    providerSlug: "volcan-equipos-demo",
    title: "Retroexcavadora",
    category: "Movimiento de tierra",
    comuna: "Maipú",
    images: ["/demo/retroexcavadora.jpg"],
    description:
      "Arriendo por hora para trabajos de excavación y retiro de material. Mínimo de cuatro horas, sujeto a confirmación.",
    price: { amount: 38000, unit: "hora" },
    operator: "Disponible",
    delivery: "A coordinar",
    services: ["Mínimo 4 horas", "Operador disponible"],
    location: "none",
  },
  {
    esEjemplo: true,
    id: "minicargador-compacto",
    providerSlug: "volcan-equipos-demo",
    title: "Minicargador compacto",
    category: "Carga y traslado",
    comuna: "Cerrillos",
    images: ["/equipo-cargador.webp"],
    price: { amount: 72000, unit: "día" },
    services: [],
    location: "approx",
    sector: "Cerrillos poniente",
  },
  {
    esEjemplo: true,
    id: "servicio-excavacion",
    providerSlug: "ruta-sur-demo",
    title: "Servicio de excavación",
    category: "Servicio con maquinaria",
    comuna: "San Bernardo",
    images: [],
    description:
      "Servicio de excavación para obras pequeñas. Consulta alcance, fechas y condiciones.",
    services: [],
    location: "none",
  },
  {
    esEjemplo: true,
    id: "excavadora-central",
    providerSlug: "central-obras-demo",
    title: "Excavadora para obra",
    category: "Movimiento de tierra",
    comuna: "Santiago",
    images: ["/demo/excavadora-rocas.jpg", "/demo/excavadora-azul.jpg", "/demo/obra.jpg"],
    price: { amount: 155000, unit: "día" },
    services: ["Excavación", "Operador a consultar"],
    location: "exact-demo",
    sector: "Punto público de ejemplo · Parque O'Higgins",
    presentationVariant: "technical",
  },
  {
    esEjemplo: true,
    id: "motoniveladora-central",
    providerSlug: "central-obras-demo",
    title: "Motoniveladora",
    category: "Nivelación",
    comuna: "Quilicura",
    images: ["/demo/obra.jpg"],
    price: { amount: 135000, unit: "día", from: true },
    services: ["Nivelación"],
    location: "approx",
    sector: "Sector industrial",
  },
  {
    esEjemplo: true,
    id: "cargador-frontal-central",
    providerSlug: "central-obras-demo",
    title: "Cargador frontal",
    category: "Carga y traslado",
    comuna: "Pudahuel",
    images: ["/demo/bulldozer.jpg", "/demo/retroexcavadora.jpg"],
    price: { amount: 42000, unit: "hora" },
    services: ["Carga", "Traslado a consultar"],
    location: "none",
  },
  {
    esEjemplo: true,
    id: "excavadora-naranja-central",
    providerSlug: "central-obras-demo",
    title: "Excavadora de orugas",
    category: "Movimiento de tierra",
    comuna: "Puente Alto",
    images: ["/demo/excavadora-naranja.jpg"],
    services: ["Excavación"],
    location: "approx",
    sector: "Sector suroriente",
  },
  {
    esEjemplo: true,
    id: "apoyo-industrial-central",
    providerSlug: "central-obras-demo",
    title: "Apoyo industrial con maquinaria",
    category: "Servicio con maquinaria",
    comuna: "Santiago",
    images: ["/demo/industrial.jpg"],
    description: "Apoyo en operaciones industriales; el alcance se define con el proveedor.",
    services: ["Apoyo industrial"],
    location: "none",
  },
];
export const providerForDemoEquipment = (item: DemoEquipment) =>
  demoProviders.find((provider) => provider.slug === item.providerSlug)!;
export const equipmentForDemoProvider = (slug: string) =>
  demoEquipment.filter((item) => item.providerSlug === slug);
export const formatDemoPrice = (item: DemoEquipment) =>
  item.price
    ? `${item.price.from ? "Desde " : ""}${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(item.price.amount)} / ${item.price.unit}`
    : "Consultar precio";
