"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EditorialCard, type EditorialSummary } from "@/components/editorial-card";

export function EditorialRail({ articles }: { articles: EditorialSummary[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ previous: false, next: false });
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () =>
      setPosition({
        previous: element.scrollLeft > 2,
        next: element.scrollLeft + element.clientWidth < element.scrollWidth - 2,
      });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [articles.length]);
  function move(direction: number) {
    const element = rail.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <div className="mt-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-xs text-[#a7b4a8]">{articles.length} lecturas · explora a tu ritmo</p>
        <div className="flex gap-2" aria-label="Navegar entre artículos">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={!position.previous}
            aria-label="Ver artículos anteriores"
            aria-controls="home-editorial-rail"
            className="editorial-arrow"
          >
            <ArrowLeft aria-hidden="true" size={19} />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={!position.next}
            aria-label="Ver siguientes artículos"
            aria-controls="home-editorial-rail"
            className="editorial-arrow"
          >
            <ArrowRight aria-hidden="true" size={19} />
          </button>
        </div>
      </div>
      <div
        ref={rail}
        id="home-editorial-rail"
        className="editorial-rail"
        role="region"
        aria-label="Artículos recientes"
        tabIndex={0}
      >
        {articles.map((article) => (
          <div key={article.slug} className="editorial-slide">
            <EditorialCard article={article} />
          </div>
        ))}
      </div>
    </div>
  );
}
