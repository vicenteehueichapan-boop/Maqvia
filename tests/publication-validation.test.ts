import test from "node:test";
import assert from "node:assert/strict";
import { locationSchema, priceSchema, publicationSchema, serviceSchema } from "../lib/publication-validation.ts";

test("precio a consultar no exige monto", () => {
  assert.equal(priceSchema.safeParse({ kind: "consult" }).success, true);
});

test("precio fijo exige monto positivo y unidad", () => {
  assert.equal(priceSchema.safeParse({ kind: "fixed", amount: 0, unit: "day" }).success, false);
  assert.equal(priceSchema.safeParse({ kind: "fixed", amount: 95000 }).success, false);
  const missingUnit = priceSchema.safeParse({ kind: "fixed", amount: 95000, unit: "" });
  assert.equal(missingUnit.success, false);
  if (!missingUnit.success) assert.match(missingUnit.error.issues[0].message, /Selecciona cómo se cobra/);
  assert.equal(priceSchema.safeParse({ kind: "fixed", amount: 95000, unit: "day" }).success, true);
});

test("ubicación exacta exige coordenadas y sector exige comuna", () => {
  assert.equal(locationSchema.safeParse({ comuna: "", sector: "", latitude: null, longitude: null, showExact: false }).success, true);
  assert.equal(locationSchema.safeParse({ comuna: "", sector: "Centro", latitude: null, longitude: null, showExact: false }).success, false);
  assert.equal(locationSchema.safeParse({ comuna: "Maipú", sector: "", latitude: null, longitude: null, showExact: true }).success, false);
});

test("servicio inactivo no exige precio", () => {
  assert.equal(serviceSchema.safeParse({ enabled: false }).success, true);
  assert.equal(serviceSchema.safeParse({ enabled: true }).success, false);
  assert.equal(serviceSchema.safeParse({ enabled: true, price: { kind: "included" } }).success, true);
});

test("publicación valida título y WhatsApp en el mismo esquema del servidor", () => {
  const base = { name: "Andes Maquinarias", whatsapp: "+56 9 1234 5678", comuna: "Maipú", description: "Maquinaria compacta para obras urbanas.", title: "Miniexcavadora 3 toneladas", category: "Movimiento de tierra", details: "Equipo para zanjas y trabajos en espacios limitados.", operator: "no", delivery: "yes" };
  assert.equal(publicationSchema.safeParse(base).success, true);
  assert.equal(publicationSchema.safeParse({ ...base, title: "abc" }).success, false);
  assert.equal(publicationSchema.safeParse({ ...base, whatsapp: "123" }).success, false);
});
