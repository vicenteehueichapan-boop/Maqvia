import { z } from "zod";

export { formatEditorialDate } from "./editorial-format.ts";

const internalHref = z
  .string()
  .refine(
    (value) => /^\/(?!\/)/.test(value) && !/[\\\s]/.test(value),
    "Usa una ruta interna segura",
  );

const publicationDate = z.string().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, "Usa una fecha válida en formato AAAA-MM-DD");

export const editorialArticleSchema = z
  .object({
    status: z.enum(["draft", "published"]),
    type: z.enum(["guia", "producto", "noticia"]),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().trim().min(1).max(140),
    summary: z.string().trim().min(1).max(320),
    image: internalHref,
    imageAlt: z.string().trim().min(1),
    publishedAt: publicationDate,
    author: z.string().trim().min(1),
    sections: z
      .array(
        z.object({
          heading: z.string().trim().min(1),
          paragraphs: z.array(z.string().trim().min(1)).min(1),
        }),
      )
      .min(1),
    sources: z.array(
      z.object({
        title: z.string().trim().min(1),
        url: z
          .string()
          .url()
          .refine((value) => new URL(value).protocol === "https:"),
      }),
    ),
    action: z.object({ href: internalHref, label: z.string().trim().min(1) }).optional(),
  })
  .superRefine((article, context) => {
    if (article.type === "noticia" && article.sources.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sources"],
        message: "Las noticias necesitan al menos una fuente verificable",
      });
    }
  });

export type EditorialArticle = z.infer<typeof editorialArticleSchema>;

export const editorialCatalogSchema = z
  .array(editorialArticleSchema)
  .superRefine((articles, context) => {
    const slugs = new Set<string>();
    articles.forEach((article, index) => {
      if (slugs.has(article.slug)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, "slug"],
          message: "Cada artículo necesita un slug único",
        });
      }
      slugs.add(article.slug);
    });
  });

export function validateEditorialCatalog(catalog: unknown): EditorialArticle[] {
  return editorialCatalogSchema.parse(catalog);
}

export const editorialArticles: EditorialArticle[] = validateEditorialCatalog([
  {
    status: "published",
    type: "guia",
    slug: "que-revisar-antes-de-arrendar-maquinaria",
    title: "Qué revisar antes de consultar por una máquina",
    summary:
      "Compara el equipo, la zona de trabajo y lo que incluye el servicio antes de hablar con el proveedor.",
    image: "/demo/obra.jpg",
    imageAlt: "Fotografía ilustrativa de equipos trabajando en una obra de movimiento de tierra",
    publishedAt: "2026-09-30",
    author: "Equipo Maqvia",
    sections: [
      {
        heading: "Empieza por el trabajo que necesitas hacer",
        paragraphs: [
          "Describe la tarea, el espacio disponible y el lugar de la obra. Una excavación, una carga de materiales y una nivelación pueden necesitar equipos distintos. La fotografía ayuda a reconocer una máquina, pero no reemplaza sus características ni la confirmación del proveedor.",
          "En el catálogo puedes buscar por equipo y comuna. Abre cada ficha para revisar la descripción, las fotografías, los servicios y la información del negocio que ofrece el equipo.",
        ],
      },
      {
        heading: "Comprueba lo que incluye la oferta",
        paragraphs: [
          "Revisa si se ofrece operador, traslado y otros servicios, y si están incluidos o se cotizan aparte. Cuando hay un precio referencial, fíjate en su unidad: un valor por hora no es comparable directamente con uno por día.",
          "Antes de acordar el arriendo, confirma disponibilidad, duración, condiciones del terreno, acceso a la obra y costo total. Si una ficha no indica un dato, consúltalo; no lo des por incluido.",
        ],
      },
      {
        heading: "Contacta con una consulta concreta",
        paragraphs: [
          "Inicia sesión para acceder a las opciones de contacto de la publicación. Indica qué equipo necesitas, la comuna, las fechas y si requieres operador o traslado. El proveedor podrá responder con una propuesta más precisa.",
          "Maqvia presenta equipos y facilita el contacto. La disponibilidad y las condiciones del arriendo se acuerdan directamente con el proveedor; una ficha visible no equivale a una reserva confirmada.",
        ],
      },
    ],
    sources: [],
    action: { href: "/maquinaria", label: "Explorar maquinaria" },
  },
  {
    status: "published",
    type: "guia",
    slug: "fotografias-para-publicar-maquinaria",
    title: "Una ficha clara parte por buenas fotos",
    summary:
      "Muestra el equipo completo, sus detalles y su estado con fotografías propias y una descripción que las acompañe.",
    image: "/demo/retroexcavadora.jpg",
    imageAlt: "Fotografía ilustrativa de una retroexcavadora en terreno",
    publishedAt: "2026-09-30",
    author: "Equipo Maqvia",
    sections: [
      {
        heading: "Elige una portada que permita reconocer el equipo",
        paragraphs: [
          "Usa una fotografía propia, enfocada y con luz suficiente. Procura que el equipo se vea completo y que el fondo no compita con él. Revisa la vista previa: la portada puede recortarse de manera diferente en la tarjeta del catálogo y en la ficha.",
          "Evita imágenes de otro proveedor, fotografías que oculten el estado actual del equipo y textos superpuestos difíciles de leer. La publicación debe representar lo que realmente ofreces.",
        ],
      },
      {
        heading: "Añade detalles que ayuden a decidir",
        paragraphs: [
          "Complementa la portada con otras vistas y detalles relevantes, como implementos o dimensiones visibles. No hace falta repetir varias veces el mismo ángulo: cada fotografía debería aportar información nueva.",
          "Evita incluir personas identificables sin su autorización, documentos, matrículas o información privada que no sea necesaria. Comprueba también que puedes utilizar y publicar las imágenes que subes.",
        ],
      },
      {
        heading: "Revisa la presentación antes de publicar",
        paragraphs: [
          "Completa el título, la descripción, la comuna y las opciones de servicio. Las fotografías muestran el equipo; el texto aclara sus características y las condiciones de la oferta.",
          "Puedes probar una vista previa en Maqvia antes de crear una cuenta. Esa prueba no publica tus datos. Para continuar con una publicación necesitas registrarte o iniciar sesión y revisar la información que quedará visible.",
        ],
      },
    ],
    sources: [],
    action: { href: "/crear-vitrina#vista-previa", label: "Probar mi vista previa" },
  },
  {
    status: "published",
    type: "producto",
    slug: "como-se-presenta-tu-vitrina",
    title: "Tu vitrina reúne equipos y servicios",
    summary:
      "Conoce la diferencia entre la tarjeta del catálogo, la ficha de un equipo y la vitrina de tu negocio.",
    image: "/demo/industrial.jpg",
    imageAlt: "Fotografía ilustrativa de una persona junto a equipos industriales",
    publishedAt: "2026-09-30",
    author: "Equipo Maqvia",
    sections: [
      {
        heading: "La tarjeta permite descubrir tu publicación",
        paragraphs: [
          "En el catálogo, cada publicación muestra una fotografía de portada y los datos principales del equipo. Un título específico, una comuna correcta y un precio claro cuando corresponda ayudan a entender la oferta antes de abrirla.",
          "La tarjeta es el primer vistazo. Reserva la descripción completa y los detalles técnicos para la ficha, donde hay más espacio para explicar el equipo.",
        ],
      },
      {
        heading: "La ficha explica lo que ofreces",
        paragraphs: [
          "Al abrir una publicación, el visitante puede consultar las fotografías, la descripción y los servicios que has indicado. Las opciones de contacto requieren iniciar sesión.",
          "Revisa tu teléfono de WhatsApp y, si decides habilitarlo, el correo de contacto. Estos datos pueden ser distintos de los que usas para entrar a tu cuenta. Publica únicamente el contacto que deseas compartir con quienes consulten por el equipo.",
        ],
      },
      {
        heading: "La vitrina da contexto a tu negocio",
        paragraphs: [
          "Tu vitrina reúne la presentación del negocio y sus publicaciones activas. Mantén el nombre, la descripción y la zona de trabajo consistentes para que el visitante entienda quién ofrece los equipos.",
          "Desde tu cuenta puedes revisar y editar tus publicaciones, pausarlas cuando no quieras mostrarlas y reactivarlas después. Mantener la información actualizada es más útil que acumular ofertas que ya no están disponibles.",
        ],
      },
    ],
    sources: [],
    action: { href: "/crear-vitrina", label: "Conocer mi vitrina" },
  },
]);

export function getPublishedArticles(
  now: Date = new Date(),
  catalog: readonly EditorialArticle[] = editorialArticles,
): EditorialArticle[] {
  return catalog
    .filter(
      (article) =>
        article.status === "published" &&
        new Date(`${article.publishedAt}T00:00:00Z`).getTime() <= now.getTime(),
    )
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug));
}

export function getArticleBySlug(
  slug: string,
  now: Date = new Date(),
  catalog: readonly EditorialArticle[] = editorialArticles,
): EditorialArticle | undefined {
  return getPublishedArticles(now, catalog).find((article) => article.slug === slug);
}
