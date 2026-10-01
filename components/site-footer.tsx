import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/brand";
export function SiteFooter() {
  return (
    <footer className="border-t border-[#343f37] bg-[#111615]">
      <div className="container-shell py-11">
        <div className="flex flex-col md:flex-row md:justify-between gap-7">
          <div>
            <Brand />
            <p className="mt-4 text-sm max-w-sm text-[#97a397] leading-relaxed">
              Maquinaria, servicios y personas para mover tus proyectos en Santiago.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-9 gap-y-4 text-sm text-[#c0c8bd]">
            <Link href="/maquinaria" className="hover:text-[#b9d88b]">
              Explorar
            </Link>
            <Link href="/como-funciona" className="hover:text-[#b9d88b]">
              Cómo funciona
            </Link>
            <Link href="/crear-vitrina" className="hover:text-[#b9d88b]">
              Crear mi vitrina
            </Link>
            <Link href="/publicar" className="hover:text-[#b9d88b]">
              Publicar <ArrowUpRight size={14} className="inline" />
            </Link>
          </div>
        </div>
        <div className="mt-10 pt-5 border-t border-[#343f37] flex flex-col sm:flex-row sm:justify-between gap-3 text-xs text-[#879488]">
          <span>© {new Date().getFullYear()} Maqvia</span>
          <span>El contacto, arriendo y pago se acuerdan directamente entre usuarios.</span>
        </div>
      </div>
    </footer>
  );
}
