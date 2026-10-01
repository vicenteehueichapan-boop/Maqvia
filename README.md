# Maqvia

Marketplace de arriendo de maquinaria para Santiago de Chile. El código se abre directamente en Visual Studio Code desde esta carpeta.

## Producto local

- `npm install` instala las dependencias.
- `npm run dev` abre el sitio local en `http://localhost:5173`.
- `npm run format:check`, `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build` comprueban la entrega.
- `/maquinaria` es el catálogo canónico; los filtros viajan en la URL.
- El encabezado se comparte desde `app/layout.tsx`: usa una barra superior compacta con enlaces visibles en escritorio y menú adaptable en pantallas estrechas.
- `/maquinaria/:slug` abre la ficha publicada. El catálogo principal ya no mezcla inventario con fichas ficticias.
- `/crear-vitrina` permite probar el recorrido catálogo → ficha → vitrina antes de iniciar sesión; `/publicar` guía el registro, conserva un borrador local y permite indicar modalidad y monto por servicio opcional. Al ingresar, la vista previa anónima se transfiere a la cuenta que la continúa; los borradores de publicación y edición quedan separados por cuenta y equipo en la misma pestaña. El borrador usa `sessionStorage`: no se comparte entre dispositivos ni sustituye una publicación guardada en D1.
- `/ingresar` concentra el acceso. En localhost, el inicio de sesión de la plataforma usa una identidad de prueba fija (`Seedy`); no crea cuentas distintas. El sitio alojado depende del inicio de sesión de ChatGPT que proporciona la plataforma. `/salir` cierra esa sesión.
- La autenticación alojada solo confía en las cabeceras de identidad cuando `AUTH_TRUSTED_PROXY=sites` **y** se ha comprobado que el borde de Sites elimina las cabeceras enviadas por visitantes e impide acceder directamente al Worker. Esta variable es una afirmación de despliegue, no una firma. Un Worker público independiente necesita un proveedor de identidad real y sesiones verificadas en el servidor; subirlo tal como está no crea cuentas públicas seguras.
- Las publicaciones y sus fotografías se guardan en Cloudflare D1 y R2, respectivamente. Desde Mi cuenta se pueden editar, pausar, reactivar y retirar. Retirar oculta la publicación, pero conserva los datos para recuperarla. Los favoritos se guardan en D1 por usuario.
- El formulario de publicación tiene cinco pasos: negocio, equipo, fotografías, precio y opciones, y vista previa. Los ajustes menos frecuentes se despliegan dentro del paso de precio. Mi cuenta muestra las fichas con fotografías, su estado, fecha y número real de usuarios que las guardaron. Aún no se miden visitas ni contactos.
- El correo de la cuenta se propone como contacto opcional al publicar. El proveedor ingresa su WhatsApp en el formulario; en publicaciones posteriores se recupera el número de su vitrina. Ambos datos se pueden modificar antes de publicar. Los contactos solo se muestran después de ingresar.
- Las consultas reales requieren sesión y llevan a un mensaje revisable para WhatsApp o, cuando el proveedor habilitó correo, a la aplicación de correo. Maqvia no administra el arriendo ni el pago.
- El distintivo de WhatsApp se guarda en `public/whatsapp-mark.svg` a partir del [SVG de Simple Icons](https://github.com/simple-icons/simple-icons/blob/develop/icons/whatsapp.svg); se usa únicamente en acciones y explicaciones de contacto.
- El distintivo de Gmail se guarda en `public/gmail-mark.svg` desde el [recurso de Google Workspace](https://knowledge.workspace.google.com/static/images/icons/product/gmail.svg); solo identifica direcciones `@gmail.com`. Las demás usan un ícono de correo genérico.

Las rutas heredadas `/demo` y `/__demo` permanecen para revisión interna, pero no forman parte de la navegación ni del catálogo principal. Las fotos editoriales son ilustrativas. El borrador de publicación se conserva localmente hasta enviarlo. Antes de un lanzamiento público se requieren moderación, políticas de privacidad y operación, y verificar la disponibilidad legal y del dominio del nombre provisional Maqvia. Las alertas de nuevas coincidencias y la ubicación exacta requieren desarrollo adicional.

El mapa de ubicación exacta solo aparece en un ejemplo ficticio y se carga al solicitarlo; los proveedores reales pueden indicar comuna o sector aproximado. Antes de usar mapas de forma comercial a escala, debe elegirse un servicio con capacidad y condiciones adecuadas. Véase la [política de mosaicos de OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/).

## Base técnica

El proyecto mantiene el stack Vinext, Cloudflare D1 y R2 de la plantilla original. Las migraciones SQL nuevas están en `drizzle/` y deben aplicarse en orden en cada entorno. No se ha publicado esta rama.

---

# vinext-starter

A clean full-stack starter running on [vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`
- Portable: Windows, macOS, or Linux; no Bash required
- Managed Linux: managed Linux runtime with Bash, `flock`, `curl`, `sha256sum`, and GNU `timeout`
- Git is required only for publishing

## Sites Lifecycle

The Sites initializer copies the shared starter and selects managed-linux only when `SITES_MANAGED_LINUX_CONTAINER=1`; otherwise it selects portable. It saves the selection only in ignored `.sites-runtime/execution-profile.json`. Both profiles copy/configure first, then use the plugin's separate `install-dependencies.mjs` step to measure installation independently. Edit source under `app/` and follow the Sites skill for installation, preview, builds, and publishing.

Run `node <plugin-root>/scripts/configure-execution-profile.mjs` only when the profile is unknown for the current checkout and environment. Profile changes do not alter tracked source or require reinstalling otherwise-valid dependencies; restart an existing preview to use the new selection. Do not commit or upload `.sites-runtime/`.

This starter does not use `wrangler.jsonc`.

`install:ci` runs `npm ci` once against the shared lockfile, disables parent-workspace discovery, and includes required dev/optional dependencies despite production/omit settings. Sharp defaults to prebuilt binaries unless explicitly configured otherwise. Do not overlap installers.

- **Portable:** Preserve host HOME, npm cache, registry, proxy, temporary paths, retry/concurrency settings, and lifecycle-script policy. Use `--prefer-offline --no-audit --no-fund`.
- **Managed Linux:** Use the existing project-local HOME/cache/tmp setup and Linux install lock, tarball preflight, and timeout. Restore the image-seeded npm cache only when its lockfile hash matches; retain network fallback. Builds keep their existing timeout. These helpers are not invoked by the portable profile.

`scripts/sites-env.mjs` preserves the caller's HOME, npm cache, proxy, XDG, and temporary-directory configuration while defaulting Wrangler and Miniflare state to the checkout. If npm reports an unwritable cache, select a writable path with `npm_config_cache` for that install. The `dev` and `start` scripts also keep Wrangler logs inside the checkout. Generated `.sites-runtime/` and `.wrangler/` directories are disposable and ignored by Git.

On portable, `npm run dev` uses `vinext dev` with HMR, starting at port 5173. Vinext records the running server in ignored `.vinext/` state, rejects an ordinary duplicate launch, and recovers stale state after a stopped process; exactly simultaneous starts can race. Pass `--port <port>` or `--hostname <host>` after `npm run dev --` when needed; keep portable previews on loopback.

For browser QA on managed Linux, use `sites-preview start`. The project's dev script runs Vite and accepts the supervisor's `--host 0.0.0.0 --port 4173 --strictPort` arguments. The internal browser uses `http://terminal.local:4173/`; it is not a user-facing URL. The supervisor owns the preview lifecycle. The ignored local profile survives the supervisor's cleared process environment.

The portable profile simulates ChatGPT sign-in only for loopback development requests. Visit `/signin-with-chatgpt?return_to=/` to sign in as `local_seedy` (`seedy@sites.test`, display name `Seedy`) and `/signout-with-chatgpt?return_to=/` to sign out. The development cookie preserves that identity across server restarts. Mock auth is disabled in the managed-linux profile and is not included in production builds; hosted authentication remains dispatch-owned.

The Worker uses `vinext/server/fetch-handler`, including Vinext's config-aware image handling. After building, `npm start` runs that Worker locally through Wrangler on `127.0.0.1`, sharing `.wrangler/state` with dev preview and local D1 migrations; it does not deploy the site or simulate sign-in. Use the URL printed by the server. Pass `npm start -- --port <port>` to select a different built-preview port.

Local previews use Miniflare's placeholder `Request.cf` metadata without a network lookup. Set `CLOUDFLARE_CF_FETCH_ENABLED=true` to opt into fetching preview metadata; this setting does not change hosted request metadata.

Local tool usage metrics are disabled by default. Set `WRANGLER_SEND_METRICS=true` to opt in.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` defines provider, equipment, and favorites tables
- `@cloudflare/workers-types` provides Worker types; `cloudflare-env.d.ts` declares optional `DB`/`BUCKET` bindings—update these declarations if binding names change
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

Only behind a verified Sites authentication edge do signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present. Do not treat raw headers from an independently deployed public Worker as proof of identity; set `AUTH_TRUSTED_PROXY=sites` only after verifying that the edge strips visitor-supplied identity headers and blocks direct Worker access.

The user ID is stable for the same user on the same Site and different across Sites. Use it as the durable user key; use email and name for display or contact purposes.

SIWC-authenticated workspace sites may also receive `oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty `name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by `oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use the returned `userId` as the stable user key for user-owned records; do not use email as a durable identifier.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send anonymous visitors through Sign in with ChatGPT.
- In a Server Component, start sign-in with `<a href={chatGPTSignInPath(returnTo)} target="_top">`. The auth helper module is server-only; do not import it into a Client Component.
- Do not use `fetch`, XHR, a client-side router, or a framework link that can prefetch the sign-in route. SIWC must start as a top-level navigation.
- Never request the AuthAPI authorization endpoint directly. The dispatch-owned `/signin-with-chatgpt` route must start the SIWC flow.
- Use `chatGPTSignOutPath(returnTo)` for browser sign-out links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the OAuth cookies, and identity header injection. Do not implement app routes for those reserved paths. Routes that do not import and call the helper remain anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the Sites hosting platform's access policy controls for workspace-wide restrictions, or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write actions tied to the current ChatGPT user. Leave public content anonymous.

## Local D1 migrations

For a D1-backed local preview, generate SQL with `npm run db:generate`. Build once through the Sites skill's build entrypoint (or `npm run build` for standalone use) to generate `dist/server/wrangler.json`, rebuilding if bindings change. From the project root, apply each pending migration in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_example.sql
```

Replace the filename with the pending migration and `DB` with your D1 binding name if different. Use `.wrangler/state`, not `.wrangler/state/v3`; Wrangler adds the versioned directories. Do not replay migrations already applied locally. This updates only the preview database; publishing applies production migrations separately.

## Diagnostic Commands

- `npm run install:ci`: perform the one locked dependency install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build the deployable Sites artifact
- `npm run start`: preview the built Worker locally with D1/R2 support
- `npm run db:generate`: generate Drizzle migrations after schema changes

When using the Sites plugin, follow its skill instructions for installation, builds, and publishing. These npm commands remain available for standalone use.

The portable build runs Vinext directly without a host `timeout` command. The managed-linux build uses `scripts/build-verified.sh` and its existing `SITES_BUILD_TIMEOUT` setting.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
