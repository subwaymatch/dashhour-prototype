"use client";

import * as React from "react";
import Link from "next/link";
import { Switch } from "@base-ui/react/switch";
import { ArrowRight } from "lucide-react";
import { cx } from "./ui";

export type Sketch = {
  slug: string;
  number: number;
  title: string;
  titleKo: string;
  notes: string[];
  href: string;
  wide?: boolean;
};

export function SketchCard({ sketch }: { sketch: Sketch }) {
  const [original, setOriginal] = React.useState(false);
  const id = React.useId();
  return (
    <article
      className={cx(
        "sketch-card-article",
        sketch.wide && "sketch-card-article-2",
      )}
    >
      <div
        className={cx(
          "sketch-card-div",
          original ? "sketch-card-div-2" : "sketch-card-div-3",
        )}
      >
        <div
          className={cx(
            "sketch-card-div-4",
            sketch.wide ? "sketch-card-div-5" : "sketch-card-div-6",
          )}
        >
          <img
            src={`/sketches/${sketch.slug}.webp`}
            alt={`Pen sketch of the ${sketch.title.toLowerCase()} screen`}
            width={sketch.wide ? 768 : 512}
            height={sketch.wide ? 512 : 768}
            loading="lazy"
            className={cx("sketch-card-img", original && "sketch-card-img-2")}
          />
          <img
            src={`/sketches/original/${sketch.slug}.webp`}
            alt={`Original notepad page for the ${sketch.title.toLowerCase()} screen, with handwritten Korean notes`}
            loading="lazy"
            className={cx(
              "sketch-card-img-3",
              !original && "sketch-card-img-2",
            )}
          />
        </div>
        <span className="sketch-card-span">{sketch.number}</span>
      </div>
      <div className="sketch-card-div-7">
        <div className="sketch-card-div-8">
          <div>
            <h3 className="sketch-card-h3">{sketch.title}</h3>
            <p lang="ko" className="sketch-card-p">
              {sketch.titleKo}
            </p>
          </div>
          <label htmlFor={id} className="sketch-card-label">
            Original page
            <Switch.Root
              id={id}
              checked={original}
              onCheckedChange={setOriginal}
              className="sketch-card-switch-root"
            >
              <Switch.Thumb className="sketch-card-switch-thumb" />
            </Switch.Root>
          </label>
        </div>
        <ul className="sketch-card-ul">
          {sketch.notes.map((n) => (
            <li key={n} className="sketch-card-li">
              <span className="sketch-card-span-2" aria-hidden />
              {n}
            </li>
          ))}
        </ul>
        <Link href={sketch.href} className="sketch-card-link">
          See it in the prototype{" "}
          <ArrowRight className="sketch-card-arrow-right" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
