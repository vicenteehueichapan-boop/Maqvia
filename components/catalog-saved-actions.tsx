"use client";

import { useEffect, useState } from "react";
import { Bookmark, X } from "lucide-react";
import { readCatalogLocal, removeSearch, saveSearch, setPending, takePending, type SavedSearch } from "@/lib/catalog-demo-repository";

export function CatalogSavedActions({ userId, q, comuna, signInUrl }: { userId: string | null; q: string; comuna: string; signInUrl: string }) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!userId) return;
    const timer = window.setTimeout(() => {
      const pending = takePending("search");
      if (pending?.kind === "search") {
        const result = saveSearch(userId, pending.search);
        setMessage(result === "saved" ? "Búsqueda guardada en este navegador." : result === "exists" ? "Ya guardaste esta búsqueda." : "No pudimos guardar la búsqueda.");
      }
      setSearches(readCatalogLocal(userId).searches);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [userId]);
  const current = { q, comuna };
  function add() {
    if (!userId) return;
    if (!q && !comuna) { setMessage("Escribe un equipo o selecciona una comuna para guardar esta búsqueda."); return; }
    const result = saveSearch(userId, current);
    setMessage(result === "saved" ? "Búsqueda guardada en este navegador." : result === "exists" ? "Ya guardaste esta búsqueda." : "No pudimos guardar la búsqueda.");
    setSearches(readCatalogLocal(userId).searches);
  }
  function remove(search: SavedSearch) {
    if (!userId) return;
    const updated = removeSearch(userId, search);
    if (updated) { setSearches(updated); setMessage("Búsqueda eliminada."); }
    else setMessage("No pudimos quitar esta búsqueda.");
  }
  return <div className="container-shell mt-8 rounded-2xl border border-[#435344] bg-[#1c251f] p-5 md:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">Para volver fácilmente</p><h2 className="mt-2 text-lg font-bold">Tus búsquedas en este navegador</h2><p className="mt-2 text-xs text-[#a7b8a3]">Esta función es una demostración local. No se sincroniza entre dispositivos.</p></div>{userId ? <button type="button" onClick={add} className="action-secondary text-xs"><Bookmark size={15}/> Guardar búsqueda</button> : <a href={signInUrl} target="_top" onClick={() => { if (q || comuna) setPending({ kind: "search", search: current }); }} className="action-secondary text-xs"><Bookmark size={15}/> Ingresa para guardar</a>}</div>
    {userId ? <div className="mt-5 flex flex-wrap gap-2">{searches.length ? searches.map((search, index) => <span key={search.q + ":" + search.comuna + ":" + index} className="inline-flex items-center rounded-full border border-[#60735d] bg-[#263328] text-xs"><a href={"/buscar?q=" + encodeURIComponent(search.q) + "&comuna=" + encodeURIComponent(search.comuna)} className="px-3 py-2 hover:text-[#d5eaba]">{search.q || "Todos los equipos"}{search.comuna ? " · " + search.comuna : ""}</a><button type="button" onClick={() => remove(search)} aria-label={"Quitar búsqueda " + (search.q || search.comuna)} className="border-l border-[#60735d] px-2 py-2"><X size={14}/></button></span>) : <p className="text-xs text-[#a7b8a3]">Aún no guardas búsquedas.</p>}</div> : null}
    {message ? <p role="status" className="mt-3 text-xs text-[#d4e3cb]">{message}</p> : null}
  </div>;
}
