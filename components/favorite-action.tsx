"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";

type FavoriteToggleProps = {
  saved: boolean;
  busy?: boolean;
  onClick: () => void;
  compact?: boolean;
};

export function FavoriteToggle({
  saved,
  busy = false,
  onClick,
  compact = false,
}: FavoriteToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? "Quitar de guardados" : "Guardar maquinaria"}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#647761] px-3 py-2 text-xs font-bold text-[#d5e4cc] transition-colors hover:border-[#b9d88b] hover:bg-[#b9d88b1a] disabled:opacity-55"
    >
      <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
      {!compact && (saved ? "Guardado" : "Guardar")}
    </button>
  );
}

export function FavoriteAction({
  equipmentId,
  authenticated,
  signInHref,
}: {
  equipmentId: string;
  authenticated: boolean;
  signInHref: string;
}) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    fetch("/api/favoritos", { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("No pudimos cargar tus guardados.");
        return (await response.json()) as { ids: string[] };
      })
      .then(({ ids }) => {
        if (active) setSaved(ids.includes(equipmentId));
      })
      .catch(() => {
        if (active) setError("No pudimos consultar tus guardados.");
      });
    return () => {
      active = false;
    };
  }, [authenticated, equipmentId]);

  if (!authenticated) {
    return (
      <Link
        href={signInHref}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#647761] px-3 py-2 text-xs font-bold text-[#d5e4cc] hover:border-[#b9d88b]"
      >
        <Bookmark size={16} /> Ingresa para guardar
      </Link>
    );
  }

  async function toggle() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/favoritos", {
        method: saved ? "DELETE" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipmentId }),
      });
      if (!response.ok) throw new Error("No pudimos actualizar tus guardados.");
      setSaved(!saved);
    } catch {
      setError("No pudimos actualizar tus guardados. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <FavoriteToggle saved={saved} busy={busy} onClick={() => void toggle()} />
      {error && (
        <p role="alert" className="mt-2 text-xs text-[#edb6a6]">
          {error}
        </p>
      )}
    </div>
  );
}
