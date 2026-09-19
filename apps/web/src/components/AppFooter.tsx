"use client";

import { Heart } from "lucide-react";
import type { ReactNode } from "react";
import { t, type Language } from "@/lib/i18n";
import { useLanguage } from "@/lib/useLanguage";

export const SOURCE_CODE_URL =
  process.env.NEXT_PUBLIC_SOURCE_CODE_URL?.trim() || "https://github.com/henmedia/layerling";

/** Der Verweis in der Fußzeile zeigt auf die Anleitung in der gewählten Sprache. */
function readmeUrl(language: Language) {
  return `${SOURCE_CODE_URL.replace(/\/+$/, "")}/blob/main/${language === "de" ? "README.de.md" : "README.md"}`;
}

// The release list rather than the tag of this build: a fork that never
// publishes a release still lands on a page that exists, and readers see what
// came after the version they are running.
function releaseNotesUrl() {
  return `${SOURCE_CODE_URL.replace(/\/+$/, "")}/releases`;
}

// Whoever operates a layerling installation may be required to publish a legal
// notice - in Germany every business site needs an Impressum. The pages differ
// per operator and are not part of this project, so they are linked through
// build-time variables and the links disappear when nothing is configured.
export const LEGAL_LINKS = ([
  { url: process.env.NEXT_PUBLIC_IMPRINT_URL, label: process.env.NEXT_PUBLIC_IMPRINT_LABEL, fallbackLabel: "Impressum" },
  { url: process.env.NEXT_PUBLIC_PRIVACY_URL, label: process.env.NEXT_PUBLIC_PRIVACY_LABEL, fallbackLabel: "Datenschutz" },
] as const)
  .map((link) => ({ href: link.url?.trim() ?? "", label: link.label?.trim() || link.fallbackLabel }))
  .filter((link) => link.href.length > 0);

// Whoever runs an installation may want to ask for support. The address is
// theirs, not the project's, so it comes from a build-time variable just like
// the legal pages - without one the button does not appear at all.
const SPONSOR_LINK = (() => {
  const href = process.env.NEXT_PUBLIC_SPONSOR_URL?.trim();
  if (!href) return null;
  return { href, label: process.env.NEXT_PUBLIC_SPONSOR_LABEL?.trim() || "" };
})();

// The footer reads as two halves: what this installation is on the left, where
// the project lives on the right. Middle dots separate the parts and sit in
// their own spans, so they are neither clickable nor read aloud. Entries that
// are not configured drop out without leaving a stray dot behind.
function joinWithDots(items: ReactNode[]) {
  return items
    .filter(Boolean)
    .flatMap((item, index) =>
      index === 0
        ? [item]
        : [
            <span className="dashboard-legal-dot" aria-hidden="true" key={`dot-${index}`}>
              &middot;
            </span>,
            item,
          ],
    );
}

/**
 * Dieselbe Zeile auf der Startseite und unter dem Arbeitsbereich. Im Editor
 * liegt sie als schmales Band am unteren Rand, deshalb bekommt sie dort eine
 * zweite Klasse statt einer eigenen Kopie des Markups.
 */
export function AppFooter({
  variant = "dashboard",
  version,
  status,
}: {
  variant?: "dashboard" | "editor";
  version: string;
  /** Die Statuszeile des Editors. Auf der Startseite gibt es nichts zu melden. */
  status?: string;
}) {
  const language = useLanguage();
  return (
    <footer className={variant === "editor" ? "dashboard-legal editor-legal" : "dashboard-legal"}>
      <div className="dashboard-legal-group">
        {joinWithDots([
          SPONSOR_LINK ? (
            <a
              className="dashboard-legal-sponsor"
              href={SPONSOR_LINK.href}
              target="_blank"
              rel="noreferrer"
              key="sponsor"
            >
              <Heart size={13} aria-hidden="true" />
              {SPONSOR_LINK.label || t("dashboard.sponsor")}
            </a>
          ) : null,
          ...LEGAL_LINKS.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          )),
        ])}
      </div>
      {variant === "editor" && status ? (
        // Nimmt den Platz, der zwischen den Verweisen uebrig bleibt, und kuerzt
        // sich selbst - schieben darf sie nichts.
        <p className="editor-status" role="status" aria-live="polite">{status}</p>
      ) : null}
      <div className="dashboard-legal-group">
        {joinWithDots([
          <a href={readmeUrl(language)} target="_blank" rel="noreferrer" key="readme">
            {t("dashboard.projectOnGitHub")}
          </a>,
          <a href={releaseNotesUrl()} target="_blank" rel="noreferrer" key="releases">
            {t("dashboard.releaseNotes")}
          </a>,
          <span className="dashboard-legal-version" key="version">
            {t("dashboard.version", { version })}
          </span>,
        ])}
      </div>
    </footer>
  );
}
