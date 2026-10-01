import type { SavedPhoto } from "./publication-draft-repository";

export type Photo = SavedPhoto & { id: string; file?: File };

export async function preparePhoto(file: File): Promise<Photo> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Usa imágenes JPG, PNG o WebP.");
  if (!file.size || file.size > 5_000_000) throw new Error("Cada foto debe pesar menos de 5 MB.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("No pudimos abrir una foto. Prueba con otro archivo.");
  }
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 1100 / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("No pudimos procesar la foto.");
  }
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let blob: Blob | null = null;
  for (const quality of [0.76, 0.62, 0.48, 0.36]) {
    blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size < 190_000) break;
  }
  if (!blob || blob.size > 250_000)
    throw new Error("Una foto es demasiado grande. Prueba con otra imagen.");
  const output = new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No pudimos leer una foto."));
    reader.readAsDataURL(output);
  });
  return { id: crypto.randomUUID(), name: output.name, dataUrl, file: output };
}

export async function restorePhoto(saved: SavedPhoto): Promise<Photo> {
  if (saved.sourceUrl) return { ...saved, id: crypto.randomUUID() };
  if (!saved.dataUrl.startsWith("data:image/jpeg;base64,"))
    throw new Error("No pudimos recuperar una foto del borrador.");
  const response = await fetch(saved.dataUrl);
  if (!response.ok) throw new Error("No pudimos recuperar una foto del borrador.");
  const blob = await response.blob();
  if (blob.type !== "image/jpeg" || !blob.size || blob.size > 5_000_000)
    throw new Error("Una foto guardada ya no es válida.");
  return {
    ...saved,
    id: crypto.randomUUID(),
    file: new File([blob], saved.name, { type: "image/jpeg" }),
  };
}
