"use client";

import * as React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Select } from "@base-ui/react/select";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import {
  Accessibility,
  Banknote,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Landmark,
  Clock,
  CircleParking,
  Languages,
  RotateCcw,
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

/**
 * Mobile list row: the whole row opens the branch page, which holds the ticket
 * and favorite controls. One action per row keeps a long list calm.
 */
export function BranchRow({
  view,
  className,
}: {
  view: BranchView;
  className?: string;
}) {
  const { t } = useStore();
  return (
    <Link
      href={`/branch/${view.id}`}
      className={cx("branch-row", focusRing, className)}
    >
      <BankBadge bank={view.bank} className="branch-row-badge" />
      <span className="branch-row-main">
        <span className="branch-row-bank">
          {view.bankName}
          {view.rank === 1 && !view.favorite && (
            <span className="branch-row-fastest">
              <Zap className="branch-row-fastest-icon" aria-hidden />
              {t("sortWait")}
            </span>
          )}
        </span>
        <span className="branch-row-name">{view.branchName}</span>
        <span className="branch-row-meta">
          {formatDistance(view.distance)} ·{" "}
          {t("walkMin", { n: view.travel.walk })}
        </span>
      </span>
      <span className="branch-row-wait">
        <span className="branch-row-wait-value">
          {view.wait > 0 ? (
            <>
              <span className="minute-number">{view.wait}</span>
              {t("min")}
            </>
          ) : (
            t("availableNow")
          )}
        </span>
        <span className="branch-row-queue">
          {t("waitingCount", { n: view.waiting })}
        </span>
      </span>
    </Link>
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
  const items = [
    { value: "all" as const, label: t("allBanks") },
    ...(Object.keys(BANKS) as BankKey[]).map((bank) => ({
      value: bank,
      label: BANKS[bank].name[lang],
    })),
  ];
  const logo = (bank: BankFilterKey) =>
    bank === "all" ? (
      <Landmark className="bank-filter-logo" aria-hidden />
    ) : (
      <BankBadge bank={bank} className="bank-filter-logo" />
    );
  return (
    <div className="bank-filter">
      <Select.Root<BankFilterKey>
        items={items}
        value={bankFilter}
        onValueChange={(value) => setBankFilter(value ?? "all")}
      >
        <div className="bank-filter-control">
          <Select.Trigger
            aria-label={t("filterBank")}
            className={cx("bank-filter-select", focusRing)}
          >
            {logo(bankFilter)}
            <Select.Value className="bank-filter-value" />
            <Select.Icon className="bank-filter-chevron">
              <ChevronDown />
            </Select.Icon>
          </Select.Trigger>
        </div>
        <Select.Portal>
          <Select.Positioner
            sideOffset={6}
            align="start"
            alignItemWithTrigger={false}
            className="bank-filter-positioner"
          >
            <Select.Popup className="bank-filter-popup">
              <Select.List className="bank-filter-list">
                {items.map((item) => (
                  <Select.Item
                    key={item.value}
                    value={item.value}
                    label={item.label}
                    className="bank-filter-item"
                  >
                    {logo(item.value)}
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <span className="bank-filter-item-check" aria-hidden>
                      <Select.ItemIndicator>
                        <Check />
                      </Select.ItemIndicator>
                    </span>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

export function FilterChips({
  className,
  tone = "light",
  compact = false,
  showClear = true,
}: {
  className?: string;
  tone?: "light" | "dark";
  compact?: boolean;
  /** The desktop list shows its own reset button next to the bank filter. */
  showClear?: boolean;
}) {
  const { filters, setFilters, bankFilter, setBankFilter, lang, t } =
    useStore();
  const chip = cx(
    "filter-chip",
    tone === "light" ? "filter-chip-light" : "filter-chip-dark",
    compact && "filter-chip-compact",
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
      {showClear && (filters.length > 0 || bankFilter !== "all") && (
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

/**
 * One row that scrolls sideways, with faded edges and arrow buttons when chips are
 * hidden. Keyboard focus scrolls a chip into view on its own, so the arrows are
 * only for pointer users.
 */
function ScrollRow({ children }: { children: ReactNode }) {
  const { t } = useStore();
  const ref = React.useRef<HTMLDivElement>(null);
  const [edges, setEdges] = React.useState({ start: false, end: false });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ start: el.scrollLeft > 1, end: el.scrollLeft < max - 1 });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const scroll = (dir: 1 | -1) =>
    ref.current?.scrollBy({
      left: dir * ref.current.clientWidth * 0.7,
      behavior: "smooth",
    });

  return (
    <div
      className="scroll-row"
      data-overflow-start={edges.start || undefined}
      data-overflow-end={edges.end || undefined}
    >
      <div ref={ref} className="scroll-row-viewport">
        {children}
      </div>
      {edges.start && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={t("scrollLeft")}
          onClick={() => scroll(-1)}
          className="scroll-row-arrow scroll-row-arrow-start"
        >
          <ChevronLeft aria-hidden />
        </button>
      )}
      {edges.end && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={t("scrollRight")}
          onClick={() => scroll(1)}
          className="scroll-row-arrow scroll-row-arrow-end"
        >
          <ChevronRight aria-hidden />
        </button>
      )}
    </div>
  );
}

/** Desktop list filters: bank select with a reset button, then one row of chips. */
export function DesktopFilters() {
  const { filters, setFilters, bankFilter, setBankFilter, t } = useStore();
  const active = filters.length > 0 || bankFilter !== "all";
  return (
    <div className="desktop-filters">
      <div className="desktop-filters-bank">
        <BankFilter />
        {active && (
          <button
            type="button"
            onClick={() => {
              setFilters([]);
              setBankFilter("all");
            }}
            className={cx("desktop-filters-reset", focusRing)}
          >
            <RotateCcw className="desktop-filters-reset-icon" aria-hidden />
            {t("resetFilters")}
          </button>
        )}
      </div>
      <ScrollRow>
        <FilterChips compact showClear={false} className="desktop-filter-chips" />
      </ScrollRow>
    </div>
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
