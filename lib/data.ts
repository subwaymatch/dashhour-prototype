import type { Localized } from "./i18n";

export type BankKey = "shinhan" | "woori" | "hana" | "kb" | "ibk" | "nh" | "citi" | "sc" | "mg";

export const BANKS: Record<BankKey, { name: Localized; short: string; color: string; ink: string }> = {
  shinhan: { name: { en: "Shinhan Bank", ko: "신한은행" }, short: "SH", color: "#0046ff", ink: "#ffffff" },
  woori: { name: { en: "Woori Bank", ko: "우리은행" }, short: "W", color: "#0067ac", ink: "#ffffff" },
  hana: { name: { en: "Hana Bank", ko: "하나은행" }, short: "H", color: "#008c8c", ink: "#ffffff" },
  kb: { name: { en: "KB Kookmin", ko: "KB국민은행" }, short: "KB", color: "#ffbc00", ink: "#3d3428" },
  ibk: { name: { en: "IBK", ko: "IBK기업은행" }, short: "IBK", color: "#004ea2", ink: "#ffffff" },
  nh: { name: { en: "NongHyup", ko: "NH농협은행" }, short: "NH", color: "#00a650", ink: "#ffffff" },
  citi: { name: { en: "Citibank", ko: "씨티은행" }, short: "C", color: "#056dae", ink: "#ffffff" },
  sc: { name: { en: "SC First", ko: "SC제일은행" }, short: "SC", color: "#0473ea", ink: "#ffffff" },
  mg: { name: { en: "MG Saemaeul", ko: "새마을금고" }, short: "MG", color: "#1d4ea1", ink: "#ffffff" },
};

/* ------------------------------------------------------------------ */
/* Services: each counter type keeps its own queue, as at real kiosks. */
/* ------------------------------------------------------------------ */

export type ServiceKey = "general" | "loan" | "fx" | "business";

export const SERVICES: Record<
  ServiceKey,
  { name: Localized; desc: Localized; rate: number; share: number; numberBase: number; bring: Localized[] }
> = {
  general: {
    name: { en: "Deposits & withdrawals", ko: "입출금·공과금" },
    desc: { en: "Cash, transfers, bills and cards", ko: "입금, 출금, 송금, 공과금, 카드" },
    rate: 0, // Uses the branch's own rate.
    share: 1,
    numberBase: 0,
    bring: [
      { en: "ID card", ko: "신분증" },
      { en: "Bankbook or debit card", ko: "통장 또는 체크카드" },
    ],
  },
  loan: {
    name: { en: "Loans & consultation", ko: "대출·상담" },
    desc: { en: "Loans, mortgages and savings advice", ko: "대출, 주택담보대출, 예적금 상담" },
    rate: 7.5,
    share: 0.32,
    numberBase: 500,
    bring: [
      { en: "ID card", ko: "신분증" },
      { en: "Proof of income", ko: "소득 증빙 서류" },
      { en: "Certificate of employment", ko: "재직증명서" },
    ],
  },
  fx: {
    name: { en: "Foreign exchange", ko: "외환" },
    desc: { en: "Currency exchange and overseas transfers", ko: "환전, 해외송금" },
    rate: 3.6,
    share: 0.22,
    numberBase: 700,
    bring: [
      { en: "ID card or passport", ko: "신분증 또는 여권" },
      { en: "Recipient's bank details for transfers", ko: "해외송금 시 수취인 계좌 정보" },
    ],
  },
  business: {
    name: { en: "Business banking", ko: "기업 업무" },
    desc: { en: "Business accounts, payroll and tax", ko: "기업 계좌, 급여 이체, 세금 납부" },
    rate: 4.8,
    share: 0.28,
    numberBase: 900,
    bring: [
      { en: "Business registration certificate", ko: "사업자등록증" },
      { en: "Company seal", ko: "법인 인감" },
      { en: "ID card", ko: "신분증" },
    ],
  },
};

export type AmenityKey = "parking" | "accessible" | "atm24" | "english";

export const AMENITIES: Record<AmenityKey, Localized> = {
  parking: { en: "Parking", ko: "주차" },
  accessible: { en: "Step-free access", ko: "휠체어 접근" },
  atm24: { en: "24h ATM", ko: "24시간 ATM" },
  english: { en: "English service", ko: "영어 상담" },
};

export type Branch = {
  id: string;
  bank: BankKey;
  name: Localized;
  address: Localized;
  phone: string;
  /** Position on the 1000×1000 city map. */
  x: number;
  y: number;
  /** Minutes per customer at the general counters, across all tellers. */
  rate: number;
  /** General queue length at the busiest time of day. */
  capacity: number;
  /** Shifts this branch's rush hours, in minutes. */
  phase: number;
  /** Ticket number at the general counters when the bank opened. */
  counterBase: number;
  counters: number;
  services: ServiceKey[];
  amenities: AmenityKey[];
  photo: string;
  /** The nearest transit stop and line, for the route summary. */
  via: Localized;
};

/** Where the person using the app is standing. */
export const USER = { x: 520, y: 600 };
export const USER_AREA: Localized = { en: "Yeoksam-dong, Gangnam-gu", ko: "강남구 역삼동" };

/** Map units → metres. */
const METRES_PER_UNIT = 3.4;

type Row = [
  id: string,
  bank: BankKey,
  name: [string, string],
  address: [string, string],
  x: number,
  y: number,
  rate: number,
  capacity: number,
  phase: number,
  counterBase: number,
  counters: number,
  services: ServiceKey[],
  amenities: AmenityKey[],
  photo: string,
  via: [string, string],
];

// Addresses and phone numbers are illustrative; queue data is simulated.
const ROWS: Row[] = [
  ["shinhan-gangnam", "shinhan", ["Gangnam Station", "강남역점"], ["1F, 390 Gangnam-daero", "강남대로 390, 1층"], 392, 512, 2.1, 14, 0, 104, 6, ["general", "loan", "fx", "business"], ["accessible", "atm24", "english"], "branch-lobby", ["Gangnam Stn. Exit 11", "강남역 11번 출구"]],
  ["woori-gangnam", "woori", ["Gangnam Station", "강남역점"], ["2F, 23 Seocho-daero 77-gil", "서초대로77길 23, 2층"], 286, 628, 2.6, 10, 25, 211, 4, ["general", "loan", "fx"], ["accessible", "atm24"], "branch-waiting", ["Gangnam Stn. Exit 9", "강남역 9번 출구"]],
  ["hana-gangnamdaero", "hana", ["Gangnam-daero", "강남대로점"], ["1F, 342 Gangnam-daero", "강남대로 342, 1층"], 352, 352, 2.4, 13, -20, 318, 5, ["general", "loan", "fx", "business"], ["parking", "accessible", "atm24"], "branch-exterior", ["Bus 140 · Gangnam-daero", "140번 버스 · 강남대로"]],
  ["mg-gangnam", "mg", ["Gangnam", "강남점"], ["1F, 14 Seocho-daero 74-gil", "서초대로74길 14, 1층"], 222, 470, 3.4, 12, 40, 57, 3, ["general", "loan"], ["parking"], "branch-corner", ["Seocho-daero", "서초대로"]],
  ["kb-yeoksam", "kb", ["Yeoksam Station", "역삼역점"], ["1F, 134 Teheran-ro", "테헤란로 134, 1층"], 718, 418, 1.8, 18, -35, 402, 8, ["general", "loan", "fx", "business"], ["parking", "accessible", "atm24", "english"], "branch-tower", ["Line 2 · Yeoksam Stn.", "2호선 · 역삼역"]],
  ["ibk-teheran", "ibk", ["Teheran-ro", "테헤란로점"], ["1F, 108 Teheran-ro", "테헤란로 108, 1층"], 604, 492, 2.2, 8, 15, 133, 4, ["general", "loan", "business"], ["accessible", "atm24"], "branch-consult", ["Teheran-ro", "테헤란로"]],
  ["citi-teheran", "citi", ["Teheran-ro", "테헤란로점"], ["2F, 152 Teheran-ro", "테헤란로 152, 2층"], 836, 520, 2.9, 11, 55, 88, 4, ["general", "loan", "fx"], ["english", "accessible"], "branch-fx", ["Bus 341 · Yeoksam-ro", "341번 버스 · 역삼로"]],
  ["shinhan-yeoksam", "shinhan", ["Yeoksam Station", "역삼역점"], ["1F, 125 Teheran-ro", "테헤란로 125, 1층"], 668, 336, 2.3, 15, -10, 276, 6, ["general", "loan", "fx", "business"], ["parking", "atm24"], "branch-waiting", ["Line 2 · Yeoksam Stn.", "2호선 · 역삼역"]],
  ["nh-seocho", "nh", ["Seocho", "서초점"], ["1F, 1305 Seocho-daero", "서초대로 1305, 1층"], 196, 728, 2.7, 12, 30, 149, 5, ["general", "loan", "business"], ["parking", "accessible", "atm24"], "branch-corner", ["Line 2 · Gangnam Stn.", "2호선 · 강남역"]],
  ["sc-gangnam", "sc", ["Gangnam", "강남점"], ["1F, 21 Nonhyeon-ro 85-gil", "논현로85길 21, 1층"], 470, 772, 2.5, 7, -45, 61, 3, ["general", "loan", "fx"], ["english"], "branch-atm", ["Nonhyeon-ro", "논현로"]],
  ["hana-yeoksam", "hana", ["Yeoksam-dong", "역삼동점"], ["1F, 34 Yeoksam-ro", "역삼로 34, 1층"], 586, 690, 2.0, 11, 5, 190, 4, ["general", "loan", "fx"], ["accessible", "atm24"], "branch-lobby", ["Yeoksam-ro", "역삼로"]],
  ["woori-sinnonhyeon", "woori", ["Sinnonhyeon", "신논현역점"], ["1F, 470 Gangnam-daero", "강남대로 470, 1층"], 418, 262, 2.2, 16, 20, 330, 5, ["general", "loan", "fx", "business"], ["parking", "accessible", "atm24"], "branch-exterior", ["Sinbundang · Sinnonhyeon", "신분당선 · 신논현역"]],
];

export const BRANCHES: Branch[] = ROWS.map(
  ([id, bank, name, address, x, y, rate, capacity, phase, counterBase, counters, services, amenities, photo, via], i) => ({
    id,
    bank,
    name: { en: name[0], ko: name[1] },
    address: { en: `${address[0]}, Gangnam-gu, Seoul`, ko: `서울 강남구 ${address[1]}` },
    phone: `02-${3400 + i * 117}-${String(1000 + i * 731).slice(0, 4)}`,
    x,
    y,
    rate,
    capacity,
    phase,
    counterBase,
    counters,
    services,
    amenities,
    photo,
    via: { en: via[0], ko: via[1] },
  }),
);

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

/** The quietest half hour of the day, for the "best time to visit" hint. */
export function quietestSlot(b: Branch) {
  let best = OPEN_MIN;
  let bestLevel = Infinity;
  for (let m = OPEN_MIN; m <= CLOSE_MIN - 30; m += 30) {
    const level = crowdAt(b, m) + crowdAt(b, m + 15) + crowdAt(b, m + 30);
    if (level < bestLevel) {
      bestLevel = level;
      best = m;
    }
  }
  return best;
}

function hash(str: string, n: number) {
  let h = 2166136261 ^ n;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** People currently in the general queue. Small deterministic jitter keeps it feeling live. */
export function waitingAt(b: Branch, dayMinute: number) {
  return queueFor(b, "general", dayMinute).waiting;
}

export function waitMinutes(b: Branch, waiting: number) {
  return Math.round(waiting * b.rate);
}

export function serviceRate(b: Branch, service: ServiceKey) {
  if (service === "general") return b.rate;
  return Math.round(SERVICES[service].rate * (0.85 + hash(b.id + service, 7) * 0.3) * 10) / 10;
}

/** Queue for one counter type at a branch. */
export function queueFor(b: Branch, service: ServiceKey, dayMinute: number) {
  const s = SERVICES[service];
  const jitter = Math.round((hash(b.id + service, Math.floor(dayMinute / 3)) - 0.5) * (service === "general" ? 2.2 : 1.4));
  const waiting = Math.max(0, Math.round(b.capacity * s.share * crowdAt(b, dayMinute)) + jitter);
  const rate = serviceRate(b, service);
  return { waiting, rate, wait: Math.round(waiting * rate) };
}

/** Ticket number currently being served at a counter type. */
export function servingAt(b: Branch, service: ServiceKey, dayMinute: number) {
  const base = service === "general" ? b.counterBase : SERVICES[service].numberBase + Math.floor(hash(b.id, 3) * 40);
  return base + Math.floor((dayMinute - OPEN_MIN) / serviceRate(b, service));
}

/* ------------------------------------------------------------------ */
/* Visit history                                                       */
/* ------------------------------------------------------------------ */

export type VisitStatus = "served" | "cancelled" | "missed";

export type Visit = {
  id: string;
  branchId: string;
  service: ServiceKey;
  number: number;
  /** Real-world timestamp, ms. */
  at: number;
  /** "HH:MM" on the demo clock when the ticket was taken. */
  time: string;
  waited: number;
  status: VisitStatus;
};

const DAY = 24 * 60 * 60 * 1000;

/** A few past visits so the account screen isn't empty on first load. */
export function seedHistory(now: number): Visit[] {
  return [
    { id: "seed-1", branchId: "kb-yeoksam", service: "general", number: 431, at: now - 6 * DAY, time: "11:04", waited: 14, status: "served" },
    { id: "seed-2", branchId: "shinhan-gangnam", service: "fx", number: 726, at: now - 13 * DAY, time: "14:20", waited: 6, status: "served" },
    { id: "seed-3", branchId: "woori-gangnam", service: "general", number: 238, at: now - 21 * DAY, time: "12:41", waited: 0, status: "cancelled" },
    { id: "seed-4", branchId: "hana-yeoksam", service: "loan", number: 518, at: now - 34 * DAY, time: "10:05", waited: 23, status: "served" },
  ];
}
