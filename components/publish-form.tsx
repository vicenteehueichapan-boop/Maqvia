"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowRight, ArrowUp, Camera, ImagePlus, Info, LockKeyhole, MapPin, Sparkles, Trash2 } from "lucide-react";
import { publicationSchema, type PublicationValues } from "@/lib/publication-validation";
import { normalizeChileanWhatsApp } from "@/lib/contact-inquiry";
import { clearAssistantHandoff, clearPublicationDraft, readAssistantHandoff, readPublicationDraft, readPublicationPhotos, writePublicationDraft, writePublicationPhotos, type SavedPhoto } from "@/lib/publication-draft-repository";

type ExistingProvider = { name: string; description: string; comuna: string; whatsapp: string } | null;
type Photo = SavedPhoto & { id: string; file: File };
type Field = keyof PublicationValues;
const communes = ["Santiago", "Maipú", "Pudahuel", "Quilicura", "Las Condes", "Puente Alto", "San Bernardo", "Otra comuna de Santiago"];
const categories = ["Movimiento de tierra", "Compactación", "Generadores", "Altura y elevación", "Transporte", "Servicio con maquinaria", "Carga y traslado", "Otro equipo"];

function initialValues(provider: ExistingProvider): PublicationValues {
  return { name: provider?.name || "", whatsapp: provider?.whatsapp || "", comuna: provider?.comuna || "", description: provider?.description || "", title: "", category: "", details: "", operator: "no", delivery: "no" };
}
async function preparePhoto(file: File): Promise<Photo> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Usa imágenes JPG, PNG o WebP.");
  if (!file.size || file.size > 5_000_000) throw new Error("Cada foto debe pesar menos de 5 MB.");
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); } catch { throw new Error("No pudimos abrir una foto. Prueba con otro archivo."); }
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 1100 / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) { bitmap.close(); throw new Error("No pudimos procesar la foto."); }
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let blob: Blob | null = null;
  for (const quality of [.76, .62, .48, .36]) {
    blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size < 190_000) break;
  }
  if (!blob || blob.size > 250_000) throw new Error("Una foto es demasiado grande. Prueba con otra imagen.");
  const output = new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
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
  return { ...saved, id: crypto.randomUUID(), file: new File([blob], saved.name, { type: "image/jpeg" }) };
}

export function PublishForm({ provider }: { provider: ExistingProvider }) {
  const router = useRouter();
  const submitLock = useRef(false);
  const [values, setValues] = useState<PublicationValues>(() => initialValues(provider));
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [touched, setTouched] = useState<Partial<Record<Field | "images", boolean>>>({});
  const [busy, setBusy] = useState(false);
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [restored, setRestored] = useState(false);
  const [fromAssistant, setFromAssistant] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const parsed = publicationSchema.safeParse(values);
  const errors = parsed.success ? {} : Object.fromEntries(parsed.error.issues.map(issue => [issue.path[0], issue.message])) as Partial<Record<Field, string>>;

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      const saved = readPublicationDraft();
      const handoff = readAssistantHandoff();
      if (!active) return;
      if (handoff) {
        const merged = { ...(saved || initialValues(provider)), ...handoff.values, name: provider?.name || (handoff.values.name === "Tu negocio" ? saved?.name || "" : handoff.values.name || saved?.name || "") } as PublicationValues;
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
        setPhotos(restoredPhotos.flatMap(result => result.status === "fulfilled" ? [result.value] : []));
        setRestored(true);
      }
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [provider]);

  useEffect(() => {
    if (!restored) return;
    const timer = window.setTimeout(() => {
      const savedValues = writePublicationDraft(values);
      const savedPhotos = writePublicationPhotos(photos.map(({ name, dataUrl }) => ({ name, dataUrl })));
      setSaveState(savedValues && savedPhotos ? "saved" : "error");
    }, 800);
    return () => window.clearTimeout(timer);
  }, [values, photos, restored]);

  function update(field: Field, value: string) {
    setValues(current => ({ ...current, [field]: value }));
    setError("");
    setSaveState("saving");
  }
  function mark(field: Field) { setTouched(current => ({ ...current, [field]: true })); }
  function fieldState(field: Field) {
    return { "aria-invalid": Boolean(touched[field] && errors[field]) as true | false, "aria-describedby": touched[field] && errors[field] ? field + "-error" : undefined };
  }
  function issue(field: Field) {
    return touched[field] && errors[field] ? <p id={field + "-error"} className="mt-1.5 text-xs font-normal text-[#f1b4a4]">{errors[field]}</p> : null;
  }
  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    if (photos.length + files.length > 4) { setPhotoError("Puedes añadir hasta cuatro fotos. Quita alguna para continuar."); return; }
    setProcessingPhotos(true);
    setPhotoError("");
    const results = await Promise.allSettled(files.map(preparePhoto));
    const added = results.flatMap(result => result.status === "fulfilled" ? [result.value] : []);
    const failed = results.flatMap(result => result.status === "rejected" ? [result.reason instanceof Error ? result.reason.message : "No pudimos usar una foto."] : []);
    setPhotos(current => [...current, ...added].slice(0, 4));
    if (added.length) setSaveState("saving");
    if (failed.length) setPhotoError(failed.join(" "));
    setProcessingPhotos(false);
  }
  function movePhoto(index: number, direction: -1 | 1) {
    setSaveState("saving");
    setPhotos(current => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current || busy || processingPhotos) return;
    setTouched({ name: true, whatsapp: true, comuna: true, description: true, title: true, category: true, details: true, operator: true, delivery: true, images: true });
    setError("");
    if (!parsed.success) { document.querySelector("[aria-invalid=true]")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (!photos.length) { setPhotoError("Añade al menos una foto de tu maquinaria o servicio."); return; }
    submitLock.current = true;
    setBusy(true);
    try {
      const form = new FormData();
      for (const [key, value] of Object.entries(parsed.data)) form.set(key, key === "whatsapp" ? normalizeChileanWhatsApp(value) || "" : value);
      for (const photo of photos) form.append("images", photo.file);
      const response = await fetch("/api/publicar", { method: "POST", body: form });
      const result = await response.json() as { error?: string; url?: string };
      if (!response.ok) throw new Error(result.error || "No pudimos publicar. Tus datos siguen aquí; intenta nuevamente.");
      clearPublicationDraft();
      clearAssistantHandoff();
      router.push(result.url || "/cuenta");
      router.refresh();
    } catch (cause) {
      console.error("No pudimos publicar", cause);
      setError(cause instanceof Error ? cause.message : "No pudimos publicar. Tus datos siguen aquí; intenta nuevamente.");
    } finally { setBusy(false); submitLock.current = false; }
  }

  return <form onSubmit={submit} noValidate className="mt-9 grid lg:grid-cols-[minmax(0,1fr)_350px] gap-6 lg:gap-8 items-start"><div className="space-y-6">
    {fromAssistant ? <div className="rounded-2xl border border-[#728666] bg-[#293529] px-5 py-4 flex gap-3 text-sm text-[#d7e5cd]"><Sparkles size={18} className="shrink-0 text-[#b9d88b]"/><div><strong>Tu vista previa está lista para revisar.</strong><p className="mt-1 text-xs text-[#b4c4ae]">Completa los datos que faltan y ajusta el texto antes de publicar.</p></div></div> : null}
    <section className="rounded-[26px] premium-panel p-5 md:p-8"><div className="flex items-start gap-4 mb-7"><span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl bg-[#b9d88b1b] text-[#b9d88b] font-bold">01</span><div><p className="eyebrow">Identidad de tu negocio</p><h2 className="mt-1 text-2xl font-bold tracking-[-.04em]">Tu perfil de proveedor</h2><p className="mt-1 text-sm text-[#a9b7a6]">Estos datos construirán tu vitrina pública.</p></div></div>
      <div className="grid md:grid-cols-2 gap-5">
        <label className="block text-sm font-semibold">Nombre comercial *<input name="name" value={values.name} onChange={event => update("name", event.target.value)} onBlur={() => mark("name")} maxLength={90} placeholder="Ej. Andes Maquinarias" {...fieldState("name")} className="field mt-2"/>{issue("name")}</label>
        <label className="block text-sm font-semibold">WhatsApp de contacto *<input name="whatsapp" value={values.whatsapp} onChange={event => update("whatsapp", event.target.value)} onBlur={() => mark("whatsapp")} type="tel" inputMode="tel" placeholder="+56 9 1234 5678" {...fieldState("whatsapp")} className="field mt-2"/>{issue("whatsapp")}<span className="mt-1.5 block text-xs font-normal text-[#94a391]">Solo visible para usuarios con sesión iniciada.</span></label>
        <label className="block text-sm font-semibold">Comuna base *<select name="comuna" value={values.comuna} onChange={event => update("comuna", event.target.value)} onBlur={() => mark("comuna")} {...fieldState("comuna")} className="field mt-2"><option value="">Selecciona tu comuna</option>{communes.map(item => <option key={item} value={item}>{item}</option>)}</select>{issue("comuna")}</label>
        <label className="block text-sm font-semibold md:col-span-2">Cuéntales sobre tu negocio *<textarea name="description" value={values.description} onChange={event => update("description", event.target.value)} onBlur={() => mark("description")} maxLength={600} rows={4} placeholder="Qué haces, dónde trabajas y qué pueden esperar tus clientes." {...fieldState("description")} className="field mt-2 resize-y"/>{issue("description")}</label>
      </div>
    </section>
    <section className="rounded-[26px] premium-panel p-5 md:p-8"><div className="flex items-start gap-4 mb-7"><span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl bg-[#b9d88b1b] text-[#b9d88b] font-bold">02</span><div><p className="eyebrow">Tu catálogo</p><h2 className="mt-1 text-2xl font-bold tracking-[-.04em]">{provider ? "Añade una publicación" : "Tu primera publicación"}</h2><p className="mt-1 text-sm text-[#a9b7a6]">Puede ser una máquina o un servicio relacionado.</p></div></div>
      <div className="grid md:grid-cols-2 gap-5">
        <label className="block text-sm font-semibold">Equipo o servicio *<input name="title" value={values.title} onChange={event => update("title", event.target.value)} onBlur={() => mark("title")} maxLength={100} placeholder="Ej. Miniexcavadora 3 toneladas" {...fieldState("title")} className="field mt-2"/>{issue("title")}</label>
        <label className="block text-sm font-semibold">Categoría *<select name="category" value={values.category} onChange={event => update("category", event.target.value)} onBlur={() => mark("category")} {...fieldState("category")} className="field mt-2"><option value="">Selecciona una categoría</option>{categories.map(item => <option key={item} value={item}>{item}</option>)}</select>{issue("category")}</label>
        <label className="block text-sm font-semibold md:col-span-2">Descripción del equipo *<textarea name="details" value={values.details} onChange={event => update("details", event.target.value)} onBlur={() => mark("details")} maxLength={800} rows={4} placeholder="Capacidad, modelo, condiciones de arriendo, zonas de trabajo..." {...fieldState("details")} className="field mt-2 resize-y"/>{issue("details")}</label>
        <label className="block text-sm font-semibold">¿Incluye operador?<select name="operator" value={values.operator} onChange={event => update("operator", event.target.value)} className="field mt-2"><option value="no">No / a consultar</option><option value="yes">Sí, a consultar</option></select></label>
        <label className="block text-sm font-semibold">¿Ofreces traslado?<select name="delivery" value={values.delivery} onChange={event => update("delivery", event.target.value)} className="field mt-2"><option value="no">No / a consultar</option><option value="yes">Sí, a consultar</option></select></label>
        <div className="md:col-span-2 rounded-2xl border border-dashed border-[#687a65] bg-[#243027] p-5 text-sm"><label className="inline-flex cursor-pointer items-center gap-2 font-semibold text-[#dce9d8]"><ImagePlus size={19} className="text-[#b9d88b]"/> Añadir fotos * <span className="font-normal text-[#a5b3a2]">(1 a 4)</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} className="sr-only"/></label><p className="mt-2 text-xs text-[#96a594]">JPG, PNG o WebP; máximo 5 MB por foto. La primera es la portada.</p>
          {processingPhotos ? <p role="status" className="mt-3 text-xs text-[#cce2c3]">Preparando fotos…</p> : null}
          {photos.length ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{photos.map((photo, index) => <div key={photo.id} className="rounded-xl border border-[#52634e] bg-[#18221a] p-2"><img src={photo.dataUrl} alt={"Foto " + (index + 1)} className="h-24 w-full rounded-lg object-cover"/><p className="mt-2 truncate text-xs text-[#d2dfca]">{index === 0 ? "Portada" : "Foto " + (index + 1)}</p><div className="mt-2 flex gap-1"><button type="button" aria-label={"Mover foto " + (index + 1) + " antes"} disabled={index === 0} onClick={() => movePhoto(index, -1)} className="rounded-md border border-[#667964] p-1 disabled:opacity-35"><ArrowUp size={14}/></button><button type="button" aria-label={"Mover foto " + (index + 1) + " después"} disabled={index === photos.length - 1} onClick={() => movePhoto(index, 1)} className="rounded-md border border-[#667964] p-1 disabled:opacity-35"><ArrowDown size={14}/></button><button type="button" aria-label={"Quitar foto " + (index + 1)} onClick={() => { setPhotos(current => current.filter(item => item.id !== photo.id)); setSaveState("saving"); }} className="ml-auto rounded-md border border-[#667964] p-1"><Trash2 size={14}/></button></div></div>)}</div> : null}
          {photoError || touched.images && !photos.length ? <p role="alert" className="mt-3 text-xs text-[#f1b4a4]">{photoError || "Añade al menos una foto."}</p> : null}
        </div>
      </div>
    </section>
    {error ? <p role="alert" className="rounded-xl border border-[#c98474] bg-[#5a302c] p-4 text-sm text-[#ffe0d7]">{error}</p> : null}
    <div className="flex flex-wrap items-center gap-4"><button disabled={busy || processingPhotos} type="submit" className="action-primary min-w-[230px] !px-7 !py-3.5 disabled:opacity-60">{busy ? "Publicando…" : "Publicar y ver mi vitrina"} <ArrowRight size={18}/></button><span role="status" className="text-xs text-[#a9bba5]">{saveState === "saving" ? "Guardando borrador…" : saveState === "saved" ? "Borrador guardado en este navegador" : saveState === "error" ? "No pudimos guardar el borrador local" : ""}</span></div>
    <p className="text-xs text-[#94a391]">Al publicar, tú atiendes las consultas y acuerdas condiciones directamente con cada cliente.</p>
  </div>
  <aside className="lg:sticky lg:top-24 rounded-[26px] overflow-hidden premium-panel"><div className="px-6 pt-6 flex items-center justify-between"><p className="eyebrow">Vista previa en vivo</p><Camera size={17} className="text-[#b9d88b]"/></div><div className="mx-6 mt-5 relative h-43 overflow-hidden rounded-2xl bg-[#303b30]"><img src={photos[0]?.dataUrl || "/hero-maquinaria.webp"} alt="Vista previa de tu publicación" className="w-full h-full object-cover"/><div className="absolute inset-0 photo-wash"/><span className="absolute left-3 top-3 rounded-full bg-[#16201bdf] px-2.5 py-1 text-[10px] font-bold tracking-widest">VISTA PREVIA</span></div><div className="p-6"><h3 className="text-xl font-bold tracking-[-.04em]">{values.name || "Nombre de tu negocio"}</h3><p className="mt-2 flex items-center gap-1 text-xs text-[#a7b4a4]"><MapPin size={14}/>{values.comuna || "Tu comuna"}, Santiago</p><div className="mt-5 pt-5 border-t border-[#455247]"><p className="text-[11px] font-bold text-[#b9d88b]">{values.category || "CATEGORÍA"}</p><p className="mt-2 font-bold">{values.title || "Tu maquinaria o servicio"}</p><p className="mt-2 text-xs leading-relaxed text-[#a4b1a1] line-clamp-3">{values.details || "Aquí se verá la descripción de tu equipo y sus características."}</p></div><div className="mt-5 rounded-xl bg-[#2b352d] px-4 py-3 text-xs text-[#b6c5b0] flex gap-2"><LockKeyhole size={16} className="shrink-0 text-[#b9d88b]"/> El contacto estará disponible para clientes que ingresen.</div><div className="mt-5 flex items-start gap-2 text-xs text-[#98a696]"><Info size={16} className="shrink-0"/> La vista final incluye tu perfil y todas las fichas que publiques.</div></div></aside></form>;
}
