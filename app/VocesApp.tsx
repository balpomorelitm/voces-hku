"use client";

/* The reader uses fixed, pre-optimized WebP pages and controls their loading itself. */
/* eslint-disable @next/next/no-img-element */

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type Language = "es" | "en";
type Localized = { es: string; en: string };

export type Issue = {
  id: string;
  number: number;
  year: number;
  title: Localized;
  description: Localized;
  pageCount: number;
  cover: string;
  pagePattern: string;
  links: string;
  downloadUrl: string;
  sections: Array<{ page: number; es: string; en: string }>;
};

type Hotspot = {
  id: string;
  type: "internal" | "external";
  rect: [number, number, number, number];
  targetPage?: number;
  url?: string;
  label: Localized;
  sourceCount: number;
};

type LinkMap = {
  sourceAnnotationCount: number;
  hotspotCount: number;
  pages: Record<string, Hotspot[]>;
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const JOIN_URL = "https://www.surveymonkey.com/r/37R3C82";

const text = {
  es: {
    edition: "Edición 01 — 2026",
    heroTitle: "Historias que cruzan idiomas.",
    heroBody:
      "VOCES es la revista estudiantil de español de HKU: un espacio semestral para compartir lengua, cultura y creatividad.",
    read: "Leer el número",
    download: "Descargar PDF",
    programme: "Spanish HKU",
    archive: "Ediciones",
    archiveIntro:
      "Un archivo vivo de la escritura y la mirada de nuestros estudiantes. Dos nuevas ediciones cada año.",
    issue: "Número",
    pages: "páginas",
    open: "Abrir revista",
    madeBy: "Creada por estudiantes de español de HKU.",
    aboutTitle: "Una revista hecha entre muchas voces",
    aboutBody:
      "Cultura, aprendizaje, música, literatura, gastronomía y vida universitaria reunidos en un proyecto bilingüe y colectivo.",
    back: "Volver a ediciones",
    contents: "Índice",
    fullscreen: "Pantalla completa",
    exitFullscreen: "Salir de pantalla completa",
    share: "Copiar enlace",
    copied: "Enlace copiado",
    previous: "Páginas anteriores",
    next: "Páginas siguientes",
    goTo: "Ir a la página",
    go: "Ir",
    page: "Página",
    enlarge: "Ampliar página",
    close: "Cerrar",
    zoomIn: "Acercar",
    zoomOut: "Alejar",
    external: "Se abre en una pestaña nueva",
    join: "Participa en el próximo número",
    loadingLinks: "Preparando enlaces interactivos…",
  },
  en: {
    edition: "Issue 01 — 2026",
    heroTitle: "Stories that travel across languages.",
    heroBody:
      "VOCES is HKU's Spanish student magazine: a semesterly space for language, culture and creativity.",
    read: "Read this issue",
    download: "Download PDF",
    programme: "Spanish HKU",
    archive: "Issues",
    archiveIntro:
      "A living archive of our students' writing and perspectives. Two new issues every year.",
    issue: "Issue",
    pages: "pages",
    open: "Open magazine",
    madeBy: "Created by HKU students of Spanish.",
    aboutTitle: "One magazine, many voices",
    aboutBody:
      "Culture, learning, music, literature, food and university life come together in a bilingual, collective project.",
    back: "Back to issues",
    contents: "Contents",
    fullscreen: "Full screen",
    exitFullscreen: "Exit full screen",
    share: "Copy link",
    copied: "Link copied",
    previous: "Previous pages",
    next: "Next pages",
    goTo: "Go to page",
    go: "Go",
    page: "Page",
    enlarge: "Enlarge page",
    close: "Close",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    external: "Opens in a new tab",
    join: "Join the next issue",
    loadingLinks: "Preparing interactive links…",
  },
} as const;

function assetUrl(path: string) {
  return `${BASE_PATH}${path}`;
}

function pageUrl(issue: Issue, page: number) {
  return assetUrl(
    issue.pagePattern.replace("{page}", page.toString().padStart(3, "0")),
  );
}

function useMobileReader() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 899px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return mobile;
}

function LanguageSwitch({
  language,
  onChange,
  compact = false,
}: {
  language: Language;
  onChange: (language: Language) => void;
  compact?: boolean;
}) {
  return (
    <div className={`language-switch${compact ? " compact" : ""}`} aria-label="Language / Idioma">
      <button
        type="button"
        className={language === "es" ? "active" : ""}
        aria-pressed={language === "es"}
        onClick={() => onChange("es")}
      >
        ES
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        className={language === "en" ? "active" : ""}
        aria-pressed={language === "en"}
        onClick={() => onChange("en")}
      >
        EN
      </button>
    </div>
  );
}

export function VocesApp({ issues }: { issues: Issue[] }) {
  const [language, setLanguage] = useState<Language>("es");
  const [readerState, setReaderState] = useState<{ issueId: string; page: number } | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("voces-language");
    const detected = saved === "es" || saved === "en"
      ? saved
      : window.navigator.language.toLowerCase().startsWith("en") ? "en" : "es";
    queueMicrotask(() => setLanguage(detected));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("voces-language", language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const readHash = () => {
      const match = window.location.hash.match(/^#\/read\/([^/]+)\/(\d+)$/);
      if (!match) {
        setReaderState(null);
        return;
      }
      const issue = issues.find((candidate) => candidate.id === match[1]);
      if (!issue) {
        setReaderState(null);
        return;
      }
      const requested = Number(match[2]);
      setReaderState({
        issueId: issue.id,
        page: Math.min(issue.pageCount, Math.max(1, Number.isFinite(requested) ? requested : 1)),
      });
    };

    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, [issues]);

  const openIssue = (issueId: string, page = 1) => {
    window.location.hash = `/read/${issueId}/${page}`;
  };

  const closeReader = () => {
    window.location.hash = "/";
  };

  const activeIssue = readerState
    ? issues.find((issue) => issue.id === readerState.issueId)
    : undefined;

  if (readerState && activeIssue) {
    return (
      <Reader
        key={activeIssue.id}
        issue={activeIssue}
        page={readerState.page}
        language={language}
        onLanguageChange={setLanguage}
        onNavigate={(page) => openIssue(activeIssue.id, page)}
        onClose={closeReader}
      />
    );
  }

  return (
    <Archive
      issues={issues}
      language={language}
      onLanguageChange={setLanguage}
      onOpen={openIssue}
    />
  );
}

function Archive({
  issues,
  language,
  onLanguageChange,
  onOpen,
}: {
  issues: Issue[];
  language: Language;
  onLanguageChange: (language: Language) => void;
  onOpen: (issueId: string, page?: number) => void;
}) {
  const c = text[language];
  const featured = issues[0];

  return (
    <div className="archive-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="VOCES — inicio">
          VOCES<span className="wordmark-dot">.</span>
        </a>
        <nav className="site-nav" aria-label={language === "es" ? "Navegación principal" : "Main navigation"}>
          <a href="#ediciones">{c.archive}</a>
          <a href="https://spanish.hku.hk/" target="_blank" rel="noreferrer">
            {c.programme} <span aria-hidden="true">↗</span>
          </a>
          <LanguageSwitch language={language} onChange={onLanguageChange} />
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">{c.edition}</p>
            <h1 id="hero-title">
              <span>VOCES</span>
              {c.heroTitle}
            </h1>
            <p className="hero-intro">{c.heroBody}</p>
            <div className="hero-actions">
              <button className="button button-primary" type="button" onClick={() => onOpen(featured.id)}>
                {c.read} <span aria-hidden="true">→</span>
              </button>
              <a className="button button-ghost" href={featured.downloadUrl}>
                {c.download} <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero-note">
              <span className="hero-note-line" aria-hidden="true" />
              <span>{c.madeBy}</span>
            </div>
          </div>

          <div className="cover-stage" aria-label={`${featured.title[language]}, ${featured.year}`}>
            <div className="cover-shape cover-shape-blue" aria-hidden="true" />
            <div className="cover-shape cover-shape-yellow" aria-hidden="true" />
            <button className="cover-button" type="button" onClick={() => onOpen(featured.id)}>
              <img src={assetUrl(featured.cover)} alt={`${featured.title[language]} — VOCES`} />
              <span className="cover-open" aria-hidden="true">{c.open} ↗</span>
            </button>
          </div>
        </section>

        <section className="about-strip" aria-labelledby="about-title">
          <p className="about-number" aria-hidden="true">01</p>
          <h2 id="about-title">{c.aboutTitle}</h2>
          <p>{c.aboutBody}</p>
        </section>

        <section className="issues-section" id="ediciones" aria-labelledby="issues-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">VOCES / HKU</p>
              <h2 id="issues-title">{c.archive}</h2>
            </div>
            <p>{c.archiveIntro}</p>
          </div>

          <div className="issue-grid">
            {issues.map((issue) => (
              <article className="issue-card" key={issue.id}>
                <button className="issue-cover" type="button" onClick={() => onOpen(issue.id)}>
                  <img src={assetUrl(issue.cover)} alt={`${issue.title[language]} — VOCES`} loading="lazy" />
                </button>
                <div className="issue-meta">
                  <p>{c.issue} {String(issue.number).padStart(2, "0")} · {issue.year}</p>
                  <h3>{issue.title[language]}</h3>
                  <p className="issue-description">{issue.description[language]}</p>
                  <div className="issue-card-footer">
                    <span>{issue.pageCount} {c.pages}</span>
                    <button type="button" onClick={() => onOpen(issue.id)}>
                      {c.open} <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark footer-mark" href="#top">VOCES.</a>
        <p>{language === "es" ? "Fanzine estudiantil de español" : "Spanish students' fanzine"}<br />The University of Hong Kong</p>
        <a href="https://spanish.hku.hk/" target="_blank" rel="noreferrer">spanish.hku.hk ↗</a>
      </footer>

      <a
        className="join-tab"
        href={JOIN_URL}
        target="_blank"
        rel="noreferrer"
        aria-label={`${c.join}. ${c.external}`}
      >
        <span>{c.join}</span>
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

function Reader({
  issue,
  page,
  language,
  onLanguageChange,
  onNavigate,
  onClose,
}: {
  issue: Issue;
  page: number;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onNavigate: (page: number) => void;
  onClose: () => void;
}) {
  const c = text[language];
  const mobile = useMobileReader();
  const readerRef = useRef<HTMLElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const jumpInput = useRef<HTMLInputElement>(null);
  const [linkMap, setLinkMap] = useState<LinkMap | null>(null);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [zoomPage, setZoomPage] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayedPages = useMemo(() => {
    if (mobile || page === 1) return [page];
    const left = page % 2 === 0 ? page : page - 1;
    return [left, left + 1].filter((candidate) => candidate <= issue.pageCount);
  }, [issue.pageCount, mobile, page]);

  const spreadStart = displayedPages[0];
  const spreadEnd = displayedPages[displayedPages.length - 1];
  const hasPrevious = spreadStart > 1;
  const hasNext = spreadEnd < issue.pageCount;

  const previous = () => {
    if (!hasPrevious) return;
    if (mobile) onNavigate(Math.max(1, page - 1));
    else if (spreadStart <= 2) onNavigate(1);
    else onNavigate(spreadStart - 2);
  };

  const next = () => {
    if (!hasNext) return;
    if (mobile) onNavigate(Math.min(issue.pageCount, page + 1));
    else if (page === 1) onNavigate(2);
    else onNavigate(Math.min(issue.pageCount, spreadStart + 2));
  };

  useEffect(() => {
    let live = true;
    fetch(assetUrl(issue.links))
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${issue.links}`);
        return response.json() as Promise<LinkMap>;
      })
      .then((data) => {
        if (live) setLinkMap(data);
      })
      .catch(() => {
        if (live) setLinkMap({ sourceAnnotationCount: 0, hotspotCount: 0, pages: {} });
      });
    return () => {
      live = false;
    };
  }, [issue.links]);

  useEffect(() => {
    const upcoming = mobile
      ? [page + 1, page + 2]
      : [spreadEnd + 1, spreadEnd + 2];
    for (const candidate of upcoming) {
      if (candidate <= issue.pageCount) {
        const image = new Image();
        image.src = pageUrl(issue, candidate);
      }
    }
  }, [issue, mobile, page, spreadEnd]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key === "Escape") {
        setContentsOpen(false);
        setZoomPage(null);
        return;
      }
      if (target.matches("input, button, a, select, textarea")) return;
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
      if (event.key === "Home") onNavigate(1);
      if (event.key === "End") onNavigate(issue.pageCount);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  const submitJump = () => {
    const destination = Math.min(
      issue.pageCount,
      Math.max(1, Number(jumpInput.current?.value) || 1),
    );
    onNavigate(destination);
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await readerRef.current?.requestFullscreen();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a, input")) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current) return;
    const dx = event.clientX - pointerStart.current.x;
    const dy = event.clientY - pointerStart.current.y;
    pointerStart.current = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      if (dx < 0) next();
      else previous();
    }
  };

  return (
    <main className="reader-shell" ref={readerRef}>
      <header className="reader-header">
        <button className="reader-wordmark" type="button" onClick={onClose} aria-label={c.back}>VOCES.</button>
        <div className="reader-title">
          <span>{issue.title[language]}</span>
          <small>{issue.year}</small>
        </div>
        <div className="reader-actions">
          <LanguageSwitch language={language} onChange={onLanguageChange} compact />
          <button type="button" onClick={() => setContentsOpen(true)} aria-label={c.contents}>
            <span aria-hidden="true">☰</span><span className="action-label">{c.contents}</span>
          </button>
          <button type="button" onClick={copyLink} aria-label={c.share}>
            <span aria-hidden="true">↗</span><span className="action-label">{copied ? c.copied : c.share}</span>
          </button>
          <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? c.exitFullscreen : c.fullscreen}>
            <span aria-hidden="true">{fullscreen ? "⊙" : "⛶"}</span><span className="action-label">{fullscreen ? c.exitFullscreen : c.fullscreen}</span>
          </button>
          <button className="reader-close" type="button" onClick={onClose} aria-label={c.back}>×</button>
        </div>
      </header>

      <div
        className={`reader-stage${displayedPages.length === 1 ? " single" : " spread"}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <button className="page-arrow previous" type="button" onClick={previous} disabled={!hasPrevious} aria-label={c.previous}>←</button>
        <div className="pages" key={`${mobile ? "mobile" : "desktop"}-${spreadStart}`}>
          {displayedPages.map((visiblePage) => (
            <PageView
              key={visiblePage}
              issue={issue}
              page={visiblePage}
              language={language}
              hotspots={linkMap?.pages[String(visiblePage)] ?? []}
              onNavigate={onNavigate}
              onEnlarge={() => {
                setZoom(1);
                setZoomPage(visiblePage);
              }}
            />
          ))}
        </div>
        <button className="page-arrow next" type="button" onClick={next} disabled={!hasNext} aria-label={c.next}>→</button>
      </div>

      <footer className="reader-controls">
        <p className="page-status" aria-live="polite">
          {c.page} {spreadStart}{spreadEnd !== spreadStart ? `–${spreadEnd}` : ""} <span>/ {issue.pageCount}</span>
        </p>
        <form
          className="page-jump"
          onSubmit={(event) => {
            event.preventDefault();
            submitJump();
          }}
        >
          <label htmlFor="page-jump">{c.goTo}</label>
          <input
            key={page}
            ref={jumpInput}
            id="page-jump"
            type="number"
            min="1"
            max={issue.pageCount}
            defaultValue={page}
          />
          <button type="submit">{c.go}</button>
        </form>
        {!linkMap && <span className="links-loading">{c.loadingLinks}</span>}
        <a className="reader-download" href={issue.downloadUrl}>{c.download} ↓</a>
      </footer>

      {contentsOpen && (
        <div className="drawer-backdrop" role="presentation" onMouseDown={() => setContentsOpen(false)}>
          <aside className="contents-drawer" role="dialog" aria-modal="true" aria-labelledby="contents-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="drawer-heading">
              <div><p>VOCES / {issue.year}</p><h2 id="contents-title">{c.contents}</h2></div>
              <button type="button" onClick={() => setContentsOpen(false)} aria-label={c.close}>×</button>
            </div>
            <ol>
              {issue.sections.map((section) => (
                <li key={`${section.page}-${section.es}`}>
                  <button type="button" onClick={() => { onNavigate(section.page); setContentsOpen(false); }}>
                    <span>{section[language]}</span><strong>{section.page}</strong>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      )}

      {zoomPage !== null && (
        <div className="zoom-backdrop" role="dialog" aria-modal="true" aria-label={`${c.page} ${zoomPage}`}>
          <div className="zoom-toolbar">
            <span>{c.page} {zoomPage}</span>
            <div>
              <button type="button" onClick={() => setZoom((value) => Math.max(0.65, value - 0.15))} aria-label={c.zoomOut}>−</button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(1.75, value + 0.15))} aria-label={c.zoomIn}>＋</button>
              <button type="button" onClick={() => setZoomPage(null)} aria-label={c.close}>×</button>
            </div>
          </div>
          <div className="zoom-scroll">
            <img
              src={pageUrl(issue, zoomPage)}
              alt={`${c.page} ${zoomPage}`}
              style={{ "--zoom": zoom } as CSSProperties}
            />
          </div>
        </div>
      )}
    </main>
  );
}

function PageView({
  issue,
  page,
  language,
  hotspots,
  onNavigate,
  onEnlarge,
}: {
  issue: Issue;
  page: number;
  language: Language;
  hotspots: Hotspot[];
  onNavigate: (page: number) => void;
  onEnlarge: () => void;
}) {
  const c = text[language];

  return (
    <figure className="page-sheet">
      <img
        className="page-image"
        src={pageUrl(issue, page)}
        alt={`${c.page} ${page} — VOCES`}
        draggable="false"
        onDoubleClick={onEnlarge}
      />
      <div className="hotspot-layer">
        {hotspots.map((hotspot) => {
          const [left, top, width, height] = hotspot.rect;
          const style = {
            left: `${left * 100}%`,
            top: `${top * 100}%`,
            width: `${width * 100}%`,
            height: `${height * 100}%`,
          };
          const label = hotspot.label[language];
          if (hotspot.type === "external" && hotspot.url) {
            return (
              <a
                className="page-hotspot"
                href={hotspot.url}
                target="_blank"
                rel="noreferrer"
                style={style}
                aria-label={`${label}. ${c.external}`}
                key={hotspot.id}
              />
            );
          }
          if (hotspot.type === "internal" && hotspot.targetPage) {
            return (
              <button
                className="page-hotspot"
                type="button"
                style={style}
                aria-label={label}
                onClick={() => onNavigate(hotspot.targetPage!)}
                key={hotspot.id}
              />
            );
          }
          return null;
        })}
      </div>
      <button className="page-enlarge" type="button" onClick={onEnlarge} aria-label={`${c.enlarge} ${page}`}>＋</button>
      <figcaption className="visually-hidden">{c.page} {page}</figcaption>
    </figure>
  );
}
