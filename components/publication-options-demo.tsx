"use client";

import { useEffect, useState } from "react";
import { Check, MapPin, SlidersHorizontal } from "lucide-react";
import { locationSchema, priceSchema, serviceSchema } from "@/lib/publication-validation";
import { readOptionsDemoDraft, writeOptionsDemoDraft, type OptionsDemoDraft } from "@/lib/options-demo-repository";

const initial: OptionsDemoDraft = { mode: "automatic", priceKind: "consult", amount: "", unit: "", operator: false, operatorKind: "included", operatorAmount: "", operatorUnit: "", comuna: "", sector: "" };
const units = [{ value: "hour", label: "Hora" }, { value: "day", label: "Día" }, { value: "week", label: "Semana" }, { value: "month", label: "Mes" }];
const pesos = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

function priceInput(kind: "consult" | "fixed" | "from", amount: string, unit: string) {
  return kind === "consult" ? { kind } : { kind, amount: amount.trim() ? Number(amount) : 0, unit };
}
function priceLabel(kind: string, amount: string, unit: string) {
  if (kind === "consult") return "Precio a consultar";
  if (kind === "included") return "Incluido";
  const unitLabel = units.find(item => item.value === unit)?.label.toLowerCase();
  if (!amount.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !unitLabel) return "Completa monto y unidad";
  return (kind === "from" ? "Desde " : "") + pesos.format(Number(amount)) + " / " + unitLabel;
}

export function PublicationOptionsDemo() {
  const [value, setValue] = useState<OptionsDemoDraft>(initial);
  const [ready, setReady] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const priceResult = priceSchema.safeParse(priceInput(value.priceKind, value.amount, value.unit));
  const operatorResult = serviceSchema.safeParse({ enabled: value.operator, price: value.operator ? value.operatorKind === "included" ? { kind: "included" } : priceInput(value.operatorKind, value.operatorAmount, value.operatorUnit) : undefined });
  const locationResult = locationSchema.safeParse({ comuna: value.comuna, sector: value.sector, latitude: null, longitude: null, showExact: false });
  const priceError = !priceResult.success ? priceResult.error.issues[0]?.message : "";
  const operatorError = !operatorResult.success ? operatorResult.error.issues[0]?.message : "";
  const locationError = !locationResult.success ? locationResult.error.issues[0]?.message : "";

  useEffect(() => {
    const timer = window.setTimeout(() => { const saved = readOptionsDemoDraft(); if (saved) setValue(saved); setReady(true); }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => { if (!writeOptionsDemoDraft(value)) setSaveError(true); }, 800);
    return () => window.clearTimeout(timer);
  }, [ready, value]);
  function update(change: Partial<OptionsDemoDraft>) { setValue(current => ({ ...current, ...change })); setSaveError(false); }
  function review() { setAttempted(true); }
  const valid = priceResult.success && operatorResult.success && locationResult.success;

  return <section className="border-t border-[#ffffff17] bg-[#171e1a]"><div className="container-shell py-20 md:py-24">
    <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><p className="eyebrow">Opciones de ejemplo</p><h2 className="display mt-4 text-[clamp(2.6rem,4.5vw,4.8rem)]">Una ficha clara, sin datos de más.</h2></div><p className="muted-copy max-w-lg text-sm md:ml-auto md:text-base">Prueba cómo se ordenan precio, operador y zona en una ficha. Este configurador es una demostración local: estos datos todavía no se añaden a una publicación real.</p></div>
    <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_.9fr]"><div className="premium-panel rounded-[26px] p-6 md:p-8"><div className="flex flex-wrap gap-2" role="group" aria-label="Modo de configuración"><button type="button" aria-pressed={value.mode === "automatic"} onClick={() => update({ mode: "automatic" })} className={value.mode === "automatic" ? "action-primary text-xs" : "action-secondary text-xs"}>Organizado por Maquinal</button><button type="button" aria-pressed={value.mode === "manual"} onClick={() => update({ mode: "manual" })} className={value.mode === "manual" ? "action-primary text-xs" : "action-secondary text-xs"}><SlidersHorizontal size={15}/> Personalizar</button></div><p className="mt-4 text-xs text-[#adbdac]">Puedes cambiar de modo sin perder lo que escribiste.</p>
      {value.mode === "manual" ? <div className="mt-8 space-y-7">
        <div><h3 className="font-bold">Precio de arriendo</h3><div className="mt-3 grid gap-3 sm:grid-cols-3"><label className="text-xs">Cómo se muestra<select value={value.priceKind} onChange={event => update({ priceKind: event.target.value as OptionsDemoDraft["priceKind"] })} className="field mt-2"><option value="consult">Consultar</option><option value="fixed">Precio fijo</option><option value="from">Desde</option></select></label>{value.priceKind !== "consult" ? <><label className="text-xs">Monto en CLP<input type="number" min="1" value={value.amount} onChange={event => update({ amount: event.target.value })} onBlur={review} aria-invalid={Boolean(attempted && priceError)} aria-describedby={attempted && priceError ? "demo-price-error" : undefined} className="field mt-2" placeholder="95000"/></label><label className="text-xs">Unidad<select value={value.unit} onChange={event => update({ unit: event.target.value as OptionsDemoDraft["unit"] })} onBlur={review} aria-invalid={Boolean(attempted && priceError)} aria-describedby={attempted && priceError ? "demo-price-error" : undefined} className="field mt-2"><option value="">Selecciona</option>{units.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></> : null}</div>{attempted && priceError ? <p id="demo-price-error" role="alert" className="mt-2 text-xs text-[#f1b4a4]">{priceError}</p> : null}</div>
        <div className="border-t border-[#4b5b4d] pt-6"><label className="inline-flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={value.operator} onChange={event => update({ operator: event.target.checked, operatorKind: event.target.checked ? value.operatorKind : "included", operatorAmount: event.target.checked ? value.operatorAmount : "", operatorUnit: event.target.checked ? value.operatorUnit : "" })} className="h-4 w-4 accent-[#b9d88b]"/> Servicio de operador</label>{value.operator ? <div className="mt-4 grid gap-3 sm:grid-cols-3"><label className="text-xs">Condición<select value={value.operatorKind} onChange={event => update({ operatorKind: event.target.value as OptionsDemoDraft["operatorKind"] })} className="field mt-2"><option value="included">Incluido</option><option value="consult">Consultar</option><option value="fixed">Precio fijo</option><option value="from">Desde</option></select></label>{["fixed", "from"].includes(value.operatorKind) ? <><label className="text-xs">Monto en CLP<input type="number" min="1" value={value.operatorAmount} onChange={event => update({ operatorAmount: event.target.value })} onBlur={review} aria-invalid={Boolean(attempted && operatorError)} aria-describedby={attempted && operatorError ? "demo-operator-error" : undefined} className="field mt-2"/></label><label className="text-xs">Unidad<select value={value.operatorUnit} onChange={event => update({ operatorUnit: event.target.value as OptionsDemoDraft["operatorUnit"] })} onBlur={review} aria-invalid={Boolean(attempted && operatorError)} aria-describedby={attempted && operatorError ? "demo-operator-error" : undefined} className="field mt-2"><option value="">Selecciona</option>{units.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></> : null}</div> : null}{attempted && operatorError ? <p id="demo-operator-error" role="alert" className="mt-2 text-xs text-[#f1b4a4]">{operatorError}</p> : null}</div>
        <div className="border-t border-[#4b5b4d] pt-6"><h3 className="font-bold">Zona de trabajo <span className="text-xs font-normal text-[#a8b8a7]">(opcional)</span></h3><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs">Comuna<select value={value.comuna} onChange={event => update({ comuna: event.target.value })} onBlur={review} aria-invalid={Boolean(attempted && locationError)} aria-describedby={attempted && locationError ? "demo-location-error" : undefined} className="field mt-2"><option value="">Sin indicar</option>{["Santiago", "Maipú", "Pudahuel", "Quilicura", "Las Condes", "Puente Alto", "San Bernardo"].map(item => <option key={item} value={item}>{item}</option>)}</select></label><label className="text-xs">Sector<input value={value.sector} onChange={event => update({ sector: event.target.value })} onBlur={review} maxLength={80} aria-invalid={Boolean(attempted && locationError)} aria-describedby={attempted && locationError ? "demo-location-error" : undefined} className="field mt-2" placeholder="Opcional"/></label></div>{attempted && locationError ? <p id="demo-location-error" role="alert" className="mt-2 text-xs text-[#f1b4a4]">{locationError}</p> : null}<p className="mt-2 text-xs text-[#a8b8a7]">La ubicación exacta no se muestra en esta demostración.</p></div>
      </div> : <p className="mt-8 rounded-2xl border border-[#53654e] bg-[#263227] p-5 text-sm text-[#c7d7c0]">Maquinal ordena la información disponible en la vista previa. Abre “Personalizar” para ajustar precio, servicio y sector.</p>}
    </div><div className="premium-panel rounded-[26px] p-6 md:p-8"><p className="eyebrow">Vista previa · datos locales</p><h3 className="mt-4 text-2xl font-bold tracking-[-.04em]">Así se organizarían estos detalles.</h3><div className="mt-8 space-y-4 border-t border-[#4b5b4d] pt-6"><p className="text-sm"><span className="block text-xs text-[#a8b8a7]">Arriendo</span><strong className="mt-1 block text-lg">{priceLabel(value.priceKind, value.amount, value.unit)}</strong></p>{value.operator ? <p className="text-sm"><span className="block text-xs text-[#a8b8a7]">Operador</span><strong className="mt-1 block">{priceLabel(value.operatorKind, value.operatorAmount, value.operatorUnit)}</strong></p> : null}{value.comuna ? <p className="flex items-center gap-2 text-sm"><MapPin size={17} className="text-[#b9d88b]"/>{value.sector ? value.sector + ", " : ""}{value.comuna}</p> : null}</div><button type="button" onClick={review} className="action-primary mt-8 text-sm">Revisar opciones <Check size={17}/></button>{attempted && valid ? <p role="status" className="mt-3 text-xs text-[#cce2c3]">Las opciones de ejemplo están completas.</p> : null}{saveError ? <p role="status" className="mt-3 text-xs text-[#f1b4a4]">No pudimos conservar esta demostración en el navegador.</p> : null}<p className="mt-6 border-t border-[#4b5b4d] pt-5 text-xs text-[#a8b8a7]">Esto no cambia ni guarda una publicación real. El formulario actual de publicación solicita únicamente los datos que Maquinal ya puede mostrar.</p></div></div>
  </div></section>;
}
