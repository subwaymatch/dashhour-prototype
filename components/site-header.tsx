"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { LogoMark } from "./logo";

const LANGS: Array<[Lang, string]> = [
  ["en", "EN"],
  ["ko", "한국어"],
];

/** Header for the pages outside the app shell (About and the sketch story). */
export function SiteHeader({
  lang,
  setLang,
  link,
  cta,
}: {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** The other page outside the app. */
  link: { href: string; label: string };
  cta: string;
}) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" aria-label="Dash Hour" className="site-header-logo">
          <LogoMark className="site-header-logo-mark" />
        </Link>
        <div className="site-header-space" />
        <Link href={link.href} className="site-header-link">
          {link.label}
        </Link>
        <div
          role="group"
          aria-label={lang === "ko" ? "언어" : "Language"}
          className="site-lang"
        >
          {LANGS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              lang={value}
              aria-pressed={lang === value}
              onClick={() => setLang(value)}
              className="site-lang-button"
            >
              {label}
            </button>
          ))}
        </div>
        <Link href="/" className="site-header-cta">
          {cta} <ArrowRight className="site-header-cta-icon" aria-hidden />
        </Link>
      </div>
    </header>
  );
}
