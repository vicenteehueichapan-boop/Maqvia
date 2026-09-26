import Link from "next/link";
import { ArrowUpRight, LogIn } from "lucide-react";
import { getChatGPTUser, chatGPTSignInPath } from "@/app/chatgpt-auth";
export async function SiteHeader(){
  const user=await getChatGPTUser();
  return <header className="sticky top-0 z-50 border-b border-[#ffffff14] bg-[#0b1113]/95 backdrop-blur-xl"><div className="mx-auto max-w-7xl px-5 h-[72px] flex items-center justify-between gap-4">
    <Link href="/" className="flex items-center gap-2.5 font-black tracking-[-.07em] text-[21px] text-[#edf2ed]"><span className="grid place-items-center w-9 h-9 bg-[#c9f276] text-[#0b1714] rounded-[10px] tracking-[-.14em] pr-1 text-2xl">M</span>MAQUINAL<span className="text-[#c9f276]">.</span></Link>
    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#a5b6af]"><Link className="hover:text-[#e8eeea]" href="/buscar">Explorar</Link><Link className="hover:text-[#e8eeea]" href="/#como-funciona">Cómo funciona</Link><Link className="hover:text-[#e8eeea]" href="/publicar">Publicar</Link></nav>
    <div className="flex items-center gap-2"><Link href={user?"/cuenta":chatGPTSignInPath("/cuenta")} className="inline-flex items-center gap-2 rounded-xl px-2 sm:px-4 h-10 text-sm font-bold text-[#d4dfd7] hover:bg-[#ffffff10]"><LogIn size={17}/><span className="hidden sm:inline">{user?"Mi cuenta":"Ingresar"}</span></Link><Link href="/publicar" className="inline-flex items-center gap-2 rounded-xl bg-[#c9f276] hover:bg-[#defe9e] px-4 h-10 text-sm font-extrabold text-[#102019]">Publicar <ArrowUpRight size={17}/></Link></div>
  </div></header>
}

