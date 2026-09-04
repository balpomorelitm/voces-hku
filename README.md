# VOCES HKU

Archivo bilingüe y lector web del fanzine estudiantil de español de The University of Hong Kong.

## Preparar una edición

1. Colocar el PDF interactivo y la carpeta numerada de páginas junto a `web/`.
2. Convertir las páginas a WebP dentro de `public/issues/<id>/pages/`.
3. Ejecutar `npm run prepare:links` para conservar índices, enlaces externos y saltos de idioma.
4. Añadir la edición a `app/issues.json` y ejecutar `npm run prepare:manifest`.
5. Ejecutar `npm run prepare:pdf` para crear el PDF web descargable.
6. Publicar ese PDF como archivo de una GitHub Release y comprobar que su URL coincide con `downloadUrl`.

Los originales, los archivos temporales y el PDF descargable no se guardan en Git. El PDF final se adjunta a una GitHub Release.

## Desarrollo y publicación

- `npm run dev`: vista previa local.
- `npm run build`: compilación de desarrollo con Vite/vinext.
- `npm run build:pages`: exportación estática para GitHub Pages.
- `npm test`: verifica páginas, enlaces y PDF.

La rama `main` se publica automáticamente mediante `.github/workflows/deploy-pages.yml`.
