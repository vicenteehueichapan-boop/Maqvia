"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EquipmentActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  async function change(next: "active" | "paused" | "archived") {
    const message =
      next === "archived"
        ? "¿Retirar esta publicación del catálogo? Podrás reactivarla desde tu cuenta."
        : null;
    if (message && !window.confirm(message)) return;
    setBusy(true);
    setError("");
    setSessionExpired(false);
    try {
      const response = await fetch(`/api/equipos/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        if (response.status === 401) setSessionExpired(true);
        throw new Error(
          result.error ||
            (response.status === 401
              ? "Tu sesión terminó. Ingresa nuevamente para gestionar tus publicaciones."
              : "No pudimos cambiar el estado. Intenta nuevamente."),
        );
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "active" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void change("paused")}
          className="action-secondary text-xs"
        >
          Pausar
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => void change("active")}
          className="action-secondary text-xs"
        >
          Reactivar
        </button>
      )}
      {status !== "archived" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void change("archived")}
          className="rounded-full border border-[#7d625c] px-4 py-2 text-xs text-[#f0bfaf] disabled:opacity-50"
        >
          Retirar publicación
        </button>
      ) : null}
      {error ? (
        <p role="alert" className="w-full text-xs text-[#f1b4a4]">
          {error}{" "}
          {sessionExpired ? (
            <a
              href="/ingresar?return_to=%2Fcuenta"
              className="font-semibold underline underline-offset-2"
            >
              Ingresar
            </a>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
