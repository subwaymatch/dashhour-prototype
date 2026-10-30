"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Meter } from "@base-ui/react/meter";
import {
  Accessibility,
  ArrowLeft,
  Bus,
  CarTaxiFront,
  ChartSpline,
  CircleParking,
  Clock,
  Copy,
  CreditCard,
  Footprints,
  Languages,
  MapPin,
  Phone,
  Share2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { AMENITIES, CLOSE_MIN, SERVICES, servingAt, type AmenityKey, type ServiceKey } from "@/lib/data";
import { dayMinute, formatClock, formatDistance } from "@/lib/sim";
import { BankBadge } from "../bank-badge";
import { CrowdBars, FavoriteButton, TakeTicketButton, crowdLabelKey } from "../branch-card";
import { MiniMap } from "../city-map";
import { CrowdChart } from "../crowd-chart";
import { useStore, type BranchView } from "../store";
import { SERVICE_ICONS } from "../take-ticket";
import { cx, focusRing } from "../ui";

const AMENITY_ICONS: Record<AmenityKey, typeof CircleParking> = {
  parking: CircleParking,
  accessible: Accessibility,
  atm24: CreditCard,
  english: Languages,
};

const ALL_SERVICES: ServiceKey[] = ["general", "loan", "fx", "business"];

export function Section({ title, icon: Icon, aside, children, className }: { title: string; icon?: typeof MapPin; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cx("rounded-lg bg-white p-5 shadow-card ring-1 ring-line/70", className)}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
          {Icon && <Icon className="size-4 text-navy-900" aria-hidden />}
          {title}
        </h2>
        {aside}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CrowdNote({ view }: { view: BranchView }) {
  const { t } = useStore();
  if (Math.abs(view.quieterBy) < 5) return <span className="text-xs text-muted">{t("usual")}</span>;
  const quieter = view.quieterBy > 0;
  const Icon = quieter ? TrendingDown : TrendingUp;
  return (
    <span className={cx("flex items-center gap-1 text-right text-xs font-semibold", quieter ? "text-emerald-700" : "text-rose-700")}>
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {t(quieter ? "quieter" : "busier", { n: Math.abs(view.quieterBy) })}
    </span>
  );
}

export function ServiceQueues({ view }: { view: BranchView }) {
  const { t, lang, sim } = useStore();
  return (
    <ul className="-my-1 divide-y divide-line">
      {ALL_SERVICES.map((s) => {
        const q = view.queues[s];
        const Icon = SERVICE_ICONS[s];
        return (
          <li key={s} className={cx("flex items-center gap-3 py-3", !q && "opacity-45")}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-paper text-navy-900">
              <Icon className="size-[18px]" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{SERVICES[s].name[lang]}</p>
              <p className="truncate text-xs text-muted">
                {q ? t("nowServing", { n: servingAt(view, s, Math.floor(dayMinute(sim))) }) : t("notOffered")}
              </p>
            </div>
            {q && (
              <div className="text-right">
                <p className="font-display text-base font-bold text-navy-900 tabular">
                  {q.wait}
                  <span className="ml-0.5 text-xs font-semibold">{t("min")}</span>
                </p>
                <p className="text-xs text-muted">{t("waitingCount", { n: q.waiting })}</p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function CrowdSection({ view, className }: { view: BranchView; className?: string }) {
  const { t } = useStore();
  return (
    <Section title={t("crowd")} icon={ChartSpline} aside={<CrowdNote view={view} />} className={className}>
      <CrowdChart branch={view} best={view.bestTime} />
      <p className="mt-3 flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
        <Sparkles className="size-4 shrink-0" aria-hidden />
        {t("bestTime", { t: `${formatClock(view.bestTime)}–${formatClock(view.bestTime + 30)}` })}
      </p>
    </Section>
  );
}

export function RouteSection({ view, className }: { view: BranchView; className?: string }) {
  const { t, lang, showOnMap } = useStore();
  const modes = [
    { icon: Footprints, label: t("walk"), min: view.travel.walk },
    { icon: Bus, label: t("bus"), min: view.travel.bus },
    { icon: CarTaxiFront, label: t("taxi"), min: view.travel.taxi },
  ];
  return (
    <Section title={t("route")} icon={MapPin} aside={<span className="text-right text-xs font-semibold text-navy-900">{view.via[lang]}</span>} className={className}>
      <button
        type="button"
        onClick={() => showOnMap(view.id)}
        aria-label={t("map")}
        className="block w-full overflow-hidden rounded-md ring-1 ring-line outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
      >
        <MiniMap branch={view} className="h-36" />
      </button>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {modes.map(({ icon: Icon, label, min }) => (
          <li key={label} className="flex flex-col items-center rounded-md bg-paper py-2.5">
            <Icon className="size-[18px] text-navy-900" aria-hidden />
            <span className="mt-1 text-xs text-muted">{label}</span>
            <span className="text-sm font-bold text-ink tabular">
              {min}
              <span className="ml-0.5 text-2xs font-semibold text-muted">{t("min")}</span>
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function InfoSection({ view, className }: { view: BranchView; className?: string }) {
  const { t, lang, notify } = useStore();
  const rows = [
    { icon: MapPin, label: t("address"), value: view.address[lang], action: { label: t("copyAddress"), icon: Copy, run: () => {
      void navigator.clipboard?.writeText(view.address[lang]).catch(() => {});
      notify(t("addressCopied"));
    } } },
    { icon: Clock, label: t("hours"), value: t("hoursValue") },
    { icon: Phone, label: t("phone"), value: view.phone, action: { label: t("call"), icon: Phone, run: () => notify(t("callDisabled")) } },
    { icon: Users, label: t("counters"), value: t("countersValue", { n: view.counters }) },
  ];
  return (
    <Section title={t("branchInfo")} className={className}>
      <dl className="-my-1 divide-y divide-line">
        {rows.map(({ icon: Icon, label, value, action }) => (
          <div key={label} className="flex items-center gap-3 py-3">
            <Icon className="size-[18px] shrink-0 text-muted" aria-hidden />
            <div className="min-w-0 flex-1">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="text-sm font-medium text-ink">{value}</dd>
            </div>
            {action && (
              <button type="button" onClick={action.run} className={cx("inline-flex h-8 items-center gap-1.5 rounded-md bg-paper px-3 text-xs font-semibold text-navy-900 hover:bg-line", focusRing)}>
                <action.icon className="size-3.5" aria-hidden />
                {action.label}
              </button>
            )}
          </div>
        ))}
      </dl>
    </Section>
  );
}

function Facilities({ view, className }: { view: BranchView; className?: string }) {
  const { t, lang } = useStore();
  return (
    <Section title={t("facilities")} className={className}>
      <ul className="flex flex-wrap gap-2">
        {view.amenities.map((a) => {
          const Icon = AMENITY_ICONS[a];
          return (
            <li key={a} className="inline-flex items-center gap-1.5 rounded-md bg-navy-100/70 px-3 py-1.5 text-xs font-medium text-navy-900">
              <Icon className="size-3.5" aria-hidden />
              {AMENITIES[a][lang]}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function Hero({ view }: { view: BranchView }) {
  const { t, notify } = useStore();
  const router = useRouter();
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: view.fullName, url });
      else {
        await navigator.clipboard.writeText(url);
        notify(t("linkCopied"));
      }
    } catch {
      // Share sheet dismissed.
    }
  };
  const glass = "inline-flex size-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-md transition-colors hover:bg-black/35 " + focusRing;
  return (
    <div className="relative h-[300px] overflow-hidden lg:h-[360px] lg:rounded-lg">
      <img src={`/images/${view.photo}.webp`} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />
      <div className="absolute inset-x-0 top-0 flex items-center gap-2 px-3 pt-[calc(0.75rem+env(safe-area-inset-top))] lg:px-4 lg:pt-4">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
          aria-label={t("back")}
          className={glass}
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex-1" />
        <button type="button" onClick={share} aria-label={t("share")} className={glass}>
          <Share2 className="size-[18px]" />
        </button>
        <FavoriteButton view={view} tone="dark" />
      </div>
    </div>
  );
}

function TitleBlock({ view }: { view: BranchView }) {
  const { t, lang } = useStore();
  const level = crowdLabelKey(view.crowd);
  return (
    <div className="flex items-start gap-3">
      <BankBadge bank={view.bank} className="size-12 ring-4 ring-white" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-muted">{view.bankName}</p>
        <h1 className="text-xl leading-tight font-bold tracking-tight text-ink lg:text-2xl">{view.branchName}</h1>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
            <span className="size-2 rounded-full bg-emerald-500" />
            {t("openUntil", { t: `${CLOSE_MIN / 60}:00` })}
          </span>
          <span aria-hidden>·</span>
          <span>{formatDistance(view.distance)}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <CrowdBars level={view.crowd} />
            {t(level)}
          </span>
        </p>
        <p className="mt-1 truncate text-xs text-muted">{view.address[lang]}</p>
      </div>
    </div>
  );
}

function Stats({ view }: { view: BranchView }) {
  const { t } = useStore();
  const level = Math.round(view.crowd * 100);
  return (
    <div className="grid grid-cols-3 divide-x divide-line rounded-lg bg-white py-4 shadow-card ring-1 ring-line/70">
      {[
        { label: t("minWait"), value: view.wait },
        { label: t("inQueue"), value: view.waiting },
        { label: t("crowdNow"), value: `${level}%` },
      ].map((s) => (
        <div key={s.label} className="px-2 text-center">
          <p className="font-display text-xl leading-none font-bold text-navy-900 tabular">{s.value}</p>
          <p className="mt-1.5 text-xs text-muted">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/** Full branch page: hero, live queues, crowd, route, facilities and info. */
export function BranchScreen({ id }: { id: string }) {
  const { viewById, t, lang } = useStore();
  const view = viewById(id);
  if (!view) return null;
  return (
    <div className="mx-auto max-w-6xl lg:px-6 lg:py-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-6">
        <div>
          <Hero view={view} />
          <div className="relative -mt-8 rounded-t-lg bg-paper px-4 pt-5 lg:mt-6 lg:rounded-none lg:px-0 lg:pt-0">
            <TitleBlock view={view} />
            <div className="mt-5 flex flex-col gap-4 pb-28 lg:pb-0">
              <Stats view={view} />
              <Section title={t("servicesTitle")} className="lg:hidden">
                <ServiceQueues view={view} />
              </Section>
              <div className="flex flex-col gap-4 xl:grid xl:grid-cols-2 xl:items-start">
                <CrowdSection view={view} />
                <RouteSection view={view} />
              </div>
              <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] xl:items-start">
                <Facilities view={view} />
                <InfoSection view={view} />
              </div>
            </div>
          </div>
        </div>
        <aside className="sticky top-22 hidden flex-col gap-4 lg:flex">
          <Section title={t("servicesTitle")}>
            <ServiceQueues view={view} />
          </Section>
          <div className="rounded-lg bg-navy-900 p-5 text-white shadow-float">
            <p className="text-xs text-white/65">{SERVICES.general.name[lang]}</p>
            <p className="font-display text-3xl leading-none font-bold tabular">
              {view.wait}
              <span className="ml-1 text-base font-semibold text-white/70">{t("min")}</span>
            </p>
            <Meter.Root value={Math.round(view.crowd * 100)} className="mt-4" aria-label={t("crowdNow")}>
              <Meter.Track className="block h-1.5 overflow-hidden rounded-full bg-white/15">
                <Meter.Indicator className="block h-full rounded-full bg-gold-500" />
              </Meter.Track>
            </Meter.Root>
            <TakeTicketButton view={view} size="lg" className="mt-5 w-full justify-center" />
          </div>
        </aside>
      </div>
      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg leading-none font-bold text-navy-900 tabular">
              {view.wait}
              <span className="ml-1 text-xs font-semibold">{t("minWait")}</span>
            </p>
            <p className="mt-1 text-xs text-muted">{t("waitingCount", { n: view.waiting })}</p>
          </div>
          <TakeTicketButton view={view} size="lg" />
        </div>
      </div>
    </div>
  );
}

