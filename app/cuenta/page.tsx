import Link from "next/link";
import { ArrowUpRight, LogOut, Plus, Search, UserRound } from "lucide-react";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { SiteFooter } from "@/components/site-footer";
import { findProviderByOwner, listProviderEquipment } from "@/lib/marketplace";
export const dynamic = "force-dynamic";
export default async function AccountPage() {
  const user = await requireChatGPTUser("/cuenta");
  const provider = await findProviderByOwner(user.userId);
  const count = provider ? (await listProviderEquipment(provider.id)).length : 0;
  return (
    <main className="min-h-screen">
      <div className="container-shell py-13 md:py-18">
        <p className="eyebrow">Tu espacio en Maquinal</p>
        <h1 className="display mt-4 text-[clamp(3rem,5vw,5rem)]">
          Hola,{" "}
          <span className="serif-accent text-[#bfd6a1]">
            {user.fullName?.split(" ")[0] || "bienvenido"}.
          </span>
        </h1>
        <p className="muted-copy mt-5 max-w-xl">
          Una sola cuenta para encontrar maquinaria y mostrar la tuya. Elige cómo quieres avanzar
          hoy.
        </p>
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <Link
            href="/maquinaria"
            className="group rounded-[26px] premium-panel p-7 md:p-9 surface-hover transition-all"
          >
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[#b9d88b1b] text-[#b9d88b]">
              <Search size={22} />
            </span>
            <p className="eyebrow mt-9">Para tu proyecto</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-[-.04em]">
              Explorar maquinaria
            </h2>
            <p className="muted-copy mt-3 text-sm">
              Busca por zona, compara opciones y contacta al proveedor.
            </p>
            <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#d1e1bf]">
              Ir al catálogo <ArrowUpRight size={17} />
            </span>
          </Link>
          <Link
            href="/publicar"
            className="group rounded-[26px] premium-panel p-7 md:p-9 surface-hover transition-all"
          >
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[#c99b7820] text-[#d0aa88]">
              <Plus size={22} />
            </span>
            <p className="eyebrow mt-9">Para tus equipos</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-[-.04em]">
              {provider ? "Gestionar mi vitrina" : "Crear mi vitrina"}
            </h2>
            <p className="muted-copy mt-3 text-sm">
              {provider
                ? count +
                  " " +
                  (count === 1 ? "publicación activa" : "publicaciones activas") +
                  ". Añade más maquinaria o servicios."
                : "Muestra tus equipos con fotos, datos y una página propia."}
            </p>
            <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#d1e1bf]">
              {provider ? "Añadir publicación" : "Comenzar"} <ArrowUpRight size={17} />
            </span>
          </Link>
        </div>
        {provider ? (
          <div className="mt-5 rounded-2xl border border-[#526350] bg-[#253026] p-5 flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="font-bold">Tu vitrina: {provider.name}</p>
              <p className="mt-1 text-xs text-[#a6b6a3]">
                {count} equipo{count === 1 ? "" : "s"} o servicio{count === 1 ? "" : "s"} publicado
                {count === 1 ? "" : "s"}
              </p>
            </div>
            <Link
              href={"/proveedores/" + provider.slug}
              className="font-bold text-sm text-[#cce0b7]"
            >
              Abrir vitrina ↗
            </Link>
          </div>
        ) : null}
        <div className="mt-11 pt-5 border-t border-[#37453a] flex flex-wrap justify-between gap-4 text-sm text-[#a5b3a1]">
          <span className="inline-flex items-center gap-2">
            <UserRound size={16} />
            {user.email}
          </span>
          <Link
            href={chatGPTSignOutPath("/")}
            className="inline-flex items-center gap-2 hover:text-white"
          >
            <LogOut size={16} /> Cerrar sesión
          </Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
