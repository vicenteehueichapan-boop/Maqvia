"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, GitCompareArrows, X } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { FavoriteToggle } from "@/components/favorite-action";
import type { ListingView } from "@/lib/listing-view";

const compareLimit = 3;

export function CatalogGrid({
  listings,
  userId,
  signInUrl,
}: {
  listings: ListingView[];
  userId?: string | null;
  signInUrl?: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoriteBusy, setFavoriteBusy] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState("");

  useEffect(() => {
    if (!userId) return;
    let active = true;
    fetch("/api/favoritos", { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("No pudimos cargar tus guardados.");
        return (await response.json()) as { ids: string[] };
      })
      .then(({ ids }) => {
        if (active) setFavorites(new Set(ids));
      })
      .catch(() => {
        if (active) setFavoriteError("No pudimos cargar tus guardados.");
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const picks = listings.filter((listing) => selected.includes(listing.id));

  function select(id: string) {
    setSelected((current) => {
      if (current.includes(id)) {
        setMessage("");
        return current.filter((value) => value !== id);
      }
      if (current.length >= compareLimit) {
        setMessage(`Puedes comparar hasta ${compareLimit} publicaciones.`);
        return current;
      }
      setMessage("");
      return [...current, id];
    });
  }

  async function toggleFavorite(id: string) {
    const saved = favorites.has(id);
    setFavoriteBusy(id);
    setFavoriteError("");
    try {
      const response = await fetch("/api/favoritos", {
        method: saved ? "DELETE" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipmentId: id }),
      });
      if (!response.ok) throw new Error("No pudimos actualizar tus guardados.");
      setFavorites((current) => {
        const next = new Set(current);
        if (saved) next.delete(id);
        else next.add(id);
        return next;
      });
    } catch {
      setFavoriteError("No pudimos actualizar tus guardados. Inténtalo de nuevo.");
    } finally {
      setFavoriteBusy(null);
    }
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-pressed={selected.includes(listing.id)}
                  onClick={() => select(listing.id)}
                  className={
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold " +
                    (selected.includes(listing.id)
                      ? "border-[#b9d88b] bg-[#b9d88b] text-[#172016]"
                      : "border-[#5a6959] text-[#c6d2c1] hover:border-[#b9d88b]")
                  }
                >
                  <GitCompareArrows size={15} />
                  {selected.includes(listing.id) ? "Seleccionado" : "Comparar"}
                </button>
                {userId ? (
                  <FavoriteToggle
                    saved={favorites.has(listing.id)}
                    busy={favoriteBusy === listing.id}
                    onClick={() => void toggleFavorite(listing.id)}
                    compact
                  />
                ) : (
                  <Link
                    href={signInUrl || "/ingresar?return_to=%2Fmaquinaria"}
                    aria-label="Ingresa para guardar maquinaria"
                    title="Ingresa para guardar"
                    className="inline-flex min-h-10 items-center rounded-xl border border-[#647761] px-3 py-2 text-[#d5e4cc] hover:border-[#b9d88b]"
                  >
                    <Bookmark size={16} />
                  </Link>
                )}
                {listing.href && (
                  <Link
                    href={listing.href}
                    className="ml-auto text-xs font-bold text-[#d4e5c5] hover:text-white"
                  >
                    Ver ficha ↗
                  </Link>
                )}
              </div>
            }
          />
        ))}
      </div>
      {message && (
        <p role="status" className="mt-4 text-sm text-[#d4e3cb]">
          {message}
        </p>
      )}
      {favoriteError && (
        <p role="alert" className="mt-4 text-sm text-[#edb6a6]">
          {favoriteError}
        </p>
      )}
      {picks.length > 0 && (
        <div className="sticky bottom-4 z-30 mt-7 rounded-2xl border border-[#7c9470] bg-[#253128]/96 p-4 shadow-[0_15px_50px_#0008] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-sm font-bold">
              <GitCompareArrows size={18} className="text-[#b9d88b]" />
              {picks.length} de {compareLimit} publicaciones para comparar
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelected([]);
                  setComparisonOpen(false);
                }}
                aria-label="Limpiar comparación"
                className="rounded-xl border border-[#5b6b5a] px-3 py-2"
              >
                <X size={17} />
              </button>
              <button
                type="button"
                onClick={() => setComparisonOpen((value) => !value)}
                aria-expanded={comparisonOpen}
                className="action-primary !py-2.5 text-sm"
              >
                {comparisonOpen ? "Ocultar comparación" : "Comparar ahora"}
              </button>
            </div>
          </div>
          {comparisonOpen && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr>
                    <th className="p-3 text-[#a9b9a6]">Característica</th>
                    {picks.map((listing) => (
                      <th key={listing.id} className="p-3">
                        {listing.href ? (
                          <Link href={listing.href} className="hover:text-[#cde5b2]">
                            {listing.title} ↗
                          </Link>
                        ) : (
                          listing.title
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ["Categoría", (item: ListingView) => item.category],
                      ["Comuna", (item: ListingView) => item.comuna],
                      ["Precio", (item: ListingView) => item.priceLabel || "Consultar precio"],
                      ["Servicios", (item: ListingView) => item.services.join(", ") || "Sin datos"],
                      ["Proveedor", (item: ListingView) => item.providerName],
                    ] as const
                  ).map(([label, value]) => (
                    <tr key={label} className="border-t border-[#ffffff1a]">
                      <th scope="row" className="p-3 font-medium text-[#a8b9a7]">
                        {label}
                      </th>
                      {picks.map((listing) => (
                        <td key={listing.id} className="p-3">
                          {value(listing)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
