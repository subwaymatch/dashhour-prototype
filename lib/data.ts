import type { Localized } from "./i18n";

export type BankKey = "shinhan" | "woori" | "hana" | "kb" | "ibk" | "nh" | "citi" | "sc" | "mg";

export const BANKS: Record<BankKey, Localized> = {
  shinhan: { en: "Shinhan Bank", ko: "신한은행" },
  woori: { en: "Woori Bank", ko: "우리은행" },
  hana: { en: "Hana Bank", ko: "하나은행" },
  kb: { en: "KB Kookmin", ko: "KB국민은행" },
  ibk: { en: "IBK", ko: "IBK기업은행" },
  nh: { en: "NongHyup", ko: "NH농협은행" },
  citi: { en: "Citibank", ko: "씨티은행" },
  sc: { en: "SC First", ko: "SC제일은행" },
  mg: { en: "MG Saemaeul", ko: "새마을금고" },
};

export type Branch = {
  id: string;
  bank: BankKey;
  name: Localized;
  /** Position on the 1000×1000 city map. */
  x: number;
  y: number;
  /** Average minutes a teller spends per customer. */
  rate: number;
  /** Queue length at the busiest time of day. */
  capacity: number;
  /** Shifts this branch's rush hours, in minutes. */
  phase: number;
  /** Ticket number being served when the bank opened. */
  counterBase: number;
  /** The nearest transit stop and line, for the route summary. */
  via: Localized;
};

/** Where the person using the app is standing. */
export const USER = { x: 520, y: 600 };

/** Map units → metres. */
const METRES_PER_UNIT = 3.4;

export const BRANCHES: Branch[] = [
  {
    id: "shinhan-gangnam",
    bank: "shinhan",
    name: { en: "Gangnam Station", ko: "강남역점" },
    x: 392,
    y: 512,
    rate: 2.1,
    capacity: 14,
    phase: 0,
    counterBase: 104,
    via: { en: "Gangnam Stn. Exit 11", ko: "강남역 11번 출구" },
  },
  {
    id: "woori-gangnam",
    bank: "woori",
    name: { en: "Gangnam Station", ko: "강남역점" },
    x: 286,
    y: 628,
    rate: 2.6,
    capacity: 10,
    phase: 25,
    counterBase: 211,
    via: { en: "Gangnam Stn. Exit 9", ko: "강남역 9번 출구" },
  },
  {
    id: "hana-gangnamdaero",
    bank: "hana",
    name: { en: "Gangnam-daero", ko: "강남대로점" },
    x: 352,
    y: 352,
    rate: 2.4,
    capacity: 13,
    phase: -20,
    counterBase: 318,
    via: { en: "Bus 140 · Gangnam-daero", ko: "140번 버스 · 강남대로" },
  },
  {
    id: "mg-gangnam",
    bank: "mg",
    name: { en: "Gangnam", ko: "강남점" },
    x: 222,
    y: 470,
    rate: 3.4,
    capacity: 12,
    phase: 40,
    counterBase: 57,
    via: { en: "Seocho-daero", ko: "서초대로" },
  },
  {
    id: "kb-yeoksam",
    bank: "kb",
    name: { en: "Yeoksam Station", ko: "역삼역점" },
    x: 718,
    y: 418,
    rate: 1.8,
    capacity: 18,
    phase: -35,
    counterBase: 402,
    via: { en: "Line 2 · Yeoksam Stn.", ko: "2호선 · 역삼역" },
  },
  {
    id: "ibk-teheran",
    bank: "ibk",
    name: { en: "Teheran-ro", ko: "테헤란로점" },
    x: 604,
    y: 492,
    rate: 2.2,
    capacity: 8,
    phase: 15,
    counterBase: 133,
    via: { en: "Teheran-ro", ko: "테헤란로" },
  },
  {
    id: "citi-teheran",
    bank: "citi",
    name: { en: "Teheran-ro", ko: "테헤란로점" },
    x: 836,
    y: 520,
    rate: 2.9,
    capacity: 11,
    phase: 55,
    counterBase: 88,
    via: { en: "Bus 341 · Yeoksam-ro", ko: "341번 버스 · 역삼로" },
  },
  {
    id: "shinhan-yeoksam",
    bank: "shinhan",
    name: { en: "Yeoksam Station", ko: "역삼역점" },
    x: 668,
    y: 336,
    rate: 2.3,
    capacity: 15,
    phase: -10,
    counterBase: 276,
    via: { en: "Line 2 · Yeoksam Stn.", ko: "2호선 · 역삼역" },
  },
  {
    id: "nh-seocho",
    bank: "nh",
    name: { en: "Seocho", ko: "서초점" },
    x: 196,
    y: 728,
    rate: 2.7,
    capacity: 12,
    phase: 30,
    counterBase: 149,
    via: { en: "Line 2 · Gangnam Stn.", ko: "2호선 · 강남역" },
  },
  {
    id: "sc-gangnam",
    bank: "sc",
    name: { en: "Gangnam", ko: "강남점" },
    x: 470,
    y: 772,
    rate: 2.5,
    capacity: 7,
    phase: -45,
    counterBase: 61,
    via: { en: "Nonhyeon-ro", ko: "논현로" },
  },
  {
    id: "hana-yeoksam",
    bank: "hana",
    name: { en: "Yeoksam-dong", ko: "역삼동점" },
    x: 586,
    y: 690,
    rate: 2.0,
    capacity: 11,
    phase: 5,
    counterBase: 190,
    via: { en: "Yeoksam-ro", ko: "역삼로" },
  },
  {
    id: "woori-sinnonhyeon",
    bank: "woori",
    name: { en: "Sinnonhyeon", ko: "신논현역점" },
    x: 418,
    y: 262,
    rate: 2.2,
    capacity: 16,
    phase: 20,
    counterBase: 330,
    via: { en: "Sinbundang · Sinnonhyeon", ko: "신분당선 · 신논현역" },
  },
];

export const DEFAULT_FAVORITES = ["shinhan-gangnam"];

export function getBranch(id: string | null | undefined) {
  return BRANCHES.find((b) => b.id === id);
}

export function distanceMetres(b: Pick<Branch, "x" | "y">) {
  const d = Math.hypot(b.x - USER.x, b.y - USER.y) * METRES_PER_UNIT;
  return Math.max(80, Math.round(d / 10) * 10);
}

export function travelMinutes(b: Pick<Branch, "x" | "y">) {
  const m = distanceMetres(b);
  return {
    walk: Math.max(1, Math.round(m / 75)),
    bus: Math.max(2, Math.round(m / 260) + 2),
    taxi: Math.max(1, Math.round(m / 400) + 1),
  };
}

/* ------------------------------------------------------------------ */
/* Crowd model                                                         */
/* ------------------------------------------------------------------ */

export const OPEN_MIN = 9 * 60;
export const CLOSE_MIN = 16 * 60;

/** How busy a typical Korean bank branch is, sampled every 30 minutes from 9:00 to 16:00. */
const BASE_CURVE = [0.62, 0.52, 0.4, 0.36, 0.42, 0.56, 0.78, 0.95, 0.88, 0.66, 0.5, 0.56, 0.74, 0.88, 0.8];

function curveAt(minute: number) {
  const pos = ((minute - OPEN_MIN) / 30 + BASE_CURVE.length) % BASE_CURVE.length;
  const i = Math.floor(pos);
  const f = pos - i;
  const a = BASE_CURVE[i];
  const b = BASE_CURVE[(i + 1) % BASE_CURVE.length];
  return a + (b - a) * (0.5 - Math.cos(f * Math.PI) / 2);
}

/** 0–1 crowd level for a branch at a time of day. */
export function crowdAt(b: Branch, dayMinute: number) {
  return curveAt(dayMinute - b.phase);
}

export function averageCrowd(b: Branch) {
  let sum = 0;
  let n = 0;
  for (let m = OPEN_MIN; m <= CLOSE_MIN; m += 10) {
    sum += crowdAt(b, m);
    n++;
  }
  return sum / n;
}

function hash(str: string, n: number) {
  let h = 2166136261 ^ n;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** People currently in the queue. Small deterministic jitter keeps it feeling live. */
export function waitingAt(b: Branch, dayMinute: number) {
  const jitter = Math.round((hash(b.id, Math.floor(dayMinute / 3)) - 0.5) * 2.2);
  return Math.max(0, Math.round(b.capacity * crowdAt(b, dayMinute)) + jitter);
}

export function waitMinutes(b: Branch, waiting: number) {
  return Math.round(waiting * b.rate);
}

/** Ticket number currently being served. */
export function servingAt(b: Branch, dayMinute: number) {
  return b.counterBase + Math.floor((dayMinute - OPEN_MIN) / b.rate);
}
