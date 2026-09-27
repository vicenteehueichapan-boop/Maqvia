import { inquirySchema, type Inquiry } from "./contact-inquiry";

const prefix = "maquinal_inquiry_v1:";

export function readInquiryDraft(key: string): Inquiry | null {
  try {
    const raw = sessionStorage.getItem(prefix + key);
    if (!raw) return null;
    const parsed = inquirySchema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
    sessionStorage.removeItem(prefix + key);
  } catch (error) {
    console.warn("No pudimos recuperar la consulta local.", error);
  }
  return null;
}

export function writeInquiryDraft(key: string, value: Inquiry): boolean {
  try {
    sessionStorage.setItem(prefix + key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn("No pudimos conservar la consulta local.", error);
    return false;
  }
}

export function clearInquiryDraft(key: string): void {
  try {
    sessionStorage.removeItem(prefix + key);
  } catch (error) {
    console.warn("No pudimos borrar la consulta local.", error);
  }
}
