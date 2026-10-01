"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  LayoutList,
  LogOut,
  Menu,
  Plus,
  UserRound,
  Warehouse,
  X,
} from "lucide-react";
import { Brand } from "@/components/brand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type HeaderProps = { authenticated: boolean; signInHref: string };

const navigation = [
  { label: "Inicio", href: "/", match: "/" },
  { label: "Explorar maquinaria", href: "/maquinaria", match: "/maquinaria" },
  { label: "Cómo funciona", href: "/como-funciona", match: "/como-funciona" },
  { label: "Quiénes somos", href: "/quienes-somos", match: "/quienes-somos" },
  { label: "Crear mi vitrina", href: "/crear-vitrina", match: "/crear-vitrina" },
] as const;

export function SiteHeaderClient({ authenticated, signInHref }: HeaderProps) {
  const pathname = usePathname();
  const home = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  const isActive = (match: string) => {
    if (match === "/") return pathname === "/";
    return (
      pathname === match ||
      pathname.startsWith(`${match}/`) ||
      (match === "/maquinaria" &&
        (pathname.startsWith("/equipos/") ||
          pathname.startsWith("/proveedores/") ||
          pathname.startsWith("/demo/"))) ||
      (match === "/crear-vitrina" && pathname === "/publicar")
    );
  };

  return (
    <header className="site-header" data-home={home} data-scrolled={scrolled}>
      <div className="site-header-inner">
        {/* ── Logo ── */}
        <Brand compact />

        {/* ── Desktop navigation ── */}
        <nav aria-label="Navegación principal" className="site-nav">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-nav-link"
              aria-current={isActive(item.match) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop actions ── */}
        <div className="site-actions">
          {authenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="site-user-btn" aria-label="Menú de cuenta">
                  <UserRound size={15} strokeWidth={1.75} />
                  <span>Mi cuenta</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={10} className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/cuenta" className="flex items-center gap-2.5">
                    <UserRound size={14} /> Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/cuenta" className="flex items-center gap-2.5">
                    <Warehouse size={14} /> Mi vitrina
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/cuenta" className="flex items-center gap-2.5">
                    <LayoutList size={14} /> Mis publicaciones
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a
                    href="/salir?return_to=%2F"
                    className="flex items-center gap-2.5 text-[#e38b78]!"
                  >
                    <LogOut size={14} /> Cerrar sesión
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href={signInHref} className="site-sign-in">
              <UserRound size={15} strokeWidth={1.75} />
              <span>Ingresar</span>
            </Link>
          )}

          <Link
            href="/publicar"
            aria-current={pathname === "/publicar" ? "page" : undefined}
            className="action-primary site-publish-btn"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Publicar</span>
          </Link>
        </div>

        {/* ── Mobile: mini CTA + hamburger ── */}
        <div className="site-mobile">
          <Link
            href="/publicar"
            className="action-primary site-publish-mobile"
            aria-label="Publicar maquinaria"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Publicar</span>
          </Link>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="site-burger"
                aria-label="Abrir menú"
                aria-expanded={menuOpen}
              >
                <Menu size={20} />
              </button>
            </SheetTrigger>

            <SheetContent side="right" showCloseButton={false} className="mobile-sheet">
              {/* Sheet top: brand + close */}
              <div className="mobile-sheet-top">
                <SheetTitle className="sr-only">Navegación</SheetTitle>
                <Brand compact />
                <SheetClose asChild>
                  <button type="button" aria-label="Cerrar menú" className="mobile-close-btn">
                    <X size={19} />
                  </button>
                </SheetClose>
              </div>

              {/* Sheet nav links */}
              <nav aria-label="Navegación móvil" className="mobile-nav">
                {navigation.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="mobile-nav-link"
                      aria-current={isActive(item.match) ? "page" : undefined}
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight size={15} />
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link
                    href="/publicar"
                    className="mobile-nav-link"
                    aria-current={pathname === "/publicar" ? "page" : undefined}
                  >
                    <span>Publicar maquinaria</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </SheetClose>
              </nav>

              {/* Sheet footer: session */}
              <div className="mobile-sheet-foot">
                {authenticated ? (
                  <>
                    <SheetClose asChild>
                      <Link
                        href="/cuenta"
                        className="action-secondary w-full justify-center text-sm"
                      >
                        <UserRound size={16} /> Mi cuenta
                      </Link>
                    </SheetClose>
                    <a
                      href="/salir?return_to=%2F"
                      className="action-ghost w-full justify-center text-sm mt-2"
                    >
                      <LogOut size={15} /> Cerrar sesión
                    </a>
                  </>
                ) : (
                  <Link
                    href={signInHref}
                    className="action-secondary w-full justify-center text-sm"
                  >
                    <UserRound size={16} /> Ingresar o registrarme
                  </Link>
                )}
                <p className="mobile-sheet-note">
                  Encuentra maquinaria o crea tu vitrina con una sola cuenta.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
