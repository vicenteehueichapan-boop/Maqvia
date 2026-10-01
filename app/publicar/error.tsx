"use client";

import { RecoverablePageError } from "@/components/recoverable-page-error";

export default function PublishError({ reset }: { error: Error; reset: () => void }) {
  return (
    <RecoverablePageError
      reset={reset}
      section="Publicar"
      title="No pudimos abrir el formulario."
      description="Si ya comenzaste, el borrador de esta pestaña puede recuperarse al reintentar."
      backHref="/cuenta"
      backLabel="Volver a mi cuenta"
    />
  );
}
