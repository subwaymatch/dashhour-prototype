"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { ChevronRight, Star, Ticket, Zap } from "lucide-react";
import { AMENITIES, SERVICES } from "@/lib/data";
import { formatCountdown, formatDistance } from "@/lib/sim";
import { BankBadge } from "./bank-badge";
import { useStore, type BranchView, type FilterKey, type SortKey } from "./store";
import { cx, focusRing } from "./ui";

export function FavoriteButton({ view, className, tone = "light" }: { view: BranchView; className?: string; tone?: "light" | "dark" }) {
  const { toggleFavorite, t } = useStore();
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(view.id)}
      aria-pressed={view.favorite}
      aria-label={view.favorite ? t("removeFavorite") : t("addFavorite")}
      className={cx(
        "inline-flex size-10 items-center justify-center rounded-full transition-colors active:scale-95",
        tone === "light" ? "text-gold-500 hover:bg-gold-100" : "bg-black/25 text-white backdrop-blur-md hover:bg-black/35",
        focusRing,
        className,
      )}
    >
      <Star className={cx("size-[22px]", view.favorite && "fill-gold-500 text-gold-500")} strokeWidth={1.8} />
    </button>
  );
}

/** Three bars that fill up with how busy the branch is right now. */
export function CrowdBars({ level, className }: { level: number; className?: string }) {
  const filled = level < 0.45 ? 1 : level < 0.72 ? 2 : 3;
  const tone = filled === 1 ? "bg-emerald-500" : filled === 2 ? "bg-amber-500" : "bg-rose-500";
  return (
    <span aria-hidden className={cx("inline-flex items-end gap-[2px]", className)}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={cx("w-[3px] rounded-full", i < filled ? tone : "bg-line", ["h-1.5", "h-2.5", "h-3.5"][i])} />
      ))}
    </span>
  );
}

export function crowdLabelKey(level: number) {
  return level < 0.45 ? "quiet" : level < 0.72 ? "moderate" : "busy";
}

const TAKE_TICKET_SIZES = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-sm",
};

export function TakeTicketButton({ view, size = "md", className }: { view: BranchView; size?: keyof typeof TAKE_TICKET_SIZES; className?: string }) {
  const { openSheet, ticket, t } = useStore();
  const mine = ticket?.branchId === view.id;
  const base = cx(
    "inline-flex shrink-0 items-center gap-1.5 rounded-md font-semibold transition-colors",
    TAKE_TICKET_SIZES[size],
    focusRing,
    className,
  );
  if (mine) {
    return (
      <Link href="/ticket" className={cx(base, "bg-navy-900 text-white hover:bg-navy-800")}>
        <Ticket className="size-4" aria-hidden />
        {t("myTicket")}
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => openSheet(view.id)} className={cx(base, "bg-gold-600 text-white hover:bg-gold-700 active:bg-gold-800")}>
      <Ticket className="size-4" aria-hidden />
      {t("takeTicket")}
    </button>
  );
}

/**
 * A card torn in two along a dashed line, like a ticket stub. The notches are cut out of
 * both halves (see `notch-bottom`/`notch-top`), so pass a `shape-*` filter for the shadow.
 */
function StubCard({ top, bottom, className }: { top: ReactNode; bottom: ReactNode; className?: string }) {
  return (
    <article className={cx("relative", className)}>
      <div className="notch-bottom relative rounded-t-lg bg-white">{top}</div>
      <div className="notch-top rounded-b-lg bg-white">
        <div aria-hidden className="mx-4 border-t-[1.5px] border-dashed border-line" />
        {bottom}
      </div>
    </article>
  );
}

function CardHeader({ view }: { view: BranchView }) {
  const { t } = useStore();
  return (
    <div className="flex items-start gap-3 pr-10">
      <BankBadge bank={view.bank} className="mt-0.5 size-11" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
          {view.bankName}
          {view.rank === 1 && !view.favorite && (
            <span className="inline-flex items-center gap-0.5 rounded-sm bg-emerald-50 px-1.5 py-px text-2xs font-semibold text-emerald-700">
              <Zap className="size-3" aria-hidden />
              {t("sortWait")}
            </span>
          )}
        </p>
        <h3 className="truncate text-base leading-snug font-bold text-ink">{view.branchName}</h3>
        <p className="mt-0.5 truncate text-xs text-muted">
          {formatDistance(view.distance)} · {t("walkMin", { n: view.travel.walk })}
        </p>
      </div>
    </div>
  );
}

function CardFooter({ view }: { view: BranchView }) {
  const { t } = useStore();
  return (
    <div className="flex items-center gap-3 px-4 pt-3 pb-4">
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-1 text-navy-900">
          {view.wait > 0 ? (
            <>
              <span className="font-display text-xl leading-none font-bold tracking-tight tabular">{view.wait}</span>
              <span className="text-xs font-semibold">{t("minWait")}</span>
            </>
          ) : (
            <span className="text-base leading-7 font-bold text-emerald-700">{t("noWait")}</span>
          )}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
          <CrowdBars level={view.crowd} />
          {t("waitingCount", { n: view.waiting })}
        </p>
      </div>
      <TakeTicketButton view={view} />
    </div>
  );
}

/** Mobile list card: opens the branch page. */
export function BranchCard({ view, className }: { view: BranchView; className?: string }) {
  return (
    <StubCard
      className={cx("shape-shadow", className)}
      top={
        <>
          <Link
            href={`/branch/${view.id}`}
            className="block px-4 pt-4 pb-3 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy-700"
          >
            <CardHeader view={view} />
          </Link>
          <FavoriteButton view={view} className="absolute top-3 right-3" />
        </>
      }
      bottom={<CardFooter view={view} />}
    />
  );
}

/** Desktop list card: selects the branch on the map. */
export function SelectableBranchCard({ view, selected, onSelect }: { view: BranchView; selected: boolean; onSelect: () => void }) {
  return (
    <StubCard
      className={cx("transition-[filter]", selected ? "shape-outline" : "shape-shadow hover:shape-shadow-float")}
      top={
        <>
          <button
            type="button"
            onClick={onSelect}
            aria-current={selected || undefined}
            className="block w-full px-4 pt-4 pb-3 text-left outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy-700"
          >
            <CardHeader view={view} />
          </button>
          <FavoriteButton view={view} className="absolute top-3 right-3" />
        </>
      }
      bottom={<CardFooter view={view} />}
    />
  );
}

/** Compact card shown over the map. */
export function MapBranchCard({ view }: { view: BranchView }) {
  const { t } = useStore();
  return (
    <article className="flex overflow-hidden rounded-lg bg-white shadow-float ring-1 ring-line/70">
      <Link href={`/branch/${view.id}`} className="relative w-20 shrink-0 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy-700" aria-label={view.fullName}>
        <img src={`/images/${view.photo}-sm.webp`} alt="" className="absolute inset-0 size-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1 p-3.5">
        <Link href={`/branch/${view.id}`} className="group flex items-center gap-1 outline-none">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-muted">{view.bankName}</span>
            <span className="block truncate text-base font-bold text-ink group-hover:underline">{view.branchName}</span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <div className="min-w-0 flex-1 text-xs text-muted">
            <p className="truncate">
              <span className="font-display text-lg font-bold text-navy-900 tabular">{view.wait}</span>{" "}
              <span className="font-semibold text-navy-900">{t("min")}</span> · {t("waitingCount", { n: view.waiting })}
            </p>
            <p className="truncate">
              {formatDistance(view.distance)} · {t("walkMin", { n: view.travel.walk })}
            </p>
          </div>
          <TakeTicketButton view={view} size="sm" />
        </div>
      </div>
    </article>
  );
}

/** Live summary of the ticket you hold, pinned above the list. */
export function ActiveTicketCard({ className }: { className?: string }) {
  const { ticket, ticketBranch, status, t, lang } = useStore();
  if (!ticket || !ticketBranch || !status) return null;
  return (
    <Link
      href="/ticket"
      className={cx(
        "group block overflow-hidden rounded-lg bg-navy-900 text-white shadow-float outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300",
        className,
      )}
    >
      <div className="flex items-center gap-4 px-4 pt-4 pb-3">
        <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-md bg-gold-500 text-navy-950">
          <span className="text-2xs font-semibold tracking-wide uppercase">No.</span>
          <span className="font-display text-lg leading-none font-bold tabular">{ticket.number}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-white/65">
            {ticketBranch.fullName} · {SERVICES[ticket.service].name[lang]}
          </p>
          <p className="mt-0.5 text-base font-bold">
            {status.called ? t("goToCounter", { n: ticket.counter }) : t("aheadOfYou", { n: status.ahead })}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-bold text-gold-300 tabular">
            {status.called ? formatCountdown(status.grace) : formatCountdown(status.remaining)}
          </p>
          <ChevronRight className="ml-auto size-4 text-white/50 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </div>
      </div>
      <div className="h-1 bg-white/10">
        <div className="h-full bg-gold-500 transition-[width] duration-500" style={{ width: `${Math.round(status.progress * 100)}%` }} />
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Filters                                                             */
/* ------------------------------------------------------------------ */

const FILTERS: FilterKey[] = ["fx", "parking", "accessible", "atm24", "english"];

export function FilterChips({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const { filters, setFilters, lang, t } = useStore();
  const chip = cx(
    "inline-flex h-9 shrink-0 items-center rounded-md px-3.5 text-xs font-medium whitespace-nowrap transition-colors",
    tone === "light"
      ? "bg-white text-ink shadow-[0_1px_2px_rgb(13_17_55/0.06)] ring-1 ring-line hover:bg-paper data-pressed:bg-navy-900 data-pressed:text-white data-pressed:ring-navy-900"
      : "bg-white/10 text-white/85 ring-1 ring-white/15 hover:bg-white/15 data-pressed:bg-white data-pressed:text-navy-950",
    focusRing,
  );
  return (
    <ToggleGroup
      multiple
      value={filters}
      onValueChange={(v) => setFilters(v as FilterKey[])}
      aria-label="Filters"
      className={cx("no-scrollbar flex gap-2 overflow-x-auto", className)}
    >
      {FILTERS.map((f) => (
        <Toggle key={f} value={f} className={chip}>
          {f === "fx" ? SERVICES.fx.name[lang] : AMENITIES[f][lang]}
        </Toggle>
      ))}
      {filters.length > 0 && (
        <button type="button" onClick={() => setFilters([])} className={cx(chip, "underline-offset-2 hover:underline", tone === "light" ? "bg-transparent shadow-none ring-0" : "bg-transparent ring-0")}>
          {t("clearFilters")}
        </button>
      )}
    </ToggleGroup>
  );
}

export function SortToggle({ className }: { className?: string }) {
  const { sort, setSort, t } = useStore();
  const item = cx(
    "h-8 rounded-sm px-3 text-xs font-medium whitespace-nowrap text-muted transition-colors",
    "hover:text-ink data-pressed:bg-ink data-pressed:text-white",
    focusRing,
  );
  return (
    <ToggleGroup
      value={[sort]}
      onValueChange={(v) => v[0] && setSort(v[0] as SortKey)}
      className={cx("flex shrink-0 rounded-md bg-white p-0.5 ring-1 ring-line", className)}
      aria-label="Sort"
    >
      <Toggle value="wait" className={item}>
        {t("sortWait")}
      </Toggle>
      <Toggle value="distance" className={item}>
        {t("sortDistance")}
      </Toggle>
    </ToggleGroup>
  );
}

export function EmptyFilters() {
  const { t, setFilters } = useStore();
  return (
    <div className="rounded-lg border border-dashed border-line px-6 py-10 text-center">
      <p className="text-sm font-semibold text-ink">{t("noMatches")}</p>
      <button type="button" onClick={() => setFilters([])} className={cx("mt-3 text-sm font-semibold text-gold-700 hover:underline", focusRing)}>
        {t("clearFilters")}
      </button>
    </div>
  );
}

export function useGreeting() {
  const { sim, t } = useStore();
  const hour = Math.floor((((sim % 1440) + 1440) % 1440) / 60);
  return hour < 12 ? t("goodMorning") : t("goodAfternoon");
}

