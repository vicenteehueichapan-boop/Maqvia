import test from "node:test";
import assert from "node:assert/strict";
import {
  claimAnonymousPublicationDraft,
  clearPublicationDraft,
  readPublicationDraft,
  readPublicationPhotos,
  writePublicationDraft,
  writePublicationPhotos,
} from "../lib/publication-draft-repository.ts";
import type { PublicationValues } from "../lib/publication-validation.ts";

function withSessionStorage(run: (values: Map<string, string>) => void) {
  const values = new Map<string, string>();
  const previous = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  });
  try {
    run(values);
  } finally {
    if (previous) Object.defineProperty(globalThis, "sessionStorage", previous);
    else Reflect.deleteProperty(globalThis, "sessionStorage");
  }
}

const example: PublicationValues = {
  name: "Andes Maquinarias",
  whatsapp: "+56 9 1234 5678",
  contactEmail: "",
  emailContactEnabled: "no",
  comuna: "Maipú",
  description: "Maquinaria compacta para obras urbanas.",
  title: "Miniexcavadora",
  category: "Movimiento de tierra",
  details: "Equipo para zanjas y espacios limitados.",
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

test("la vista previa anónima pasa a la primera cuenta y deja de estar disponible a otra", () => {
  withSessionStorage(() => {
    const photo = { name: "equipo.jpg", dataUrl: "data:image/jpeg;base64,AAAA" };
    assert.equal(writePublicationDraft(example), true);
    assert.equal(writePublicationPhotos([photo]), true);
    assert.equal(claimAnonymousPublicationDraft("usuario-A"), true);
    assert.equal(readPublicationDraft("usuario-A")?.title, "Miniexcavadora");
    assert.deepEqual(readPublicationPhotos("usuario-A"), [photo]);
    assert.equal(readPublicationDraft(), null);
    assert.deepEqual(readPublicationPhotos(), []);
    assert.equal(readPublicationDraft("usuario-B"), null);
    assert.deepEqual(readPublicationPhotos("usuario-B"), []);
  });
});

test("los borradores nuevos y de edición se aíslan por cuenta y equipo", () => {
  withSessionStorage(() => {
    writePublicationDraft(example, "usuario-A");
    writePublicationDraft({ ...example, title: "Retroexcavadora" }, "usuario-B");
    writePublicationDraft({ ...example, title: "Edición" }, "usuario-A", "equipo-1");
    assert.equal(readPublicationDraft("usuario-A")?.title, "Miniexcavadora");
    assert.equal(readPublicationDraft("usuario-B")?.title, "Retroexcavadora");
    assert.equal(readPublicationDraft("usuario-A", "equipo-1")?.title, "Edición");
    assert.equal(readPublicationDraft("usuario-B", "equipo-1"), null);
    clearPublicationDraft("usuario-A");
    assert.equal(readPublicationDraft("usuario-A"), null);
    assert.equal(readPublicationDraft("usuario-A", "equipo-1")?.title, "Edición");
  });
});

test("no mezcla fotos anónimas con un borrador propio anterior", () => {
  withSessionStorage(() => {
    writePublicationDraft({ ...example, title: "Borrador propio" }, "usuario-A");
    writePublicationDraft(example);
    writePublicationPhotos([{ name: "anon.jpg", dataUrl: "data:image/jpeg;base64,AAAA" }]);
    assert.equal(claimAnonymousPublicationDraft("usuario-A"), true);
    assert.equal(readPublicationDraft("usuario-A")?.title, "Borrador propio");
    assert.deepEqual(readPublicationPhotos("usuario-A"), []);
    assert.equal(readPublicationDraft(), null);
    assert.deepEqual(readPublicationPhotos(), []);
  });
});

test("migra un borrador de edición anterior solo al dueño que abre ese equipo", () => {
  withSessionStorage((values) => {
    values.set("maquinal_publication_draft_v2:equipo-1", JSON.stringify(example));
    assert.equal(readPublicationDraft("usuario-A", "equipo-1")?.title, "Miniexcavadora");
    assert.equal(values.has("maquinal_publication_draft_v2:equipo-1"), false);
    assert.equal(readPublicationDraft("usuario-B", "equipo-1"), null);
  });
});
