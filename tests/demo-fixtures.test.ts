import assert from "node:assert/strict";
import test from "node:test";
import { demoEquipment, demoProviders } from "../lib/demo-fixtures.ts";

test("los escenarios de ejemplo cubren perfiles, precios e imágenes sin contacto real", () => {
  assert.equal(demoProviders.length, 4);
  assert.ok(demoEquipment.length >= 10);
  assert.ok(
    demoProviders.every(
      (provider) => provider.esEjemplo && provider.email.endsWith(".example.com"),
    ),
  );
  assert.ok(
    demoEquipment.every(
      (item) =>
        item.esEjemplo && demoProviders.some((provider) => provider.slug === item.providerSlug),
    ),
  );
  assert.ok(demoEquipment.some((item) => item.price?.unit === "hora"));
  assert.ok(demoEquipment.some((item) => item.price?.from));
  assert.ok(demoEquipment.some((item) => !item.price));
  assert.ok(demoEquipment.some((item) => item.images.length === 0));
  assert.ok(demoEquipment.some((item) => item.images.length > 2));
  assert.ok(demoEquipment.some((item) => item.location === "exact-demo"));
});
