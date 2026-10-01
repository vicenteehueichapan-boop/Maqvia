"use client";

import Link from "next/link";

export function RecoverablePageError({
  reset,
  section,
  title,
  description,
  backHref,
  backLabel,
}: {
  reset: () => void;
  section: string;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-[#101313] px-5 py-20 text-[#eae9e2]">
      <div className="max-w-xl rounded-[26px] border border-[#5c6b5d] bg-[#1b2320] p-8 md:p-12">
        <p className="eyebrow">{section}</p>
        <h1 className="mt-4 text-3xl font-bold tracking-[-.05em]">{title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#b4c3b1]">{description}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="action-primary text-sm">
            Intentar de nuevo
          </button>
          <Link href={backHref} className="action-secondary text-sm">
            {backLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
