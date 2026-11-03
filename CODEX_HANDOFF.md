# Registro de continuidad de Codex

Última actualización: 3 de noviembre de 2026.

## Actualización del 3 de noviembre de 2026

- El usuario ha sustituido la edición anterior por los archivos definitivos `PARA PUBLICAR - Corr. BUENO.pdf` y `PARA PUBLICAR - Corr. BUENO.zip`, ubicados junto a `web/`.
- El ZIP contiene 119 WebP de 1414 × 2000. Sus nombres mezclan números y secciones: debe conservarse el orden de las entradas del ZIP, nunca el orden alfabético. Se ha contrastado la secuencia completa con las 119 páginas renderizadas del PDF. Las páginas 11/71 y 20/80 son casi idénticas entre idiomas; las diferencias de comparación están dentro del ruido de compresión.
- Se sustituyen las 119 imágenes sin recomprimirlas. Peso total: 25.870.820 bytes. Se añade `revisionDate: 2026-11-03` y una versión en las URL para evitar que las cachés conserven la edición anterior.
- El PDF definitivo contiene 64 anotaciones, consolidadas en 49 zonas web. Conserva los siete saltos al inglés y los dos índices. El mapa se vuelve a extraer íntegramente del PDF definitivo.
- `build-pdf.mjs` admite PNG y WebP numerados y usa el número real de páginas/anotaciones del mapa, sin fijar las 62 anotaciones antiguas.
- Se genera de nuevo el PDF descargable, manteniendo el nombre y la URL de la Release para actualizar también los enlaces compartidos con anterioridad.
- `https://voces-hku.netlify.app/` responde con HTTP 200 al comenzar esta revisión; se conservan tanto Netlify como Pages y la invitación de SurveyMonkey.
- Validación local: `npm test`, `npm run build:netlify` y `npm run build:pages` superados. Las 119 imágenes publicadas coinciden byte a byte con las del ZIP ordenado; se han revisado muestras renderizadas del PDF final. El PDF tiene 48.427.915 bytes (46,2 MiB) y conserva los 64 destinos comprobados en las pruebas.
- La descarga de GitHub Release se ha sustituido correctamente con `gh release upload --clobber`.
- El primer intento de revisión con Computer Use se detuvo al no poder verificar la URL de Edge; no se llegaron a subir los cambios web. Se retoma la publicación mediante Git y los mecanismos de despliegue del repositorio.
- Publicación completada con el commit `39e355af31f7830b5c6fc3593572367e1cd2cbf1` en `main`.
- Netlify: despliegue `6ae9bcf76693509fb93e41d6`, estado `ready`, publicado automáticamente desde ese commit en `https://voces-hku.netlify.app/`.
- GitHub Pages: ejecución `41622892057` terminada con `success`, publicada en `https://balpomorelitm.github.io/voces-hku/`.
- Comprobación HTTP en ambos proveedores: manifiesto con revisión `2026-11-03`, portada con el enlace de participación y mapa definitivo de 64 anotaciones/49 zonas. Se descargaron y compararon por SHA-256 las 119 imágenes de cada proveedor: todas coinciden con los archivos definitivos locales.
- Descarga pública de la Release comprobada por SHA-256: sus 48.427.915 bytes coinciden exactamente con el PDF definitivo local.
- La comprobación visual de los documentos se realizó antes de publicar. La comprobación de esta publicación se realizó mediante API y HTTP, sin utilizar Computer Use.

## Estado actual

- Repositorio: `https://github.com/balpomorelitm/voces-hku.git`.
- Rama de publicación: `main`; la implementación partió del commit `5dcefab`.
- Los cambios descritos aquí forman parte de la entrega de Netlify publicada en `main`; usa `git log --oneline` para identificar la revisión exacta.
- GitHub Pages continúa configurado como despliegue de respaldo.
- Netlify y GitHub Pages están publicados y verificados con la edición definitiva del 3 de noviembre de 2026.

## Cambios del 4 de septiembre de 2026

- Se añadió `npm run build:netlify`, una exportación estática de Next.js que genera `out/` sin el prefijo `/voces-hku`.
- `npm run build:pages` conserva su comportamiento y continúa generando recursos bajo `/voces-hku`.
- Se añadió `netlify.toml` con Node 22, el comando de build de Netlify y `out` como directorio de publicación.
- Los metadatos usan la variable `URL` que Netlify proporciona durante el build y recurren a la URL de GitHub Pages cuando no existe.
- La portada muestra una pestaña flotante bilingüe que abre `https://www.surveymonkey.com/r/37R3C82` en una pestaña nueva.
- La invitación solo existe en la vista de archivo/portada; no aparece dentro del lector.
- Se documentó el despliegue de Netlify en `README.md` y se creó `AGENTS.md` para mantener este registro en futuras sesiones.

## Validación realizada

- `npm test`: 3 pruebas superadas; edición de 119 páginas, enlaces interactivos y PDF verificados.
- `npm run lint`: superado sin avisos ni errores en una copia limpia fuera de OneDrive.
- `npm run build:netlify`: superado con Next.js 16.2.6; 119 WebP y 42,59 MiB de salida, cero referencias de recursos con `/voces-hku`.
- Build de Netlify simulado con `URL=https://voces-hku.netlify.app`: los metadatos contienen la dirección de Netlify y no la dirección de GitHub.
- `npm run build:pages`: superado; 119 WebP, recursos correctamente prefijados con `/voces-hku` y ninguna referencia incorrecta desde la raíz.
- Revisión visual con Chrome en escritorio y móvil: la pestaña queda bajo la cabecera sin tapar la portada; foco visible y estilos coherentes con la web.
- Revisión visual del lector: la pestaña no aparece.
- El enlace de SurveyMonkey responde con HTTP 200.
- `https://voces-hku.netlify.app/` respondía con HTTP 404 al cerrar esta sesión; todavía no hay un deploy público confirmado en esa dirección.

## Incidencia del entorno local

El build ejecutado directamente dentro de la carpeta sincronizada por OneDrive produjo `UNKNOWN: unknown error, read`, y el primer lint quedó esperando lecturas. Las mismas revisiones pasaron en una copia temporal limpia fuera de OneDrive, por lo que se trata como un problema de hidratación/sincronización del sistema de archivos, no del código.

## Pasos pendientes históricos en Netlify (resueltos; sitio verificado el 3 de noviembre)

1. En **Project configuration → Build & deploy**, desactivar o eliminar `@netlify/plugin-nextjs` del campo **Runtime** o de **Build plugins**.
2. Crear `NETLIFY_NEXT_PLUGIN_SKIP=true` con alcance **Builds**.
3. Usar **Clear cache and deploy site** para evitar que sobreviva la configuración anterior de `.next`.
4. En **Domain management**, intentar asignar `voces-hku` para obtener `https://voces-hku.netlify.app`; si no está disponible, conservar el subdominio asignado.
5. Verificar en producción la portada, el cambio ES/EN, la invitación, el lector, las imágenes, los enlaces interactivos y la descarga del PDF.
6. Actualizar este archivo con la URL final y el resultado del deploy.
