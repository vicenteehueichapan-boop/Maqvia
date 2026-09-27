export type SavedSearch = { q: string; comuna: string; category?: string };
type CatalogLocal = { favorites: string[]; searches: SavedSearch[] };
type Pending = { kind: "favorite"; id: string } | { kind: "search"; search: SavedSearch };
const key = (userId: string) => "maquinal_catalog_demo_v1:" + userId;
const pendingKey = "maquinal_catalog_pending_v1";

export function readCatalogLocal(userId: string): CatalogLocal {
  try {
    const raw = localStorage.getItem(key(userId));
    const value: unknown = raw ? JSON.parse(raw) : null;
    if (!value || typeof value !== "object") return { favorites: [], searches: [] };
    const item = value as Record<string, unknown>;
    const favorites = Array.isArray(item.favorites)
      ? item.favorites
          .filter((id): id is string => typeof id === "string" && /^[a-f0-9-]{36}$/.test(id))
          .slice(0, 100)
      : [];
    const searches = Array.isArray(item.searches)
      ? item.searches
          .filter(
            (search): search is SavedSearch =>
              search &&
              typeof search.q === "string" &&
              search.q.length <= 100 &&
              typeof search.comuna === "string" &&
              search.comuna.length <= 80 &&
              (search.category === undefined ||
                (typeof search.category === "string" && search.category.length <= 80)),
          )
          .slice(0, 30)
      : [];
    return {
      favorites: [...new Set(favorites)],
      searches: searches.filter(
        (search, index) =>
          searches.findIndex(
            (other) =>
              other.q === search.q &&
              other.comuna === search.comuna &&
              (other.category || "") === (search.category || ""),
          ) === index,
      ),
    };
  } catch (error) {
    console.warn("No pudimos leer tus guardados locales.", error);
    return { favorites: [], searches: [] };
  }
}

function write(userId: string, data: CatalogLocal): boolean {
  try {
    localStorage.setItem(key(userId), JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn("No pudimos guardar esta acción localmente.", error);
    return false;
  }
}

export function toggleFavorite(
  userId: string,
  id: string,
): { saved: boolean; favorites: string[] } | null {
  const data = readCatalogLocal(userId);
  const saved = !data.favorites.includes(id);
  const favorites = saved
    ? [...data.favorites, id]
    : data.favorites.filter((value) => value !== id);
  return write(userId, { ...data, favorites }) ? { saved, favorites } : null;
}

export function saveSearch(userId: string, search: SavedSearch): "saved" | "exists" | "error" {
  const data = readCatalogLocal(userId);
  const category = (search.category || "").trim();
  const normalized = {
    q: search.q.trim(),
    comuna: search.comuna.trim(),
    ...(category ? { category } : {}),
  };
  if (
    data.searches.some(
      (item) =>
        item.q === normalized.q &&
        item.comuna === normalized.comuna &&
        (item.category || "") === category,
    )
  )
    return "exists";
  return write(userId, { ...data, searches: [...data.searches, normalized] }) ? "saved" : "error";
}

export function removeSearch(userId: string, search: SavedSearch): SavedSearch[] | null {
  const data = readCatalogLocal(userId);
  const searches = data.searches.filter(
    (item) =>
      item.q !== search.q ||
      item.comuna !== search.comuna ||
      (item.category || "") !== (search.category || ""),
  );
  return write(userId, { ...data, searches }) ? searches : null;
}

export function setPending(action: Pending): void {
  try {
    sessionStorage.setItem(pendingKey, JSON.stringify(action));
  } catch (error) {
    console.warn("No pudimos conservar la acción pendiente.", error);
  }
}
export function takePending(kind: Pending["kind"]): Pending | null {
  try {
    const raw = sessionStorage.getItem(pendingKey);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || (value as Pending).kind !== kind) return null;
    sessionStorage.removeItem(pendingKey);
    return value as Pending;
  } catch (error) {
    console.warn("No pudimos recuperar la acción pendiente.", error);
    return null;
  }
}
