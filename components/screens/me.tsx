"use client";

import Link from "next/link";
import { Switch } from "@base-ui/react/switch";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { BellRing, BookOpen, ChevronRight, Clock4, Languages, RotateCcw, ShieldAlert, Sparkles, Ticket, Timer } from "lucide-react";
import { SERVICES, type Visit } from "@/lib/data";
import { SPEEDS } from "@/lib/sim";
import { BankBadge } from "../bank-badge";
import { MobileTopBar } from "../shell";
import { useStore } from "../store";
import { cx, focusRing } from "../ui";

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className="px-3 text-center">
      <p className={cx("font-display text-xl leading-none font-bold tabular", tone === "warn" ? "text-rose-700" : "text-navy-900")}>{value}</p>
      <p className="mt-1.5 text-xs leading-tight text-muted">{label}</p>
    </div>
  );
}

function VisitRow({ visit }: { visit: Visit }) {
  const { viewById, t, lang } = useStore();
  const view = viewById(visit.branchId);
  if (!view) return null;
  const date = new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-US", { month: "short", day: "numeric" }).format(visit.at);
  const chip = {
    served: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-paper text-muted",
    missed: "bg-rose-50 text-rose-700",
  }[visit.status];
  const label = { served: t("statusServed"), cancelled: t("statusCancelled"), missed: t("statusMissed") }[visit.status];
  return (
    <li>
      <Link href={`/branch/${view.id}`} className={cx("flex items-center gap-3 rounded-md px-2 py-3 hover:bg-paper", focusRing)}>
        <BankBadge bank={view.bank} className="size-10 text-xs" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{view.fullName}</p>
          <p className="truncate text-xs text-muted">
            {SERVICES[visit.service].name[lang]} · #{visit.number}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-muted tabular">
            {date} · {visit.time}
          </p>
          <span className={cx("mt-1 inline-block rounded-sm px-2 py-0.5 text-2xs font-semibold", chip)}>
            {visit.status === "served" ? t("waitedMin", { n: visit.waited }) : label}
          </span>
        </div>
      </Link>
    </li>
  );
}

function SettingRow({ icon: Icon, title, desc, children }: { icon: typeof BellRing; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-paper text-navy-900">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {desc && <p className="text-xs text-muted">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onChange}
      aria-label={label}
      className={cx("relative flex h-7 w-12 shrink-0 rounded-full bg-line p-0.5 transition-colors data-checked:bg-navy-900", focusRing)}
    >
      <Switch.Thumb className="size-6 rounded-full bg-white shadow transition-transform data-checked:translate-x-5" />
    </Switch.Root>
  );
}

const segItem = cx(
  "h-8 rounded-sm px-3 text-xs font-medium whitespace-nowrap text-muted transition-colors hover:text-ink data-pressed:bg-white data-pressed:text-ink data-pressed:shadow-sm",
  focusRing,
);

export function MeScreen() {
  const { t, lang, setLang, speed, setSpeed, settings, setSettings, history, noShows, resetDemo, setShowOnboarding, ready } = useStore();
  const served = history.filter((v) => v.status === "served");
  const saved = served.reduce((sum, v) => sum + v.waited, 0);
  const savedLabel = saved >= 60 ? t("hoursMinutes", { h: Math.floor(saved / 60), m: saved % 60 }) : t("minutesOnly", { m: saved });

  return (
    <>
      <MobileTopBar title={t("account")} />
      <div className="mx-auto max-w-xl px-4 py-6 lg:max-w-5xl lg:px-6 lg:py-10">
        <h1 className="mb-6 hidden text-xl font-bold tracking-tight text-ink lg:block">{t("account")}</h1>
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
          <div className="flex flex-col gap-4">
            <section className="rounded-lg bg-navy-900 p-5 text-white shadow-float">
              <div className="flex items-center gap-4">
                <span className="flex size-14 items-center justify-center rounded-full bg-gold-500 text-lg font-bold text-navy-950">G</span>
                <div>
                  <p className="text-lg font-bold">{t("guest")}</p>
                  <p className="text-xs text-white/65">{t("demoAccount")}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 divide-x divide-white/15 rounded-md bg-white py-4 text-ink">
                <Stat label={t("statVisits")} value={ready ? String(served.length) : "–"} />
                <Stat label={t("statSaved")} value={ready ? savedLabel : "–"} />
                <Stat label={t("statNoShows")} value={`${noShows}/3`} tone={noShows > 0 ? "warn" : undefined} />
              </div>
            </section>

            <section className="rounded-lg bg-white p-5 shadow-card ring-1 ring-line/70">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                <Clock4 className="size-4 text-navy-900" aria-hidden />
                {t("history")}
              </h2>
              {!ready ? (
                <div className="mt-4 flex flex-col gap-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="skeleton h-12 rounded-md" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">{t("noHistory")}</p>
              ) : (
                <ul className="-mx-2 mt-2">
                  {history.slice(0, 8).map((v) => (
                    <VisitRow key={v.id} visit={v} />
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="flex flex-col gap-4">
            <section className="rounded-lg bg-white px-5 py-2 shadow-card ring-1 ring-line/70">
              <h2 className="pt-3 text-sm font-bold text-ink">{t("settings")}</h2>
              <div className="divide-y divide-line">
                <SettingRow icon={BellRing} title={t("notifTurn")} desc={t("notifTurnDesc")}>
                  <SettingSwitch label={t("notifTurn")} checked={settings.turnAlerts} onChange={(v) => setSettings({ ...settings, turnAlerts: v })} />
                </SettingRow>
                <SettingRow icon={Ticket} title={t("notifAhead")} desc={t("notifAheadDesc")}>
                  <SettingSwitch label={t("notifAhead")} checked={settings.aheadAlerts} onChange={(v) => setSettings({ ...settings, aheadAlerts: v })} />
                </SettingRow>
                <SettingRow icon={Languages} title={t("language")}>
                  <ToggleGroup value={[lang]} onValueChange={(v) => v[0] && setLang(v[0] as "en" | "ko")} className="flex rounded-md bg-paper p-0.5" aria-label={t("language")}>
                    <Toggle value="en" className={segItem}>
                      EN
                    </Toggle>
                    <Toggle value="ko" className={segItem} lang="ko">
                      한국어
                    </Toggle>
                  </ToggleGroup>
                </SettingRow>
                <SettingRow icon={Timer} title={t("demoSpeed")}>
                  <ToggleGroup value={[String(speed)]} onValueChange={(v) => v[0] && setSpeed(Number(v[0]))} className="flex rounded-md bg-paper p-0.5" aria-label={t("demoSpeed")}>
                    {SPEEDS.map((s) => (
                      <Toggle key={s} value={String(s)} className={segItem}>
                        {s}×
                      </Toggle>
                    ))}
                  </ToggleGroup>
                </SettingRow>
              </div>
            </section>

            <section className="flex gap-3 rounded-lg bg-gold-100/70 p-5 ring-1 ring-gold-300/60">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-gold-700" aria-hidden />
              <div>
                <h2 className="text-sm font-bold text-ink">{t("noShowPolicy")}</h2>
                <p className="mt-1 text-xs leading-relaxed text-ink/75">{t("noShowPolicyBody")}</p>
              </div>
            </section>

            <section className="overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-line/70">
              {[
                { icon: Sparkles, label: t("replayIntro"), onClick: () => setShowOnboarding(true) },
                { icon: RotateCcw, label: t("resetDemo"), onClick: resetDemo },
              ].map(({ icon: Icon, label, onClick }) => (
                <button key={label} type="button" onClick={onClick} className={cx("flex w-full items-center gap-3 border-b border-line px-5 py-4 text-left text-sm font-medium text-ink hover:bg-paper", focusRing)}>
                  <Icon className="size-[18px] text-muted" aria-hidden />
                  <span className="flex-1">{label}</span>
                  <ChevronRight className="size-4 text-muted" aria-hidden />
                </button>
              ))}
              <Link href="/story" className={cx("flex items-center gap-3 px-5 py-4 text-sm font-medium text-ink hover:bg-paper", focusRing)}>
                <BookOpen className="size-[18px] text-muted" aria-hidden />
                <span className="flex-1">{t("aboutProject")}</span>
                <ChevronRight className="size-4 text-muted" aria-hidden />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
