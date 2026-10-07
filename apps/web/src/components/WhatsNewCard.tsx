"use client";

import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import { GuideHelpLink } from "@/components/GuideHelpLink";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/useLanguage";
import type { WhatsNewView } from "@/lib/useWhatsNew";
import type { WhatsNewEntry } from "@/lib/whatsNew";

/** The versions with their highlights, in the interface language. */
export function WhatsNewList({ entries }: { entries: readonly WhatsNewEntry[] }) {
  const language = useLanguage();
  return (
    <>
      {entries.map((entry) => (
        <section className="whats-new-version" key={entry.version}>
          <h2>{t("whatsNew.version", { version: entry.version })}</h2>
          <ul>
            {entry.items.map((item) => (
              <li key={item.title.en}>
                <strong>{item.title[language]}</strong>
                <span>{item.body[language]}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

/**
 * What came with the versions since the last visit, on the start page. The
 * newest version is open; older ones wait behind one button so a long absence
 * does not turn the card into a wall of text. Closing it remembers the current
 * version, so it does not come back until the next update.
 */
export function WhatsNewCard({ view, current, onClose }: { view: WhatsNewView; current: string; onClose: () => void }) {
  useLanguage();
  const [showOlder, setShowOlder] = useState(false);
  const [newest, ...older] = view.entries;
  const visible = showOlder ? view.entries : [newest];
  const title = view.from
    ? t("whatsNew.title", { from: view.from, to: current })
    : t("whatsNew.titleRecent");

  return (
    <aside className="whats-new" role="region" aria-label={title}>
      <header className="whats-new-header">
        <span className="whats-new-icon" aria-hidden="true">
          <Sparkles size={20} strokeWidth={2.4} />
        </span>
        <strong>{title}</strong>
        <GuideHelpLink section="whatsNew" />
        <button className="whats-new-close" type="button" aria-label={t("whatsNew.close")} title={t("whatsNew.close")} onClick={onClose}>
          <X size={16} />
        </button>
      </header>
      <div className="whats-new-body">
        <WhatsNewList entries={visible} />
      </div>
      <footer className="whats-new-footer">
        {older.length > 0 && !showOlder ? (
          <button className="whats-new-older" type="button" onClick={() => setShowOlder(true)}>
            {t("whatsNew.older", { count: older.length })}
          </button>
        ) : null}
        <button className="whats-new-done" type="button" onClick={onClose}>
          {t("whatsNew.dismiss")}
        </button>
      </footer>
    </aside>
  );
}
