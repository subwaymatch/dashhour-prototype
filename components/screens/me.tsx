"use client";

import Link from "next/link";
import { Switch } from "@base-ui/react/switch";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import {
  BellRing,
  BookOpen,
  ChevronRight,
  Clock4,
  Languages,
  RotateCcw,
  ShieldAlert,
  CirclePlay,
  Ticket,
  Timer,
} from "lucide-react";
import { SERVICES, type Visit } from "@/lib/data";
import { SPEEDS } from "@/lib/sim";
import { BankBadge } from "../bank-badge";
import { MobileTopBar } from "../shell";
import { useStore } from "../store";
import { cx, focusRing } from "../ui";

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <div className="stat-div">
      <p className={cx("stat-p", tone === "warn" ? "stat-p-2" : "stat-p-3")}>
        {value}
      </p>
      <p className="stat-p-4">{label}</p>
    </div>
  );
}

function VisitRow({ visit }: { visit: Visit }) {
  const { viewById, t, lang } = useStore();
  const view = viewById(visit.branchId);
  if (!view) return null;
  const date = new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-US", {
    month: "short",
    day: "numeric",
  }).format(visit.at);
  const chip = {
    served: "chip-4",
    cancelled: "chip-5",
    missed: "chip-6",
  }[visit.status];
  const label = {
    served: t("statusServed"),
    cancelled: t("statusCancelled"),
    missed: t("statusMissed"),
  }[visit.status];
  return (
    <li>
      <Link
        href={`/branch/${view.id}`}
        className={cx("visit-row-link-waited-min", focusRing)}
      >
        <BankBadge bank={view.bank} className="visit-row-bank-badge" />
        <div className="visit-row-div">
          <p className="visit-row-p">{view.fullName}</p>
          <p className="visit-row-p-2">
            {SERVICES[visit.service].name[lang]} · #{visit.number}
          </p>
        </div>
        <div className="visit-row-div-waited-min">
          <p className="visit-row-p-3">
            {date} · {visit.time}
          </p>
          <span className={cx("visit-row-span-waited-min", chip)}>
            {visit.status === "served"
              ? t("waitedMin", { n: visit.waited })
              : label}
          </span>
        </div>
      </Link>
    </li>
  );
}

function SettingRow({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: typeof BellRing;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="setting-row-div">
      <span className="setting-row-span">
        <Icon className="setting-row-icon" aria-hidden />
      </span>
      <div className="visit-row-div">
        <p className="setting-row-p">{title}</p>
        {desc && <p className="setting-row-p-2">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onChange}
      aria-label={label}
      className={cx("setting-switch-switch-root", focusRing)}
    >
      <Switch.Thumb className="setting-switch-switch-thumb" />
    </Switch.Root>
  );
}

const segItem = cx("seg-item", focusRing);

export function MeScreen() {
  const {
    t,
    lang,
    setLang,
    speed,
    setSpeed,
    settings,
    setSettings,
    history,
    noShows,
    resetDemo,
    setShowOnboarding,
    ready,
  } = useStore();
  const served = history.filter((v) => v.status === "served");
  const saved = served.reduce((sum, v) => sum + v.waited, 0);
  const savedLabel =
    saved >= 60
      ? t("hoursMinutes", { h: Math.floor(saved / 60), m: saved % 60 })
      : t("minutesOnly", { m: saved });

  return (
    <>
      <MobileTopBar title={t("account")} />
      <div className="me-screen-div-account plain-page">
        <h1 className="me-screen-h1-account">{t("account")}</h1>
        <div className="me-screen-div-guest">
          <div className="me-screen-div-guest-2">
            <section className="me-screen-section-guest">
              <div className="me-screen-div-guest-3">
                <span className="me-screen-span">G</span>
                <div>
                  <p className="me-screen-p-guest">{t("guest")}</p>
                  <p className="me-screen-p-demo-account">{t("demoAccount")}</p>
                </div>
              </div>
              <div className="me-screen-div-stat-visits">
                <Stat
                  label={t("statVisits")}
                  value={ready ? String(served.length) : "–"}
                />
                <Stat label={t("statSaved")} value={ready ? savedLabel : "–"} />
                <Stat
                  label={t("statNoShows")}
                  value={`${noShows}/3`}
                  tone={noShows > 0 ? "warn" : undefined}
                />
              </div>
            </section>

            <section className="me-screen-section-history">
              <h2 className="me-screen-h2-history">
                <Clock4 className="me-screen-clock4" aria-hidden />
                {t("history")}
              </h2>
              {!ready ? (
                <div className="me-screen-div">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="me-screen-div-2" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <p className="me-screen-p-no-history">{t("noHistory")}</p>
              ) : (
                <ul className="me-screen-ul">
                  {history.slice(0, 8).map((v) => (
                    <VisitRow key={v.id} visit={v} />
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="me-screen-div-guest-2">
            <section className="me-screen-section-settings">
              <h2 className="me-screen-h2-settings">{t("settings")}</h2>
              <div className="me-screen-div-notif-turn">
                <SettingRow
                  icon={BellRing}
                  title={t("notifTurn")}
                  desc={t("notifTurnDesc")}
                >
                  <SettingSwitch
                    label={t("notifTurn")}
                    checked={settings.turnAlerts}
                    onChange={(v) =>
                      setSettings({ ...settings, turnAlerts: v })
                    }
                  />
                </SettingRow>
                <SettingRow
                  icon={Ticket}
                  title={t("notifAhead")}
                  desc={t("notifAheadDesc")}
                >
                  <SettingSwitch
                    label={t("notifAhead")}
                    checked={settings.aheadAlerts}
                    onChange={(v) =>
                      setSettings({ ...settings, aheadAlerts: v })
                    }
                  />
                </SettingRow>
                <SettingRow icon={Languages} title={t("language")}>
                  <ToggleGroup
                    value={[lang]}
                    onValueChange={(v) => v[0] && setLang(v[0] as "en" | "ko")}
                    className="me-screen-toggle-group"
                    aria-label={t("language")}
                  >
                    <Toggle value="en" className={segItem}>
                      EN
                    </Toggle>
                    <Toggle value="ko" className={segItem} lang="ko">
                      한국어
                    </Toggle>
                  </ToggleGroup>
                </SettingRow>
                <SettingRow icon={Timer} title={t("demoSpeed")}>
                  <ToggleGroup
                    value={[String(speed)]}
                    onValueChange={(v) => v[0] && setSpeed(Number(v[0]))}
                    className="me-screen-toggle-group"
                    aria-label={t("demoSpeed")}
                  >
                    {SPEEDS.map((s) => (
                      <Toggle key={s} value={String(s)} className={segItem}>
                        {s}×
                      </Toggle>
                    ))}
                  </ToggleGroup>
                </SettingRow>
              </div>
            </section>

            <section className="me-screen-section-no-show-policy">
              <ShieldAlert className="me-screen-shield-alert" aria-hidden />
              <div>
                <h2 className="me-screen-h2-no-show-policy">
                  {t("noShowPolicy")}
                </h2>
                <p className="me-screen-p-no-show-policy-body">
                  {t("noShowPolicyBody")}
                </p>
              </div>
            </section>

            <section className="me-screen-section-replay-intro">
              {[
                {
                  icon: CirclePlay,
                  label: t("replayIntro"),
                  onClick: () => setShowOnboarding(true),
                },
                { icon: RotateCcw, label: t("resetDemo"), onClick: resetDemo },
              ].map(({ icon: Icon, label, onClick }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  className={cx("me-screen-button", focusRing)}
                >
                  <Icon className="me-screen-icon" aria-hidden />
                  <span className="me-screen-span-2">{label}</span>
                  <ChevronRight
                    className="me-screen-chevron-right"
                    aria-hidden
                  />
                </button>
              ))}
              <Link
                href="/story"
                className={cx("me-screen-link-about-project", focusRing)}
              >
                <BookOpen className="me-screen-icon" aria-hidden />
                <span className="me-screen-span-2">{t("aboutProject")}</span>
                <ChevronRight className="me-screen-chevron-right" aria-hidden />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
