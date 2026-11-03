import { spawnSync } from "node:child_process";
import { readFile, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { PDFDocument, PDFName, PDFNull, PDFString } from "pdf-lib";

const imageDirectory = resolve(process.argv[2] ?? "public/issues/voces-1-2026/pages");
const linksPath = resolve(
  process.argv[3] ?? "public/issues/voces-1-2026/links.json",
);
const outputPath = resolve(
  process.argv[4] ?? "output/pdf/voces-numero-1-2026-web.pdf",
);
const jpegDirectory = resolve("tmp/pdfs/voces-1-2026-jpeg");
const linkMap = JSON.parse(await readFile(linksPath, "utf8"));
const PAGE_COUNT = linkMap.pageCount;
const PDF_WIDTH = 595.276;
const PDF_HEIGHT = 841.89;
const MAX_BYTES = 100 * 1024 * 1024;

await mkdir(jpegDirectory, { recursive: true });
await mkdir(dirname(outputPath), { recursive: true });

const filenames = await readdir(imageDirectory);
const imagePaths = new Map();
for (const filename of filenames) {
  const match = filename.match(/^(\d+)\.(png|webp)$/i);
  if (!match) continue;
  const number = Number(match[1]);
  if (imagePaths.has(number)) throw new Error(`Duplicate image for page ${number}.`);
  imagePaths.set(number, resolve(imageDirectory, filename));
}
if (imagePaths.size !== PAGE_COUNT) {
  throw new Error(`Expected ${PAGE_COUNT} images, found ${imagePaths.size}.`);
}

for (let page = 1; page <= PAGE_COUNT; page += 1) {
  const source = imagePaths.get(page);
  if (!source) throw new Error(`Missing image for page ${page}.`);
  const target = resolve(jpegDirectory, `${String(page).padStart(3, "0")}.jpg`);
  const conversion = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      source,
      "-q:v",
      "3",
      "-pix_fmt",
      "yuvj444p",
      target,
    ],
    { stdio: "inherit" },
  );
  if (conversion.status !== 0) {
    throw new Error(`Unable to prepare page ${page} for the PDF.`);
  }
  if (page % 20 === 0 || page === PAGE_COUNT) {
    console.log(`Prepared ${page}/${PAGE_COUNT} PDF pages.`);
  }
}

if (linkMap.annotations.length !== linkMap.sourceAnnotationCount) {
  throw new Error(
    "The annotation count does not match the extracted PDF links.",
  );
}

const pdf = await PDFDocument.create();
pdf.setTitle("VOCES — Número 1 · 2026");
pdf.setAuthor("HKU Spanish students");
pdf.setSubject("Fanzine estudiantil de español de HKU");
pdf.setCreator("VOCES HKU web edition");
pdf.setProducer("VOCES HKU web edition");

for (let page = 1; page <= PAGE_COUNT; page += 1) {
  const jpegPath = resolve(
    jpegDirectory,
    `${String(page).padStart(3, "0")}.jpg`,
  );
  const image = await pdf.embedJpg(await readFile(jpegPath));
  const pdfPage = pdf.addPage([PDF_WIDTH, PDF_HEIGHT]);
  pdfPage.drawImage(image, {
    x: 0,
    y: 0,
    width: PDF_WIDTH,
    height: PDF_HEIGHT,
  });
}

const pdfPages = pdf.getPages();
for (let pageNumber = 1; pageNumber <= PAGE_COUNT; pageNumber += 1) {
  const page = pdfPages[pageNumber - 1];
  const pageLinks = linkMap.annotations.filter(
    (annotation) => annotation.page === pageNumber,
  );
  if (pageLinks.length === 0) continue;

  const references = pageLinks.map((annotation) => {
    const [left, top, width, height] = annotation.rect;
    const x1 = left * PDF_WIDTH;
    const x2 = (left + width) * PDF_WIDTH;
    const y1 = (1 - top - height) * PDF_HEIGHT;
    const y2 = (1 - top) * PDF_HEIGHT;
    const link = {
      Type: "Annot",
      Subtype: "Link",
      Rect: [x1, y1, x2, y2],
      Border: [0, 0, 0],
      Contents: PDFString.of(annotation.label.es),
      ...(annotation.type === "external"
        ? {
            A: {
              Type: "Action",
              S: "URI",
              URI: PDFString.of(annotation.url),
            },
          }
        : {
            Dest: [
              pdfPages[annotation.targetPage - 1].ref,
              PDFName.of("XYZ"),
              PDFNull,
              PDF_HEIGHT,
              PDFNull,
            ],
          }),
    };
    return pdf.context.register(pdf.context.obj(link));
  });
  page.node.set(PDFName.of("Annots"), pdf.context.obj(references));
}

const pdfBytes = await pdf.save({ useObjectStreams: true });
await writeFile(outputPath, pdfBytes);
const outputStats = await stat(outputPath);
if (outputStats.size >= MAX_BYTES) {
  throw new Error(
    `Optimized PDF is ${(outputStats.size / 1024 / 1024).toFixed(1)} MiB; expected less than 100 MiB.`,
  );
}
console.log(
  `Created ${outputPath} (${(outputStats.size / 1024 / 1024).toFixed(1)} MiB) with ${linkMap.sourceAnnotationCount} link annotations.`,
);
