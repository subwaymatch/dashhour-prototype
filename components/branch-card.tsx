"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import {
  Accessibility,
  Banknote,
  ChevronRight,
  ChevronDown,
  Clock,
  CircleParking,
  Languages,
  Star,
  Ticket,
  Timer,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AMENITIES, BANKS, SERVICES, type BankKey } from "@/lib/data";
import { formatCountdown, formatDistance } from "@/lib/sim";
import { BankBadge } from "./bank-badge";
import {
  useStore,
  type BranchView,
  type BankFilterKey,
  type FilterKey,
  type SortKey,
} from "./store";
import { cx, focusRing } from "./ui";

export function FavoriteButton({
  view,
  className,
  tone = "light",
}: {
  view: BranchView;
  className?: string;
  tone?: "light" | "dark";
}) {
  const { toggleFavorite, t } = useStore();
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(view.id)}
      aria-pressed={view.favorite}
      aria-label={view.favorite ? t("removeFavorite") : t("addFavorite")}
      className={cx(
        "favorite-button",
        tone === "light" ? "favorite-button-light" : "favorite-button-dark",
        focusRing,
        className,
      )}
    >
      <Star
        className={cx(
          "favorite-icon",
          view.favorite && "favorite-icon-selected",
        )}
        strokeWidth={1.8}
      />
    </button>
  );
}

/** Three bars that fill up with how busy the branch is right now. */
export function CrowdBars({
  level,
  className,
}: {
  level: number;
  className?: string;
}) {
  const filled = level < 0.45 ? 1 : level < 0.72 ? 2 : 3;
  const tone =
    filled === 1
      ? "crowd-quiet"
      : filled === 2
        ? "crowd-moderate"
        : "crowd-busy";
  return (
    <span aria-hidden className={cx("crowd-bars", className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cx(
            "crowd-bar",
            i < filled ? tone : "crowd-bar-empty",
            ["crowd-bar-short", "crowd-bar-medium", "crowd-bar-tall"][i],
          )}
        />
      ))}
    </span>
  );
}

export function crowdLabelKey(level: number) {
  return level < 0.45 ? "quiet" : level < 0.72 ? "moderate" : "busy";
}

const TAKE_TICKET_SIZES = {
  sm: "take-ticket-small",
  md: "take-ticket-medium",
  lg: "take-ticket-large",
};

export function TakeTicketButton({
  view,
  size = "md",
  className,
}: {
  view: BranchView;
  size?: keyof typeof TAKE_TICKET_SIZES;
  className?: string;
}) {
  const { openSheet, ticket, t } = useStore();
  const mine = ticket?.branchId === view.id;
  const base = cx(
    "take-ticket-button",
    TAKE_TICKET_SIZES[size],
    focusRing,
    className,
  );
  if (mine) {
    return (
      <Link href="/ticket" className={cx(base, "take-ticket-owned")}>
        <Ticket className="take-ticket-icon" aria-hidden />
        {t("myTicket")}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => openSheet(view.id)}
      className={cx(base, "take-ticket-available")}
    >
      <Ticket className="take-ticket-icon" aria-hidden />
      {t("takeTicket")}
    </button>
  );
}

/**
 * A card torn in two along a dashed line, like a ticket stub. The notches are cut out of
 * both halves. The card shadow and selection glow follow the notched shape.
 */
function StubCard({
  top,
  bottom,
  action,
  selected = false,
  className,
}: {
  top: ReactNode;
  bottom: ReactNode;
  action: ReactNode;
  selected?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cx("stub-card", className)}
      data-selected={selected || undefined}
    >
      {action}
      <div className="stub-card-top">{top}</div>
      <div className="stub-card-bottom">
        <div aria-hidden className="stub-card-perforation" />
        {bottom}
      </div>
    </article>
  );
}

function CardHeader({ view }: { view: BranchView }) {
  const { t } = useStore();
  return (
    <div className="card-header">
      <BankBadge bank={view.bank} className="card-bank-logo" />
      <div className="card-content">
        <p className="card-bank-name">
          {view.bankName}
          {view.rank === 1 && !view.favorite && (
            <span className="card-recommended">
              <Zap className="card-recommended-icon" aria-hidden />
              {t("sortWait")}
            </span>
          )}
        </p>
        <h3 className="card-branch-name">{view.branchName}</h3>
        <p className="card-distance">
          {formatDistance(view.distance)} ·{" "}
          {t("walkMin", { n: view.travel.walk })}
        </p>
      </div>
    </div>
  );
}

function CardFooter({ view }: { view: BranchView }) {
  const { t } = useStore();
  return (
    <div className="card-footer">
      <div className="card-content">
        <p className="card-wait">
          <Clock className="card-queue-icon" aria-hidden />
          {view.wait > 0 ? (
            <>
              <span className="card-wait-prefix">
                {t("waitEstimatePrefix")}
              </span>{" "}
              <span className="card-wait-number minute-number">
                {view.wait}
              </span>
              <span className="card-wait-unit">{t("min")}</span>
            </>
          ) : (
            <span className="card-no-wait">{t("availableNow")}</span>
          )}
        </p>
        <p className="card-queue">
          <Users className="card-queue-icon" aria-hidden />
          {t("waitingCount", { n: view.waiting })}
        </p>
      </div>
      <TakeTicketButton view={view} />
    </div>
  );
}

/** The action covers both halves; the favorite and ticket controls sit above it. */
export function BranchCard({
  view,
  className,
}: {
  view: BranchView;
  className?: string;
}) {
  return (
    <StubCard
      className={className}
      action={
        <Link
          href={`/branch/${view.id}`}
          aria-label={view.fullName}
          className={cx("stub-card-action", focusRing)}
        />
      }
      top={
        <>
          <div className="stub-card-heading">
            <CardHeader view={view} />
          </div>
          <FavoriteButton view={view} className="card-favorite" />
        </>
      }
      bottom={<CardFooter view={view} />}
    />
  );
}

/** Desktop list card: selects the branch on the map. */
export function SelectableBranchCard({
  view,
  selected,
  onSelect,
}: {
  view: BranchView;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <StubCard
      selected={selected}
      action={
        <button
          type="button"
          onClick={onSelect}
          aria-label={view.fullName}
          aria-current={selected || undefined}
          className={cx("stub-card-action", focusRing)}
        />
      }
      top={
        <>
          <div className="stub-card-heading">
            <CardHeader view={view} />
          </div>
          <FavoriteButton view={view} className="card-favorite" />
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
    <article className="map-branch-card-article-min">
      <Link
        href={`/branch/${view.id}`}
        className="map-branch-card-link"
        aria-label={view.fullName}
      >
        <img
          src={`/images/${view.photo}-sm.webp`}
          alt=""
          className="map-branch-card-img"
        />
      </Link>
      <div className="map-branch-card-div-min">
        <Link
          href={`/branch/${view.id}`}
          className="interaction-group map-branch-card-link-2"
        >
          <span className="card-content">
            <span className="map-branch-card-span">{view.bankName}</span>
            <span className="map-branch-card-span-2">{view.branchName}</span>
          </span>
          <ChevronRight className="map-branch-card-chevron-right" aria-hidden />
        </Link>
        <div className="map-branch-card-div-min-2">
          <div className="map-branch-card-div-min-3">
            <p className="map-branch-card-p-min">
              <span className="map-branch-card-span-3 minute-number">
                {view.wait}
              </span>
              <span className="map-branch-card-span-min">{t("min")}</span> ·{" "}
              {t("waitingCount", { n: view.waiting })}
            </p>
            <p className="map-branch-card-p-min">
              {formatDistance(view.distance)} ·{" "}
              {t("walkMin", { n: view.travel.walk })}
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
        "interaction-group active-ticket-card-link-go-to-counter",
        className,
      )}
    >
      <div className="active-ticket-card-div-go-to-counter">
        <div className="active-ticket-card-div">
          <span className="active-ticket-card-span">No.</span>
          <span className="active-ticket-card-span-2">{ticket.number}</span>
        </div>
        <div className="card-content">
          <p className="active-ticket-card-p">
            {ticketBranch.fullName} · {SERVICES[ticket.service].name[lang]}
          </p>
          <p className="active-ticket-card-p-go-to-counter">
            {status.called
              ? t("goToCounter", { n: ticket.counter })
              : t("aheadOfYou", { n: status.ahead })}
          </p>
        </div>
        <div className="active-ticket-card-div-2">
          <p className="active-ticket-card-p-2">
            {status.called
              ? formatCountdown(status.grace)
              : formatCountdown(status.remaining)}
          </p>
          <ChevronRight
            className="active-ticket-card-chevron-right"
            aria-hidden
          />
        </div>
      </div>
      <div className="active-ticket-card-div-3">
        <div
          className="active-ticket-card-div-4"
          style={{ width: `${Math.round(status.progress * 100)}%` }}
        />
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Filters                                                             */
/* ------------------------------------------------------------------ */

const FILTERS = [
  { key: "fx", icon: Banknote },
  { key: "parking", icon: CircleParking },
  { key: "accessible", icon: Accessibility },
  { key: "atm24", icon: Timer },
  { key: "english", icon: Languages },
] satisfies { key: FilterKey; icon: typeof Banknote }[];

export function BankFilter() {
  const { bankFilter, setBankFilter, lang, t } = useStore();
  return (
    <label className="bank-filter">
      <span>{t("filterBank")}</span>
      <span className="bank-filter-control">
        <select
          aria-label={t("filterBank")}
          value={bankFilter}
          onChange={(event) =>
            setBankFilter(event.target.value as BankFilterKey)
          }
          className={cx("bank-filter-select", focusRing)}
        >
          <option value="all">{t("allBanks")}</option>
          {(Object.keys(BANKS) as BankKey[]).map((bank) => (
            <option key={bank} value={bank}>
              {BANKS[bank].name[lang]}
            </option>
          ))}
        </select>
        <ChevronDown className="bank-filter-chevron" aria-hidden />
      </span>
    </label>
  );
}

export function FilterChips({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const { filters, setFilters, bankFilter, setBankFilter, lang, t } =
    useStore();
  const chip = cx(
    "filter-chip",
    tone === "light" ? "filter-chip-light" : "filter-chip-dark",
    focusRing,
  );
  return (
    <ToggleGroup
      multiple
      value={filters}
      onValueChange={(v) => setFilters(v as FilterKey[])}
      aria-label="Filters"
      className={cx("filter-chips-toggle-group-clear-filters", className)}
    >
      {FILTERS.map(({ key: f, icon: Icon }) => (
        <Toggle key={f} value={f} className={chip}>
          <Icon className="filter-chips-icon" aria-hidden />
          {f === "fx" ? SERVICES.fx.name[lang] : AMENITIES[f][lang]}
        </Toggle>
      ))}
      {(filters.length > 0 || bankFilter !== "all") && (
        <button
          type="button"
          onClick={() => {
            setFilters([]);
            setBankFilter("all");
          }}
          className={cx(
            chip,
            "filter-chips-button-clear-filters",
            tone === "light"
              ? "filter-chips-button-clear-filters-2"
              : "filter-chips-button-clear-filters-3",
          )}
        >
          <X className="filter-chips-icon" aria-hidden />
          {t("clearFilters")}
        </button>
      )}
    </ToggleGroup>
  );
}

export function SortToggle({ className }: { className?: string }) {
  const { sort, setSort, t } = useStore();
  const item = cx("sort-option", focusRing);
  return (
    <ToggleGroup
      value={[sort]}
      onValueChange={(v) => v[0] && setSort(v[0] as SortKey)}
      className={cx("sort-toggle-toggle-group-sort-wait", className)}
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
  const { t, setFilters, setBankFilter } = useStore();
  return (
    <div className="empty-filters-div-no-matches">
      <p className="empty-filters-p-no-matches">{t("noMatches")}</p>
      <button
        type="button"
        onClick={() => {
          setFilters([]);
          setBankFilter("all");
        }}
        className={cx("empty-filters-button-clear-filters", focusRing)}
      >
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
