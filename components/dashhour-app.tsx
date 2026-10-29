"use client";

import * as React from "react";
import { Tabs } from "@base-ui/react/tabs";
import { Toast } from "@base-ui/react/toast";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { ChevronDown, House, Map as MapIcon, Ticket } from "lucide-react";
import { BranchCard, ExpandableBranchCard } from "./branch-card";
import { BranchPanel } from "./branch-detail";
import { CityMap } from "./city-map";
import { DesktopHeader, MobileHeader } from "./header";
import { StoreProvider, useStore, type BranchView, type DesktopPanel, type MobileTab, type SortKey } from "./store";
import { IssuingOverlay, TakeTicketDialog } from "./take-ticket";
import { CancelTicketDialog, TicketView } from "./ticket";
import { Toasts } from "./toasts";
import { cx } from "./ui";

export function DashhourApp() {
  return (
    <Toast.Provider limit={3}>
      <StoreProvider>
        <MobileLayout />
        <DesktopLayout />
        <TakeTicketDialog />
        <IssuingOverlay />
        <CancelTicketDialog />
        <Toasts />
      </StoreProvider>
    </Toast.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function SortToggle() {
  const { sort, setSort, t } = useStore();
  const item = cx(
    "h-8 rounded-full px-3 text-[13px] font-semibold whitespace-nowrap text-muted transition-colors outline-none",
    "hover:text-navy-900 data-pressed:bg-navy-900 data-pressed:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-navy-700",
  );
  return (
    <ToggleGroup
      value={[sort]}
      onValueChange={(v) => v[0] && setSort(v[0] as SortKey)}
      className="flex shrink-0 rounded-full bg-white p-0.5 shadow-sm"
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

function ListMeta() {
  const { updatedLabel, t } = useStore();
  return (
    <p className="text-[12px] text-muted">
      {updatedLabel} · {t("simulated")}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile: the original three-tab layout                               */
/* ------------------------------------------------------------------ */

const LIST_LIMIT = 5;

function MobileHome() {
  const { favorites, others, t } = useStore();
  const [expanded, setExpanded] = React.useState<string | null>(favorites[0]?.id ?? null);
  const [showAll, setShowAll] = React.useState(false);
  const visible = showAll ? others : others.slice(0, LIST_LIMIT);

  const card = (v: BranchView) => (
    <ExpandableBranchCard key={v.id} view={v} open={expanded === v.id} onOpenChange={(open) => setExpanded(open ? v.id : null)} />
  );

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3 px-3 pt-4 pb-10">
      <div className="flex items-center justify-between gap-2">
        <ListMeta />
        <SortToggle />
      </div>
      {favorites.length > 0 && (
        <section aria-label={t("favorites")} className="flex flex-col gap-3">
          {favorites.map(card)}
        </section>
      )}
      {favorites.length > 0 && <hr className="my-2 border-navy-900/15" />}
      <section aria-label={t("nearby")} className="flex flex-col gap-3">
        {visible.map(card)}
      </section>
      {others.length > LIST_LIMIT && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          aria-expanded={showAll}
          className="mx-auto mt-1 flex h-11 items-center gap-1.5 rounded-full bg-white px-5 text-[14px] font-bold text-navy-900 shadow-sm outline-none hover:bg-navy-100/60 focus-visible:outline-2 focus-visible:outline-navy-700"
        >
          {showAll ? t("showLess") : t("showMore", { n: others.length - LIST_LIMIT })}
          <ChevronDown className={cx("size-4 transition-transform", showAll && "rotate-180")} aria-hidden />
        </button>
      )}
    </div>
  );
}

function MobileMap() {
  const { selected, select } = useStore();
  return (
    <div className="relative h-full">
      <CityMap minSize={720} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto mx-auto max-w-xl">
          <BranchCard view={selected} onSelect={() => select(selected.id)} className="shadow-[0_8px_30px_rgba(13,17,55,0.25)]" />
        </div>
      </div>
    </div>
  );
}

const tabClass = cx(
  "flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold text-navy-900 transition-colors outline-none",
  "data-active:text-gold-600 hover:bg-paper/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy-700",
);

function MobileLayout() {
  const { mobileTab, setMobileTab, ticket, status, t } = useStore();
  return (
    <div className="flex h-dvh flex-col lg:hidden">
      <MobileHeader />
      <Tabs.Root value={mobileTab} onValueChange={(v) => setMobileTab(v as MobileTab)} className="flex min-h-0 flex-1 flex-col">
        <Tabs.List className="relative z-10 flex shrink-0 bg-white shadow-[0_1px_0_rgba(13,17,55,0.08)]">
          <Tabs.Tab value="home" className={tabClass}>
            <House className="size-6" strokeWidth={1.75} aria-hidden />
            {t("home")}
          </Tabs.Tab>
          <Tabs.Tab value="map" className={tabClass}>
            <MapIcon className="size-6" strokeWidth={1.75} aria-hidden />
            {t("map")}
          </Tabs.Tab>
          <Tabs.Tab value="ticket" className={tabClass}>
            <span className="relative">
              <Ticket className="size-6" strokeWidth={1.75} aria-hidden />
              {ticket && (
                <span
                  className={cx(
                    "absolute -top-1.5 -right-3 min-w-5 rounded-full px-1 text-[10px] leading-4 font-black text-white tabular",
                    status?.called ? "animate-pulse bg-rose-600" : "bg-navy-900",
                  )}
                >
                  {status?.called ? "!" : status?.ahead}
                </span>
              )}
            </span>
            {t("ticket")}
          </Tabs.Tab>
          <Tabs.Indicator className="absolute bottom-0 left-0 h-[3px] w-(--active-tab-width) translate-x-(--active-tab-left) bg-gold-500 transition-[translate,width] duration-200 ease-out" />
        </Tabs.List>
        <Tabs.Panel value="home" className="scrollbar-thin min-h-0 flex-1 overflow-y-auto outline-none">
          <MobileHome />
        </Tabs.Panel>
        <Tabs.Panel value="map" className="min-h-0 flex-1 outline-none">
          <MobileMap />
        </Tabs.Panel>
        <Tabs.Panel value="ticket" className="scrollbar-thin min-h-0 flex-1 overflow-y-auto outline-none">
          <TicketView />
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop: list · map · panel                                         */
/* ------------------------------------------------------------------ */

function DesktopList() {
  const { favorites, others, selected, select, t } = useStore();
  const card = (v: BranchView) => <BranchCard key={v.id} view={v} selected={v.id === selected.id} onSelect={() => select(v.id)} />;
  return (
    <aside className="flex min-h-0 flex-col border-r border-navy-900/10">
      <div className="flex shrink-0 flex-col gap-2 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[17px] font-extrabold text-navy-900">{t("nearby")}</h2>
          <SortToggle />
        </div>
        <ListMeta />
      </div>
      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pt-1 pb-6">
        {favorites.map(card)}
        {favorites.length > 0 && <hr className="my-1 border-navy-900/15" />}
        {others.map(card)}
      </div>
    </aside>
  );
}

const panelTabClass = cx(
  "relative flex h-12 flex-1 items-center justify-center gap-2 text-[14px] font-bold text-muted transition-colors outline-none",
  "data-active:text-navy-900 hover:text-navy-900 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy-700",
);

function DesktopPanelTabs() {
  const { desktopPanel, setDesktopPanel, selected, ticket, t } = useStore();
  return (
    <Tabs.Root
      value={desktopPanel}
      onValueChange={(v) => setDesktopPanel(v as DesktopPanel)}
      render={<aside />}
      className="flex min-h-0 flex-col border-l border-navy-900/10 bg-white"
    >
      <Tabs.List className="relative flex shrink-0 border-b border-navy-900/10">
        <Tabs.Tab value="details" className={panelTabClass}>
          {t("details")}
        </Tabs.Tab>
        <Tabs.Tab value="ticket" className={panelTabClass}>
          {t("myTicket")}
          {ticket && <span className="rounded-full bg-navy-900 px-1.5 text-[11px] leading-5 text-white tabular">#{ticket.number}</span>}
        </Tabs.Tab>
        <Tabs.Indicator className="absolute bottom-0 left-0 h-[3px] w-(--active-tab-width) translate-x-(--active-tab-left) bg-gold-500 transition-[translate,width] duration-200 ease-out" />
      </Tabs.List>
      <Tabs.Panel value="details" className="scrollbar-thin min-h-0 flex-1 overflow-y-auto outline-none">
        <BranchPanel view={selected} />
      </Tabs.Panel>
      <Tabs.Panel value="ticket" className="scrollbar-thin min-h-0 flex-1 overflow-y-auto bg-paper outline-none">
        <TicketView />
      </Tabs.Panel>
    </Tabs.Root>
  );
}

function MapLegend() {
  const { t } = useStore();
  return (
    <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-1.5 rounded-xl bg-white/90 px-3 py-2.5 text-[12px] font-semibold text-navy-900 shadow-sm backdrop-blur">
      <span className="flex items-center gap-2">
        <span className="h-1 w-4 rounded-full bg-line-2" aria-hidden /> Line 2
      </span>
      <span className="flex items-center gap-2">
        <span className="h-1 w-4 rounded-full bg-line-sb" aria-hidden /> Sinbundang
      </span>
      <span className="flex items-center gap-2">
        <span className="size-3 rounded-full border-2 border-white bg-sky-500 shadow" aria-hidden /> {t("you")}
      </span>
    </div>
  );
}

function DesktopLayout() {
  return (
    <div className="hidden h-dvh flex-col lg:flex">
      <DesktopHeader />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(340px,390px)_minmax(0,1fr)_minmax(340px,400px)]">
        <DesktopList />
        <main className="relative min-h-0">
          <CityMap minSize={900} />
          <MapLegend />
        </main>
        <DesktopPanelTabs />
      </div>
    </div>
  );
}
