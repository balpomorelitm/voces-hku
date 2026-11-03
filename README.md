# VOCES HKU

Archivo bilingüe y lector web del fanzine estudiantil de español de The University of Hong Kong.

## Preparar una edición

La versión definitiva del número 1 procede de `PARA PUBLICAR - Corr. BUENO.pdf` y `PARA PUBLICAR - Corr. BUENO.zip` (3 de noviembre de 2026). Los WebP del ZIP ya están optimizados; conservar su orden interno, que mezcla nombres numéricos y títulos de secciones, y contrastarlo con el PDF antes de renombrarlos. No ordenar el ZIP alfabéticamente.

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
- `npm run build:netlify`: exportación estática para Netlify, sin prefijo de ruta.
- `npm test`: verifica páginas, enlaces y PDF.
- `npm run lint`: comprueba el código TypeScript y JavaScript.

La rama `main` se publica automáticamente mediante `.github/workflows/deploy-pages.yml`.

### Netlify

El archivo `netlify.toml` ejecuta `npm run build:netlify` y publica la carpeta `out/`.

Como este proyecto usa una exportación completamente estática, en **Project configuration → Build & deploy** de Netlify hay que:

1. Desactivar o eliminar `@netlify/plugin-nextjs` del campo **Runtime** o de **Build plugins**.
2. Crear la variable `NETLIFY_NEXT_PLUGIN_SKIP=true` con alcance **Builds**.
3. Lanzar un nuevo deploy; si Netlify conserva la configuración anterior, usar **Clear cache and deploy site**.
4. En **Domain management**, intentar asignar el nombre `voces-hku` para obtener `https://voces-hku.netlify.app`.

Netlify proporciona la variable `URL` durante el build. La web la usa como URL base de sus metadatos; GitHub Pages conserva su propia dirección cuando esa variable no existe.

## Continuidad entre sesiones

`CODEX_HANDOFF.md` contiene el estado actual, las comprobaciones y los pasos pendientes para continuar el trabajo desde otra sesión de Codex u otro ordenador.
