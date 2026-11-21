# Entrega para revisión — Secure Biz Solutions

Se solicita a Zakee confirmar la entrega estática en Bluehost en lugar de WordPress, y revisar la homepage, el sitio completo y las imágenes generadas por IA antes de activar producción.

## Datos pendientes

- Teléfono, logos en color y blanco, y banner de la homepage.
- Tres videos con stills y subtítulos cuando estén disponibles.
- Código inline de las agendas de Google Calendar de 15 y 20 minutos.
- Privacy, Terms y SMS Terms aprobados; metadescripciones faltantes indicadas en el manifiesto de páginas.
- IDs de medición y aprobación de su configuración.
- Accesos a Bluehost y Cloudflare para el dominio final.

## Flujo de revisión y lanzamiento

1. Abrir el sitio desde `index.html` o servir la raíz en un staging protegido. Las etiquetas y el robots de la exportación de revisión bloquean la indexación; el acceso privado debe configurarse en el hosting.
2. Validar los cuatro formularios de Zakee en HTTPS, con datos de prueba acordados con su equipo. Dentro de JotForm, comprobar los nombres de campos, tema visual, consentimiento SMS opcional y redirecciones al destino correspondiente. Verificar que una carga con `sid` quede asociada al lead correcto. El sitio no controla campos, reglas de elegibilidad ni notificaciones.
3. Cargar los recursos aprobados y marcar las imágenes con `approved: true` en `config.js`, usando las rutas de `generated-art.js` como referencia. El arte de IA representa escenas ilustrativas. Añadir calendario, teléfono, textos legales y analítica. Probar los cuatro destinos de conversión y las reservas en los dispositivos previstos.
4. Tras la aprobación, activar `production`, cambiar la URL si corresponde y regenerar. Publicar las 28 carpetas o archivos de ruta del manifiesto, `404.html`, `sitemap.xml`, `robots.txt`, `.htaccess` y `assets` (excepto originales). Los directorios de trabajo, documentos y pruebas son internos.
5. Respaldar el destino, comprobar HTTPS, configurar Cloudflare en Full (strict) y excluir de caché las rutas de formularios y confirmaciones. Validar un 404 real, sitemap, etiquetas, formularios y rendimiento móvil en el hosting. Mantener el respaldo para reversión.
