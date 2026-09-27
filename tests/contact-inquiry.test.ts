import test from "node:test";
import assert from "node:assert/strict";
import { buildInquiryMessage, buildWhatsAppUrl, inquirySchema, normalizeChileanWhatsApp } from "../lib/contact-inquiry.ts";

test("acepta un número móvil chileno y rechaza un destino inválido", () => {
  assert.equal(normalizeChileanWhatsApp("+56 9 1234 5678"), "56912345678");
  assert.equal(normalizeChileanWhatsApp("912345678"), "56912345678");
  assert.equal(normalizeChileanWhatsApp("+56 2 1234 5678"), null);
  assert.equal(buildWhatsAppUrl("número incorrecto", "Hola"), null);
});

test("permite una consulta sin campos opcionales y omite líneas vacías", () => {
  const parsed = inquirySchema.parse({ date: "", comuna: "", operator: "", delivery: "", comment: "" });
  const message = buildInquiryMessage("Miniexcavadora", parsed);
  assert.match(message, /Miniexcavadora/);
  assert.doesNotMatch(message, /Comuna:|Fecha aproximada:|Operador:|Traslado:|Consulta:/);
});

test("solo incluye datos entregados y codifica el mensaje para WhatsApp", () => {
  const parsed = inquirySchema.parse({ date: "2026-10-15", comuna: " Maipú ", operator: "yes", delivery: "no", comment: " Necesito una zanja. " });
  const message = buildInquiryMessage("Miniexcavadora", parsed);
  assert.match(message, /Comuna: Maipú/);
  assert.match(message, /Fecha aproximada: 15\/10\/2026/);
  assert.match(message, /Operador: Sí/);
  assert.match(message, /Traslado: No/);
  assert.match(message, /Necesito una zanja\./);
  const url = buildWhatsAppUrl("+56 9 1234 5678", message);
  assert.ok(url);
  assert.equal(new URL(url).searchParams.get("text"), message);
});

test("rechaza fechas imposibles y comentarios demasiado largos", () => {
  assert.equal(inquirySchema.safeParse({ date: "2026-02-30", comuna: "", operator: "", delivery: "", comment: "" }).success, false);
  assert.equal(inquirySchema.safeParse({ date: "", comuna: "", operator: "", delivery: "", comment: "x".repeat(501) }).success, false);
});

test("la consulta por una vitrina usa un saludo apropiado", () => {
  const values = inquirySchema.parse({ date: "", comuna: "", operator: "", delivery: "", comment: "" });
  const message = buildInquiryMessage("equipos disponibles", values, "provider");
  assert.match(message, /encontré tu vitrina/);
  assert.doesNotMatch(message, /publicación/);
});
