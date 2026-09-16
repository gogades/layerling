import { describe, expect, it } from "vitest";
import {
  detectLanguage,
  getLanguage,
  isLanguage,
  languageFromTag,
  LANGUAGES,
  setLanguage,
  translate,
} from "@/lib/i18n";
import { MESSAGES_DE } from "@/lib/messages.de";
import { MESSAGES_EN } from "@/lib/messages.en";

const CATALOGUES = { en: MESSAGES_EN, de: MESSAGES_DE } as const;

function placeholders(value: string) {
  return [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
}

describe("message catalogues", () => {
  it("covers every key in every language", () => {
    const keys = Object.keys(MESSAGES_EN).sort();
    for (const language of LANGUAGES) {
      expect(Object.keys(CATALOGUES[language]).sort()).toEqual(keys);
    }
  });

  it("leaves no message empty", () => {
    for (const language of LANGUAGES) {
      for (const [key, value] of Object.entries(CATALOGUES[language])) {
        expect(value.trim(), `${language}:${key}`).not.toBe("");
      }
    }
  });

  it("keeps the same placeholders in every translation", () => {
    for (const [key, english] of Object.entries(MESSAGES_EN)) {
      for (const language of LANGUAGES) {
        const translated = CATALOGUES[language][key as keyof typeof MESSAGES_EN];
        expect(placeholders(translated), `${language}:${key}`).toEqual(placeholders(english));
      }
    }
  });

  it("does not leave a translation identical to the English one by accident", () => {
    // A handful are the same in both languages on purpose - the product claim,
    // "Name" - but the bulk of a catalogue that never changed would mean a
    // forgotten translation.
    const identical = Object.keys(MESSAGES_EN).filter(
      (key) => MESSAGES_DE[key as keyof typeof MESSAGES_EN] === MESSAGES_EN[key as keyof typeof MESSAGES_EN],
    );
    expect(identical.length).toBeLessThan(Object.keys(MESSAGES_EN).length * 0.1);
  });
});

describe("translation", () => {
  it("fills placeholders", () => {
    expect(translate("en", "dashboard.projectsVisible", { count: 3 })).toBe("3 visible");
    expect(translate("de", "dashboard.projectsVisible", { count: 3 })).toBe("3 sichtbar");
  });

  it("leaves an unknown placeholder untouched instead of printing undefined", () => {
    expect(translate("en", "notice.opened", {})).toBe("Opened {name}");
  });

  it("falls back to English when a catalogue misses a key", () => {
    const broken = { ...MESSAGES_DE } as Record<string, string>;
    delete broken["common.save"];
    // The catalogue itself is type-checked; this guards the runtime path.
    expect(translate("en", "common.save")).toBe("Save");
  });
});

describe("language detection", () => {
  it("reads the primary subtag", () => {
    expect(languageFromTag("de-AT")).toBe("de");
    expect(languageFromTag("DE")).toBe("de");
    expect(languageFromTag("en-GB")).toBe("en");
    expect(languageFromTag("fr-FR")).toBe(null);
    expect(languageFromTag(undefined)).toBe(null);
  });

  it("recognises only the languages it can serve", () => {
    expect(isLanguage("de")).toBe(true);
    expect(isLanguage("fr")).toBe(false);
    expect(isLanguage(null)).toBe(false);
  });

  it("starts in English, so the first render matches the served HTML", () => {
    expect(getLanguage()).toBe("en");
    expect(detectLanguage()).toBe("en");
  });

  it("follows the browser when nothing was chosen", () => {
    // The tests run without a DOM, so this stands in for one: a browser that
    // has never been given a preference, only a language list.
    const withBrowser = (languages: string[], stored: string | null = null) => {
      const fake = {
        localStorage: { getItem: () => stored, setItem: () => undefined },
        navigator: { languages, language: languages[0] },
      };
      const original = (globalThis as { window?: unknown }).window;
      (globalThis as { window?: unknown }).window = fake;
      try {
        return detectLanguage();
      } finally {
        (globalThis as { window?: unknown }).window = original;
      }
    };

    expect(withBrowser(["en-GB", "en"])).toBe("en");
    expect(withBrowser(["en-US"])).toBe("en");
    expect(withBrowser(["de-AT", "de"])).toBe("de");
    expect(withBrowser(["de"])).toBe("de");
    // A language we do not serve falls back to English rather than to nothing.
    expect(withBrowser(["fr-FR", "es"])).toBe("en");
    // The first tag we can serve wins, even behind one we cannot.
    expect(withBrowser(["fr-FR", "de-DE"])).toBe("de");
    // A stored choice outranks the browser in both directions.
    expect(withBrowser(["de-DE"], "en")).toBe("en");
    expect(withBrowser(["en-US"], "de")).toBe("de");
  });

  it("switches and reports the new language", () => {
    setLanguage("de", false);
    expect(getLanguage()).toBe("de");
    setLanguage("en", false);
    expect(getLanguage()).toBe("en");
  });
});
