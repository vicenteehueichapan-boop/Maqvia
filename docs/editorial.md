# Espacio editorial de Maqvia

## Recorrido implementado

- Inicio: hasta seis entradas publicadas recientes, tres visibles en escritorio, dos en tablet y una con indicio de la siguiente en móvil. Flechas y desplazamiento táctil/manual; no hay reproducción automática ni cambio del texto mientras se lee. Cuando todos los artículos caben, las flechas quedan deshabilitadas.
- Ver todas: `/novedades`, archivo de las entradas publicadas. Las antiguas se conservan.
- Leer artículo: `/novedades/[slug]`, título, categoría, autor, fecha, imagen ilustrativa, contenido completo, fuentes cuando existen, siguiente paso relacionado y otras lecturas.
- Un slug inexistente, borrador o de fecha futura responde como no encontrado. No se exige sesión para leer.

La primera entrega contiene dos guías propias y una explicación del producto. No contiene noticias del sector inventadas ni anuncios de usuarios simulados.

## Archivos

- `lib/editorial.ts`: esquema Zod y catálogo; consulta de publicados, orden determinista y búsqueda por slug.
- `lib/editorial-format.ts`: formato de fechas sin trasladar catálogo, cuerpos ni validación al cliente.
- `components/home-editorial.tsx`: selección en servidor de hasta seis resúmenes.
- `components/editorial-rail.tsx`: navegación manual adaptable y respetuosa de movimiento reducido.
- `components/editorial-card.tsx`: tarjeta compartida por inicio, archivo y relacionados.
- `app/novedades/`: archivo y lectura, metadatos y estado no encontrado.
- `tests/editorial.test.ts`: borradores, fechas futuras/imposibles, orden, fuentes y destinos.

## Actualización semanal

La automatización `novedades-semanales-de-maqvia` está activa los lunes a las 10:00 con la zona local de la aplicación y continúa este chat. Su prompt apunta al Git del subdirectorio `maquinaria-site`, no al de la carpeta padre. La configuración vive en Codex, no dentro del sitio: clonar el repositorio no instala esa automatización.

Cada ejecución busca y abre fuentes primarias, evita duplicados y puede añadir una o dos entradas relevantes. Actualiza el catálogo, sin reescribir el diseño ni borrar artículos anteriores. Una noticia necesita texto original, fecha real y fuentes directas HTTPS. La validación de URL no demuestra que una fuente sea fiable: la revisión factual sigue siendo necesaria. Si no hay noticias útiles, conserva el contenido o mejora una guía sin cambiarle la fecha para simular actualidad. Datos no comprobados permanecen como borrador.

Comprobaciones: formato, TypeScript, pruebas y compilación; revisión del inicio, archivo y artículo en navegador cuando sea posible. Usar las fechas de eventos y publicaciones para distinguir novedades reales de información antigua. No copiar fotografías sin permiso, inventar demanda ni anunciar mejoras no implementadas.

Todavía no hay alojamiento ni despliegue público configurados: los resultados quedan como cambios locales revisables. No hace merges ni despliegues automáticos. La primera ejecución programada aún no se ha realizado; las rutas y los datos iniciales sí se han probado manualmente. Equipo y aplicación deben estar activos para trabajar sobre archivos locales. Si las herramientas, permisos o la red fallan, debe reportarse el bloqueo y no afirmar que la web cambió.

## Antes de automatizar la publicación pública

Definir entorno de alojamiento y proceso de despliegue; cerrar autenticación pública; habilitar validaciones en CI, revisión editorial, registro de cambios y reversión. Una actualización editorial fallida debe conservar la última versión publicada. Las promociones futuras deben etiquetarse como patrocinadas y distinguirse de noticias y guías.
