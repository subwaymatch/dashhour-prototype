import { CLOSE_MIN, OPEN_MIN } from "./data";

/** The demo always opens at 10:32, the time on the original screenshots. */
export const SIM_START = 10 * 60 + 32;
export const SPEEDS = [1, 10, 30] as const;
export const DEFAULT_SPEED = 10;

export type Clock = { realStart: number; simStart: number; speed: number };

export function newClock(speed: number = DEFAULT_SPEED, simStart = SIM_START): Clock {
  return { realStart: Date.now(), simStart, speed };
}

/** Simulated minutes since midnight. Keeps counting past closing time. */
export function simMinutes(clock: Clock, realNow: number) {
  return clock.simStart + ((realNow - clock.realStart) / 60000) * clock.speed;
}

/** Wraps a simulated time into opening hours so queues never run dry. */
export function dayMinute(sim: number) {
  const span = CLOSE_MIN - OPEN_MIN;
  return OPEN_MIN + ((((sim - OPEN_MIN) % span) + span) % span);
}

export function formatClock(sim: number) {
  const m = Math.floor(dayMinute(sim));
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function formatCountdown(minutes: number) {
  const total = Math.max(0, Math.ceil(minutes * 60));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function formatDistance(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`;
}

export type Ticket = {
  branchId: string;
  number: number;
  /** Simulated minute the ticket was printed. */
  issuedAt: number;
  /** People ahead when the ticket was printed. */
  ahead: number;
  rate: number;
};

export function ticketStatus(t: Ticket, sim: number) {
  const total = t.ahead * t.rate;
  const remaining = Math.max(0, total - (sim - t.issuedAt));
  return {
    total,
    remaining,
    ahead: Math.ceil(remaining / t.rate - 1e-6),
    progress: total > 0 ? 1 - remaining / total : 1,
    called: remaining <= 0,
    arriveBy: t.issuedAt + total,
  };
}
