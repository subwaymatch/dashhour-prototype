"use client";

import * as React from "react";
import Link from "next/link";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Progress } from "@base-ui/react/progress";
import { encode } from "uqr";
import { Check, CircleCheck, Clock, ListChecks, Navigation, Undo2, User, X } from "lucide-react";
import { SERVICES } from "@/lib/data";
import { formatClock, formatCountdown, formatDistance } from "@/lib/sim";
import { SERVICE_ICONS } from "./take-ticket";
import { useStore } from "./store";
import { backdropClass, cx, dangerButton, focusRing, navyButton, popupAnimation, primaryButton, secondaryButton } from "./ui";

const R = 84;
const CIRC = 2 * Math.PI * R;

/** Ring that empties as the queue moves, after sketch ③ ("a shrinking graph"). */
function QueueRing({ progress, children, label }: { progress: number; children: React.ReactNode; label: string }) {
  return (
    <Progress.Root value={Math.round(progress * 100)} aria-label={label} className="relative mx-auto size-[188px]">
      <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="100" cy="100" r={R} fill="none" stroke="var(--color-gold-100)" strokeWidth="12" />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke="var(--color-gold-500)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${CIRC * (1 - progress)} ${CIRC}`}
          className="transition-[stroke-dasharray] duration-500 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </Progress.Root>
  );
}

function QrCode({ value, className }: { value: string; className?: string }) {
  const { data, size } = React.useMemo(() => encode(value, { ecc: "M" }), [value]);
  let d = "";
  data.forEach((row, y) => row.forEach((on, x) => on && (d += `M${x} ${y}h1v1h-1z`)));
  return (
    <svg viewBox={`-2 -2 ${size + 4} ${size + 4}`} className={className} role="img" aria-label="Check-in QR code" shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={size + 4} height={size + 4} fill="white" />
      <path d={d} fill="var(--color-navy-950)" />
    </svg>
  );
}

export function TicketStub({ className }: { className?: string }) {
  const { ticket, ticketBranch, status, t, lang, showOnMap, setCancelOpen, finishTicket, delayTurn } = useStore();
  if (!ticket || !ticketBranch || !status) return null;

  const serving = status.called ? ticket.number : ticket.number - 1 - status.ahead;
  const ServiceIcon = SERVICE_ICONS[ticket.service];

  return (
    <div className={cx("mx-auto w-full max-w-[400px] drop-shadow-[0_16px_32px_rgba(13,17,55,0.16)]", className)}>
      <div className="ticket-edges relative bg-white px-6 pt-9 pb-7 text-center">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-paper px-3 py-1.5 text-xs font-semibold text-navy-900">
            <ServiceIcon className="size-3.5" aria-hidden />
            {SERVICES[ticket.service].name[lang]}
          </span>
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            aria-label={t("cancelTicket")}
            className={cx("-mr-2 inline-flex size-10 items-center justify-center rounded-full text-muted hover:bg-paper hover:text-ink", focusRing)}
          >
            <X className="size-5" />
          </button>
        </div>

        <p className={cx("mt-5 text-sm font-semibold", status.called ? "text-rose-700" : "text-navy-900")}>
          {status.called ? t("goToCounter", { n: ticket.counter }) : t("beThereBy", { t: formatClock(status.calledAt) })}
        </p>
        <p className="mt-1 font-display text-5xl leading-[0.95] font-extrabold tracking-[-0.04em] text-navy-900 tabular">{ticket.number}</p>
        <p className="mt-3 text-base leading-tight">
          <span className="font-bold text-gold-700">{ticketBranch.bankName}</span>{" "}
          <span className="font-medium text-gold-700">{ticketBranch.branchName}</span>
        </p>
        <p className="mt-1 text-xs text-muted">
          {formatDistance(ticketBranch.distance)} · {t("walkMin", { n: ticketBranch.travel.walk })}
        </p>

        <div className="mt-6">
          {status.called ? (
            <div className="mx-auto flex max-w-[260px] flex-col items-center">
              <img src="/images/your-turn.webp" alt="" className="size-40 object-contain" />
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {t("graceNote", { c: ticket.counter, t: formatCountdown(status.grace) })}
              </p>
            </div>
          ) : (
            <QueueRing progress={status.progress} label={t("aheadOfYou", { n: status.ahead })}>
              <p className="flex items-center gap-1.5 text-sm font-medium text-muted">
                <User className="size-4" aria-hidden />
                <span className="tabular">{t("aheadOfYou", { n: status.ahead })}</span>
              </p>
              <p className="mt-1 font-display text-2xl leading-none font-bold text-navy-900 tabular" aria-live="off">
                {formatCountdown(status.remaining)}
              </p>
              <p className="mt-1 text-xs font-medium text-muted">{t("timeLeft")}</p>
            </QueueRing>
          )}
        </div>
        <p className="mt-4 text-xs text-muted tabular">
          {t("nowServing", { n: serving })} · {t("counterLabel", { n: ticket.counter })}
        </p>

        <div className="mt-6 border-t-[1.5px] border-dashed border-line" />

        <div className="mt-6 flex items-center gap-4 text-left">
          <QrCode value={`DASHHOUR:${ticket.id}:${ticket.number}`} className="size-24 shrink-0 rounded-sm ring-1 ring-line" />
          <div className="min-w-0">
            <p className="text-xs leading-snug font-medium text-ink">{t("checkIn")}</p>
            <p className="mt-1 font-mono text-2xs tracking-wider text-muted uppercase">{ticket.id}</p>
          </div>
        </div>

        {status.called ? (
          <button type="button" className={cx(navyButton, "mt-6 w-full")} onClick={finishTicket}>
            <CircleCheck className="size-5" aria-hidden />
            {t("finish")}
          </button>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => showOnMap(ticketBranch.id)} className={secondaryButton}>
              <Navigation className="size-4" aria-hidden />
              {t("directions")}
            </button>
            <button type="button" onClick={delayTurn} disabled={ticket.delayed > 0} className={cx(secondaryButton, "disabled:opacity-45")}>
              <Undo2 className="size-4" aria-hidden />
              {t("delayTurn")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function TicketTimeline({ className }: { className?: string }) {
  const { ticket, ticketBranch, status, sim, t } = useStore();
  if (!ticket || !ticketBranch || !status) return null;
  const leaveAt = status.calledAt - ticketBranch.travel.walk - 2;
  const almostAt = status.calledAt - 3 * ticket.rate;
  const steps = [
    { label: t("tlIssued"), at: ticket.issuedAt },
    { label: t("tlLeave"), at: Math.max(ticket.issuedAt, leaveAt), note: t("walkMin", { n: ticketBranch.travel.walk }) },
    ...(ticket.ahead + ticket.delayed > 3 ? [{ label: t("tlAlmost"), at: almostAt }] : []),
    { label: t("tlCalled"), at: status.calledAt, note: t("counterLabel", { n: ticket.counter }) },
  ];
  const current = steps.findIndex((s) => s.at > sim);
  return (
    <section className={cx("rounded-lg bg-white p-5 shadow-card ring-1 ring-line/70", className)}>
      <h2 className="text-sm font-bold text-ink">{t("timeline")}</h2>
      <ol className="mt-4">
        {steps.map((s, i) => {
          const done = current === -1 || i < current;
          const next = i === current;
          return (
            <li key={s.label} className="relative flex gap-3 pb-5 last:pb-0">
              {i < steps.length - 1 && (
                <span aria-hidden className={cx("absolute top-6 bottom-0 left-[11px] w-0.5", done ? "bg-navy-900" : "bg-line")} />
              )}
              <span
                aria-hidden
                className={cx(
                  "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full",
                  done ? "bg-navy-900 text-white" : next ? "bg-gold-500 ring-4 ring-gold-100" : "bg-white ring-2 ring-line",
                )}
              >
                {done && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
                <div>
                  <p className={cx("text-sm font-semibold", done || next ? "text-ink" : "text-muted")}>{s.label}</p>
                  {s.note && <p className="text-xs text-muted">{s.note}</p>}
                </div>
                <span className="text-xs font-medium text-muted tabular">{formatClock(s.at)}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function BringList({ className }: { className?: string }) {
  const { ticket, t, lang } = useStore();
  if (!ticket) return null;
  return (
    <section className={cx("rounded-lg bg-white p-5 shadow-card ring-1 ring-line/70", className)}>
      <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
        <ListChecks className="size-4" aria-hidden />
        {t("whatToBring")}
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {SERVICES[ticket.service].bring.map((item) => (
          <li key={item.en} className="flex items-center gap-2.5 text-sm text-ink/85">
            <span className="flex size-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Check className="size-3" strokeWidth={3} aria-hidden />
            </span>
            {item[lang]}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TicketBranchCard({ className }: { className?: string }) {
  const { ticketBranch, t, lang } = useStore();
  if (!ticketBranch) return null;
  return (
    <Link
      href={`/branch/${ticketBranch.id}`}
      className={cx("flex overflow-hidden rounded-lg bg-white shadow-card ring-1 ring-line/70 transition-shadow hover:shadow-float", focusRing, className)}
    >
      <img src={`/images/${ticketBranch.photo}-sm.webp`} alt="" className="w-28 shrink-0 object-cover" />
      <div className="min-w-0 p-4">
        <p className="text-xs text-muted">{ticketBranch.bankName}</p>
        <p className="truncate text-base font-bold text-ink">{ticketBranch.branchName}</p>
        <p className="mt-1 truncate text-xs text-muted">{ticketBranch.address[lang]}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
          <Clock className="size-3" aria-hidden />
          {t("hoursValue")}
        </p>
      </div>
    </Link>
  );
}

export function EmptyTicket() {
  const { t } = useStore();
  return (
    <div className="flex flex-col items-center justify-center px-8 py-14 text-center">
      <img src="/images/empty-ticket.webp" alt="" className="size-44 object-contain" />
      <p className="mt-4 text-lg font-bold text-ink">{t("noTicket")}</p>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{t("noTicketBody")}</p>
      <Link href="/" className={cx(primaryButton, "mt-6")}>
        {t("findBranch")}
      </Link>
    </div>
  );
}

export function CancelTicketDialog() {
  const { cancelOpen, setCancelOpen, cancelTicket, ticket, t } = useStore();
  return (
    <AlertDialog.Root open={cancelOpen} onOpenChange={setCancelOpen}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={backdropClass} />
        <AlertDialog.Popup
          className={cx(
            "fixed top-1/2 left-1/2 w-[22rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 text-ink shadow-2xl outline-none",
            popupAnimation,
          )}
        >
          <AlertDialog.Title className="text-base font-bold text-ink">{t("cancelTitle", { num: ticket?.number ?? "" })}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-muted">{t("cancelBody")}</AlertDialog.Description>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <AlertDialog.Close className={secondaryButton}>{t("keepTicket")}</AlertDialog.Close>
            <button type="button" onClick={cancelTicket} className={dangerButton}>
              {t("cancelTicket")}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
