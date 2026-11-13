"use client";

import * as React from "react";
import Link from "next/link";
import { Switch } from "@base-ui/react/switch";
import { ArrowRight } from "lucide-react";
import { useReveal } from "./motion";
import { cx } from "./ui";

export type Sketch = {
  slug: string;
  number: number;
  title: string;
  titleKo: string;
  notes: string[];
  href: string;
  /** Landscape sketch (3:2) instead of portrait (3:4). */
  wide?: boolean;
  /** Spans both grid columns with the notes beside the sketch. */
  row?: boolean;
};

export function SketchCard({ sketch }: { sketch: Sketch }) {
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
            alt={`Pen sketch of the ${sketch.title.toLowerCase()} screen`}
            width={sketch.wide ? 768 : 512}
            height={sketch.wide ? 512 : 768}
            loading="lazy"
            className={cx("sketch-img-redrawn", original && "sketch-img-hidden")}
          />
          <img
            src={`/sketches/original/${sketch.slug}.webp`}
            alt={`Original notepad page for the ${sketch.title.toLowerCase()} screen, with handwritten Korean notes`}
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
            <p className="sketch-step">Sketch {sketch.number}</p>
            <h3 className="sketch-title">
              {sketch.title}
              <span lang="ko" className="sketch-title-ko">
                {sketch.titleKo}
              </span>
            </h3>
          </div>
          <label htmlFor={id} className="sketch-toggle">
            Original page
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
          {sketch.notes.map((n) => (
            <li key={n} className="sketch-note">
              <span className="sketch-note-dot" aria-hidden />
              {n}
            </li>
          ))}
        </ul>
        <Link href={sketch.href} className="sketch-link">
          See it in the prototype{" "}
          <ArrowRight className="sketch-link-arrow" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
