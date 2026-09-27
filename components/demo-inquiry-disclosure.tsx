"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { InquiryForm } from "@/components/inquiry-form";

export function DemoInquiryDisclosure({
  subject,
  draftKey,
}: {
  subject: string;
  draftKey: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="action-primary w-full text-sm"
      >
        <MessageCircle size={18} />
        {open ? "Ocultar consulta" : "Consultar por esta máquina"}
      </button>
      {open && (
        <div className="mt-5 rounded-2xl border border-[#455748] bg-[#1b2520] p-5">
          <p className="mb-4 text-xs text-[#b4c5ae]">
            Simulación: no se abrirá ningún contacto externo.
          </p>
          <InquiryForm subject={subject} draftKey={draftKey} demo />
        </div>
      )}
    </div>
  );
}
