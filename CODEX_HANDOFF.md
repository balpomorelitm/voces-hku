# Registro de continuidad de Codex

Última actualización: 4 de septiembre de 2026.

## Estado actual

- Repositorio: `https://github.com/balpomorelitm/voces-hku.git`.
- Rama de publicación: `main`; la implementación partió del commit `5dcefab`.
- Los cambios descritos aquí forman parte de la entrega de Netlify publicada en `main`; usa `git log --oneline` para identificar la revisión exacta.
- GitHub Pages continúa configurado como despliegue de respaldo.
- El código para Netlify está terminado y validado localmente, pero el despliegue externo sigue pendiente porque requiere acceso a la cuenta de Netlify.

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

## Pasos pendientes en Netlify

1. En **Project configuration → Build & deploy**, desactivar o eliminar `@netlify/plugin-nextjs` del campo **Runtime** o de **Build plugins**.
2. Crear `NETLIFY_NEXT_PLUGIN_SKIP=true` con alcance **Builds**.
3. Usar **Clear cache and deploy site** para evitar que sobreviva la configuración anterior de `.next`.
4. En **Domain management**, intentar asignar `voces-hku` para obtener `https://voces-hku.netlify.app`; si no está disponible, conservar el subdominio asignado.
5. Verificar en producción la portada, el cambio ES/EN, la invitación, el lector, las imágenes, los enlaces interactivos y la descarga del PDF.
6. Actualizar este archivo con la URL final y el resultado del deploy.
