import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "layerling - Easy 3D CAD for 3D printing",
  description: "Easy 3D CAD for 3D printing, right in your browser",
  icons: {
    icon: "assets/layerling/layerling-logo.svg",
    apple: "assets/layerling/layerling-icon.svg",
  },
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
