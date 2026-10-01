# Maqvia: auditoría del inicio y actualización semanal

Fecha: 30 de septiembre de 2026, America/Santiago.

## Alcance y evidencia

Revisión de la versión local actual, encabezado, portada, recorridos buscar/publicar, consejos, editorial, pie y menú móvil. Capturas nuevas en escritorio (1440 × 900) y móvil (390 × 844). Se comprobó el DOM y la carga de las ocho imágenes. El documento no certifica accesibilidad, rendimiento de producción, autenticación ni conversión.

El puerto 5173 mostraba otro producto, Gas El Volcán. Maqvia se inició en 5174 sin interrumpirlo. El navegador integrado falló por el sandbox; se utilizó Playwright. No se modificó el diseño ni se publicó una nueva versión durante esta auditoría.

## Recorrido revisado

| Paso | Estado observado | Mejora propuesta |
| --- | --- | --- |
| 1. Encabezado | Navegación visible en escritorio; móvil tiene Publicar y menú | Hacer más evidente el acceso a la cuenta en móvil si las pruebas con personas muestran dificultad; evitar añadir una barra lateral al inicio sin probarla |
| 2. Portada y buscador | Propósito, equipo y comuna claros; fotografía dominante | Mantener búsqueda como acción principal; acortar altura y espacio inferior en móvil; revisar legibilidad del encabezado sobre cada fotografía |
| 3. Buscar o publicar | Dos caminos diferenciados, visualmente coherentes | Reducir su altura; complementar con tarjetas de equipos reales activos, con fotografía, comuna y precio si existe |
| 4. Antes de elegir | Tres consejos entendibles | Integrarlos en una sección más compacta; parte del mensaje se repite en las guías siguientes |
| 5. Editorial | Tres guías estáticas; no es todavía una sección de noticias | Separar Noticias, Guías y Novedades de Maqvia; fecha y fuente para noticias; destino que cumpla la promesa del enlace |
| 6. Pie | Explica el trato directo y enlaza acciones principales | Antes del lanzamiento agregar identidad del responsable, ayuda, privacidad y términos reales; no inventar respaldos o certificaciones |
| 7. Menú móvil | Apertura comprobada; muestra rutas y “Ingresar o registrarme”; el fondo queda fuera del árbol accesible mientras está abierto | Probar cierre, retorno del foco y navegación completa por teclado antes de afirmar conformidad |

## Hallazgos prioritarios

1. **Actividad real antes que apariencia:** el inicio no muestra inventario real en esta versión. Las fotografías ilustrativas cumplen una función visual, pero no demuestran oferta. Priorizar hasta cuatro publicaciones activas y recientes; ocultar esa sección si no existe inventario, o mostrar una invitación honesta a publicar. No mostrar datos de prueba como anuncios de usuarios.
2. **Recorrido móvil largo:** la captura completa mide 5.313 píxeles de alto. Las dos imágenes de entrada y los consejos ocupan gran parte del recorrido antes del editorial. Acortar espacios y tarjetas, preservando lectura y tamaño de botones. La comprobación de ancho no detectó desbordamiento horizontal a 390 píxeles.
3. **La promesa editorial es imprecisa:** “Leer más” actualmente lleva a páginas explicativas y a una vista previa, no a tres artículos independientes. Usar acciones específicas para guías y un artículo o enlace de fuente real para noticias. Una función permanente no debería parecer una novedad reciente indefinidamente.
4. **Ayuda flotante:** en la captura editorial móvil, “Cómo funciona” se superpone al texto de la primera tarjeta. Reservar espacio, recolocarla o retirarla en esa zona. No se ha demostrado que bloquee un enlace, pero la superposición visual existe.
5. **Movimiento:** el carrusel automático conserva el texto y respeta la preferencia inicial de movimiento reducido. Revisar una forma accesible de detener la animación y las preferencias modificadas durante la sesión. No se ha realizado una auditoría completa WCAG.
6. **Medir la estrategia:** instrumentar búsquedas, apertura de ficha, intención de contacto, inicio/final de publicación y lectura editorial. No afirmar mejora de retención sin datos de usuarios reales. No usar métricas o testimonios ficticios.

## Orden propuesto del inicio

1. Portada con búsqueda y acción secundaria de publicar.
2. Selección pequeña de maquinaria real activa, con acceso al catálogo.
3. Explicación compacta de buscar y publicar, con acceso a la vista previa.
4. Novedades y guías: máximo tres tarjetas.
5. Información de confianza, ayuda y pie.

Las noticias complementan el marketplace. Su utilidad principal sigue siendo encontrar equipos y contactar al proveedor.

## Automatización creada

Identificador: `novedades-semanales-de-maqvia`. Activa, semanal los lunes a las 10:00 según la zona local configurada en la aplicación. Es un seguimiento de este chat, que apunta explícitamente al repositorio hijo `maquinaria-site`.

La tarea revisa fuentes primarias, fechas y temas anteriores; selecciona una o dos novedades relevantes para maquinaria, construcción y arriendo en Chile; resume con texto original y enlaza la fuente. Mantiene un máximo de tres tarjetas, distingue guías de noticias y no inventa actividad. Si no hay noticias útiles, conserva el contenido o mejora una guía sin disfrazarla de actualidad. Comprueba formato, TypeScript y compilación cuando modifica código; captura el resultado si hay navegador disponible. Conserva cambios ajenos y registra fuentes y verificaciones.

**Límites:** todavía no existe alojamiento ni despliegue público configurado. La automatización puede preparar o actualizar contenido local; no hace merges ni despliegues automáticos, y no debe afirmar que la web pública cambió. Su primera ejecución programada aún no ha ocurrido. Para tareas con archivos locales, el equipo debe estar encendido y la aplicación abierta; permisos, red y disponibilidad de herramientas pueden impedir una ejecución.

Documentación: [Tareas programadas de OpenAI](https://learn.chatgpt.com/docs/automations).

## Base editorial recomendada para la siguiente implementación

Separar contenido y presentación. Crear un catálogo editorial validado con slug, tipo (noticia/guía/producto), título, resumen, cuerpo, imagen y texto alternativo, estado (borrador/publicado), fecha de publicación, fecha del evento cuando corresponda y fuentes verificadas. La portada consume solo publicados y limita a tres; una ruta editorial permite leer y consultar el archivo. Las guías permanentes no necesitan fechas fingidas de actualidad. No añadir un CMS grande o una dependencia externa solo para tres tarjetas.

Primera fase: datos versionados en el repositorio y revisión de cambios. Segunda fase, cuando estén definidos alojamiento y autenticación: edición administrada, despliegue verificado, reversión y monitoreo. El proceso editorial debe poder fallar sin impedir búsquedas ni publicaciones.

La publicidad futura debe ocupar espacios diferenciados y etiquetados como patrocinados; los anuncios pagados no deben presentarse como recomendaciones editoriales imparciales.

## Capturas aceptadas

### 1. Inicio en escritorio

![Inicio en escritorio](../output/playwright/01-inicio-desktop.png)

### 2. Inicio en móvil

![Inicio en móvil](../output/playwright/02-inicio-movil.png)

### 3. Editorial móvil y ayuda flotante

![Editorial móvil](../output/playwright/03-editorial-movil.png)

### 4. Menú móvil abierto

![Menú móvil](../output/playwright/04-menu-movil.png)

Las capturas están en una carpeta de resultados ignorada por Git. Deben conservarse aparte si se quiere compartir este documento con sus imágenes.
