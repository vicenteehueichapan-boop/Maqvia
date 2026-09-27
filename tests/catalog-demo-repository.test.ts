import test from "node:test";
import assert from "node:assert/strict";
import {
  readCatalogLocal,
  saveSearch,
  setPending,
  takePending,
  toggleFavorite,
} from "../lib/catalog-demo-repository.ts";

function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}

test("favoritos alternan sin crear duplicados", () => {
  Object.assign(globalThis, { localStorage: storage(), sessionStorage: storage() });
  const id = "ee6c78f4-ebd4-4d07-b0db-ed299144e4a1";
  assert.equal(toggleFavorite("usuario-demo", id)?.saved, true);
  assert.equal(readCatalogLocal("usuario-demo").favorites.length, 1);
  assert.equal(toggleFavorite("usuario-demo", id)?.saved, false);
  assert.equal(readCatalogLocal("usuario-demo").favorites.length, 0);
});

test("una búsqueda igual se guarda una sola vez", () => {
  Object.assign(globalThis, { localStorage: storage(), sessionStorage: storage() });
  const search = { q: " excavadora ", comuna: " Maipú " };
  assert.equal(saveSearch("usuario-demo", search), "saved");
  assert.equal(saveSearch("usuario-demo", search), "exists");
  assert.deepEqual(readCatalogLocal("usuario-demo").searches, [
    { q: "excavadora", comuna: "Maipú" },
  ]);
});

test("la intención pendiente se consume una vez tras iniciar sesión", () => {
  Object.assign(globalThis, { localStorage: storage(), sessionStorage: storage() });
  setPending({ kind: "favorite", id: "ee6c78f4-ebd4-4d07-b0db-ed299144e4a1" });
  assert.equal(takePending("search"), null);
  assert.equal(takePending("favorite")?.kind, "favorite");
  assert.equal(takePending("favorite"), null);
});
