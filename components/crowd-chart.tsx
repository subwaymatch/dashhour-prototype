"use client";

import { CLOSE_MIN, OPEN_MIN, crowdAt, type Branch } from "@/lib/data";
import { dayMinute, formatClock } from "@/lib/sim";
import { useStore } from "./store";

const W = 340;
const H = 132;
const PAD = { top: 18, right: 12, bottom: 28, left: 12 };

function xFor(minute: number) {
  return PAD.left + ((minute - OPEN_MIN) / (CLOSE_MIN - OPEN_MIN)) * (W - PAD.left - PAD.right);
}

function yFor(level: number) {
  return PAD.top + (1 - level) * (H - PAD.top - PAD.bottom);
}

/** Hour-by-hour crowd curve with a marker for the current demo time, after sketch ④. */
export function CrowdChart({ branch }: { branch: Branch }) {
  const { sim, t } = useStore();
  const now = dayMinute(sim);

  const points: Array<[number, number]> = [];
  for (let m = OPEN_MIN; m <= CLOSE_MIN; m += 10) points.push([xFor(m), yFor(crowdAt(branch, m))]);
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  const area = `${line}L${xFor(CLOSE_MIN)},${H - PAD.bottom}L${xFor(OPEN_MIN)},${H - PAD.bottom}Z`;

  const nx = xFor(now);
  const ny = yFor(crowdAt(branch, now));
  const labelX = Math.min(Math.max(nx, 40), W - 40);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full overflow-visible"
      role="img"
      aria-label={`${t("crowd")}: ${t("now")} ${formatClock(sim)}`}
    >
      <defs>
        <linearGradient id={`crowd-fill-${branch.id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-gold-500)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--color-gold-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((l) => (
        <line key={l} x1={PAD.left} x2={W - PAD.right} y1={yFor(l)} y2={yFor(l)} stroke="var(--color-navy-900)" strokeOpacity="0.07" />
      ))}
      <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke="var(--color-navy-900)" strokeOpacity="0.25" />
      <path d={area} fill={`url(#crowd-fill-${branch.id})`} />
      <path d={line} fill="none" stroke="var(--color-gold-500)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {[9, 12, 15]
        .filter((h) => Math.abs(xFor(h * 60) - labelX) > 56)
        .map((h) => (
          <text key={h} x={xFor(h * 60)} y={H - 12} textAnchor="middle" fontSize="10" fill="var(--color-muted)">
            {`${h}:00`}
          </text>
        ))}
      <line x1={nx} x2={nx} y1={PAD.top - 6} y2={H - PAD.bottom} stroke="var(--color-navy-900)" strokeWidth="1.5" />
      <circle cx={nx} cy={PAD.top - 6} r="3.5" fill="var(--color-navy-900)" />
      <circle cx={nx} cy={ny} r="4.5" fill="white" stroke="var(--color-navy-900)" strokeWidth="2" />
      <g transform={`translate(${labelX} ${H - PAD.bottom + 4})`}>
        <rect x="-30" y="0" width="60" height="16" rx="8" fill="var(--color-navy-900)" />
        <text y="11.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="white" className="tabular">
          {formatClock(sim)}
        </text>
      </g>
    </svg>
  );
}
