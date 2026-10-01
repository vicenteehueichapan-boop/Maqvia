# Maqvia — mapa del proyecto

Maqvia es una vitrina de maquinaria y servicios para Santiago. Los visitantes exploran publicaciones; una cuenta permite contactar proveedores, guardar equipos y publicar. El arriendo y el pago se acuerdan fuera del sitio.

## Arquitectura actual

- app/: páginas y handlers del router. Las páginas públicas consultan solo publicaciones activas.
- components/: interfaz compartida. PublishForm es el único formulario completo de publicación; QuickListingPreview muestra catálogo, ficha y vitrina de forma privada antes del ingreso.
- lib/marketplace.ts: consultas a D1 y comprobaciones de propiedad; lib/publication-validation.ts valida los datos de publicación.
- db/schema.ts y drizzle/: esquema y migraciones de D1. Las fotografías se guardan en R2.
- app/chatgpt-auth.ts: sesión proporcionada por la plataforma. En localhost se usa una identidad fija de prueba. En producción, las cabeceras solo se aceptan con `AUTH_TRUSTED_PROXY=sites` tras verificar el borde; un sitio público independiente necesita autenticación real.
- tests/: pruebas de identidad, validación, borradores, fotografías y mensajes. La vista previa anónima se transfiere a la primera cuenta que la continúa; después, los borradores se aíslan por cuenta y equipo en `sessionStorage` de la pestaña. No son datos persistentes del servidor.

## Recorridos

1. Visitante: Inicio → catálogo → ficha o vitrina. Puede probar una vista previa privada. Para abrir contactos o guardar un equipo debe ingresar.
2. Proveedor: ingresar → publicar → completar perfil, equipo y fotos → revisar las tres vistas → publicar. Desde Mi cuenta puede editar, pausar, reactivar o retirar. Retirar es reversible.
3. Interesado: ingresar → ficha → contacto por WhatsApp o correo, si el proveedor lo habilitó. Maqvia no procesa el arriendo ni el pago.

## Operación y límites

Ejecutar npm run dev para desarrollo local; npm run build para compilar. Aplicar las migraciones de drizzle/ en orden a D1 antes de usar las rutas nuevas. La migración 0004 agrega estados y favoritos. Consultar README.md para la configuración de Cloudflare y comandos exactos.

El nombre Maqvia es provisional hasta comprobar marca y dominio. Antes de un lanzamiento público hacen falta moderación, privacidad, términos y revisión de despliegue. La identidad fija de localhost sirve solo para pruebas; las cuentas reales dependen de la plataforma alojada.
