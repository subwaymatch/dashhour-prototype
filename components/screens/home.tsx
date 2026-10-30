"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, MapPin, Search, Zap } from "lucide-react";
import { USER_AREA } from "@/lib/data";
import { formatDistance } from "@/lib/sim";
import { BankBadge } from "../bank-badge";
import {
  ActiveTicketCard,
  BranchCard,
  EmptyFilters,
  FavoriteButton,
  FilterChips,
  SelectableBranchCard,
  SortToggle,
  TakeTicketButton,
  useGreeting,
} from "../branch-card";
import { CityMap } from "../city-map";
import { LogoMark, Wordmark } from "../logo";
import { OptionsMenu, RefreshButton, SearchDialog, darkIconButton } from "../shell";
import { useStore, type BranchView } from "../store";
import { CrowdSection, ServiceQueues, Section } from "./branch";
import { cx, focusRing } from "../ui";

const LIST_LIMIT = 5;

function SectionHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {children}
    </div>
  );
}

/** Shortest queue nearby, shown when you don't hold a ticket. */
function Recommendation({ view }: { view: BranchView }) {
  const { t } = useStore();
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-float ring-1 ring-line/70">
      <Link href={`/branch/${view.id}`} className="flex items-center gap-3 px-4 pt-4 pb-3 outline-none focus-visible:bg-paper">
        <BankBadge bank={view.bank} className="size-11" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <Zap className="size-3.5" aria-hidden />
            {t("sortWait")}
          </p>
          <p className="truncate text-base font-bold text-ink">{view.fullName}</p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
      </Link>
      <div className="flex items-center gap-3 border-t border-line px-4 py-3">
        <p className="min-w-0 flex-1 text-xs text-muted">
          <span className="font-display text-lg font-bold text-navy-900 tabular">{view.wait}</span>{" "}
          <span className="font-semibold text-navy-900">{t("minWait")}</span>
          <span className="mx-1.5" aria-hidden>
            ·
          </span>
          {formatDistance(view.distance)}
        </p>
        <TakeTicketButton view={view} />
      </div>
    </div>
  );
}

function MobileHome() {
  const { favorites, others, t, lang, ticket, updatedLabel, ready } = useStore();
  const greeting = useGreeting();
  const [showAll, setShowAll] = React.useState(false);
  const visible = showAll ? others : others.slice(0, LIST_LIMIT);
  const empty = favorites.length + others.length === 0;

  return (
    <div className="lg:hidden">
      <header className="relative overflow-hidden bg-navy-950 pt-[env(safe-area-inset-top)] pb-16 text-white">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-[radial-gradient(circle,rgb(180_166_122/0.35),transparent_65%)]" />
        <div className="relative mx-auto max-w-xl px-4">
          <div className="flex h-14 items-center gap-2.5">
            <LogoMark className="h-7 w-auto text-white" />
            <Wordmark className="text-base" />
            <div className="flex-1" />
            <RefreshButton className={darkIconButton} />
            <OptionsMenu className={cx(darkIconButton, "-mr-2")} />
          </div>
          <p className="mt-4 flex items-center gap-1 text-xs text-white/60">
            <MapPin className="size-3.5" aria-hidden />
            {USER_AREA[lang]}
          </p>
          <h1 className="mt-1.5 text-xl leading-[1.15] font-bold tracking-tight">
            {greeting}
            <span className="mt-1 block text-base font-medium tracking-normal text-white/75">{t("homeTitle")}</span>
          </h1>
          <SearchDialog
            trigger={
              <button
                type="button"
                className={cx("mt-5 flex h-12 w-full items-center gap-3 rounded-md bg-white/10 px-4 text-left text-sm text-white/70 ring-1 ring-white/15 transition-colors hover:bg-white/15", focusRing)}
              >
                <Search className="size-5" aria-hidden />
                {t("searchPlaceholder")}
              </button>
            }
          />
        </div>
      </header>

      <div className="relative mx-auto -mt-10 flex max-w-xl flex-col gap-3 px-4 pb-8">
        {ticket ? <ActiveTicketCard /> : others[0] ? <Recommendation view={others[0]} /> : null}
        <FilterChips className="-mx-4 mt-2 px-4 py-1" />
        {empty && <EmptyFilters />}
        {favorites.length > 0 && (
          <section aria-label={t("favorites")} className="flex flex-col gap-3">
            <SectionHeader title={t("favorites")} />
            {favorites.map((v) => (
              <BranchCard key={v.id} view={v} />
            ))}
          </section>
        )}
        {others.length > 0 && (
          <section aria-label={t("nearby")} className="flex flex-col gap-3">
            <SectionHeader title={t("nearby")}>
              <SortToggle />
            </SectionHeader>
            {visible.map((v) => (
              <BranchCard key={v.id} view={v} className="animate-rise" />
            ))}
          </section>
        )}
        {others.length > LIST_LIMIT && (
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            aria-expanded={showAll}
            className={cx("mx-auto mt-1 flex h-11 items-center gap-1.5 rounded-md bg-white px-5 text-sm font-semibold text-ink ring-1 ring-line hover:bg-paper", focusRing)}
          >
            {showAll ? t("showLess") : t("showMore", { n: others.length - LIST_LIMIT })}
            <ChevronDown className={cx("size-4 transition-transform", showAll && "rotate-180")} aria-hidden />
          </button>
        )}
        <p className="mt-2 text-center text-xs text-muted" suppressHydrationWarning>
          {ready ? `${updatedLabel} · ${t("simulated")}` : t("simulated")}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop explorer: list · map · branch panel                         */
/* ------------------------------------------------------------------ */

function DesktopList() {
  const { favorites, others, selected, select, t, updatedLabel } = useStore();
  const card = (v: BranchView) => <SelectableBranchCard key={v.id} view={v} selected={v.id === selected.id} onSelect={() => select(v.id)} />;
  return (
    <aside className="flex min-h-0 flex-col border-r border-line">
      <div className="flex shrink-0 flex-col gap-3 px-4 pt-5 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-ink">{t("nearby")}</h1>
            <p className="text-xs text-muted">
              {updatedLabel} · {t("simulated")}
            </p>
          </div>
          <SortToggle />
        </div>
        <FilterChips className="flex-wrap overflow-visible" />
      </div>
      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pt-1 pb-6 [&>*]:shrink-0">
        <ActiveTicketCard />
        {favorites.length + others.length === 0 && <EmptyFilters />}
        {favorites.map(card)}
        {favorites.length > 0 && others.length > 0 && <hr className="my-1 border-line" />}
        {others.map(card)}
      </div>
    </aside>
  );
}

function BranchPanel({ view }: { view: BranchView }) {
  const { t } = useStore();
  return (
    <aside className="scrollbar-thin flex min-h-0 flex-col overflow-y-auto border-l border-line bg-paper">
      <div className="relative h-44 shrink-0">
        <img key={view.photo} src={`/images/${view.photo}.webp`} alt="" className="absolute inset-0 size-full animate-rise object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent" />
        <FavoriteButton view={view} tone="dark" className="absolute top-3 right-3" />
        <div className="absolute inset-x-4 bottom-3 flex items-end gap-3 text-white">
          <BankBadge bank={view.bank} className="size-10 ring-2 ring-white/80" />
          <div className="min-w-0">
            <p className="text-xs text-white/75">{view.bankName}</p>
            <h2 className="truncate text-lg leading-tight font-bold">{view.branchName}</h2>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-card ring-1 ring-line/70">
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl leading-none font-bold text-navy-900 tabular">
              {view.wait}
              <span className="ml-1 text-sm font-semibold">{t("minWait")}</span>
            </p>
            <p className="mt-1.5 text-xs text-muted">
              {t("waitingCount", { n: view.waiting })} · {formatDistance(view.distance)} · {t("walkMin", { n: view.travel.walk })}
            </p>
          </div>
          <TakeTicketButton view={view} />
        </div>
        <Section title={t("servicesTitle")}>
          <ServiceQueues view={view} />
        </Section>
        <CrowdSection view={view} />
        <Link
          href={`/branch/${view.id}`}
          className={cx("flex h-12 items-center justify-center gap-1.5 rounded-md bg-white text-sm font-semibold text-navy-900 ring-1 ring-line hover:bg-white/70", focusRing)}
        >
          {t("viewDetails")}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </aside>
  );
}

function MapLegend() {
  const { t } = useStore();
  return (
    <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-1.5 rounded-lg bg-white/92 px-3 py-2.5 text-xs font-medium text-ink shadow-card backdrop-blur">
      <span className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-subway-2" aria-hidden /> {t("line2")}
      </span>
      <span className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-subway-sb" aria-hidden /> {t("sinbundang")}
      </span>
      <span className="flex items-center gap-2">
        <span className="size-3 rounded-full border-2 border-white bg-sky-500 shadow" aria-hidden /> {t("you")}
      </span>
    </div>
  );
}

export function DesktopExplorer() {
  const { selected } = useStore();
  return (
    <div className="hidden h-[calc(100dvh-4rem)] grid-cols-[minmax(340px,390px)_minmax(0,1fr)_minmax(340px,400px)] lg:grid">
      <DesktopList />
      <main className="relative min-h-0">
        <CityMap />
        <MapLegend />
      </main>
      <BranchPanel view={selected} />
    </div>
  );
}

export function HomeScreen() {
  return (
    <>
      <MobileHome />
      <DesktopExplorer />
    </>
  );
}
