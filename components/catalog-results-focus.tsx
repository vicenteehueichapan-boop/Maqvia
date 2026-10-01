"use client";

import { useEffect } from "react";

/** Keep search results in view after client-side navigation from the homepage or filters. */
export function CatalogResultsFocus({ searchKey }: { searchKey: string }) {
  useEffect(() => {
    if (window.location.hash !== "#resultados") return;
    const frame = requestAnimationFrame(() => {
      const heading = document.getElementById("resultados-titulo");
      heading?.scrollIntoView({ block: "start" });
      heading?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [searchKey]);

  return null;
}
