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
import { LogoMark } from "../logo";
import {
  OptionsMenu,
  RefreshButton,
  SearchDialog,
  darkIconButton,
} from "../shell";
import { useStore, type BranchView } from "../store";
import { CrowdSection, ServiceQueues, Section } from "./branch";
import { cx, focusRing } from "../ui";

const LIST_LIMIT = 5;

function SectionHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-header-div">
      <h2 className="section-header-h2">{title}</h2>
      {children}
    </div>
  );
}

/** Shortest queue nearby, shown when you don't hold a ticket. */
function Recommendation({ view }: { view: BranchView }) {
  const { t } = useStore();
  return (
    <div className="recommendation-div-sort-wait">
      <Link
        href={`/branch/${view.id}`}
        className="recommendation-link-sort-wait"
      >
        <BankBadge bank={view.bank} className="recommendation-bank-badge" />
        <div className="recommendation-div-sort-wait-2">
          <p className="recommendation-p-sort-wait">
            <Zap className="recommendation-zap" aria-hidden />
            {t("sortWait")}
          </p>
          <p className="recommendation-p">{view.fullName}</p>
        </div>
        <ChevronRight className="recommendation-chevron-right" aria-hidden />
      </Link>
      <div className="recommendation-div-min-wait">
        <p className="recommendation-p-min-wait">
          <span className="recommendation-span minute-number">{view.wait}</span>
          <span className="recommendation-span-min-wait">{t("minWait")}</span>
          <span className="recommendation-span-2" aria-hidden>
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
  const { favorites, others, t, lang, ticket } = useStore();
  const greeting = useGreeting();
  const [showAll, setShowAll] = React.useState(false);
  const visible = showAll ? others : others.slice(0, LIST_LIMIT);
  const empty = favorites.length + others.length === 0;

  return (
    <div className="mobile-home-div-home-title">
      <header className="mobile-home-header-home-title">
        <div aria-hidden className="mobile-home-div" />
        <div className="mobile-home-div-home-title-2">
          <div className="mobile-home-div-2">
            <Link
              href="/"
              aria-label="Dash Hour"
              className={cx("mobile-home-link", focusRing)}
            >
              <LogoMark className="mobile-home-logo-mark" />
            </Link>
            <div className="mobile-home-div-3" />
            <RefreshButton className={darkIconButton} />
            <OptionsMenu
              className={cx(darkIconButton, "mobile-home-options-menu")}
            />
          </div>
          <p className="mobile-home-p">
            <MapPin className="recommendation-zap" aria-hidden />
            {USER_AREA[lang]}
          </p>
          <h1 className="mobile-home-h1-home-title">
            {greeting}
            <span className="mobile-home-span-home-title">
              {t("homeTitle")}
            </span>
          </h1>
          <SearchDialog
            trigger={
              <button
                type="button"
                className={cx(
                  "mobile-home-button-search-placeholder",
                  focusRing,
                )}
              >
                <Search className="mobile-home-search" aria-hidden />
                {t("searchPlaceholder")}
              </button>
            }
          />
        </div>
      </header>

      <div className="mobile-home-div-favorites">
        {ticket ? (
          <ActiveTicketCard />
        ) : others[0] ? (
          <Recommendation view={others[0]} />
        ) : null}
        <FilterChips className="mobile-home-filter-chips" />
        {empty && <EmptyFilters />}
        {favorites.length > 0 && (
          <section
            aria-label={t("favorites")}
            className="mobile-home-section-favorites"
          >
            <SectionHeader title={t("favorites")} />
            {favorites.map((v) => (
              <BranchCard key={v.id} view={v} />
            ))}
          </section>
        )}
        {others.length > 0 && (
          <section
            aria-label={t("nearby")}
            className="mobile-home-section-favorites"
          >
            <SectionHeader title={t("nearby")}>
              <SortToggle />
            </SectionHeader>
            {visible.map((v) => (
              <BranchCard
                key={v.id}
                view={v}
                className="mobile-home-branch-card"
              />
            ))}
          </section>
        )}
        {others.length > LIST_LIMIT && (
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            aria-expanded={showAll}
            className={cx("mobile-home-button-show-less", focusRing)}
          >
            {showAll
              ? t("showLess")
              : t("showMore", { n: others.length - LIST_LIMIT })}
            <ChevronDown
              className={cx(
                "mobile-home-chevron-down",
                showAll && "mobile-home-chevron-down-2",
              )}
              aria-hidden
            />
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop explorer: list · map · branch panel                         */
/* ------------------------------------------------------------------ */

function DesktopList() {
  const { favorites, others, selected, select, t } = useStore();
  const card = (v: BranchView) => (
    <SelectableBranchCard
      key={v.id}
      view={v}
      selected={v.id === selected.id}
      onSelect={() => select(v.id)}
    />
  );
  return (
    <aside className="desktop-list">
      <div className="desktop-list-header">
        <div className="desktop-list-heading">
          <h1 className="desktop-list-title">{t("nearby")}</h1>
          <SortToggle />
        </div>
        <FilterChips className="desktop-list-filter-chips" />
      </div>
      <div className="desktop-list-cards">
        <ActiveTicketCard />
        {favorites.length + others.length === 0 && <EmptyFilters />}
        {favorites.map(card)}
        {favorites.length > 0 && others.length > 0 && (
          <hr className="desktop-list-hr" />
        )}
        {others.map(card)}
      </div>
    </aside>
  );
}

function BranchPanel({ view }: { view: BranchView }) {
  const { t } = useStore();
  return (
    <aside className="branch-panel">
      <div className="branch-panel-photo">
        <img
          key={view.photo}
          src={`/images/${view.photo}.webp`}
          alt=""
          className="branch-panel-img"
        />
        <div className="branch-panel-photo-shade" />
        <FavoriteButton
          view={view}
          tone="dark"
          className="branch-panel-favorite-button"
        />
        <div className="branch-panel-heading">
          <BankBadge bank={view.bank} className="branch-panel-bank-badge" />
          <div className="branch-panel-name">
            <p className="branch-panel-bank">{view.bankName}</p>
            <h2 className="branch-panel-title">{view.branchName}</h2>
          </div>
        </div>
      </div>
      <div className="branch-panel-content">
        <div className="branch-panel-summary">
          <div className="recommendation-div-sort-wait-2">
            <p className="branch-panel-wait">
              <span className="minute-number">{view.wait}</span>
              <span className="branch-panel-wait-unit">{t("minWait")}</span>
            </p>
            <p className="branch-panel-queue">
              {t("waitingCount", { n: view.waiting })} ·{" "}
              {formatDistance(view.distance)} ·{" "}
              {t("walkMin", { n: view.travel.walk })}
            </p>
          </div>
          <TakeTicketButton view={view} />
        </div>
        <Section title={t("servicesTitle")} plain>
          <ServiceQueues view={view} compact />
        </Section>
        <CrowdSection view={view} plain />
      </div>

      <Link
        href={`/branch/${view.id}`}
        className={cx("branch-panel-details", focusRing)}
      >
        {t("viewDetails")}
        <ChevronRight className="branch-panel-chevron-right" aria-hidden />
      </Link>
    </aside>
  );
}

function MapLegend() {
  const { t } = useStore();
  return (
    <div className="map-legend-div-sinbundang">
      <span className="map-legend-span">
        <span className="map-legend-span-2" aria-hidden /> {t("line2")}
      </span>
      <span className="map-legend-span">
        <span className="map-legend-span-3" aria-hidden /> {t("sinbundang")}
      </span>
      <span className="map-legend-span">
        <span className="map-legend-span-4" aria-hidden /> {t("you")}
      </span>
    </div>
  );
}

export function DesktopExplorer() {
  const { selected } = useStore();
  return (
    <div className="desktop-explorer">
      <DesktopList />
      <main className="desktop-map">
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
