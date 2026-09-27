export function imageUrls(raw: string): string[] {
  try {
    const keys: unknown = JSON.parse(raw);
    return Array.isArray(keys)
      ? keys
          .filter((key): key is string => typeof key === "string")
          .map((key) => "/api/imagenes/" + encodeURIComponent(key))
      : [];
  } catch {
    return [];
  }
}
