import type { Metadata, Viewport } from "next";
import "./globals.css";

const NAME = "layerling";
const TITLE = "layerling - Easy 3D CAD for 3D printing";
const DESCRIPTION = "Easy 3D CAD for 3D printing, right in your browser";
const SOCIAL_CARD = "/assets/layerling/layerling-social.png";

export const metadata: Metadata = {
  // Damit die Bilder fuer Linkvorschauen als volle Adresse im Kopf stehen -
  // relative Angaben liest kein Forum und kein Messenger aus.
  metadataBase: new URL("https://layerling.com"),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: NAME,
  manifest: "/manifest.webmanifest",
  icons: {
    // Das SVG ist das eigentliche Symbol; die .ico steht daneben fuer alles,
    // was stur /favicon.ico abholt, statt in den Kopf zu sehen.
    icon: [
      { url: "/assets/layerling/layerling-logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    // iOS nimmt hier ausschliesslich PNG. Stand da ein SVG, legte
    // "Zum Home-Bildschirm" einen Schnappschuss der Seite ab statt des Symbols.
    apple: { url: "/assets/layerling/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  openGraph: {
    type: "website",
    siteName: NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    locale: "en",
    images: [{ url: SOCIAL_CARD, width: 1280, height: 640, type: "image/png", alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SOCIAL_CARD],
  },
};

export const viewport: Viewport = {
  // Faerbt die Leiste des Browsers und, wenn layerling als App laeuft, deren
  // Titelzeile. Die Werte sind die der Werkzeugleiste, hell wie dunkel.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#2b2116" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
