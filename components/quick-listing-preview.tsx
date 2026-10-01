"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import { PublishPreview } from "@/components/publish-preview";
import { categories, communes } from "@/lib/publish-constants";
import { preparePhoto, type Photo } from "@/lib/image-processing";
import { writePublicationDraft, writePublicationPhotos } from "@/lib/publication-draft-repository";
import type { PublicationValues } from "@/lib/publication-validation";

type PreviewFields = Pick<
  PublicationValues,
  "title" | "category" | "comuna" | "priceKind" | "priceAmount" | "priceUnit"
>;

const emptyFields: PreviewFields = {
  title: "",
  category: "",
  comuna: "",
  priceKind: "consult",
  priceAmount: "",
  priceUnit: "day",
};

function toDraft(fields: PreviewFields): PublicationValues {
  return {
    name: "",
    whatsapp: "",
    contactEmail: "",
    emailContactEnabled: "no",
    comuna: fields.comuna,
    description: "",
    title: fields.title.trim(),
    category: fields.category,
    details: "",
    operator: "no",
    delivery: "no",
    priceKind: fields.priceKind,
    priceAmount: fields.priceKind === "consult" ? "" : fields.priceAmount,
    priceUnit: fields.priceUnit,
    services: "",
    serviceOffers: "",
    sector: "",
    locationPrecision: "none",
    presentationVariant: "editorial",
  };
}

/** A short private preview. The complete publishing form is the only publishing wizard. */
export function QuickListingPreview({ continueHref }: { continueHref: string }) {
  const router = useRouter();
  const [fields, setFields] = useState<PreviewFields>(emptyFields);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  function update<Key extends keyof PreviewFields>(key: Key, value: PreviewFields[Key]) {
    setFields((current) => ({ ...current, [key]: value }));
    setError("");
  }

  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    if (photos.length + files.length > 4) {
      setError("Puedes añadir hasta cuatro fotos.");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const results = await Promise.allSettled(files.map(preparePhoto));
      const ready = results.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      const failures = results.flatMap((result) =>
        result.status === "rejected"
          ? [result.reason instanceof Error ? result.reason.message : "No pudimos usar una foto."]
          : [],
      );
      setPhotos((current) => [...current, ...ready].slice(0, 4));
      if (failures.length) setError(failures.join(" "));
    } finally {
      setProcessing(false);
    }
  }

  function continueToPublish() {
    if (!fields.title.trim() || !fields.category || !fields.comuna) {
      setError("Escribe el equipo y selecciona su categoría y comuna.");
      return;
    }
    if (
      fields.priceKind !== "consult" &&
      (!/^\d+$/.test(fields.priceAmount) || Number(fields.priceAmount) <= 0)
    ) {
      setError("Indica un monto mayor que $0 o selecciona «Consultar precio».");
      return;
    }
    if (!photos.length) {
      setError("Añade al menos una foto para continuar con la publicación.");
      return;
    }
    const savedDraft = writePublicationDraft(toDraft(fields));
    const savedPhotos = writePublicationPhotos(
      photos.map(({ name, dataUrl }) => ({ name, dataUrl })),
    );
    if (!savedDraft || !savedPhotos) {
      setError(
        "No pudimos conservar la vista previa en este navegador. Revisa el espacio disponible e intenta de nuevo.",
      );
      return;
    }
    if (continueHref.startsWith("/signin-with-chatgpt")) {
      window.location.assign(continueHref);
    } else {
      router.push(continueHref);
    }
  }

  return (
    <div className="container-shell grid gap-10 py-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-14 lg:py-20">
      <div className="space-y-6">
        <div>
          <p className="eyebrow">Prueba privada</p>
          <h2 className="display mt-3 text-[clamp(2rem,3.8vw,3.4rem)]">Mira cómo se verá.</h2>
          <p className="muted-copy mt-3 max-w-lg text-sm leading-relaxed">
            Prepara una vista inicial de tu equipo. Aún no se publica. Podrás completar los datos de
            tu negocio y revisar la ficha antes de confirmar.
          </p>
        </div>
        <div className="grid gap-4 rounded-[26px] premium-panel p-5 sm:p-7">
          <label className="text-sm font-semibold">
            Maquinaria o servicio
            <input
              className="field mt-2"
              value={fields.title}
              onChange={(event) => update("title", event.target.value)}
              maxLength={100}
              placeholder="Ej. Miniexcavadora de 3 toneladas"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Categoría
              <select
                className="field mt-2"
                value={fields.category}
                onChange={(event) => update("category", event.target.value)}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Comuna
              <select
                className="field mt-2"
                value={fields.comuna}
                onChange={(event) => update("comuna", event.target.value)}
              >
                <option value="">Selecciona una comuna</option>
                {communes.map((commune) => (
                  <option key={commune} value={commune}>
                    {commune}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Precio
              <select
                className="field mt-2"
                value={fields.priceKind}
                onChange={(event) =>
                  update("priceKind", event.target.value as PreviewFields["priceKind"])
                }
              >
                <option value="consult">A consultar</option>
                <option value="fixed">Precio fijo</option>
                <option value="from">Desde</option>
              </select>
            </label>
            {fields.priceKind !== "consult" && (
              <label className="text-sm font-semibold">
                Monto en pesos por día
                <input
                  className="field mt-2"
                  inputMode="numeric"
                  value={fields.priceAmount}
                  onChange={(event) => update("priceAmount", event.target.value)}
                  placeholder="Ej. 95000"
                />
              </label>
            )}
          </div>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#667568] px-4 py-2.5 text-sm font-semibold text-[#dce9d8] hover:border-[#b9d88b]">
              <ImagePlus size={18} /> Añadir fotos (1 a 4)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={addPhotos}
                className="sr-only"
              />
            </label>
            <p className="mt-2 text-xs text-[#9aab97]">
              JPG, PNG o WebP, hasta 5 MB cada una. La primera será la portada.
            </p>
            {photos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="relative h-20 w-24 overflow-hidden rounded-xl border border-[#52634e]"
                  >
                    <img
                      src={photo.dataUrl}
                      alt={`Foto ${index + 1} de tu equipo`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPhotos((current) => current.filter((item) => item.id !== photo.id))
                      }
                      aria-label={`Quitar foto ${index + 1}`}
                      className="absolute right-1 top-1 rounded-full bg-[#101a14] p-1 text-white"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {processing && (
            <p role="status" className="text-sm text-[#cce2c3]">
              Preparando fotos…
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-[#f1b4a4]">
              {error}
            </p>
          )}
          <button
            type="button"
            className="action-primary justify-center"
            onClick={continueToPublish}
            disabled={processing}
          >
            Continuar con mi publicación <ArrowRight size={17} />
          </button>
          <p className="text-xs leading-relaxed text-[#9aab97]">
            Tu vista previa es privada. Al continuar, iniciarás sesión si hace falta y revisarás los
            datos obligatorios antes de publicar.
          </p>
        </div>
      </div>
      <div className="min-w-0">
        <PublishPreview values={toDraft(fields)} images={photos.map((photo) => photo.dataUrl)} />
      </div>
    </div>
  );
}
