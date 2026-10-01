import { wizardSteps } from "@/lib/publish-constants";

export function WizardProgress({ step, editId }: { step: number; editId?: string }) {
  return (
    <div className="rounded-2xl border border-[#46584a] bg-[#1a231e] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">{editId ? "Editar publicación" : "Publicación guiada"}</p>
        <p className="text-xs font-bold text-[#d4e7c2]">
          {step + 1} / {wizardSteps.length}
        </p>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#354337]">
        <div
          className="h-full rounded-full bg-[#b9d88b] transition-all"
          style={{ width: `${((step + 1) / wizardSteps.length) * 100}%` }}
        />
      </div>
      <ol className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {wizardSteps.map((label, index) => (
          <li
            key={label}
            className={
              "shrink-0 text-xs " + (index === step ? "font-bold text-[#e8f2df]" : "text-[#8d9e8b]")
            }
          >
            {String(index + 1).padStart(2, "0")} {label}
          </li>
        ))}
      </ol>
    </div>
  );
}
