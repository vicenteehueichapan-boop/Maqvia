"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, UserRound, X } from "lucide-react";
import { Brand } from "@/components/brand";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

type HeaderProps = { authenticated: boolean; signInHref: string };
const navigation = [
  { label: "Explorar maquinaria", href: "/buscar", match: "/buscar" },
  { label: "Cómo funciona", href: "/como-funciona", match: "/como-funciona" },
  { label: "Crear mi vitrina", href: "/crear-vitrina", match: "/crear-vitrina" },
] as const;

export function SiteHeaderClient({ authenticated, signInHref }: HeaderProps) {
  const pathname = usePathname();
  const home = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 18);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
    };
  }, [pathname]);

  const isActive = (match: string) => pathname === match || pathname.startsWith(`${match}/`);
  const accountHref = authenticated ? "/cuenta" : signInHref;

  return <header className="site-header" data-home={home} data-scrolled={scrolled}>
    <div className="container-shell flex h-[74px] items-center justify-between gap-4">
      <Brand compact />
      <nav aria-label="Navegación principal" className="hidden lg:flex items-center gap-8">
        {navigation.map(item => <a key={item.href} href={item.href} className="header-link" aria-current={isActive(item.match) ? "page" : undefined}>{item.label}</a>)}
      </nav>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:ml-0">
        {authenticated ? <a href={accountHref} aria-current={pathname === "/cuenta" ? "page" : undefined} className="action-ghost header-auth-action text-sm"><UserRound size={17} /> Mi cuenta</a> : <a href={accountHref} target="_top" className="action-ghost header-auth-action text-sm"><UserRound size={17} /> Ingresar</a>}
        <a href="/publicar" aria-current={pathname === "/publicar" ? "page" : undefined} className="action-primary min-h-10! px-4! py-2! text-sm">Publicar <ArrowUpRight size={16} /></a>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild><button type="button" className="grid size-11 place-items-center rounded-xl border border-[#ffffff32] text-[#eef0e8] lg:hidden" aria-label="Abrir menú" aria-expanded={menuOpen}><Menu size={20} /></button></SheetTrigger>
          <SheetContent side="right" showCloseButton={false} className="w-[min(92vw,380px)]! max-w-none! border-l border-[#465249] bg-[#19211e] p-6 shadow-[-24px_0_80px_#0009]">
            <div className="flex items-center justify-between border-b border-[#ffffff16] pb-6"><SheetTitle className="text-lg tracking-[-.04em]">Menú</SheetTitle><SheetClose asChild><button type="button" aria-label="Cerrar menú" className="grid size-11 place-items-center rounded-xl border border-[#ffffff32]"><X size={20}/></button></SheetClose></div>
            <nav aria-label="Navegación móvil" className="mt-3 flex flex-col">
              {navigation.map(item => <SheetClose asChild key={item.href}><a href={item.href} className="header-mobile-link" aria-current={isActive(item.match) ? "page" : undefined}>{item.label}<ArrowUpRight size={17}/></a></SheetClose>)}
              <SheetClose asChild><a href="/publicar" className="header-mobile-link" aria-current={pathname === "/publicar" ? "page" : undefined}>Publicar maquinaria<ArrowUpRight size={17}/></a></SheetClose>
            </nav>
            <div className="mt-auto border-t border-[#ffffff16] pt-6">
              {authenticated ? <SheetClose asChild><a href="/cuenta" className="action-secondary w-full text-sm"><UserRound size={17}/> Mi cuenta</a></SheetClose> : <a href={accountHref} target="_top" className="action-secondary w-full text-sm"><UserRound size={17}/> Ingresar o registrarme</a>}
              <p className="mt-5 text-xs leading-relaxed text-[#aeb9ad]">Encuentra maquinaria o crea tu vitrina con una sola cuenta.</p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>;
}
