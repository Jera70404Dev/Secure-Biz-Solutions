# Secure Biz Solutions

Abre `index.html` con doble clic para recorrer el sitio. Las 28 rutas también están exportadas como documentos HTML completos para un servidor estático, sin paquetes ni compilación en el navegador.

- `assets/js/config.js`: materiales y datos suministrados por Zakee; identificadores de JotForm ya configurados.
- `assets/js/content.js` y `page-sections.js`: contenido y secciones compartidas.
- `assets/images/`: WebP de 800 y 1600 px. Los PNG originales están en `assets/images/originals/` y se conservan para edición, fuera del paquete público.
- `docs/image-candidates.html`: galería para revisar las imágenes generadas. El JSON adyacente registra los prompts y la herramienta.
- `docs/entrega.md`: pendientes con el cliente y pasos de publicación.

Para regenerar los HTML tras editar el contenido, ejecuta `node scripts/build.mjs`. Node solo se necesita para esta tarea de mantenimiento. El archivo inicial y las páginas exportadas ya están listos para revisión.

## GitHub Pages

Repositorio: https://github.com/Jera70404Dev/Secure-Biz-Solutions

En Settings → Pages, seleccionar **GitHub Actions** como fuente. Cada push a `main` ejecuta `.github/workflows/pages.yml` y publica únicamente el contenido de `dist/`. Los documentos internos, originales de imágenes y pruebas no se incluyen en el sitio publicado.

Para preparar el paquete local: `node scripts/build-pages.mjs`. La URL predeterminada es `https://jera70404dev.github.io/Secure-Biz-Solutions/`; `SBS_SITE_URL` permite cambiarla. Las rutas y la página 404 admiten el prefijo del repositorio.

La publicación conserva el modo de revisión (`production: false`, sin indexación). Los pendientes del cliente siguen en `docs/entrega.md` local.
