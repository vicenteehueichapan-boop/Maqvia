"use client";

import { useEffect, useState } from "react";
import { MessageCircleQuestion } from "lucide-react";
import Link from "next/link";

export function FloatingHelp() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Solo mostramos el botón después de scrollear un poco, para no bloquear la primera impresión
    const handleScroll = () => setShow(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 hidden md:block transition-all duration-500 ${
        show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
      }`}
    >
      <Link
        href="/como-funciona"
        className="flex items-center gap-2.5 bg-[#1b2320] border border-[#b9d88b66] text-[#cce8a0] px-4 py-3 rounded-full font-bold shadow-2xl shadow-[#00000088] hover:bg-[#b9d88b] hover:text-[#0f1a0e] hover:scale-105 transition-all"
        aria-label="Ver cómo funciona la página"
      >
        <MessageCircleQuestion size={20} />
        <span className="text-sm tracking-tight">Cómo funciona</span>
      </Link>
    </div>
  );
}
