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
import { ArrowLeft, ArrowRight } from "lucide-react";
import { publicationSchema, type PublicationValues } from "@/lib/publication-validation";
import { normalizeChileanWhatsApp } from "@/lib/contact-inquiry";
import { readServiceOffersDraft, type ServiceName, type ServiceOffer } from "@/lib/service-offers";
import {
  claimAnonymousPublicationDraft,
  clearPublicationDraft,
  readPublicationDraft,
  readPublicationPhotos,
  writePublicationDraft,
  writePublicationPhotos,
} from "@/lib/publication-draft-repository";
import { PublishPreview } from "@/components/publish-preview";
import { preparePhoto, restorePhoto, type Photo } from "@/lib/image-processing";

type ExistingProvider = {
  name: string;
  description: string;
  comuna: string;
  whatsapp: string;
  contactEmail: string;
} | null;
export type ExistingEquipment = {
  id: string;
  title: string;
  category: string;
  description: string;
  images: string[];
  operator: string;
  delivery: string;
  priceKind: string;
  priceAmount: number | string | null;
  priceUnit: string;
  services: string;
  serviceOffers?: string;
  sector: string;
  locationPrecision: string;
  presentationVariant: string;
};
type Field = keyof PublicationValues;

import { wizardSteps } from "@/lib/publish-constants";
import { WizardProgress } from "@/components/publish-wizard/wizard-progress";
import { StepBusinessProfile } from "@/components/publish-wizard/step-business-profile";
import { StepEquipment } from "@/components/publish-wizard/step-equipment";
import { StepPhotos } from "@/components/publish-wizard/step-photos";

const stepFields: Partial<Record<number, Field[]>> = {
  0: ["name", "whatsapp", "contactEmail", "comuna", "description"],
  1: ["title", "category", "details"],
  3: ["priceAmount", "serviceOffers"],
};

function initialValues(
  provider: ExistingProvider,
  accountEmail: string,
  accountPhone: string,
  equipment?: ExistingEquipment,
): PublicationValues {
  const base: PublicationValues = {
    name: provider?.name || "",
    whatsapp: provider?.whatsapp || accountPhone,
    contactEmail: provider?.contactEmail || accountEmail,
    emailContactEnabled: provider?.contactEmail ? "yes" : "no",
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
  if (!equipment) return base;
  return {
    ...base,
    title: equipment.title,
    category: equipment.category,
    details: equipment.description,
    operator: equipment.operator === "yes" ? "yes" : "no",
    delivery: equipment.delivery === "yes" ? "yes" : "no",
    priceKind:
      equipment.priceKind === "fixed" || equipment.priceKind === "from"
        ? equipment.priceKind
        : "consult",
    priceAmount: equipment.priceAmount == null ? "" : String(equipment.priceAmount),
    priceUnit: ["hour", "day", "week", "month", "service"].includes(equipment.priceUnit)
      ? (equipment.priceUnit as PublicationValues["priceUnit"])
      : "day",
    services: equipment.services,
    serviceOffers: equipment.serviceOffers || "",
    sector: equipment.sector,
    locationPrecision: equipment.locationPrecision === "approx" ? "approx" : "none",
    presentationVariant: ["editorial", "visual", "technical"].includes(
      equipment.presentationVariant,
    )
      ? (equipment.presentationVariant as PublicationValues["presentationVariant"])
      : "editorial",
  };
}

export function PublishForm({
  provider,
  accountId,
  accountEmail,
  accountPhone = "",
  existingEquipment,
  editId,
}: {
  provider: ExistingProvider;
  accountId: string;
  accountEmail: string;
  accountPhone?: string;
  existingEquipment?: ExistingEquipment;
  editId?: string;
}) {
  const router = useRouter();
  const submitLock = useRef(false);
  const [values, setValues] = useState<PublicationValues>(() =>
    initialValues(provider, accountEmail, accountPhone, existingEquipment),
  );
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [draggedPhoto, setDraggedPhoto] = useState<number | null>(null);
  const [touched, setTouched] = useState<Partial<Record<Field | "images", boolean>>>({});
  const [busy, setBusy] = useState(false);
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [restored, setRestored] = useState(false);
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
      if (!editId) claimAnonymousPublicationDraft(accountId);
      const saved = readPublicationDraft(accountId, editId);
      if (!active) return;
      const restoredEmail =
        saved?.contactEmail ||
        (saved?.emailContactEnabled === "yes" ? "" : provider?.contactEmail || accountEmail);
      if (saved)
        setValues((current) => ({
          ...current,
          ...saved,
          name: saved.name || current.name,
          whatsapp: saved.whatsapp || current.whatsapp,
          description: saved.description || current.description,
          contactEmail: restoredEmail,
        }));
      const savedPhotos = readPublicationPhotos(accountId, editId);
      const restoredPhotos = await Promise.allSettled(savedPhotos.map(restorePhoto));
      if (active) {
        const recovered = restoredPhotos.flatMap((result) =>
          result.status === "fulfilled" ? [result.value] : [],
        );
        setPhotos(
          recovered.length || saved
            ? recovered
            : (existingEquipment?.images || []).map((url, index) => ({
                id: `existing-${index}`,
                name: `Foto ${index + 1}`,
                dataUrl: url,
                sourceUrl: url,
              })),
        );
        setRestored(true);
      }
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [provider, accountId, accountEmail, accountPhone, editId, existingEquipment]);

  useEffect(() => {
    if (!restored) return;
    const timer = window.setTimeout(() => {
      const savedValues = writePublicationDraft(values, accountId, editId);
      const savedPhotos = writePublicationPhotos(
        photos.map(({ name, dataUrl, sourceUrl }) => ({ name, dataUrl, sourceUrl })),
        accountId,
        editId,
      );
      setSaveState(savedValues && savedPhotos ? "saved" : "error");
    }, 800);
    return () => window.clearTimeout(timer);
  }, [values, photos, restored, accountId, editId]);

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
    const activeFields =
      step === 3 && values.priceKind === "consult"
        ? fields.filter((field) => field !== "priceAmount")
        : fields;
    setTouched((current) => ({
      ...current,
      ...Object.fromEntries(activeFields.map((field) => [field, true])),
    }));
    if (activeFields.some((field) => errors[field])) {
      if (errors.serviceOffers)
        document
          .querySelector<HTMLDetailsElement>('details[data-publish-step="3"]')
          ?.setAttribute("open", "");
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
      contactEmail: true,
      emailContactEnabled: true,
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
      if (first === "serviceOffers")
        document
          .querySelector<HTMLDetailsElement>('details[data-publish-step="3"]')
          ?.setAttribute("open", "");
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
      for (const photo of photos) if (photo.file) form.append("images", photo.file);
      if (editId)
        form.set(
          "existingImages",
          JSON.stringify(photos.flatMap((photo) => (photo.sourceUrl ? [photo.sourceUrl] : []))),
        );
      const response = await fetch(
        editId ? `/api/equipos/${encodeURIComponent(editId)}` : "/api/publicar",
        {
          method: editId ? "PATCH" : "POST",
          body: form,
        },
      );
      const result = (await response.json()) as { error?: string; url?: string; itemUrl?: string };
      if (!response.ok)
        throw new Error(
          result.error || "No pudimos publicar. Tus datos siguen aquí; intenta nuevamente.",
        );
      clearPublicationDraft(accountId, editId);
      router.push(result.itemUrl || result.url || "/cuenta");
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
        <WizardProgress step={step} />
        <StepBusinessProfile
          values={values}
          update={update}
          mark={mark}
          fieldState={fieldState}
          issue={issue}
        />
        <StepEquipment
          step={step}
          values={values}
          update={update}
          mark={mark}
          fieldState={fieldState}
          issue={issue}
          selectedOffers={selectedOffers}
          setServiceOffer={setServiceOffer}
        >
          <StepPhotos
            photos={photos}
            processingPhotos={processingPhotos}
            photoError={photoError}
            touchedImages={touched.images}
            draggedPhoto={draggedPhoto}
            setDraggedPhoto={setDraggedPhoto}
            addPhotos={addPhotos}
            dropPhotos={dropPhotos}
            reorderPhoto={reorderPhoto}
            movePhoto={movePhoto}
            removePhoto={(id) => {
              setPhotos((current) => current.filter((item) => item.id !== id));
              setSaveState("saving");
            }}
          />
        </StepEquipment>
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
        <div data-publish-step="4" className="flex flex-wrap items-center gap-4">
          <button
            disabled={busy || processingPhotos}
            type="submit"
            className="action-primary min-w-[230px] !px-7 !py-3.5 disabled:opacity-60"
          >
            {busy
              ? "Guardando…"
              : editId
                ? "Guardar cambios y ver ficha"
                : "Publicar y ver mi ficha"}{" "}
            <ArrowRight size={18} />
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
      <aside data-publish-step="4" className="lg:col-span-2">
        <PublishPreview values={values} images={photos.map((photo) => photo.dataUrl)} />
      </aside>
    </form>
  );
}
