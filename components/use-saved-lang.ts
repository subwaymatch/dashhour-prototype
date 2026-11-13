"use client";

import * as React from "react";
import type { Lang } from "@/lib/i18n";
import { STORAGE_KEY } from "@/lib/storage";

/**
 * The app's saved language, for pages outside the app shell. Starts in Korean so the
 * prerendered HTML matches the first client render, then follows what the app saved.
 */
export function useSavedLang(): [Lang, (lang: Lang) => void] {
  const [lang, setLangState] = React.useState<Lang>("ko");

  React.useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved.lang === "en" || saved.lang === "ko") setLangState(saved.lang);
    } catch {
      // Storage unavailable: stay in Korean.
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = React.useCallback((next: Lang) => {
    setLangState(next);
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, lang: next }));
    } catch {
      // Storage unavailable: the choice lasts for this visit.
    }
  }, []);

  return [lang, setLang];
}
