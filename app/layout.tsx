import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://balpomorelitm.github.io/voces-hku/"),
  title: "VOCES — Fanzine estudiantil de español de HKU",
  description:
    "La revista estudiantil de español de HKU: lengua, cultura y creatividad en una nueva edición cada semestre.",
  icons: {
    icon: "./favicon.png",
    shortcut: "./favicon.png",
  },
  openGraph: {
    title: "VOCES — Fanzine estudiantil de español de HKU",
    description:
      "Lee VOCES en línea: la revista creada por estudiantes de español de HKU.",
    type: "website",
    locale: "es_ES",
    alternateLocale: "en_GB",
    images: [
      {
        url: "./og.png",
        width: 1536,
        height: 1024,
        alt: "VOCES, fanzine estudiantil de español de HKU",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VOCES — HKU Spanish Students' Fanzine",
    description: "Language, culture and creativity made by HKU students.",
    images: ["./og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
