import test from "node:test";
import assert from "node:assert/strict";
import { restorePhoto } from "../lib/image-processing.ts";

test("rechaza fotos dañadas del borrador antes de convertirlas en archivos", async () => {
  await assert.rejects(
    restorePhoto({ name: "equipo.jpg", dataUrl: "data:text/html;base64,PGgxPg==" }),
    /recuperar una foto/,
  );
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response("not found", { status: 404 });
    await assert.rejects(
      restorePhoto({ name: "equipo.jpg", dataUrl: "data:image/jpeg;base64,AAAA" }),
      /recuperar una foto/,
    );
    globalThis.fetch = async () =>
      new Response("no es una foto", { headers: { "content-type": "text/plain" } });
    await assert.rejects(
      restorePhoto({ name: "equipo.jpg", dataUrl: "data:image/jpeg;base64,AAAA" }),
      /ya no es válida/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
