"use client";

import { RecoverablePageError } from "@/components/recoverable-page-error";

export default function AccountError({ reset }: { error: Error; reset: () => void }) {
  return (
    <RecoverablePageError
      reset={reset}
      section="Mi cuenta"
      title="No pudimos cargar tu cuenta."
      description="Tus publicaciones siguen guardadas. Espera un momento y vuelve a intentarlo."
      backHref="/maquinaria"
      backLabel="Explorar maquinaria"
    />
  );
}
