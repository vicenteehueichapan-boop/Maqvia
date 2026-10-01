import { z } from "zod";

export const inquirySchema = z.object({
  date: z.string().refine((value) => {
    if (!value) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Ingresa una fecha válida."),
  comuna: z.string().trim().max(80, "La comuna debe tener menos de 80 caracteres."),
  operator: z.enum(["", "yes", "no"]),
  delivery: z.enum(["", "yes", "no"]),
  comment: z.string().trim().max(500, "El comentario debe tener menos de 500 caracteres."),
});

export type Inquiry = z.infer<typeof inquirySchema>;

export function normalizeChileanWhatsApp(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  const international = digits.startsWith("56")
    ? digits
    : digits.startsWith("9")
      ? `56${digits}`
      : "";
  return /^569\d{8}$/.test(international) ? international : null;
}

export function buildInquiryMessage(
  subject: string,
  values: Inquiry,
  kind: "item" | "provider" = "item",
): string {
  const greeting =
    kind === "provider"
      ? "Hola, encontré tu vitrina en Maqvia."
      : `Hola, vi tu publicación “${subject.trim()}” en Maqvia.`;
  const lines = [greeting, "", "Quisiera consultar:"];
  if (values.comuna.trim()) lines.push(`• Comuna: ${values.comuna.trim()}`);
  if (values.date) {
    const [year, month, day] = values.date.split("-");
    lines.push(`• Fecha aproximada: ${day}/${month}/${year}`);
  }
  if (values.operator) lines.push(`• Operador: ${values.operator === "yes" ? "Sí" : "No"}`);
  if (values.delivery) lines.push(`• Traslado: ${values.delivery === "yes" ? "Sí" : "No"}`);
  if (values.comment.trim()) lines.push("", "Consulta:", values.comment.trim());
  if (lines.at(-1) === "Quisiera consultar:") lines.splice(-1);
  return lines.join("\n").trim();
}

export function buildWhatsAppUrl(phone: string, message: string): string | null {
  const normalized = normalizeChileanWhatsApp(phone);
  return normalized ? `https://wa.me/${normalized}?text=${encodeURIComponent(message)}` : null;
}
