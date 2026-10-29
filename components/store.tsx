"use client";

import * as React from "react";
import { Toast } from "@base-ui/react/toast";
import {
  BANKS,
  BRANCHES,
  DEFAULT_FAVORITES,
  averageCrowd,
  crowdAt,
  distanceMetres,
  getBranch,
  servingAt,
  travelMinutes,
  waitMinutes,
  waitingAt,
  type Branch,
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

export type MobileTab = "home" | "map" | "ticket";
export type DesktopPanel = "details" | "ticket";
export type SortKey = "wait" | "distance";

export type BranchView = Branch & {
  bankName: string;
  branchName: string;
  fullName: string;
  waiting: number;
  wait: number;
  distance: number;
  travel: ReturnType<typeof travelMinutes>;
  crowd: number;
  /** Positive when quieter than usual, negative when busier. */
  quieterBy: number;
  favorite: boolean;
  /** 1-based rank by shortest wait among non-favorites. */
  rank: number;
};

type Persisted = { lang: Lang; clock: Clock; favorites: string[]; ticket: Ticket | null };

const STORAGE_KEY = "dashhour:v1";

type Store = {
  lang: Lang;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  setLang: (lang: Lang) => void;
  sim: number;
  clockLabel: string;
  speed: number;
  setSpeed: (speed: number) => void;
  views: BranchView[];
  favorites: BranchView[];
  others: BranchView[];
  sort: SortKey;
  setSort: (sort: SortKey) => void;
  selected: BranchView;
  select: (id: string) => void;
  toggleFavorite: (id: string) => void;
  ticket: Ticket | null;
  ticketBranch: BranchView | null;
  status: ReturnType<typeof ticketStatus> | null;
  requestTicket: (id: string) => void;
  confirmFor: BranchView | null;
  closeConfirm: () => void;
  confirmTicket: () => void;
  issuing: boolean;
  cancelOpen: boolean;
  setCancelOpen: (open: boolean) => void;
  cancelTicket: () => void;
  finishTicket: () => void;
  mobileTab: MobileTab;
  setMobileTab: (tab: MobileTab) => void;
  desktopPanel: DesktopPanel;
  setDesktopPanel: (panel: DesktopPanel) => void;
  showTicket: () => void;
  showOnMap: (id: string) => void;
  refreshing: boolean;
  refresh: () => void;
  resetDemo: () => void;
  updatedLabel: string;
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

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const toasts = Toast.useToastManager();

  const [lang, setLangState] = React.useState<Lang>("en");
  const [clock, setClock] = React.useState<Clock>(() => ({ realStart: 0, simStart: SIM_START, speed: DEFAULT_SPEED }));
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>(DEFAULT_FAVORITES);
  const [ticket, setTicket] = React.useState<Ticket | null>(null);
  const [hydrated, setHydrated] = React.useState(false);
  const [sim, setSim] = React.useState(SIM_START);

  const [sort, setSort] = React.useState<SortKey>("wait");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [mobileTab, setMobileTab] = React.useState<MobileTab>("home");
  const [desktopPanel, setDesktopPanel] = React.useState<DesktopPanel>("details");
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [issuing, setIssuing] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [updatedAt, setUpdatedAt] = React.useState(SIM_START);

  const t = React.useCallback(
    (key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  );

  // Load saved state after hydration so the prerendered HTML always matches the first client render.
  React.useEffect(() => {
    const saved = readPersisted();
    if (saved.lang === "en" || saved.lang === "ko") setLangState(saved.lang);
    if (Array.isArray(saved.favorites)) setFavoriteIds(saved.favorites.filter((id) => getBranch(id)));
    const savedClock = saved.clock && saved.clock.realStart > 0 ? saved.clock : null;
    // Start a fresh demo day if the saved one is more than a few hours old.
    const fresh = !savedClock || Date.now() - savedClock.realStart > 6 * 60 * 60 * 1000;
    const nextClock = fresh ? newClock(savedClock?.speed ?? DEFAULT_SPEED) : savedClock;
    setClock(nextClock);
    if (!fresh && saved.ticket && getBranch(saved.ticket.branchId)) setTicket(saved.ticket);
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "map" || tab === "ticket" || tab === "home") setMobileTab(tab);
    if (tab === "ticket") setDesktopPanel("ticket");
    setSim(simMinutes(nextClock, Date.now()));
    setUpdatedAt(simMinutes(nextClock, Date.now()));
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    writePersisted({ lang, clock, favorites: favoriteIds, ticket });
  }, [hydrated, lang, clock, favoriteIds, ticket]);

  React.useEffect(() => {
    if (!hydrated) return;
    const id = window.setInterval(() => setSim(simMinutes(clock, Date.now())), 500);
    return () => window.clearInterval(id);
  }, [hydrated, clock]);

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Queues only change once per simulated minute, so the list doesn't re-sort on every tick.
  const minute = Math.floor(dayMinute(sim));

  const views = React.useMemo<BranchView[]>(() => {
    const base = BRANCHES.map((b) => {
      const waiting = waitingAt(b, minute);
      const crowd = crowdAt(b, minute);
      const avg = averageCrowd(b);
      const bankName = BANKS[b.bank][lang];
      const branchName = b.name[lang];
      return {
        ...b,
        bankName,
        branchName,
        fullName: `${bankName} ${branchName}`,
        waiting,
        wait: waitMinutes(b, waiting),
        distance: distanceMetres(b),
        travel: travelMinutes(b),
        crowd,
        quieterBy: Math.round((1 - crowd / avg) * 100),
        favorite: favoriteIds.includes(b.id),
        rank: 0,
      };
    });
    const ranked = base
      .filter((v) => !v.favorite)
      .sort((a, b) => a.wait - b.wait || a.distance - b.distance);
    ranked.forEach((v, i) => (v.rank = i + 1));
    return base;
  }, [minute, lang, favoriteIds]);

  const sorted = React.useMemo(() => {
    const by = (a: BranchView, b: BranchView) =>
      sort === "wait" ? a.wait - b.wait || a.distance - b.distance : a.distance - b.distance;
    return [...views].sort(by);
  }, [views, sort]);

  const favorites = sorted.filter((v) => v.favorite);
  const others = sorted.filter((v) => !v.favorite);

  const viewById = React.useCallback((id: string | null | undefined) => views.find((v) => v.id === id) ?? null, [views]);

  // Default map selection from sketch ⑤: a favorite first, otherwise the shortest queue.
  const selected = viewById(selectedId) ?? favorites[0] ?? others[0];
  const ticketBranch = ticket ? viewById(ticket.branchId) : null;
  const status = ticket ? ticketStatus(ticket, sim) : null;

  // Tell the person when their number comes up, even if they're looking at another screen.
  const called = status?.called ?? false;
  const calledRef = React.useRef(false);
  React.useEffect(() => {
    if (!ticket || !ticketBranch) {
      calledRef.current = false;
      return;
    }
    if (called && !calledRef.current && ticket.ahead > 0) {
      toasts.add({
        title: t("yourTurn"),
        description: t("yourTurnBody", { branch: ticketBranch.fullName }),
        priority: "high",
      });
    }
    calledRef.current = called;
  }, [called, ticket, ticketBranch, toasts, t]);

  const setLang = React.useCallback((next: Lang) => setLangState(next), []);

  const setSpeed = React.useCallback(
    (speed: number) => {
      const now = Date.now();
      setClock((c) => ({ realStart: now, simStart: simMinutes(c, now), speed }));
    },
    [],
  );

  const select = React.useCallback((id: string) => {
    setSelectedId(id);
    setDesktopPanel("details");
  }, []);

  const toggleFavorite = React.useCallback(
    (id: string) => {
      const has = favoriteIds.includes(id);
      setFavoriteIds(has ? favoriteIds.filter((x) => x !== id) : [...favoriteIds, id]);
      toasts.add({ title: translate(lang, has ? "favoriteRemoved" : "favoriteAdded"), timeout: 2000 });
    },
    [favoriteIds, toasts, lang],
  );

  const showTicket = React.useCallback(() => {
    setMobileTab("ticket");
    setDesktopPanel("ticket");
  }, []);

  const showOnMap = React.useCallback((id: string) => {
    setSelectedId(id);
    setMobileTab("map");
  }, []);

  const requestTicket = React.useCallback((id: string) => setConfirmId(id), []);
  const closeConfirm = React.useCallback(() => setConfirmId(null), []);

  const confirmTicket = React.useCallback(() => {
    const view = viewById(confirmId);
    if (!view || ticket) return;
    setConfirmId(null);
    setIssuing(true);
    const issuedAt = simMinutes(clock, Date.now());
    const next: Ticket = {
      branchId: view.id,
      number: servingAt(view, Math.floor(dayMinute(issuedAt))) + view.waiting + 1,
      issuedAt,
      ahead: view.waiting,
      rate: view.rate,
    };
    // Give the ticket machine animation time to play before showing the ticket.
    window.setTimeout(() => {
      setTicket(next);
      setIssuing(false);
      setSelectedId(view.id);
      setMobileTab("ticket");
      setDesktopPanel("ticket");
      toasts.add({
        title: translate(lang, "issued", { num: next.number }),
        description: translate(lang, "issuedBody", { branch: view.fullName, m: view.wait }),
      });
    }, 2300);
  }, [confirmId, viewById, ticket, clock, toasts, lang]);

  const cancelTicket = React.useCallback(() => {
    setTicket(null);
    setCancelOpen(false);
    toasts.add({ title: translate(lang, "ticketCancelled"), timeout: 2500 });
  }, [toasts, lang]);

  const finishTicket = React.useCallback(() => {
    setTicket(null);
    setDesktopPanel("details");
  }, []);

  const refresh = React.useCallback(() => {
    setRefreshing(true);
    window.setTimeout(() => {
      const now = simMinutes(clock, Date.now());
      setSim(now);
      setUpdatedAt(now);
      setRefreshing(false);
      toasts.add({
        title: translate(lang, "updated"),
        description: translate(lang, "updatedAt", { t: formatClock(now) }),
        timeout: 2000,
      });
    }, 700);
  }, [clock, toasts, lang]);

  const resetDemo = React.useCallback(() => {
    const fresh = newClock(DEFAULT_SPEED);
    setClock(fresh);
    setSim(SIM_START);
    setUpdatedAt(SIM_START);
    setTicket(null);
    setFavoriteIds(DEFAULT_FAVORITES);
    setSelectedId(null);
    setMobileTab("home");
    setDesktopPanel("details");
    toasts.add({ title: translate(lang, "resetDone"), timeout: 2000 });
  }, [toasts, lang]);

  const value: Store = {
    lang,
    t,
    setLang,
    sim,
    clockLabel: formatClock(sim),
    speed: clock.speed,
    setSpeed,
    views,
    favorites,
    others,
    sort,
    setSort,
    selected,
    select,
    toggleFavorite,
    ticket,
    ticketBranch,
    status,
    requestTicket,
    confirmFor: viewById(confirmId),
    closeConfirm,
    confirmTicket,
    issuing,
    cancelOpen,
    setCancelOpen,
    cancelTicket,
    finishTicket,
    mobileTab,
    setMobileTab,
    desktopPanel,
    setDesktopPanel,
    showTicket,
    showOnMap,
    refreshing,
    refresh,
    resetDemo,
    updatedLabel: translate(lang, "updatedAt", { t: formatClock(updatedAt) }),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
