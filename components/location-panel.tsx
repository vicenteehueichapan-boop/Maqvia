"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import type { ListingView } from "@/lib/listing-view";

const demoLatitude = -33.46428;
const demoLongitude = -70.6603;
const demoMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${demoLongitude - 0.006}%2C${demoLatitude - 0.004}%2C${demoLongitude + 0.006}%2C${demoLatitude + 0.004}&layer=mapnik&marker=${demoLatitude}%2C${demoLongitude}`;

export function LocationPanel({ listing }: { listing: ListingView }) {
  const [opened, setOpened] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (state !== "loading") return;
    const timer = window.setTimeout(() => setState("error"), 12000);
    return () => window.clearTimeout(timer);
  }, [state]);

  if (listing.location === "none") return null;

  return (
    <section
      className="mt-7 overflow-hidden rounded-2xl border border-[#465548] bg-[radial-gradient(circle_at_60%_55%,#394f48,#25342f_65%,#1c2926)] p-5"
      aria-label="Ubicación de la publicación"
    >
      <p className="eyebrow">
        {listing.location === "approx" ? "Ubicación aproximada" : "Ubicación exacta de ejemplo"}
      </p>
      <div className="mt-3 flex min-h-28 items-center gap-4 rounded-xl border border-[#ffffff19] bg-[#14221d4d] px-5">
        <MapPin size={25} className="shrink-0 text-[#b9d88b]" />
        <p className="text-sm text-[#d8e4d3]">
          {listing.sector || listing.comuna}
          <br />
          <span className="text-xs text-[#a9b8a6]">
            {listing.location === "approx"
              ? "Sector referencial; solicita la ubicación al proveedor."
              : "Punto público ficticio para visualizar cómo se mostraría un mapa autorizado."}
          </span>
        </p>
      </div>
      {listing.location === "exact-demo" && (
        <div className="mt-4">
          {!opened && (
            <button
              type="button"
              onClick={() => {
                setOpened(true);
                setState("loading");
              }}
              className="action-secondary text-xs"
            >
              Ver mapa de ejemplo ↗
            </button>
          )}
          {opened && (
            <>
              {state === "loading" && (
                <p role="status" className="mb-3 text-xs text-[#c9d9c2]">
                  Cargando mapa…
                </p>
              )}
              {state === "error" ? (
                <div
                  role="alert"
                  className="rounded-xl border border-[#725d4f] bg-[#2e2924] p-4 text-sm text-[#f0d4bd]"
                >
                  No pudimos cargar el mapa. La publicación sigue disponible.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-[#677968]">
                  <iframe
                    title="Mapa de ubicación ficticia en Parque O’Higgins"
                    src={demoMapUrl}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    onLoad={() => setState("ready")}
                    onError={() => setState("error")}
                    className="h-64 w-full border-0 md:h-80"
                  />
                </div>
              )}
              <p className="mt-2 text-[11px] text-[#adbdad]">
                Mapa © OpenStreetMap contributors · ubicación de demostración
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
