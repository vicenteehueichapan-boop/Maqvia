import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";
import { getChatGPTUser, platformSignInPath, safeRelativeReturnPath } from "@/app/chatgpt-auth";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ingresar | Maqvia" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  const { return_to: requested } = await searchParams;
  const returnTo = safeRelativeReturnPath(requested || "/cuenta");
  const user = await getChatGPTUser();

  return (
    <main className="min-h-screen">
      <div className="container-shell grid min-h-[720px] items-center gap-12 py-16 lg:grid-cols-[1fr_.8fr]">
        <div className="max-w-2xl">
          <p className="eyebrow">Una cuenta · todas las posibilidades</p>
          <h1 className="display mt-5 text-[clamp(3.2rem,6vw,6rem)]">
            Entra y lleva tu proyecto <span className="text-[#c9e3ad]">más lejos.</span>
          </h1>
          <p className="muted-copy mt-6 max-w-lg text-lg">
            Explora maquinaria libremente. Al ingresar podrás contactar proveedores y publicar tus
            propios equipos.
          </p>
          <div className="mt-9 grid gap-4 border-t border-[#ffffff24] pt-7 text-sm text-[#c8d6c2] sm:grid-cols-2">
            <p className="flex items-start gap-3">
              <LockKeyhole size={18} className="shrink-0 text-[#b9d88b]" /> Los contactos se
              muestran solo a personas con sesión iniciada.
            </p>
            <p className="flex items-start gap-3">
              <UserRound size={18} className="shrink-0 text-[#b9d88b]" /> La misma cuenta sirve para
              buscar y para publicar.
            </p>
          </div>
        </div>
        <div className="premium-panel rounded-[28px] p-7 md:p-10">
          <p className="eyebrow">Tu acceso</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-.05em]">
            {user ? "Ya tienes una sesión activa" : "Iniciar sesión o crear cuenta"}
          </h2>
          <p className="muted-copy mt-4 text-sm">
            {user
              ? `Estás usando ${user.email}. Continúa donde quedaste.`
              : "Continúa con tu cuenta para contactar y publicar. Si aún no tienes una, podrás crearla durante el acceso."}
          </p>
          {user ? (
            <Link href={returnTo} className="action-primary mt-8 w-full text-sm">
              Continuar <ArrowRight size={17} />
            </Link>
          ) : (
            <a
              href={platformSignInPath(returnTo)}
              target="_top"
              className="action-primary mt-8 w-full text-sm"
            >
              Ingresar o crear cuenta <ArrowRight size={17} />
            </a>
          )}
          <p className="mt-5 text-xs leading-relaxed text-[#9ead9d]">
            El arriendo y el pago se acuerdan directamente con el proveedor.
          </p>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
