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
    <article className={cx("flex flex-col overflow-hidden rounded-lg bg-white shadow-[0_1px_2px_rgba(13,17,55,0.06),0_12px_32px_rgba(13,17,55,0.07)]", sketch.wide && "md:col-span-2")}>
      <div className={cx("relative overflow-hidden", original ? "bg-ink" : "notepad")}>
        <div className={cx("relative mx-auto", sketch.wide ? "aspect-[3/2] max-w-2xl" : "aspect-[3/4] max-w-md")}>
          <img
            src={`/sketches/${sketch.slug}.webp`}
            alt={`Pen sketch of the ${sketch.title.toLowerCase()} screen`}
            width={sketch.wide ? 768 : 512}
            height={sketch.wide ? 512 : 768}
            loading="lazy"
            className={cx("absolute inset-0 size-full object-contain p-6 transition-opacity duration-300", original && "opacity-0")}
          />
          <img
            src={`/sketches/original/${sketch.slug}.webp`}
            alt={`Original notepad page for the ${sketch.title.toLowerCase()} screen, with handwritten Korean notes`}
            loading="lazy"
            className={cx("absolute inset-0 size-full object-contain transition-opacity duration-300", !original && "opacity-0")}
          />
        </div>
        <span className="absolute top-4 left-4 flex size-9 items-center justify-center rounded-full bg-navy-950 font-display text-sm font-black text-white">
          {sketch.number}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-navy-900">{sketch.title}</h3>
            <p lang="ko" className="text-sm font-medium text-gold-700">
              {sketch.titleKo}
            </p>
          </div>
          <label htmlFor={id} className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-semibold text-muted">
            Original page
            <Switch.Root
              id={id}
              checked={original}
              onCheckedChange={setOriginal}
              className="relative flex h-6 w-10 rounded-full bg-navy-900/15 p-0.5 transition-colors outline-none data-checked:bg-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
            >
              <Switch.Thumb className="size-5 rounded-full bg-white shadow transition-transform data-checked:translate-x-4" />
            </Switch.Root>
          </label>
        </div>
        <ul className="flex flex-col gap-1.5 text-sm leading-relaxed text-ink/80">
          {sketch.notes.map((n) => (
            <li key={n} className="flex gap-2">
              <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden />
              {n}
            </li>
          ))}
        </ul>
        <Link
          href={sketch.href}
          className="mt-auto inline-flex items-center gap-1.5 self-start pt-2 text-sm font-bold text-gold-700 hover:text-gold-800 hover:underline"
        >
          See it in the prototype <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
