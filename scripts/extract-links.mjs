import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const input = resolve(process.argv[2] ?? "../Voces1comprimido.pdf");
const output = resolve(
  process.argv[3] ?? "public/issues/voces-1-2026/links.json",
);

const englishVersions = new Map([
  [7, 67],
  [9, 69],
  [21, 81],
  [30, 90],
  [37, 97],
  [44, 104],
  [52, 112],
]);

function normalizedRect(rect, view) {
  const [minX, minY, maxX, maxY] = view;
  const width = maxX - minX;
  const height = maxY - minY;
  const [x1, y1, x2, y2] = rect;
  return [
    (x1 - minX) / width,
    (maxY - y2) / height,
    (x2 - x1) / width,
    (y2 - y1) / height,
  ].map((value) => Number(value.toFixed(7)));
}

function linkLabel(page, annotation, targetPage, url) {
  if (englishVersions.get(page) === targetPage) {
    return {
      es: "Leer este artículo en inglés",
      en: "Read this article in English",
    };
  }

  const contents = annotation.contentsObj?.str?.trim();
  if (targetPage) {
    const destination = contents || `Página ${targetPage}`;
    return {
      es: `Ir a ${destination}`,
      en: `Go to ${contents || `page ${targetPage}`}`,
    };
  }

  const host = url ? new URL(url).hostname.replace(/^www\./, "") : "enlace";
  if (host.includes("youtube") || host === "youtu.be") {
    return { es: "Abrir vídeo en YouTube", en: "Open video on YouTube" };
  }
  if (host.includes("instagram")) {
    return { es: "Abrir Instagram", en: "Open Instagram" };
  }
  if (host.includes("facebook")) {
    return { es: "Abrir Facebook", en: "Open Facebook" };
  }
  if (host === "spanish.hku.hk") {
    return {
      es: "Visitar el Programa de Español de HKU",
      en: "Visit the HKU Spanish Programme",
    };
  }
  return {
    es: `Abrir enlace externo: ${host}`,
    en: `Open external link: ${host}`,
  };
}

function sameTarget(first, second) {
  return (
    first.page === second.page &&
    first.type === second.type &&
    first.targetPage === second.targetPage &&
    first.url === second.url
  );
}

function touches(first, second) {
  const [ax, ay, aw, ah] = first.rect;
  const [bx, by, bw, bh] = second.rect;
  const ar = ax + aw;
  const ab = ay + ah;
  const br = bx + bw;
  const bb = by + bh;
  const overlapX = Math.min(ar, br) - Math.max(ax, bx);
  const overlapY = Math.min(ab, bb) - Math.max(ay, by);
  const gapX = Math.max(0, Math.max(ax, bx) - Math.min(ar, br));
  const gapY = Math.max(0, Math.max(ay, by) - Math.min(ab, bb));
  return (
    (overlapX >= 0 && overlapY >= 0) ||
    (gapX <= 0.004 && overlapY > 0) ||
    (gapY <= 0.004 && overlapX > 0)
  );
}

function unionRect(first, second) {
  const left = Math.min(first[0], second[0]);
  const top = Math.min(first[1], second[1]);
  const right = Math.max(first[0] + first[2], second[0] + second[2]);
  const bottom = Math.max(first[1] + first[3], second[1] + second[3]);
  return [left, top, right - left, bottom - top].map((value) =>
    Number(value.toFixed(7)),
  );
}

function mergeHotspots(annotations) {
  const merged = [];
  for (const annotation of annotations) {
    const existing = merged.find(
      (candidate) => sameTarget(candidate, annotation) && touches(candidate, annotation),
    );
    if (existing) {
      existing.rect = unionRect(existing.rect, annotation.rect);
      existing.sourceCount += 1;
    } else {
      merged.push({ ...annotation, sourceCount: 1 });
    }
  }
  return merged;
}

const bytes = new Uint8Array(await readFile(input));
const document = await getDocument({ data: bytes }).promise;
const annotations = [];

for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
  const page = await document.getPage(pageNumber);
  const pageAnnotations = await page.getAnnotations();
  let sequence = 0;

  for (const annotation of pageAnnotations) {
    if (annotation.subtype !== "Link") continue;
    let destination = annotation.dest;
    if (typeof destination === "string") {
      destination = await document.getDestination(destination);
    }
    let targetPage;
    if (Array.isArray(destination) && destination[0]) {
      try {
        targetPage = (await document.getPageIndex(destination[0])) + 1;
      } catch {
        targetPage = undefined;
      }
    }
    const url = annotation.url || annotation.unsafeUrl || undefined;
    if (!targetPage && !url) continue;
    sequence += 1;
    annotations.push({
      id: `p${pageNumber}-link-${sequence}`,
      page: pageNumber,
      type: targetPage ? "internal" : "external",
      rect: normalizedRect(annotation.rect, page.view),
      ...(targetPage ? { targetPage } : { url }),
      label: linkLabel(pageNumber, annotation, targetPage, url),
    });
  }
}

const hotspots = mergeHotspots(annotations);
const pages = {};
for (const hotspot of hotspots) {
  const key = String(hotspot.page);
  pages[key] ??= [];
  const webHotspot = { ...hotspot };
  delete webHotspot.page;
  pages[key].push(webHotspot);
}

const result = {
  source: input.split(/[\\/]/).pop(),
  pageCount: document.numPages,
  sourceAnnotationCount: annotations.length,
  hotspotCount: hotspots.length,
  annotations,
  pages,
};

await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(
  `Extracted ${annotations.length} PDF annotations into ${hotspots.length} web hotspots across ${document.numPages} pages.`,
);
