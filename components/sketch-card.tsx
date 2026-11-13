"use client";

import * as React from "react";
import Link from "next/link";
import { Switch } from "@base-ui/react/switch";
import { ArrowRight } from "lucide-react";
import type { Lang, Localized } from "@/lib/i18n";
import { useReveal } from "./motion";
import { cx } from "./ui";

export type Sketch = {
  slug: string;
  number: number;
  /** The Korean title is the one written on the notepad page. */
  title: Localized;
  notes: Record<Lang, string[]>;
  href: string;
  /** Landscape sketch (3:2) instead of portrait (3:4). */
  wide?: boolean;
  /** Spans both grid columns with the notes beside the sketch. */
  row?: boolean;
};

const LABELS = {
  en: {
    step: (n: number) => `Sketch ${n}`,
    redrawn: (title: string) => `Pen sketch of the ${title.toLowerCase()} screen`,
    original: (title: string) =>
      `Original notepad page for the ${title.toLowerCase()} screen, with handwritten Korean notes`,
    toggle: "Original page",
    link: "See it in the prototype",
  },
  ko: {
    step: (n: number) => `스케치 ${n}`,
    redrawn: (title: string) => `${title} 펜 스케치`,
    original: (title: string) => `${title} 노트 원본, 손글씨 메모 포함`,
    toggle: "원본 보기",
    link: "프로토타입에서 보기",
  },
};

export function SketchCard({ sketch, lang }: { sketch: Sketch; lang: Lang }) {
  const l = LABELS[lang];
  const title = sketch.title[lang];
  const [original, setOriginal] = React.useState(false);
  const id = React.useId();
  const ref = useReveal<HTMLElement>();
  return (
    <article
      ref={ref}
      className={cx(
        "sketch reveal",
        sketch.wide && "sketch-wide",
        sketch.row && "sketch-row",
      )}
    >
      <div
        className={cx(
          "sketch-frame",
          original ? "sketch-frame-original" : "sketch-frame-paper",
        )}
      >
        <div
          className={cx(
            "sketch-media",
            sketch.wide ? "sketch-media-wide" : "sketch-media-tall",
          )}
        >
          <img
            src={`/sketches/${sketch.slug}.webp`}
            alt={l.redrawn(title)}
            width={sketch.wide ? 768 : 512}
            height={sketch.wide ? 512 : 768}
            loading="lazy"
            className={cx("sketch-img-redrawn", original && "sketch-img-hidden")}
          />
          <img
            src={`/sketches/original/${sketch.slug}.webp`}
            alt={l.original(title)}
            loading="lazy"
            className={cx(
              "sketch-img-original",
              !original && "sketch-img-hidden",
            )}
          />
        </div>
      </div>
      <div className="sketch-body">
        <div className="sketch-heading">
          <div>
            <p className="sketch-step">{l.step(sketch.number)}</p>
            <h3 className="sketch-title">
              {title}
              {lang === "en" && (
                <span lang="ko" className="sketch-title-ko">
                  {sketch.title.ko}
                </span>
              )}
            </h3>
          </div>
          <label htmlFor={id} className="sketch-toggle">
            {l.toggle}
            <Switch.Root
              id={id}
              checked={original}
              onCheckedChange={setOriginal}
              className="sketch-switch"
            >
              <Switch.Thumb className="sketch-switch-thumb" />
            </Switch.Root>
          </label>
        </div>
        <ul className="sketch-notes">
          {sketch.notes[lang].map((n) => (
            <li key={n} className="sketch-note">
              <span className="sketch-note-dot" aria-hidden />
              {n}
            </li>
          ))}
        </ul>
        <Link href={sketch.href} className="sketch-link">
          {l.link}{" "}
          <ArrowRight className="sketch-link-arrow" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
