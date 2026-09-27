"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ImagePlus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { publicationSchema, type PublicationValues } from "@/lib/publication-validation";
import { normalizeChileanWhatsApp } from "@/lib/contact-inquiry";
import {
  readServiceOffersDraft,
  serviceNames,
  type ServiceName,
  type ServiceOffer,
} from "@/lib/service-offers";
import {
  clearAssistantHandoff,
  clearPublicationDraft,
  readAssistantHandoff,
  readPublicationDraft,
  readPublicationPhotos,
  writePublicationDraft,
  writePublicationPhotos,
  type SavedPhoto,
} from "@/lib/publication-draft-repository";
import { PublishPreview } from "@/components/publish-preview";

type ExistingProvider = {
  name: string;
  description: string;
  comuna: string;
  whatsapp: string;
} | null;
type Photo = SavedPhoto & { id: string; file: File };
type Field = keyof PublicationValues;
const communes = [
  "Santiago",
  "Maipú",
  "Pudahuel",
  "Quilicura",
  "Las Condes",
  "Puente Alto",
  "San Bernardo",
  "Otra comuna de Santiago",
];
const categories = [
  "Movimiento de tierra",
  "Compactación",
  "Generadores",
  "Altura y elevación",
  "Transporte",
  "Servicio con maquinaria",
  "Carga y traslado",
  "Otro equipo",
];
const wizardSteps = [
  "Tu negocio",
  "Equipo",
  "Fotografías",
  "Precio",
  "Servicios",
  "Ubicación",
  "Presentación",
  "Vista previa",
] as const;
const stepFields: Partial<Record<number, Field[]>> = {
  0: ["name", "whatsapp", "comuna", "description"],
  1: ["title", "category", "details"],
  3: ["priceAmount"],
  4: ["serviceOffers"],
};

function initialValues(provider: ExistingProvider): PublicationValues {
  return {
    name: provider?.name || "",
    whatsapp: provider?.whatsapp || "",
    comuna: provider?.comuna || "",
    description: provider?.description || "",
    title: "",
    category: "",
    details: "",
    operator: "no",
    delivery: "no",
    priceKind: "consult",
    priceAmount: "",
    priceUnit: "day",
    services: "",
    serviceOffers: "",
    sector: "",
    locationPrecision: "none",
    presentationVariant: "editorial",
  };
}
async function preparePhoto(file: File): Promise<Photo> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Usa imágenes JPG, PNG o WebP.");
  if (!file.size || file.size > 5_000_000) throw new Error("Cada foto debe pesar menos de 5 MB.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("No pudimos abrir una foto. Prueba con otro archivo.");
  }
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 1100 / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("No pudimos procesar la foto.");
  }
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let blob: Blob | null = null;
  for (const quality of [0.76, 0.62, 0.48, 0.36]) {
    blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size < 190_000) break;
  }
  if (!blob || blob.size > 250_000)
    throw new Error("Una foto es demasiado grande. Prueba con otra imagen.");
  const output = new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No pudimos leer una foto."));
    reader.readAsDataURL(output);
  });
  return { id: crypto.randomUUID(), name: output.name, dataUrl, file: output };
}
async function restorePhoto(saved: SavedPhoto): Promise<Photo> {
  const response = await fetch(saved.dataUrl);
  const blob = await response.blob();
  return {
    ...saved,
    id: crypto.randomUUID(),
    file: new File([blob], saved.name, { type: "image/jpeg" }),
  };
}

export function PublishForm({ provider }: { provider: ExistingProvider }) {
  const router = useRouter();
  const submitLock = useRef(false);
  const [values, setValues] = useState<PublicationValues>(() => initialValues(provider));
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [draggedPhoto, setDraggedPhoto] = useState<number | null>(null);
  const [touched, setTouched] = useState<Partial<Record<Field | "images", boolean>>>({});
  const [busy, setBusy] = useState(false);
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [restored, setRestored] = useState(false);
  const [fromAssistant, setFromAssistant] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [step, setStep] = useState(0);
  const selectedOffers = readServiceOffersDraft(values.serviceOffers);
  if (!values.serviceOffers) {
    if (values.operator === "yes" && !selectedOffers.some((offer) => offer.name === "Operador"))
      selectedOffers.push({ name: "Operador", kind: "consult" });
    if (values.delivery === "yes" && !selectedOffers.some((offer) => offer.name === "Traslado"))
      selectedOffers.push({ name: "Traslado", kind: "consult" });
  }
  const parsed = publicationSchema.safeParse(values);
  const errors = parsed.success
    ? {}
    : (Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path[0], issue.message]),
      ) as Partial<Record<Field, string>>);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      const saved = readPublicationDraft();
      const handoff = readAssistantHandoff();
      if (!active) return;
      if (handoff) {
        const merged = {
          ...(saved || initialValues(provider)),
          ...handoff.values,
          name:
            provider?.name ||
            (handoff.values.name === "Tu negocio"
              ? saved?.name || ""
              : handoff.values.name || saved?.name || ""),
          description:
            provider?.description || handoff.values.description || saved?.description || "",
        } as PublicationValues;
        setValues(merged);
        writePublicationDraft(merged);
        if (handoff.photos.length) writePublicationPhotos(handoff.photos);
        clearAssistantHandoff();
        setFromAssistant(true);
      } else if (saved) setValues(saved);
      const savedPhotos = readPublicationPhotos();
      const sourcePhotos = handoff?.photos.length ? handoff.photos : savedPhotos;
      const restoredPhotos = await Promise.allSettled(sourcePhotos.map(restorePhoto));
      if (active) {
        setPhotos(
          restoredPhotos.flatMap((result) => (result.status === "fulfilled" ? [result.value] : [])),
        );
        setRestored(true);
      }
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [provider]);

  useEffect(() => {
    if (!restored) return;
    const timer = window.setTimeout(() => {
      const savedValues = writePublicationDraft(values);
      const savedPhotos = writePublicationPhotos(
        photos.map(({ name, dataUrl }) => ({ name, dataUrl })),
      );
      setSaveState(savedValues && savedPhotos ? "saved" : "error");
    }, 800);
    return () => window.clearTimeout(timer);
  }, [values, photos, restored]);

  function update(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setError("");
    setSaveState("saving");
  }
  function setServiceOffer(name: ServiceName, offer: ServiceOffer | null) {
    setValues((current) => {
      const existing = readServiceOffersDraft(current.serviceOffers);
      if (!current.serviceOffers) {
        if (current.operator === "yes") existing.push({ name: "Operador", kind: "consult" });
        if (current.delivery === "yes") existing.push({ name: "Traslado", kind: "consult" });
      }
      const next = existing.filter((item) => item.name !== name);
      if (offer) next.push(offer);
      return {
        ...current,
        serviceOffers: JSON.stringify(next),
        operator: name === "Operador" ? (offer ? "yes" : "no") : current.operator,
        delivery: name === "Traslado" ? (offer ? "yes" : "no") : current.delivery,
      };
    });
    setError("");
    setSaveState("saving");
  }
  function mark(field: Field) {
    setTouched((current) => ({ ...current, [field]: true }));
  }
  function fieldState(field: Field) {
    return {
      "aria-invalid": Boolean(touched[field] && errors[field]) as true | false,
      "aria-describedby": touched[field] && errors[field] ? field + "-error" : undefined,
    };
  }
  function issue(field: Field) {
    return touched[field] && errors[field] ? (
      <p id={field + "-error"} className="mt-1.5 text-xs font-normal text-[#f1b4a4]">
        {errors[field]}
      </p>
    ) : null;
  }
  function nextStep() {
    if (processingPhotos) return;
    const fields = stepFields[step] || [];
    const activeFields = step === 3 && values.priceKind === "consult" ? [] : fields;
    setTouched((current) => ({
      ...current,
      ...Object.fromEntries(activeFields.map((field) => [field, true])),
    }));
    if (activeFields.some((field) => errors[field])) {
      setError("Revisa los campos marcados antes de continuar.");
      return;
    }
    if (step === 2 && !photos.length) {
      setTouched((current) => ({ ...current, images: true }));
      setPhotoError("Añade al menos una foto para continuar.");
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, wizardSteps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    await processPhotoFiles(files);
  }
  async function processPhotoFiles(files: File[]) {
    if (!files.length) return;
    if (photos.length + files.length > 4) {
      setPhotoError("Puedes añadir hasta cuatro fotos. Quita alguna para continuar.");
      return;
    }
    setProcessingPhotos(true);
    setPhotoError("");
    const results = await Promise.allSettled(files.map(preparePhoto));
    const added = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
    const failed = results.flatMap((result) =>
      result.status === "rejected"
        ? [result.reason instanceof Error ? result.reason.message : "No pudimos usar una foto."]
        : [],
    );
    setPhotos((current) => [...current, ...added].slice(0, 4));
    if (added.length) setSaveState("saving");
    if (failed.length) setPhotoError(failed.join(" "));
    setProcessingPhotos(false);
  }
  function dropPhotos(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void processPhotoFiles(Array.from(event.dataTransfer.files));
  }
  function reorderPhoto(from: number, to: number) {
    if (from === to) return;
    setSaveState("saving");
    setPhotos((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }
  function movePhoto(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target >= 0 && target < photos.length) reorderPhoto(index, target);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current || busy || processingPhotos) return;
    if (step < wizardSteps.length - 1) {
      nextStep();
      return;
    }
    setTouched({
      name: true,
      whatsapp: true,
      comuna: true,
      description: true,
      title: true,
      category: true,
      details: true,
      operator: true,
      delivery: true,
      priceKind: true,
      priceAmount: true,
      priceUnit: true,
      services: true,
      serviceOffers: true,
      sector: true,
      locationPrecision: true,
      presentationVariant: true,
      images: true,
    });
    setError("");
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.path[0];
      const failedStep = Object.entries(stepFields).find(([, fields]) =>
        fields?.includes(first as Field),
      );
      setStep(failedStep ? Number(failedStep[0]) : 0);
      setError("Revisa los campos marcados antes de publicar.");
      return;
    }
    if (!photos.length) {
      setStep(2);
      setPhotoError("Añade al menos una foto de tu maquinaria o servicio.");
      return;
    }
    submitLock.current = true;
    setBusy(true);
    try {
      const form = new FormData();
      for (const [key, value] of Object.entries(parsed.data))
        form.set(key, key === "whatsapp" ? normalizeChileanWhatsApp(value) || "" : value);
      for (const photo of photos) form.append("images", photo.file);
      const response = await fetch("/api/publicar", { method: "POST", body: form });
      const result = (await response.json()) as { error?: string; url?: string };
      if (!response.ok)
        throw new Error(
          result.error || "No pudimos publicar. Tus datos siguen aquí; intenta nuevamente.",
        );
      clearPublicationDraft();
      clearAssistantHandoff();
      router.push(result.url || "/cuenta");
      router.refresh();
    } catch (cause) {
      console.error("No pudimos publicar", cause);
      setError(
        cause instanceof Error
          ? cause.message
          : "No pudimos publicar. Tus datos siguen aquí; intenta nuevamente.",
      );
    } finally {
      setBusy(false);
      submitLock.current = false;
    }
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      data-current-step={step}
      className="publish-wizard mx-auto mt-9 grid max-w-[960px] grid-cols-1 gap-6 items-start"
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-[#46584a] bg-[#1a231e] p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow">Publicación guiada</p>
            <p className="text-xs font-bold text-[#d4e7c2]">
              {step + 1} / {wizardSteps.length}
            </p>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#354337]">
            <div
              className="h-full rounded-full bg-[#b9d88b] transition-all"
              style={{ width: `${((step + 1) / wizardSteps.length) * 100}%` }}
            />
          </div>
          <ol className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {wizardSteps.map((label, index) => (
              <li
                key={label}
                className={
                  "shrink-0 text-xs " +
                  (index === step ? "font-bold text-[#e8f2df]" : "text-[#8d9e8b]")
                }
              >
                {String(index + 1).padStart(2, "0")} {label}
              </li>
            ))}
          </ol>
        </div>
        {fromAssistant ? (
          <div className="rounded-2xl border border-[#728666] bg-[#293529] px-5 py-4 flex gap-3 text-sm text-[#d7e5cd]">
            <Sparkles size={18} className="shrink-0 text-[#b9d88b]" />
            <div>
              <strong>Tu vista previa está lista para revisar.</strong>
              <p className="mt-1 text-xs text-[#b4c4ae]">
                Completa los datos que faltan y ajusta el texto antes de publicar.
              </p>
            </div>
          </div>
        ) : null}
        <section data-publish-step="0" className="rounded-[26px] premium-panel p-5 md:p-8">
          <div className="flex items-start gap-4 mb-7">
            <span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl bg-[#b9d88b1b] text-[#b9d88b] font-bold">
              01
            </span>
            <div>
              <p className="eyebrow">Identidad de tu negocio</p>
              <h2 className="mt-1 text-2xl font-bold tracking-[-.04em]">Tu perfil de proveedor</h2>
              <p className="mt-1 text-sm text-[#a9b7a6]">
                Estos datos construirán tu vitrina pública.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <label className="block text-sm font-semibold">
              Nombre comercial *
              <input
                name="name"
                value={values.name}
                onChange={(event) => update("name", event.target.value)}
                onBlur={() => mark("name")}
                maxLength={90}
                placeholder="Ej. Andes Maquinarias"
                {...fieldState("name")}
                className="field mt-2"
              />
              {issue("name")}
            </label>
            <label className="block text-sm font-semibold">
              WhatsApp de contacto *
              <input
                name="whatsapp"
                value={values.whatsapp}
                onChange={(event) => update("whatsapp", event.target.value)}
                onBlur={() => mark("whatsapp")}
                type="tel"
                inputMode="tel"
                placeholder="+56 9 1234 5678"
                {...fieldState("whatsapp")}
                className="field mt-2"
              />
              {issue("whatsapp")}
              <span className="mt-1.5 block text-xs font-normal text-[#94a391]">
                Solo visible para usuarios con sesión iniciada.
              </span>
            </label>
            <label className="block text-sm font-semibold">
              Comuna base *
              <select
                name="comuna"
                value={values.comuna}
                onChange={(event) => update("comuna", event.target.value)}
                onBlur={() => mark("comuna")}
                {...fieldState("comuna")}
                className="field mt-2"
              >
                <option value="">Selecciona tu comuna</option>
                {communes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {issue("comuna")}
            </label>
            <label className="block text-sm font-semibold md:col-span-2">
              Cuéntales sobre tu negocio *
              <textarea
                name="description"
                value={values.description}
                onChange={(event) => update("description", event.target.value)}
                onBlur={() => mark("description")}
                maxLength={600}
                rows={4}
                placeholder="Qué haces, dónde trabajas y qué pueden esperar tus clientes."
                {...fieldState("description")}
                className="field mt-2 resize-y"
              />
              {issue("description")}
            </label>
          </div>
        </section>
        <section data-publish-equipment className="rounded-[26px] premium-panel p-5 md:p-8">
          <div className="flex items-start gap-4 mb-7">
            <span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl bg-[#b9d88b1b] text-[#b9d88b] font-bold">
              {String(step + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="eyebrow">Prepara tu publicación</p>
              <h2 className="mt-1 text-2xl font-bold tracking-[-.04em]">{wizardSteps[step]}</h2>
              <p className="mt-1 text-sm text-[#a9b7a6]">
                Avanza a tu ritmo. Guardamos el borrador en este navegador.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <label className="block text-sm font-semibold" data-publish-step="1">
              Equipo o servicio *
              <input
                name="title"
                value={values.title}
                onChange={(event) => update("title", event.target.value)}
                onBlur={() => mark("title")}
                maxLength={100}
                placeholder="Ej. Miniexcavadora 3 toneladas"
                {...fieldState("title")}
                className="field mt-2"
              />
              {issue("title")}
            </label>
            <label className="block text-sm font-semibold" data-publish-step="1">
              Categoría *
              <select
                name="category"
                value={values.category}
                onChange={(event) => update("category", event.target.value)}
                onBlur={() => mark("category")}
                {...fieldState("category")}
                className="field mt-2"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {issue("category")}
            </label>
            <label className="block text-sm font-semibold md:col-span-2" data-publish-step="1">
              Descripción del equipo *
              <textarea
                name="details"
                value={values.details}
                onChange={(event) => update("details", event.target.value)}
                onBlur={() => mark("details")}
                maxLength={800}
                rows={4}
                placeholder="Capacidad, modelo, condiciones de arriendo, zonas de trabajo..."
                {...fieldState("details")}
                className="field mt-2 resize-y"
              />
              {issue("details")}
            </label>
            <label className="block text-sm font-semibold" data-publish-step="3">
              Precio
              <select
                name="priceKind"
                value={values.priceKind}
                onChange={(event) => update("priceKind", event.target.value)}
                className="field mt-2"
              >
                <option value="consult">Consultar precio</option>
                <option value="fixed">Precio fijo</option>
                <option value="from">Desde</option>
              </select>
            </label>
            {values.priceKind !== "consult" && (
              <>
                <label className="block text-sm font-semibold" data-publish-step="3">
                  Monto en pesos *
                  <input
                    name="priceAmount"
                    value={values.priceAmount}
                    onChange={(event) => update("priceAmount", event.target.value)}
                    onBlur={() => mark("priceAmount")}
                    inputMode="numeric"
                    placeholder="Ej. 95000"
                    {...fieldState("priceAmount")}
                    className="field mt-2"
                  />
                  {issue("priceAmount")}
                </label>
                <label className="block text-sm font-semibold" data-publish-step="3">
                  Unidad
                  <select
                    name="priceUnit"
                    value={values.priceUnit}
                    onChange={(event) => update("priceUnit", event.target.value)}
                    className="field mt-2"
                  >
                    <option value="day">Por día</option>
                    <option value="hour">Por hora</option>
                    <option value="week">Por semana</option>
                    <option value="month">Por mes</option>
                    <option value="service">Por servicio</option>
                  </select>
                </label>
              </>
            )}
            <fieldset className="md:col-span-2" data-publish-step="4">
              <legend className="text-sm font-semibold">Servicios opcionales</legend>
              <p className="mt-1 text-xs text-[#a9b7a6]">
                Selecciona solo lo que realmente ofreces e indica cómo se cobra cada servicio.
              </p>
              <div className="mt-4 space-y-3">
                {serviceNames.map((name) => {
                  const offer = selectedOffers.find((item) => item.name === name);
                  return (
                    <div
                      key={name}
                      className="grid gap-3 rounded-xl border border-[#435447] bg-[#1b261f] p-4 sm:grid-cols-[1fr_190px_160px] sm:items-center"
                    >
                      <label className="flex items-center gap-3 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={Boolean(offer)}
                          onChange={(event) =>
                            setServiceOffer(
                              name,
                              event.target.checked ? { name, kind: "consult" } : null,
                            )
                          }
                          className="accent-[#b9d88b]"
                        />
                        {name}
                      </label>
                      {offer ? (
                        <>
                          <label className="text-xs text-[#b7c7b2]">
                            Modalidad
                            <select
                              aria-label={`Modalidad de ${name}`}
                              value={offer.kind}
                              onChange={(event) => {
                                const kind = event.target.value as ServiceOffer["kind"];
                                setServiceOffer(name, {
                                  name,
                                  kind,
                                  amount:
                                    kind === "fixed" || kind === "from" ? offer.amount : undefined,
                                });
                              }}
                              className="field mt-1"
                            >
                              <option value="consult">A consultar</option>
                              <option value="included">Incluido</option>
                              <option value="fixed">Precio fijo</option>
                              <option value="from">Desde</option>
                            </select>
                          </label>
                          {offer.kind === "fixed" || offer.kind === "from" ? (
                            <label className="text-xs text-[#b7c7b2]">
                              Monto en pesos
                              <input
                                aria-label={`Monto de ${name}`}
                                inputMode="numeric"
                                value={offer.amount ?? ""}
                                onChange={(event) => {
                                  const raw = event.target.value.trim();
                                  setServiceOffer(name, {
                                    name,
                                    kind: offer.kind,
                                    amount: /^\d+$/.test(raw) ? Number(raw) : undefined,
                                  });
                                }}
                                placeholder="Ej. 40000"
                                className="field mt-1"
                              />
                            </label>
                          ) : (
                            <span className="hidden sm:block" />
                          )}
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              {issue("serviceOffers")}
            </fieldset>
            <label className="block text-sm font-semibold md:col-span-2" data-publish-step="4">
              Otras condiciones (opcional, separa con comas)
              <input
                name="services"
                value={values.services}
                onChange={(event) => update("services", event.target.value)}
                maxLength={300}
                placeholder="Ej. operador disponible, traslado a consultar"
                className="field mt-2"
              />
            </label>
            <label className="block text-sm font-semibold" data-publish-step="5">
              Sector referencial (opcional)
              <input
                name="sector"
                value={values.sector}
                onChange={(event) => update("sector", event.target.value)}
                maxLength={80}
                placeholder="Ej. sector industrial"
                className="field mt-2"
              />
            </label>
            <label className="block text-sm font-semibold" data-publish-step="5">
              Ubicación
              <select
                name="locationPrecision"
                value={values.locationPrecision}
                onChange={(event) => update("locationPrecision", event.target.value)}
                className="field mt-2"
              >
                <option value="none">Mostrar solo comuna</option>
                <option value="approx">Mostrar sector aproximado</option>
              </select>
            </label>
            <label className="block text-sm font-semibold md:col-span-2" data-publish-step="6">
              Presentación de la ficha
              <select
                name="presentationVariant"
                value={values.presentationVariant}
                onChange={(event) => update("presentationVariant", event.target.value)}
                className="field mt-2"
              >
                <option value="editorial">Editorial · equilibrada</option>
                <option value="visual">Visual · fotografías protagonistas</option>
                <option value="technical">Técnica · detalles protagonistas</option>
              </select>
            </label>
            <div
              data-publish-step="2"
              onDragOver={(event) => event.preventDefault()}
              onDrop={dropPhotos}
              className="md:col-span-2 rounded-2xl border border-dashed border-[#687a65] bg-[#243027] p-5 text-sm"
            >
              <label className="inline-flex cursor-pointer items-center gap-2 font-semibold text-[#dce9d8]">
                <ImagePlus size={19} className="text-[#b9d88b]" /> Añadir fotos *{" "}
                <span className="font-normal text-[#a5b3a2]">(1 a 4)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={addPhotos}
                  className="sr-only"
                />
              </label>
              <p className="mt-2 text-xs text-[#96a594]">
                JPG, PNG o WebP; máximo 5 MB por foto. La primera es la portada. También puedes
                soltar fotos aquí o arrastrarlas para reordenarlas.
              </p>
              {processingPhotos ? (
                <p role="status" className="mt-3 text-xs text-[#cce2c3]">
                  Preparando fotos…
                </p>
              ) : null}
              {photos.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      draggable
                      onDragStart={() => setDraggedPhoto(index)}
                      onDragEnd={() => setDraggedPhoto(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (draggedPhoto !== null) reorderPhoto(draggedPhoto, index);
                        setDraggedPhoto(null);
                      }}
                      className="rounded-xl border border-[#52634e] bg-[#18221a] p-2"
                    >
                      <img
                        src={photo.dataUrl}
                        alt={"Foto " + (index + 1)}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                      <p className="mt-2 truncate text-xs text-[#d2dfca]">
                        {index === 0 ? "Portada" : "Foto " + (index + 1)}
                      </p>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => reorderPhoto(index, 0)}
                          className="mt-1 text-xs font-bold text-[#c7e1ad] hover:underline"
                        >
                          Usar como portada
                        </button>
                      )}
                      <div className="mt-2 flex gap-1">
                        <button
                          type="button"
                          aria-label={"Mover foto " + (index + 1) + " antes"}
                          disabled={index === 0}
                          onClick={() => movePhoto(index, -1)}
                          className="rounded-md border border-[#667964] p-1 disabled:opacity-35"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={"Mover foto " + (index + 1) + " después"}
                          disabled={index === photos.length - 1}
                          onClick={() => movePhoto(index, 1)}
                          className="rounded-md border border-[#667964] p-1 disabled:opacity-35"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={"Quitar foto " + (index + 1)}
                          onClick={() => {
                            setPhotos((current) => current.filter((item) => item.id !== photo.id));
                            setSaveState("saving");
                          }}
                          className="ml-auto rounded-md border border-[#667964] p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              {photoError || (touched.images && !photos.length) ? (
                <p role="alert" className="mt-3 text-xs text-[#f1b4a4]">
                  {photoError || "Añade al menos una foto."}
                </p>
              ) : null}
            </div>
          </div>
        </section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => {
              setError("");
              setStep((current) => Math.max(current - 1, 0));
            }}
            className="action-secondary text-sm disabled:opacity-40"
          >
            <ArrowLeft size={17} /> Anterior
          </button>
          {step < wizardSteps.length - 1 && (
            <button
              type="button"
              onClick={nextStep}
              disabled={processingPhotos}
              className="action-primary text-sm"
            >
              Continuar <ArrowRight size={17} />
            </button>
          )}
        </div>
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-[#c98474] bg-[#5a302c] p-4 text-sm text-[#ffe0d7]"
          >
            {error}
          </p>
        ) : null}
        <div data-publish-step="7" className="flex flex-wrap items-center gap-4">
          <button
            disabled={busy || processingPhotos}
            type="submit"
            className="action-primary min-w-[230px] !px-7 !py-3.5 disabled:opacity-60"
          >
            {busy ? "Publicando…" : "Publicar y ver mi vitrina"} <ArrowRight size={18} />
          </button>
          <span role="status" className="text-xs text-[#a9bba5]">
            {saveState === "saving"
              ? "Guardando borrador…"
              : saveState === "saved"
                ? "Borrador guardado en este navegador"
                : saveState === "error"
                  ? "No pudimos guardar el borrador local"
                  : ""}
          </span>
        </div>
        <p className="text-xs text-[#94a391]">
          Al publicar, tú atiendes las consultas y acuerdas condiciones directamente con cada
          cliente.
        </p>
      </div>
      <aside data-publish-step="7" className="lg:col-span-2">
        <PublishPreview values={values} images={photos.map((photo) => photo.dataUrl)} />
      </aside>
    </form>
  );
}
