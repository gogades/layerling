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

// German readers are already gathered in the drucktipps3d forum this project
// grew out of; everyone else is pointed at GitHub Discussions instead, since
// a German forum means nothing to them.
const FORUM_URL = "https://forum.drucktipps3d.de/forum/board/127-layerling/";

function communityUrl(language: Language) {
  return language === "de" ? FORUM_URL : `${SOURCE_CODE_URL.replace(/\/+$/, "")}/discussions`;
}

// Whoever operates a layerling installation may be required to publish a legal
// notice - in Germany every business site needs an Impressum. The pages differ
// per operator and are not part of this project, so they are linked through
// build-time variables and the links disappear when nothing is configured. An
// operator-supplied label wins outright, in whichever language they wrote it;
// only the built-in fallback follows the reader's own language.
const LEGAL_LINK_SOURCES = [
  {
    url: process.env.NEXT_PUBLIC_IMPRINT_URL,
    label: process.env.NEXT_PUBLIC_IMPRINT_LABEL,
    fallbackLabel: { de: "Impressum", en: "Imprint" },
  },
  {
    url: process.env.NEXT_PUBLIC_PRIVACY_URL,
    label: process.env.NEXT_PUBLIC_PRIVACY_LABEL,
    fallbackLabel: { de: "Datenschutz", en: "Privacy Policy" },
  },
] as const;

function legalLinks(language: Language) {
  return LEGAL_LINK_SOURCES.map((link) => ({
    href: link.url?.trim() ?? "",
    label: link.label?.trim() || link.fallbackLabel[language],
  })).filter((link) => link.href.length > 0);
}

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
export function AppFooter({ variant = "dashboard", version }: { variant?: "dashboard" | "editor"; version: string }) {
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
          <a href={communityUrl(language)} target="_blank" rel="noreferrer" key="community">
            {t("dashboard.forum")}
          </a>,
          ...legalLinks(language).map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          )),
        ])}
      </div>
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
