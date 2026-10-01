import test from "node:test";
import assert from "node:assert/strict";
import { publicationSchema } from "../lib/publication-validation.ts";
import {
  equipmentFields,
  invalidPublicationImage,
  providerFields,
  publicationUploads,
  readPublicationForm,
} from "../lib/server/publication-payload.ts";

function validForm() {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    name: "Andes Maquinarias",
    whatsapp: "+56 9 1234 5678",
    contactEmail: "CONTACTO@EMPRESA.CL",
    emailContactEnabled: "yes",
    comuna: "Maipú",
    description: "Arriendo de maquinaria para obras en Santiago.",
    title: "Miniexcavadora de tres toneladas",
    category: "Movimiento de tierra",
    details: "Equipo compacto para zanjas y obras en espacios limitados.",
    operator: "yes",
    delivery: "no",
    priceKind: "fixed",
    priceAmount: "95000",
    priceUnit: "day",
    services: "Implemento adicional, combustible",
    serviceOffers: '[{"name":"Operador","kind":"included"}]',
    sector: "Sector industrial",
    locationPrecision: "approx",
    presentationVariant: "visual",
  }))
    form.set(key, value);
  return form;
}

test("crear y editar interpretan el mismo formulario y guardan el mismo formato", () => {
  const parsed = publicationSchema.parse(readPublicationForm(validForm()));
  assert.deepEqual(providerFields(parsed, "56912345678", "2026-09-30"), {
    name: "Andes Maquinarias",
    description: "Arriendo de maquinaria para obras en Santiago.",
    comuna: "Maipú",
    whatsapp: "56912345678",
    contactEmail: "contacto@empresa.cl",
    updatedAt: "2026-09-30",
  });
  const item = equipmentFields(parsed, ["photo.webp"]);
  assert.equal(item.priceAmount, 95000);
  assert.deepEqual(JSON.parse(item.images), ["photo.webp"]);
  assert.deepEqual(JSON.parse(item.services), [
    "Implemento adicional",
    "combustible",
    { name: "Operador", kind: "included" },
  ]);
  assert.equal(item.presentationVariant, "visual");
});

test("el correo opcional no se publica cuando está desactivado", () => {
  const form = validForm();
  form.set("emailContactEnabled", "no");
  const parsed = publicationSchema.parse(readPublicationForm(form));
  assert.equal(providerFields(parsed, "56912345678", "2026-09-30").contactEmail, "");
});

test("las fotos se validan igual al crear y editar", () => {
  const form = validForm();
  form.append("images", new File(["imagen"], "maquina.webp", { type: "image/webp" }));
  assert.equal(publicationUploads(form).length, 1);
  assert.equal(invalidPublicationImage(publicationUploads(form)), false);
  assert.equal(
    invalidPublicationImage([new File(["x"], "archivo.svg", { type: "image/svg+xml" })]),
    true,
  );
});
