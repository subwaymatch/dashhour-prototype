"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { USER } from "@/lib/data";
import type { Lang } from "@/lib/i18n";
import { useStore, type BranchView } from "./store";
import { cx } from "./ui";

/* ------------------------------------------------------------------ */
/* Static map art: a stylised Gangnam Station neighbourhood.           */
/* Map space is 1000×1000; roads run well past it so the map can be    */
/* cropped to any aspect ratio without showing an edge.                */
/* ------------------------------------------------------------------ */

const GANGNAM = { x: 360, y: 560 };
// Teheran-ro runs east-north-east from Gangnam Station; Gangnam-daero runs roughly north–south.
const TEHERAN = norm(1, -0.27);
const DAERO = norm(0.075, 1);

function norm(x: number, y: number) {
  const l = Math.hypot(x, y);
  return { x: x / l, y: y / l };
}

function lineThrough(p: { x: number; y: number }, d: { x: number; y: number }, len = 2200) {
  return `M${p.x - d.x * len},${p.y - d.y * len}L${p.x + d.x * len},${p.y + d.y * len}`;
}

function offset(p: { x: number; y: number }, d: { x: number; y: number }, k: number) {
  // Move along the normal of d.
  return { x: p.x - d.y * k, y: p.y + d.x * k };
}

const MINOR_ROADS = [
  ...[-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6].map((i) => lineThrough(offset(GANGNAM, TEHERAN, i * 118 + 20), TEHERAN)),
  ...[-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6].map((i) => lineThrough(offset(GANGNAM, DAERO, i * 132 - 30), DAERO)),
];

const SECONDARY_ROADS = [
  lineThrough(offset(GANGNAM, TEHERAN, 286), TEHERAN), // Yeoksam-ro
  lineThrough(offset(GANGNAM, TEHERAN, -330), TEHERAN), // Bongeunsa-ro
  lineThrough(offset(GANGNAM, DAERO, -262), DAERO), // Nonhyeon-ro
  lineThrough(offset(GANGNAM, DAERO, -560), DAERO), // Eonju-ro
];

const ALLEYS = [
  "M120,300 C170,360 150,420 210,470 S260,560 230,640",
  "M60,560 C120,600 140,690 120,780",
  "M470,840 C520,880 600,860 640,930",
  "M760,610 C800,660 860,650 900,720",
  "M520,140 C560,170 600,160 640,210",
];

const PARKS = [
  { x: 540, y: 780, w: 120, h: 70, r: 18 },
  { x: 120, y: 150, w: 110, h: 90, r: 22 },
  { x: 820, y: 690, w: 90, h: 60, r: 16 },
];

const STATIONS = [
  { x: GANGNAM.x, y: GANGNAM.y, name: { en: "Gangnam", ko: "강남" }, lines: ["2", "sb"], label: [16, 32, "start"] },
  {
    x: GANGNAM.x + TEHERAN.x * 340,
    y: GANGNAM.y + TEHERAN.y * 340,
    name: { en: "Yeoksam", ko: "역삼" },
    lines: ["2"],
    label: [0, 36, "middle"],
  },
  {
    x: GANGNAM.x - DAERO.x * 345,
    y: GANGNAM.y - DAERO.y * 345,
    name: { en: "Sinnonhyeon", ko: "신논현" },
    lines: ["sb"],
    label: [-17, 6, "end"],
  },
  { x: GANGNAM.x + TEHERAN.x * 720, y: GANGNAM.y + TEHERAN.y * 720, name: { en: "Seolleung", ko: "선릉" }, lines: ["2"], label: [17, -12, "start"] },
  { x: GANGNAM.x - TEHERAN.x * 400, y: GANGNAM.y - TEHERAN.y * 400, name: { en: "Seocho", ko: "서초" }, lines: ["2"], label: [17, -12, "start"] },
] as const;

const ROAD_LABELS = [
  { x: 610, y: 482, angle: -15.1, text: { en: "TEHERAN-RO", ko: "테헤란로" } },
  { x: 334, y: 760, angle: 85.7, text: { en: "GANGNAM-DAERO", ko: "강남대로" } },
];

function MapArt({ lang, route }: { lang: Lang; route?: string }) {
  return (
    <>
      <rect x="-1500" y="-1500" width="4000" height="4000" fill="var(--color-map-land)" />
      <g fill="var(--color-map-park)">
        {PARKS.map((p) => (
          <rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.r} />
        ))}
      </g>
      <g fill="none" stroke="white" strokeLinecap="round">
        <g stroke="var(--color-map-block)" strokeWidth="14">
          {MINOR_ROADS.map((d) => (
            <path key={d} d={d} />
          ))}
          {ALLEYS.map((d) => (
            <path key={d} d={d} strokeWidth="11" />
          ))}
        </g>
        <g strokeWidth="9">
          {MINOR_ROADS.map((d) => (
            <path key={d} d={d} />
          ))}
          {ALLEYS.map((d) => (
            <path key={d} d={d} strokeWidth="6" />
          ))}
        </g>
        <g stroke="#ddd6c4" strokeWidth="22">
          {SECONDARY_ROADS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g strokeWidth="17">
          {SECONDARY_ROADS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g stroke="#d6cdb6" strokeWidth="36">
          <path d={lineThrough(GANGNAM, TEHERAN)} />
          <path d={lineThrough(GANGNAM, DAERO)} />
        </g>
        <g stroke="#fffdf6" strokeWidth="30">
          <path d={lineThrough(GANGNAM, TEHERAN)} />
          <path d={lineThrough(GANGNAM, DAERO)} />
        </g>
      </g>
      {/* Subway lines run under the two main roads. */}
      <g fill="none" strokeWidth="6" strokeLinecap="round" opacity="0.9">
        <path d={lineThrough(offset(GANGNAM, TEHERAN, 5), TEHERAN)} stroke="var(--color-line-2)" />
        <path d={lineThrough(offset(GANGNAM, DAERO, 5), DAERO)} stroke="var(--color-line-sb)" />
      </g>
      <g fontFamily="var(--font-sans)" fontWeight="700" letterSpacing="3" fontSize="13" fill="#a59c84">
        {ROAD_LABELS.map((r) => (
          <text key={r.text.en} transform={`translate(${r.x} ${r.y}) rotate(${r.angle})`} textAnchor="middle" dy="4.5">
            {r.text[lang]}
          </text>
        ))}
      </g>
      {route && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={route} stroke="white" strokeWidth="11" />
          <path d={route} stroke="var(--color-navy-800)" strokeWidth="5" strokeDasharray="1 10" />
        </g>
      )}
      <g fontFamily="var(--font-sans)">
        {STATIONS.map((s) => (
          <g key={s.name.en} transform={`translate(${s.x} ${s.y})`}>
            <rect x="-11" y="-11" width="22" height="22" rx="11" fill="white" stroke="var(--color-ink)" strokeWidth="2.5" />
            <g>
              {s.lines.map((l, i) => (
                <circle
                  key={l}
                  cx={s.lines.length > 1 ? (i ? 4 : -4) : 0}
                  r="4.5"
                  fill={l === "2" ? "var(--color-line-2)" : "var(--color-line-sb)"}
                />
              ))}
            </g>
            <text
              x={s.label[0]}
              y={s.label[1]}
              textAnchor={s.label[2]}
              fontSize="17"
              fontWeight="800"
              fill="var(--color-ink)"
              stroke="var(--color-map-land)"
              strokeWidth="5"
              paintOrder="stroke"
            >
              {s.name[lang]}
            </text>
          </g>
        ))}
      </g>
    </>
  );
}

/** A walking route that follows the street grid from the user to a branch. */
function routeTo(b: { x: number; y: number }) {
  // Walk along Teheran-ro's direction first, then turn onto a cross street.
  const dx = b.x - USER.x;
  const dy = b.y - USER.y;
  const det = TEHERAN.x * DAERO.y - TEHERAN.y * DAERO.x;
  const a = (dx * DAERO.y - dy * DAERO.x) / det;
  const corner = { x: USER.x + TEHERAN.x * a, y: USER.y + TEHERAN.y * a };
  return `M${USER.x},${USER.y}L${corner.x.toFixed(1)},${corner.y.toFixed(1)}L${b.x},${b.y}`;
}

/* ------------------------------------------------------------------ */
/* Markers                                                             */
/* ------------------------------------------------------------------ */

function Pin({ view, selected, onSelect, lang }: { view: BranchView; selected: boolean; onSelect: () => void; lang: Lang }) {
  const { t } = useStore();
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${view.fullName}, ${view.wait} ${t("min")}, ${t("waitingCount", { n: view.waiting })}`}
      className={cx(
        "group absolute z-10 -translate-x-1/2 -translate-y-full outline-none",
        selected && "z-20",
      )}
      style={{ left: `${view.x / 10}%`, top: `${view.y / 10}%` }}
    >
      <span
        className={cx(
          "relative block origin-bottom transition-transform duration-200",
          selected ? "scale-[1.35]" : "group-hover:scale-110",
        )}
      >
        <svg viewBox="0 0 28 36" className="h-9 w-7 drop-shadow-[0_2px_3px_rgba(13,17,55,0.35)]">
          <path
            d="M14 35s12-11.6 12-21A12 12 0 0 0 2 14c0 9.4 12 21 12 21Z"
            fill={view.favorite || selected ? "var(--color-navy-900)" : "white"}
            stroke="var(--color-navy-900)"
            strokeWidth="2"
          />
        </svg>
        <span
          className={cx(
            "absolute inset-x-0 top-[5px] flex justify-center text-[13px] leading-[18px] font-black",
            view.favorite || selected ? "text-white" : "text-navy-900",
          )}
        >
          {view.favorite ? <Star className="size-[15px] fill-gold-500 text-gold-500" aria-hidden /> : view.rank}
        </span>
      </span>
      <span
        className={cx(
          "pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap shadow-sm transition-opacity",
          selected
            ? "bg-navy-900 text-white opacity-100"
            : "bg-white text-navy-900 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
        )}
        lang={lang}
      >
        {view.wait} {t("min")}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Full, pannable map                                                  */
/* ------------------------------------------------------------------ */

export function CityMap({ className, minSize = 680 }: { className?: string; minSize?: number }) {
  const { views, selected, select, lang, t, ticketBranch } = useStore();
  const scroller = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);

  // Keep the selected branch in view.
  React.useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const size = el.scrollWidth;
    el.scrollTo({
      left: (selected.x / 1000) * size - el.clientWidth / 2,
      top: (selected.y / 1000) * el.scrollHeight - el.clientHeight * 0.42,
      behavior: drag.current === null && el.dataset.ready ? "smooth" : "auto",
    });
    el.dataset.ready = "1";
  }, [selected.id, selected.x, selected.y]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = scroller.current!;
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    d.moved = true;
    scroller.current!.scrollLeft = d.left - dx;
    scroller.current!.scrollTop = d.top - dy;
  };
  const endDrag = () => {
    // Let the click that ends a drag see `moved` before clearing it.
    window.setTimeout(() => (drag.current = null), 0);
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current?.moved) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div
      ref={scroller}
      role="region"
      aria-label={t("mapLabel")}
      className={cx(
        "relative h-full w-full overflow-auto overscroll-contain bg-map-land [container-type:size] [scrollbar-width:none] select-none",
        "cursor-grab active:cursor-grabbing",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={onClickCapture}
    >
      <div className="relative aspect-square" style={{ width: `max(100cqw, 100cqh, ${minSize}px)` }}>
        <svg viewBox="0 0 1000 1000" className="absolute inset-0 size-full" aria-hidden>
          <MapArt lang={lang} route={ticketBranch ? routeTo(ticketBranch) : undefined} />
        </svg>
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${USER.x / 10}%`, top: `${USER.y / 10}%` }}
          aria-label={t("you")}
          role="img"
        >
          <span className="absolute inset-0 rounded-full bg-sky-500 animate-pulse-ring" />
          <span className="relative block size-4 rounded-full border-[3px] border-white bg-sky-500 shadow-md" />
        </div>
        {views.map((v) => (
          <Pin key={v.id} view={v} lang={lang} selected={v.id === selected.id} onSelect={() => select(v.id)} />
        ))}
      </div>
    </div>
  );
}

/** A small, non-interactive crop of the map centred on one branch (sketch ④). */
export function MiniMap({ branch, className }: { branch: BranchView; className?: string }) {
  const { lang } = useStore();
  const w = 520;
  const h = 230;
  const cx0 = (branch.x + USER.x) / 2;
  const cy0 = (branch.y + USER.y) / 2;
  return (
    <svg
      viewBox={`${cx0 - w / 2} ${cy0 - h / 2} ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      className={cx("block w-full", className)}
      aria-hidden
    >
      <MapArt lang={lang} route={routeTo(branch)} />
      <circle cx={USER.x} cy={USER.y} r="9" fill="rgb(14 165 233)" stroke="white" strokeWidth="4" />
      <g transform={`translate(${branch.x - 14} ${branch.y - 36})`}>
        <path d="M14 35s12-11.6 12-21A12 12 0 0 0 2 14c0 9.4 12 21 12 21Z" fill="var(--color-navy-900)" stroke="white" strokeWidth="2" />
        <circle cx="14" cy="14" r="4.5" fill="var(--color-gold-500)" />
      </g>
    </svg>
  );
}
