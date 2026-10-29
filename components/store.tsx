"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@base-ui/react/toast";
import {
  BANKS,
  BRANCHES,
  DEFAULT_FAVORITES,
  SERVICES,
  averageCrowd,
  crowdAt,
  distanceMetres,
  getBranch,
  queueFor,
  quietestSlot,
  seedHistory,
  servingAt,
  travelMinutes,
  type AmenityKey,
  type Branch,
  type ServiceKey,
  type Visit,
  type VisitStatus,
} from "@/lib/data";
import { translate, type Lang, type StringKey } from "@/lib/i18n";
import {
  DEFAULT_SPEED,
  SIM_START,
  dayMinute,
  formatClock,
  newClock,
  simMinutes,
  ticketStatus,
  type Clock,
  type Ticket,
} from "@/lib/sim";

export type SortKey = "wait" | "distance";
export type FilterKey = "fx" | AmenityKey;
export type Settings = { turnAlerts: boolean; aheadAlerts: boolean };

type Queue = ReturnType<typeof queueFor>;

export type BranchView = Branch & {
  bankName: string;
  branchName: string;
  fullName: string;
  /** General-counter queue, the headline number on every card. */
  waiting: number;
  wait: number;
  queues: Partial<Record<ServiceKey, Queue>>;
  distance: number;
  travel: ReturnType<typeof travelMinutes>;
  crowd: number;
  /** Positive when quieter than usual, negative when busier. */
  quieterBy: number;
  bestTime: number;
  favorite: boolean;
  /** 1-based rank by shortest wait among non-favorites. */
  rank: number;
};

type Persisted = {
  lang: Lang;
  clock: Clock;
  favorites: string[];
  ticket: Ticket | null;
  history: Visit[];
  settings: Settings;
  onboarded: boolean;
};

const STORAGE_KEY = "dashhour:v2";
const DEFAULT_SETTINGS: Settings = { turnAlerts: true, aheadAlerts: true };

type Store = {
  ready: boolean;
  lang: Lang;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  setLang: (lang: Lang) => void;
  sim: number;
  clockLabel: string;
  speed: number;
  setSpeed: (speed: number) => void;
  views: BranchView[];
  viewById: (id: string | null | undefined) => BranchView | null;
  favorites: BranchView[];
  others: BranchView[];
  sort: SortKey;
  setSort: (sort: SortKey) => void;
  filters: FilterKey[];
  setFilters: (filters: FilterKey[]) => void;
  selected: BranchView;
  select: (id: string) => void;
  toggleFavorite: (id: string) => void;
  ticket: Ticket | null;
  ticketBranch: BranchView | null;
  status: ReturnType<typeof ticketStatus> | null;
  openSheet: (id: string) => void;
  sheetBranch: BranchView | null;
  closeSheet: () => void;
  takeTicket: (service: ServiceKey, alert: boolean) => void;
  issuing: boolean;
  cancelOpen: boolean;
  setCancelOpen: (open: boolean) => void;
  cancelTicket: () => void;
  finishTicket: () => void;
  delayTurn: () => void;
  history: Visit[];
  noShows: number;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  goToTicket: () => void;
  showOnMap: (id: string) => void;
  refreshing: boolean;
  refresh: () => void;
  resetDemo: () => void;
  updatedLabel: string;
  notify: (title: string, description?: string) => void;
};

const StoreContext = React.createContext<Store | null>(null);

export function useStore() {
  const store = React.useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  return store;
}

function readPersisted(): Partial<Persisted> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Persisted>) : {};
  } catch {
    return {};
  }
}

function writePersisted(value: Persisted) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Private mode or storage disabled: the demo still works for this visit.
  }
}

function matchesFilters(b: Branch, filters: FilterKey[]) {
  return filters.every((f) => (f === "fx" ? b.services.includes("fx") : b.amenities.includes(f)));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const toasts = Toast.useToastManager();
  const router = useRouter();

  const [ready, setReady] = React.useState(false);
  const [lang, setLangState] = React.useState<Lang>("en");
  const [clock, setClock] = React.useState<Clock>(() => ({ realStart: 0, simStart: SIM_START, speed: DEFAULT_SPEED }));
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>(DEFAULT_FAVORITES);
  const [ticket, setTicket] = React.useState<Ticket | null>(null);
  const [history, setHistory] = React.useState<Visit[]>([]);
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [onboarded, setOnboarded] = React.useState(true);
  const [showOnboarding, setShowOnboardingState] = React.useState(false);
  const [sim, setSim] = React.useState(SIM_START);

  const [sort, setSort] = React.useState<SortKey>("wait");
  const [filters, setFilters] = React.useState<FilterKey[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [sheetId, setSheetId] = React.useState<string | null>(null);
  const [issuing, setIssuing] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [updatedAt, setUpdatedAt] = React.useState(SIM_START);

  const t = React.useCallback(
    (key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  );

  const notify = React.useCallback(
    (title: string, description?: string) => toasts.add({ title, description, timeout: description ? 4000 : 2200 }),
    [toasts],
  );

  // Load saved state after hydration so prerendered HTML always matches the first client render.
  React.useEffect(() => {
    const saved = readPersisted();
    if (saved.lang === "en" || saved.lang === "ko") setLangState(saved.lang);
    if (Array.isArray(saved.favorites)) setFavoriteIds(saved.favorites.filter((id) => getBranch(id)));
    if (saved.settings) setSettings({ ...DEFAULT_SETTINGS, ...saved.settings });
    setHistory(Array.isArray(saved.history) ? saved.history.filter((v) => getBranch(v.branchId)) : seedHistory(Date.now()));
    const savedClock = saved.clock && saved.clock.realStart > 0 ? saved.clock : null;
    // Start a fresh demo day if the saved one is more than a few hours old.
    const fresh = !savedClock || Date.now() - savedClock.realStart > 6 * 60 * 60 * 1000;
    const nextClock = fresh ? newClock(savedClock?.speed ?? DEFAULT_SPEED) : savedClock;
    setClock(nextClock);
    if (!fresh && saved.ticket && getBranch(saved.ticket.branchId) && saved.ticket.service) setTicket(saved.ticket);
    setOnboarded(saved.onboarded === true);
    if (saved.onboarded !== true) setShowOnboardingState(true);
    setSim(simMinutes(nextClock, Date.now()));
    setUpdatedAt(simMinutes(nextClock, Date.now()));
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    writePersisted({ lang, clock, favorites: favoriteIds, ticket, history, settings, onboarded });
  }, [ready, lang, clock, favoriteIds, ticket, history, settings, onboarded]);

  React.useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => setSim(simMinutes(clock, Date.now())), 500);
    return () => window.clearInterval(id);
  }, [ready, clock]);

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Queues only change once per simulated minute, so lists don't re-sort on every tick.
  const minute = Math.floor(dayMinute(sim));

  const views = React.useMemo<BranchView[]>(() => {
    const base = BRANCHES.map((b) => {
      const queues: BranchView["queues"] = {};
      for (const s of b.services) queues[s] = queueFor(b, s, minute);
      const crowd = crowdAt(b, minute);
      const bankName = BANKS[b.bank].name[lang];
      const branchName = b.name[lang];
      return {
        ...b,
        bankName,
        branchName,
        fullName: `${bankName} ${branchName}`,
        waiting: queues.general!.waiting,
        wait: queues.general!.wait,
        queues,
        distance: distanceMetres(b),
        travel: travelMinutes(b),
        crowd,
        quieterBy: Math.round((1 - crowd / averageCrowd(b)) * 100),
        bestTime: quietestSlot(b),
        favorite: favoriteIds.includes(b.id),
        rank: 0,
      };
    });
    const ranked = base.filter((v) => !v.favorite).sort((a, b) => a.wait - b.wait || a.distance - b.distance);
    ranked.forEach((v, i) => (v.rank = i + 1));
    return base;
  }, [minute, lang, favoriteIds]);

  const sorted = React.useMemo(() => {
    const by = (a: BranchView, b: BranchView) =>
      sort === "wait" ? a.wait - b.wait || a.distance - b.distance : a.distance - b.distance;
    return views.filter((v) => matchesFilters(v, filters)).sort(by);
  }, [views, sort, filters]);

  const favorites = sorted.filter((v) => v.favorite);
  const others = sorted.filter((v) => !v.favorite);

  const viewById = React.useCallback((id: string | null | undefined) => views.find((v) => v.id === id) ?? null, [views]);

  // Default selection from sketch ⑤: a favorite first, otherwise the shortest queue.
  const selected = viewById(selectedId) ?? favorites[0] ?? others[0] ?? views[0];
  const ticketBranch = ticket ? viewById(ticket.branchId) : null;
  const status = ticket ? ticketStatus(ticket, sim) : null;
  const noShows = history.filter((v) => v.status === "missed" && Date.now() - v.at < 30 * 24 * 60 * 60 * 1000).length;

  const record = React.useCallback(
    (tk: Ticket, statusValue: VisitStatus, waited: number) => {
      setHistory((h) => [
        {
          id: tk.id,
          branchId: tk.branchId,
          service: tk.service,
          number: tk.number,
          at: Date.now(),
          time: formatClock(tk.issuedAt),
          waited: Math.max(0, Math.round(waited)),
          status: statusValue,
        },
        ...h,
      ]);
    },
    [],
  );

  // Ticket alerts: a heads-up at 3 ahead, a call when it's your turn, and release after the grace period.
  const alerted = React.useRef<{ id: string; almost: boolean; called: boolean } | null>(null);
  React.useEffect(() => {
    if (!ticket || !status || !ticketBranch) {
      alerted.current = null;
      return;
    }
    if (alerted.current?.id !== ticket.id) {
      // Don't replay alerts for a ticket restored from storage.
      alerted.current = { id: ticket.id, almost: status.ahead <= 3, called: status.called };
    }
    const a = alerted.current;
    if (!a.almost && status.ahead <= 3 && status.ahead > 0) {
      a.almost = true;
      if (settings.aheadAlerts && ticket.alertAt > 0) notify(t("almostTitle"), t("almostBody", { branch: ticketBranch.fullName }));
    }
    if (!a.called && status.called) {
      a.called = true;
      if (settings.turnAlerts) {
        toasts.add({
          title: t("yourTurn"),
          description: t("yourTurnBody", { c: ticket.counter, branch: ticketBranch.fullName }),
          priority: "high",
          timeout: 8000,
        });
      }
    }
    if (status.missed) {
      record(ticket, "missed", status.total);
      setTicket(null);
      toasts.add({ title: t("missedTitle"), description: t("missedBody", { n: noShows + 1 }), priority: "high", timeout: 8000 });
    }
  }, [ticket, status, ticketBranch, settings, notify, toasts, t, record, noShows]);

  const setLang = React.useCallback((next: Lang) => setLangState(next), []);

  const setSpeed = React.useCallback((speed: number) => {
    const now = Date.now();
    setClock((c) => ({ realStart: now, simStart: simMinutes(c, now), speed }));
  }, []);

  const select = React.useCallback((id: string) => setSelectedId(id), []);

  const toggleFavorite = React.useCallback(
    (id: string) => {
      const has = favoriteIds.includes(id);
      setFavoriteIds(has ? favoriteIds.filter((x) => x !== id) : [...favoriteIds, id]);
      notify(translate(lang, has ? "favoriteRemoved" : "favoriteAdded"));
    },
    [favoriteIds, notify, lang],
  );

  const goToTicket = React.useCallback(() => router.push("/ticket"), [router]);

  const showOnMap = React.useCallback(
    (id: string) => {
      setSelectedId(id);
      router.push("/map");
    },
    [router],
  );

  const openSheet = React.useCallback((id: string) => setSheetId(id), []);
  const closeSheet = React.useCallback(() => setSheetId(null), []);

  const takeTicket = React.useCallback(
    (service: ServiceKey, alert: boolean) => {
      const view = viewById(sheetId);
      const queue = view?.queues[service];
      if (!view || !queue || ticket) return;
      setSheetId(null);
      setIssuing(true);
      const issuedAt = simMinutes(clock, Date.now());
      const number = servingAt(view, service, Math.floor(dayMinute(issuedAt))) + queue.waiting + 1;
      const extra = { general: 0, loan: 1, fx: 2, business: 3 }[service];
      const next: Ticket = {
        id: `t-${Date.now().toString(36)}`,
        branchId: view.id,
        service,
        number,
        issuedAt,
        ahead: queue.waiting,
        delayed: 0,
        rate: queue.rate,
        counter: service === "general" ? (number % view.counters) + 1 : view.counters + extra,
        alertAt: alert ? 3 : 0,
      };
      // Give the ticket machine animation time to play before showing the ticket.
      window.setTimeout(() => {
        setTicket(next);
        setIssuing(false);
        setSelectedId(view.id);
        router.push("/ticket");
        toasts.add({
          title: translate(lang, "issued", { num: next.number }),
          description: translate(lang, "issuedBody", { branch: view.fullName, m: queue.wait }),
        });
      }, 2300);
    },
    [sheetId, viewById, ticket, clock, toasts, lang, router],
  );

  const cancelTicket = React.useCallback(() => {
    if (ticket) record(ticket, "cancelled", sim - ticket.issuedAt);
    setTicket(null);
    setCancelOpen(false);
    notify(translate(lang, "ticketCancelled"));
  }, [ticket, record, sim, notify, lang]);

  const finishTicket = React.useCallback(() => {
    if (ticket && status) record(ticket, "served", status.total);
    setTicket(null);
    notify(translate(lang, "servedTitle"), translate(lang, "servedBody"));
  }, [ticket, status, record, notify, lang]);

  const delayTurn = React.useCallback(() => {
    if (!ticket || ticket.delayed > 0 || status?.called) return;
    setTicket({ ...ticket, delayed: 3 });
    if (alerted.current) alerted.current.almost = false;
    notify(translate(lang, "delayed"), translate(lang, "delayedBody"));
  }, [ticket, status, notify, lang]);

  const setShowOnboarding = React.useCallback((show: boolean) => {
    setShowOnboardingState(show);
    if (!show) setOnboarded(true);
  }, []);

  const refresh = React.useCallback(() => {
    setRefreshing(true);
    window.setTimeout(() => {
      const now = simMinutes(clock, Date.now());
      setSim(now);
      setUpdatedAt(now);
      setRefreshing(false);
      notify(translate(lang, "updated"), translate(lang, "updatedAt", { t: formatClock(now) }));
    }, 700);
  }, [clock, notify, lang]);

  const resetDemo = React.useCallback(() => {
    setClock(newClock(DEFAULT_SPEED));
    setSim(SIM_START);
    setUpdatedAt(SIM_START);
    setTicket(null);
    setFavoriteIds(DEFAULT_FAVORITES);
    setHistory(seedHistory(Date.now()));
    setSettings(DEFAULT_SETTINGS);
    setFilters([]);
    setSelectedId(null);
    notify(translate(lang, "resetDone"));
    router.push("/");
  }, [notify, lang, router]);

  const value: Store = {
    ready,
    lang,
    t,
    setLang,
    sim,
    clockLabel: formatClock(sim),
    speed: clock.speed,
    setSpeed,
    views,
    viewById,
    favorites,
    others,
    sort,
    setSort,
    filters,
    setFilters,
    selected,
    select,
    toggleFavorite,
    ticket,
    ticketBranch,
    status,
    openSheet,
    sheetBranch: viewById(sheetId),
    closeSheet,
    takeTicket,
    issuing,
    cancelOpen,
    setCancelOpen,
    cancelTicket,
    finishTicket,
    delayTurn,
    history,
    noShows,
    settings,
    setSettings,
    showOnboarding,
    setShowOnboarding,
    goToTicket,
    showOnMap,
    refreshing,
    refresh,
    resetDemo,
    updatedLabel: translate(lang, "updatedAt", { t: formatClock(updatedAt) }),
    notify,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function serviceName(service: ServiceKey, lang: Lang) {
  return SERVICES[service].name[lang];
}
