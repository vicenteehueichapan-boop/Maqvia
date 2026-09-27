"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import {
  readCatalogLocal,
  setPending,
  takePending,
  toggleFavorite,
} from "@/lib/catalog-demo-repository";

export function FavoriteAction({
  id,
  userId,
  signInUrl,
}: {
  id: string;
  userId: string | null;
  signInUrl: string;
}) {
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userId) return;
    const timer = window.setTimeout(() => {
      const pending = takePending("favorite");
      if (
        pending?.kind === "favorite" &&
        pending.id === id &&
        !readCatalogLocal(userId).favorites.includes(id)
      ) {
        const result = toggleFavorite(userId, id);
        setMessage(
          result ? "Publicación guardada en este navegador." : "No pudimos guardar la publicación.",
        );
      }
      setSaved(readCatalogLocal(userId).favorites.includes(id));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [id, userId]);

  if (!userId)
    return (
      <a
        href={signInUrl}
        target="_top"
        onClick={() => setPending({ kind: "favorite", id })}
        className="action-secondary mt-3 w-full text-sm"
      >
        <Heart size={17} /> Ingresa para guardar
      </a>
    );

  return (
    <div className="mt-3">
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => {
          const result = toggleFavorite(userId, id);
          if (!result) {
            setMessage("No pudimos guardar la publicación.");
            return;
          }
          setSaved(result.saved);
          setMessage(
            result.saved
              ? "Publicación guardada en este navegador."
              : "Publicación eliminada de favoritos.",
          );
        }}
        className="action-secondary w-full text-sm"
      >
        <Heart size={17} fill={saved ? "currentColor" : "none"} />
        {saved ? "Guardado" : "Guardar publicación"}
      </button>
      {message && (
        <p role="status" className="mt-2 text-xs text-[#c9d9bf]">
          {message}
        </p>
      )}
    </div>
  );
}
