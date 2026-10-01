"use client";

import { RecoverablePageError } from "@/components/recoverable-page-error";

export default function PageError({ reset }: { error: Error; reset: () => void }) {
  return (
    <RecoverablePageError
      reset={reset}
      section="Maqvia"
      title="No pudimos cargar esta sección."
      description="Puedes volver a intentarlo o continuar desde el inicio."
      backHref="/"
      backLabel="Ir al inicio"
    />
  );
}
