"use client";
import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ImagePlus, X } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { ListingDetail } from "@/components/listing-detail";
import { ProviderShowcase } from "@/components/provider-showcase";
import type { ListingView, ProviderView } from "@/lib/listing-view";
import { writeAssistantHandoff } from "@/lib/publication-draft-repository";

type Photo = { name: string; dataUrl: string };
type PreviewTab = "card" | "detail" | "showcase";
const examples = [
  "Tengo una miniexcavadora en Pudahuel y ofrezco operador",
  "Arriendo minicargador en Quilicura con traslado a obra",
  "Hago excavaciones y movimiento de tierra en Maipú",
];
const communes = [
  "Santiago",
  "Maipú",
  "Pudahuel",
  "Quilicura",
  "Las Condes",
  "Puente Alto",
  "San Bernardo",
  "Cerrillos",
];
function deriveTitle(text: string) {
  const lower = text.toLocaleLowerCase("es-CL");
  if (/mini.?excav/.test(lower)) return "Miniexcavadora";
  if (/mini.?cargador/.test(lower)) return "Minicargador";
  if (/retro.?excav/.test(lower)) return "Retroexcavadora";
  if (/excavaci/.test(lower)) return "Servicio de excavación";
  return "Maquinaria o servicio";
}
function deriveCategory(title: string) {
  return /cargador/i.test(title)
    ? "Carga y traslado"
    : /excav/i.test(title)
      ? "Movimiento de tierra"
      : "Servicio con maquinaria";
}
async function preparePhoto(file: File): Promise<Photo> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Usa fotos JPG, PNG o WebP.");
  if (file.size > 5_000_000) throw new Error("Cada foto debe pesar menos de 5 MB.");
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No pudimos procesar la imagen.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.65),
  );
  if (!blob || blob.size > 250_000) throw new Error("Prueba con una fotografía más pequeña.");
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No pudimos leer la imagen."));
    reader.readAsDataURL(blob);
  });
  return { name: file.name.replace(/\.[^.]+$/, "") + ".jpg", dataUrl };
}
export function ProfileAssistantV2() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [title, setTitle] = useState("");
  const [business, setBusiness] = useState("");
  const [comuna, setComuna] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<"día" | "hora">("día");
  const [service, setService] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [cover, setCover] = useState(0);
  const [tab, setTab] = useState<PreviewTab>("card");
  const [variant, setVariant] = useState<"editorial" | "visual" | "técnica">("editorial");
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const shownTitle = title.trim() || deriveTitle(idea);
  const name = business.trim() || "Tu negocio";
  const ordered = photos.length
    ? [photos[cover], ...photos.filter((_, index) => index !== cover)].map((photo) => photo.dataUrl)
    : [];
  const amount = Number(price);
  const priceLabel =
    price.trim() && Number.isFinite(amount) && amount > 0
      ? `${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(amount)} / ${unit}`
      : "Consultar precio";
  const listing: ListingView = {
    id: "vista-previa",
    title: shownTitle,
    category: deriveCategory(shownTitle),
    comuna,
    images: ordered,
    description: idea.trim(),
    priceLabel,
    operator: /operador/i.test(idea) ? "A consultar" : undefined,
    delivery: /traslado|transporte/i.test(idea) ? "A consultar" : undefined,
    services: service.trim()
      ? service
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : [],
    location: "none",
    providerName: name,
    esEjemplo: false,
    presentationVariant: variant === "técnica" ? "technical" : variant,
  };
  const provider: ProviderView = {
    name,
    comuna,
    description: idea.trim(),
    services: listing.services,
    serviceAreas: comuna ? [comuna] : [],
    esEjemplo: false,
  };
  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length + photos.length > 4) {
      setError("Puedes añadir hasta cuatro fotografías.");
      return;
    }
    setBusy(true);
    const results = await Promise.allSettled(files.map(preparePhoto));
    setPhotos((current) => [
      ...current,
      ...results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : [])),
    ]);
    const failures = results.flatMap((result) =>
      result.status === "rejected"
        ? [result.reason instanceof Error ? result.reason.message : "No pudimos añadir una foto."]
        : [],
    );
    setError(failures.join(" "));
    setBusy(false);
  }
  function generate() {
    if (idea.trim().length < 12) {
      setError("Describe tu maquinaria o servicio con más detalle.");
      return;
    }
    if (price.trim() && (!Number.isFinite(amount) || amount <= 0)) {
      setError("El precio debe ser un valor mayor que cero.");
      return;
    }
    setError("");
    if (!title.trim()) setTitle(deriveTitle(idea));
    if (!comuna)
      setComuna(
        communes.find((value) =>
          idea.toLocaleLowerCase("es-CL").includes(value.toLocaleLowerCase("es-CL")),
        ) || "",
      );
    setGenerated(true);
  }
  function continueDraft() {
    const success = writeAssistantHandoff(
      {
        name,
        title: shownTitle,
        category: listing.category,
        comuna,
        description: idea.trim(),
        details: idea.trim(),
        operator: listing.operator ? "yes" : "no",
        delivery: listing.delivery ? "yes" : "no",
        priceKind: price.trim() ? "fixed" : "consult",
        priceAmount: price.trim(),
        priceUnit: unit === "hora" ? "hour" : "day",
        services: service.trim(),
        sector: "",
        locationPrecision: "none",
        presentationVariant: listing.presentationVariant,
      },
      photos.length ? [photos[cover], ...photos.filter((_, index) => index !== cover)] : [],
    );
    if (success) router.push("/publicar");
    else setError("No pudimos conservar el borrador en este navegador. Prueba con menos fotos.");
  }
  return (
    <section
      id="asistente"
      className="relative overflow-hidden border-t border-[#56645c33] bg-[#14191a]"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_22%,#7992aa40,transparent_52%),radial-gradient(ellipse_at_75%_55%,#7f9c7040,transparent_47%)]" />
      <div className="container-shell relative py-24 md:py-32">
        <div className="mx-auto max-w-[770px] text-center">
          <p className="eyebrow">Crea tu vitrina</p>
          <h2 className="display mt-5 text-[clamp(2.8rem,5.4vw,5.6rem)]">
            Muéstranos tu equipo.
            <br />
            Mira cómo se verá.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#c4cdc5] md:text-lg">
            Describe tu oferta y añade tus fotos. Maquinal organiza tus datos en una vista previa
            del catálogo, la ficha y tu vitrina.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-[920px] rounded-[27px] border border-[#d9ded6] bg-[#edf0eb] p-5 text-[#263129] shadow-[0_30px_100px_#0008]">
          <label className="block text-sm font-bold" htmlFor="preview-idea">
            Tu maquinaria o servicio
          </label>
          <textarea
            id="preview-idea"
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Ej. Arriendo una miniexcavadora en Pudahuel, con operador y traslado a obra..."
            className="mt-3 w-full resize-y bg-transparent p-2 text-base outline-none placeholder:text-[#69766c]"
          />
          <div className="grid gap-3 border-t border-[#bec9bd] pt-4 sm:grid-cols-2">
            <label className="text-xs font-bold">
              Nombre de tu negocio
              <input
                value={business}
                onChange={(event) => setBusiness(event.target.value)}
                maxLength={90}
                placeholder="Ej. Mi empresa"
                className="mt-1 w-full rounded-xl border border-[#c1cbc0] bg-white px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="text-xs font-bold">
              Comuna
              <select
                value={comuna}
                onChange={(event) => setComuna(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[#c1cbc0] bg-white px-3 py-2 text-sm outline-none"
              >
                <option value="">Por definir</option>
                {communes.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold">
              Precio referencial (opcional)
              <input
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                inputMode="numeric"
                placeholder="Ej. 95000"
                className="mt-1 w-full rounded-xl border border-[#c1cbc0] bg-white px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="text-xs font-bold">
              Modalidad
              <select
                value={unit}
                onChange={(event) => setUnit(event.target.value as "día" | "hora")}
                className="mt-1 w-full rounded-xl border border-[#c1cbc0] bg-white px-3 py-2 text-sm outline-none"
              >
                <option value="día">Por día</option>
                <option value="hora">Por hora</option>
              </select>
            </label>
            <label className="text-xs font-bold sm:col-span-2">
              Servicios (separa con comas)
              <input
                value={service}
                onChange={(event) => setService(event.target.value)}
                placeholder="Ej. operador, traslado"
                className="mt-1 w-full rounded-xl border border-[#c1cbc0] bg-white px-3 py-2 text-sm outline-none"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#c1cbc0] pt-4">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#bac6bb] bg-white/75 px-4 py-2.5 text-sm font-bold">
              <ImagePlus size={17} /> Añadir fotos
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={addPhotos}
                className="sr-only"
              />
            </label>
            <button
              type="button"
              onClick={generate}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-[#24372f] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {busy ? "Preparando fotos…" : "Crear vista previa"}
              <ArrowRight size={17} />
            </button>
          </div>
          {photos.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <button
                    type="button"
                    onClick={() => setCover(index)}
                    aria-label={`Elegir foto ${index + 1} como portada`}
                    className={
                      "overflow-hidden rounded-xl border-2 " +
                      (cover === index ? "border-[#4e754d]" : "border-transparent")
                    }
                  >
                    <img
                      src={photo.dataUrl}
                      alt={`Foto añadida ${index + 1}`}
                      className="h-18 w-18 object-cover"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotos((current) =>
                        current.filter((_, photoIndex) => photoIndex !== index),
                      );
                      setCover(0);
                    }}
                    aria-label={`Quitar foto ${index + 1}`}
                    className="absolute -right-2 -top-2 rounded-full bg-[#26372c] p-1 text-white"
                  >
                    <X size={14} />
                  </button>
                  {cover === index && <span className="block text-[10px]">Portada</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        {error && (
          <p role="alert" className="mx-auto mt-3 max-w-[920px] text-sm text-[#f3b4a8]">
            {error}
          </p>
        )}
        <div className="mx-auto mt-5 flex max-w-[920px] flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {examples.map((value, index) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setIdea(value);
                  setTitle("");
                  setComuna("");
                  setGenerated(false);
                }}
                className="rounded-full border border-[#a1b4a15e] px-3 py-2 text-xs text-[#d4ddd3]"
              >
                Ejemplo {index + 1}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#a0aea4]">Vista previa local · nada se publica aquí</p>
        </div>
        {generated && (
          <div id="resultado-vista-previa" className="mx-auto mt-14 max-w-[1180px]">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="eyebrow">Vista previa de tu publicación</p>
                <h3 className="mt-2 text-3xl font-bold tracking-[-.05em]">
                  Así se verá en Maquinal.
                </h3>
              </div>
              <p className="max-w-sm text-xs text-[#b2c1b1]">
                Esta vista utiliza las mismas tarjetas y fichas del sitio. Edita los datos y la
                vista previa se actualizará de inmediato.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Vistas previas">
              {(
                [
                  ["card", "En el catálogo"],
                  ["detail", "Publicación completa"],
                  ["showcase", "En mi vitrina"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={tab === value}
                  onClick={() => setTab(value)}
                  className={
                    "rounded-full px-4 py-2 text-sm font-bold " +
                    (tab === value
                      ? "bg-[#b9d88b] text-[#172016]"
                      : "border border-[#667568] text-[#c5d3c2]")
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-[#b4c5af]">
              Presentación:{" "}
              {(["editorial", "visual", "técnica"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVariant(value)}
                  aria-pressed={variant === value}
                  className={
                    "rounded-full border px-3 py-1.5 capitalize " +
                    (variant === value ? "border-[#b9d88b] text-[#e3f2d5]" : "border-[#526252]")
                  }
                >
                  {value}
                </button>
              ))}
            </div>
            <div
              role="tabpanel"
              className={
                "preview-variant preview-variant-" +
                variant +
                " mt-6 rounded-[26px] border border-[#455348] bg-[#161d19] p-4 md:p-7"
              }
            >
              {tab === "card" ? (
                <div className="max-w-sm">
                  <ListingCard listing={listing} inert />
                </div>
              ) : tab === "detail" ? (
                <ListingDetail
                  listing={listing}
                  preview
                  contact={
                    <p className="mt-4 text-sm text-[#aebdac]">
                      El contacto estará disponible cuando publiques e ingresen clientes a su
                      cuenta.
                    </p>
                  }
                />
              ) : (
                <ProviderShowcase provider={provider} listings={[listing]} preview />
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <label className="text-xs text-[#c1d0bf]">
                Editar título
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={100}
                  className="field mt-2 block min-w-[260px] text-sm"
                />
              </label>
              <button type="button" onClick={continueDraft} className="action-primary text-sm">
                Continuar para publicar <ArrowRight size={17} />
              </button>
            </div>
            <p className="mt-3 text-xs text-[#a4b2a3]">
              Para continuar debes ingresar; el formulario final solicita los datos de contacto y
              revisa la información antes de publicar.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
