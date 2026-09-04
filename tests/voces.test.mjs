import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const root = new URL("../", import.meta.url);
const issueRoot = new URL("../public/issues/voces-1-2026/", import.meta.url);

test("publishes a complete, ordered first issue", async () => {
  const manifest = JSON.parse(await readFile(new URL("public/issues.json", root), "utf8"));
  const appManifest = JSON.parse(await readFile(new URL("app/issues.json", root), "utf8"));
  assert.deepEqual(appManifest, manifest);
  assert.equal(manifest.length, 1);
  assert.equal(manifest[0].id, "voces-1-2026");
  assert.equal(manifest[0].pageCount, 119);
  assert.equal(manifest[0].sections.length, 10);

  const files = (await readdir(new URL("pages/", issueRoot)))
    .filter((file) => file.endsWith(".webp"))
    .sort();
  assert.equal(files.length, 119);
  assert.equal(files[0], "001.webp");
  assert.equal(files.at(-1), "119.webp");
  for (const file of files) {
    assert.ok((await stat(new URL(`pages/${file}`, issueRoot))).size > 1_000);
  }
});

test("keeps every interactive PDF link and the English-version jumps", async () => {
  const links = JSON.parse(await readFile(new URL("links.json", issueRoot), "utf8"));
  assert.equal(links.pageCount, 119);
  assert.equal(links.sourceAnnotationCount, 62);
  assert.ok(links.hotspotCount < links.sourceAnnotationCount);

  const expectedTranslations = new Map([
    [7, 67],
    [9, 69],
    [21, 81],
    [30, 90],
    [37, 97],
    [44, 104],
    [52, 112],
  ]);
  for (const [page, targetPage] of expectedTranslations) {
    assert.ok(
      links.pages[String(page)].some(
        (link) => link.type === "internal" && link.targetPage === targetPage,
      ),
      `Missing English-version jump ${page} -> ${targetPage}`,
    );
  }
  assert.ok(Object.keys(links.pages).includes("2"));
  assert.ok(Object.keys(links.pages).includes("62"));
  assert.ok(
    links.annotations.some(
      (link) => link.type === "external" && link.url.includes("youtube"),
    ),
  );
});

test("creates a compact, interactive 119-page download", async () => {
  const pdfUrl = new URL("output/pdf/voces-numero-1-2026-web.pdf", root);
  const pdfStats = await stat(pdfUrl);
  assert.ok(pdfStats.size < 100 * 1024 * 1024);
  const pdf = await getDocument({ data: new Uint8Array(await readFile(pdfUrl)) }).promise;
  assert.equal(pdf.numPages, 119);
  let annotationCount = 0;
  for (let page = 1; page <= pdf.numPages; page += 1) {
    annotationCount += (await (await pdf.getPage(page)).getAnnotations())
      .filter((annotation) => annotation.subtype === "Link").length;
  }
  assert.equal(annotationCount, 62);
});
