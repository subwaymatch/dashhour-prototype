"use client";

import { Meter } from "@base-ui/react/meter";
import { Bus, CarTaxiFront, ChartSpline, Clock, Footprints, MapPin, Ticket, TrendingDown, TrendingUp, Users } from "lucide-react";
import { servingAt } from "@/lib/data";
import { dayMinute, formatDistance } from "@/lib/sim";
import { FavoriteButton } from "./branch-card";
import { MiniMap } from "./city-map";
import { CrowdChart } from "./crowd-chart";
import { useStore, type BranchView } from "./store";
import { cx, navyButton, primaryButton } from "./ui";

function SectionTitle({ icon: Icon, children, aside }: { icon: typeof MapPin; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-navy-900">
        <Icon className="size-4" aria-hidden />
        {children}
      </h3>
      {aside}
    </div>
  );
}

function CrowdNote({ view }: { view: BranchView }) {
  const { t } = useStore();
  if (Math.abs(view.quieterBy) < 5) return <span className="text-[13px] text-muted">{t("usual")}</span>;
  const quieter = view.quieterBy > 0;
  const Icon = quieter ? TrendingDown : TrendingUp;
  return (
    <span className={cx("flex items-center gap-1 text-right text-[13px] font-semibold", quieter ? "text-emerald-700" : "text-rose-700")}>
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {t(quieter ? "quieter" : "busier", { n: Math.abs(view.quieterBy) })}
    </span>
  );
}

/** Route times, crowd chart and (on mobile) a map preview — the expanded part of sketch ④. */
export function BranchDetail({ view, showMiniMap }: { view: BranchView; showMiniMap?: boolean }) {
  const { t, lang, showOnMap } = useStore();
  const modes = [
    { icon: Footprints, label: t("walk"), min: view.travel.walk },
    { icon: Bus, label: t("bus"), min: view.travel.bus },
    { icon: CarTaxiFront, label: t("taxi"), min: view.travel.taxi },
  ];
  return (
    <div className="flex flex-col">
      <section className="space-y-2 px-5 pt-4 pb-3">
        <SectionTitle icon={MapPin} aside={<span className="text-right text-[13px] font-semibold text-navy-900">{view.via[lang]}</span>}>
          {t("route")}
        </SectionTitle>
        <ul className="flex gap-4 text-[13px] text-muted">
          {modes.map(({ icon: Icon, label, min }) => (
            <li key={label} className="flex items-center gap-1.5">
              <Icon className="size-4 text-navy-900" aria-hidden />
              <span>
                {label} <b className="font-bold text-navy-900 tabular">{min}</b>
                {t("min")}
              </span>
            </li>
          ))}
        </ul>
      </section>
      {showMiniMap && (
        <button
          type="button"
          onClick={() => showOnMap(view.id)}
          className="block outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy-700"
          aria-label={t("map")}
        >
          <MiniMap branch={view} className="h-36" />
        </button>
      )}
      <section className="space-y-1 px-5 pt-4 pb-4">
        <SectionTitle icon={ChartSpline} aside={<CrowdNote view={view} />}>
          {t("crowd")}
        </SectionTitle>
        <CrowdChart branch={view} />
      </section>
    </div>
  );
}

/** Desktop side panel for the selected branch. */
export function BranchPanel({ view }: { view: BranchView }) {
  const { t, sim, requestTicket, showTicket, ticket } = useStore();
  const mine = ticket?.branchId === view.id;
  const level = Math.round(view.crowd * 100);
  const levelLabel = t(level < 40 ? "quiet" : level < 70 ? "moderate" : "busy");
  return (
    <div className="flex flex-col">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-gold-700">{view.bankName}</p>
            <h2 className="text-2xl leading-tight font-extrabold text-navy-900">{view.branchName}</h2>
          </div>
          <FavoriteButton view={view} className="-mt-1 -mr-2" />
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-paper/70 p-3 text-center">
          <div>
            <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">
              <Clock className="mx-auto mb-1 size-4 text-navy-900" aria-hidden />
              {t("waitLabel")}
            </dt>
            <dd className="font-display text-2xl font-black text-navy-900 tabular">
              {view.wait}
              <span className="ml-0.5 text-sm font-extrabold">{t("min")}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">
              <Users className="mx-auto mb-1 size-4 text-navy-900" aria-hidden />
              {t("queueLabel")}
            </dt>
            <dd className="font-display text-2xl font-black text-navy-900 tabular">{view.waiting}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">
              <MapPin className="mx-auto mb-1 size-4 text-navy-900" aria-hidden />
              {t("distanceLabel")}
            </dt>
            <dd className="font-display text-2xl font-black text-navy-900 tabular">{formatDistance(view.distance)}</dd>
          </div>
        </dl>
        <Meter.Root value={level} className="mt-4 grid grid-cols-[1fr_auto] gap-y-1.5">
          <Meter.Label className="text-[13px] font-semibold text-navy-900">{t("crowdNow")}</Meter.Label>
          <Meter.Value className="text-[13px] font-semibold text-muted">{(_, value) => `${value}% · ${levelLabel}`}</Meter.Value>
          <Meter.Track className="col-span-2 h-2 overflow-hidden rounded-full bg-navy-100">
            <Meter.Indicator className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-600 transition-[width] duration-500" />
          </Meter.Track>
        </Meter.Root>
        <p className="mt-3 text-[13px] text-muted">
          {t("nowServing", { n: servingAt(view, Math.floor(dayMinute(sim))) })} · {t("closed")}
        </p>
        <button
          type="button"
          className={cx(mine ? navyButton : primaryButton, "mt-4 w-full")}
          onClick={() => (mine ? showTicket() : requestTicket(view.id))}
        >
          <Ticket className="size-5" aria-hidden />
          {mine ? t("viewTicket") : t("takeTicket")}
        </button>
      </div>
      <div className="border-t border-dashed border-gold-300">
        <BranchDetail view={view} />
      </div>
    </div>
  );
}
