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
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  AMENITIES,
  CLOSE_MIN,
  SERVICES,
  servingAt,
  type AmenityKey,
  type ServiceKey,
} from "@/lib/data";
import { dayMinute, formatClock, formatDistance } from "@/lib/sim";
import { BankBadge } from "../bank-badge";
import {
  CrowdBars,
  FavoriteButton,
  TakeTicketButton,
  crowdLabelKey,
} from "../branch-card";
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

export function Section({
  title,
  icon: Icon,
  aside,
  children,
  className,
  plain = false,
}: {
  plain?: boolean;
  title: string;
  icon?: typeof MapPin;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(plain ? "section-plain" : "section-section", className)}
    >
      <div className="section-div">
        <h2 className="section-h2">
          {Icon && <Icon className="section-icon" aria-hidden />}
          {title}
        </h2>
        {aside}
      </div>
      <div className="section-div-2">{children}</div>
    </section>
  );
}

function CrowdNote({ view }: { view: BranchView }) {
  const { t } = useStore();
  if (Math.abs(view.quieterBy) < 5)
    return <span className="crowd-note-span-usual">{t("usual")}</span>;
  const quieter = view.quieterBy > 0;
  const Icon = quieter ? TrendingDown : TrendingUp;
  return (
    <span
      className={cx(
        "crowd-note-span",
        quieter ? "crowd-note-span-2" : "crowd-note-span-3",
      )}
    >
      <Icon className="crowd-note-icon" aria-hidden />
      {t(quieter ? "quieter" : "busier", { n: Math.abs(view.quieterBy) })}
    </span>
  );
}

export function ServiceQueues({
  view,
  compact = false,
}: {
  view: BranchView;
  compact?: boolean;
}) {
  const { t, lang, sim } = useStore();
  return (
    <ul className="service-queues-ul-now-serving">
      {ALL_SERVICES.map((s) => {
        const q = view.queues[s];
        const Icon = SERVICE_ICONS[s];
        return (
          <li
            key={s}
            className={cx(
              "service-queues-li-now-serving",
              !q && "service-queues-li-now-serving-2",
            )}
          >
            <span className="service-queues-span">
              <Icon className="service-queues-icon" aria-hidden />
            </span>
            <div className="service-queues-div-now-serving">
              <p className="service-queues-p">{SERVICES[s].name[lang]}</p>
              <p className="service-queues-p-now-serving">
                {q
                  ? t("nowServing", {
                      n: servingAt(view, s, Math.floor(dayMinute(sim))),
                    })
                  : t("notOffered")}
              </p>
            </div>
            {q && (
              <div className="service-queues-div-min">
                <p
                  className={
                    compact
                      ? "service-queue-wait-compact"
                      : "service-queues-p-min"
                  }
                >
                  <span className="minute-number">{q.wait}</span>
                  <span className="service-queues-span-min">{t("min")}</span>
                </p>
                <p className="crowd-note-span-usual">
                  {t("waitingCount", { n: q.waiting })}
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function CrowdSection({
  view,
  className,
  plain = false,
}: {
  view: BranchView;
  className?: string;
  plain?: boolean;
}) {
  const { t } = useStore();
  return (
    <Section
      title={t("crowd")}
      icon={ChartSpline}
      aside={<CrowdNote view={view} />}
      className={className}
      plain={plain}
    >
      <CrowdChart branch={view} best={view.bestTime} />
      <p className="crowd-section-p-best-time">
        <Clock className="crowd-section-clock" aria-hidden />
        {t("bestTime", {
          t: `${formatClock(view.bestTime)}–${formatClock(view.bestTime + 30)}`,
        })}
      </p>
    </Section>
  );
}

export function RouteSection({
  view,
  className,
}: {
  view: BranchView;
  className?: string;
}) {
  const { t, lang, showOnMap } = useStore();
  const modes = [
    { icon: Footprints, label: t("walk"), min: view.travel.walk },
    { icon: Bus, label: t("bus"), min: view.travel.bus },
    { icon: CarTaxiFront, label: t("taxi"), min: view.travel.taxi },
  ];
  return (
    <Section
      title={t("route")}
      icon={MapPin}
      aside={<span className="route-section-span">{view.via[lang]}</span>}
      className={className}
    >
      <button
        type="button"
        onClick={() => showOnMap(view.id)}
        aria-label={t("map")}
        className="route-section-button"
      >
        <MiniMap branch={view} className="route-section-mini-map" />
      </button>
      <ul className="route-section-ul-min">
        {modes.map(({ icon: Icon, label, min }) => (
          <li key={label} className="route-section-li-min">
            <Icon className="route-section-icon" aria-hidden />
            <span className="route-section-span-2">{label}</span>
            <span className="route-section-span-min">
              <span className="minute-number">{min}</span>
              <span className="route-section-span-min-2">{t("min")}</span>
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function InfoSection({
  view,
  className,
}: {
  view: BranchView;
  className?: string;
}) {
  const { t, lang, notify } = useStore();
  const rows = [
    {
      icon: MapPin,
      label: t("address"),
      value: view.address[lang],
      action: {
        label: t("copyAddress"),
        icon: Copy,
        run: () => {
          void navigator.clipboard
            ?.writeText(view.address[lang])
            .catch(() => {});
          notify(t("addressCopied"));
        },
      },
    },
    { icon: Clock, label: t("hours"), value: t("hoursValue") },
    {
      icon: Phone,
      label: t("phone"),
      value: view.phone,
      action: {
        label: t("call"),
        icon: Phone,
        run: () => notify(t("callDisabled")),
      },
    },
    {
      icon: Users,
      label: t("counters"),
      value: t("countersValue", { n: view.counters }),
    },
  ];
  return (
    <Section title={t("branchInfo")} className={className}>
      <dl className="service-queues-ul-now-serving">
        {rows.map(({ icon: Icon, label, value, action }) => (
          <div key={label} className="service-queues-li-now-serving">
            <Icon className="info-section-icon" aria-hidden />
            <div className="service-queues-div-now-serving">
              <dt className="crowd-note-span-usual">{label}</dt>
              <dd className="info-section-dd">{value}</dd>
            </div>
            {action && (
              <button
                type="button"
                onClick={action.run}
                className={cx("info-section-button", focusRing)}
              >
                <action.icon className="info-section-action-icon" aria-hidden />
                {action.label}
              </button>
            )}
          </div>
        ))}
      </dl>
    </Section>
  );
}

function Facilities({
  view,
  className,
}: {
  view: BranchView;
  className?: string;
}) {
  const { t, lang } = useStore();
  return (
    <Section title={t("facilities")} className={className}>
      <ul className="facilities-ul">
        {view.amenities.map((a) => {
          const Icon = AMENITY_ICONS[a];
          return (
            <li key={a} className="facilities-li">
              <Icon className="info-section-action-icon" aria-hidden />
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
  const glass = cx("hero-icon-button", focusRing);
  return (
    <div className="hero-div-back">
      <img src={`/images/${view.photo}.webp`} alt="" className="hero-img" />
      <div className="hero-div" />
      <div className="hero-div-back-2">
        <button
          type="button"
          onClick={() =>
            window.history.length > 1 ? router.back() : router.push("/")
          }
          aria-label={t("back")}
          className={glass}
        >
          <ArrowLeft className="hero-arrow-left" />
        </button>
        <div className="hero-div-2" />
        <button
          type="button"
          onClick={share}
          aria-label={t("share")}
          className={glass}
        >
          <Share2 className="service-queues-icon" />
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
    <div className="title-block-div-open-until">
      <BankBadge bank={view.bank} className="title-block-bank-badge" />
      <div className="service-queues-div-now-serving">
        <p className="title-block-p">{view.bankName}</p>
        <h1 className="title-block-h1">{view.branchName}</h1>
        <p className="title-block-p-open-until">
          <span className="title-block-span-open-until">
            <span className="title-block-span" />
            {t("openUntil", { t: `${CLOSE_MIN / 60}:00` })}
          </span>
          <span aria-hidden>·</span>
          <span>{formatDistance(view.distance)}</span>
          <span aria-hidden>·</span>
          <span className="title-block-span-2">
            <CrowdBars level={view.crowd} />
            {t(level)}
          </span>
        </p>
        <p className="title-block-p-2">{view.address[lang]}</p>
      </div>
    </div>
  );
}

function Stats({ view }: { view: BranchView }) {
  const { t } = useStore();
  const level = Math.round(view.crowd * 100);
  return (
    <div className="stats-div-min-wait">
      {[
        { label: t("waitTime"), value: view.wait, unit: t("min") },
        { label: t("inQueue"), value: view.waiting, unit: t("peopleUnit") },
        { label: t("crowdNow"), value: level, unit: "%" },
      ].map((s) => (
        <div key={s.label} className="stats-div">
          <p className="stats-p">
            <span className="minute-number">{s.value}</span>
            {s.unit && <span className="stats-unit">{s.unit}</span>}
          </p>
          <p className="stats-p-2">{s.label}</p>
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
    <div className="branch-screen-div-services-title plain-page">
      <div className="branch-screen-div-services-title-2">
        <div>
          <Hero view={view} />
          <div className="branch-screen-div-services-title-3">
            <TitleBlock view={view} />
            <div className="branch-screen-div-services-title-4">
              <Stats view={view} />
              <Section
                title={t("servicesTitle")}
                className="branch-screen-section"
              >
                <ServiceQueues view={view} />
              </Section>
              <div className="branch-screen-div">
                <CrowdSection view={view} />
                <RouteSection view={view} />
              </div>
              <div className="branch-screen-div-2">
                <Facilities view={view} />
                <InfoSection view={view} />
              </div>
            </div>
          </div>
        </div>
        <aside className="branch-screen-aside-services-title">
          <Section title={t("servicesTitle")}>
            <ServiceQueues view={view} />
          </Section>
          <div className="branch-screen-action">
            <p className="branch-screen-action-label">
              {SERVICES.general.name[lang]}
            </p>
            <p className="branch-screen-action-wait">
              <span className="minute-number">{view.wait}</span>
              {t("minWait")}
              <span className="branch-screen-action-queue">
                · {t("waitingCount", { n: view.waiting })}
              </span>
            </p>
            <div className="branch-screen-meter-caption" aria-hidden>
              <span>{t("crowdNow")}</span>
              <span className="branch-screen-meter-value">
                {Math.round(view.crowd * 100)}%
              </span>
            </div>
            <Meter.Root
              value={Math.round(view.crowd * 100)}
              aria-label={t("crowdNow")}
            >
              <Meter.Track className="branch-screen-meter-track">
                <Meter.Indicator className="branch-screen-meter-indicator" />
              </Meter.Track>
            </Meter.Root>
            <TakeTicketButton
              view={view}
              size="lg"
              className="branch-screen-take-ticket-button"
            />
          </div>
        </aside>
      </div>
      {/* Mobile sticky action bar */}
      <div className="branch-screen-div-min-wait">
        <div className="branch-screen-div-min-wait-2">
          <div className="service-queues-div-now-serving">
            <p className="branch-screen-p-min-wait">
              <span className="minute-number">{view.wait}</span>
              <span className="branch-screen-span-min-wait">
                {t("minWait")}
              </span>
            </p>
            <p className="route-section-span-2">
              {t("waitingCount", { n: view.waiting })}
            </p>
          </div>
          <TakeTicketButton view={view} size="lg" />
        </div>
      </div>
    </div>
  );
}
