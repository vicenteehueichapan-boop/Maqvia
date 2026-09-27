import { env } from "cloudflare:workers";
export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(key))
    return new Response("Imagen no encontrada", { status: 404 });
  const obj = await env.BUCKET?.get(key);
  if (!obj) return new Response("Imagen no encontrada", { status: 404 });
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || "image/jpeg",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
