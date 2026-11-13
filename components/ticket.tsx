"use client";

import * as React from "react";
import Link from "next/link";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Progress } from "@base-ui/react/progress";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { encode } from "uqr";
import {
  Check,
  CircleCheck,
  Clock,
  FastForward,
  ListChecks,
  Navigation,
  Undo2,
  User,
  X,
} from "lucide-react";
import { SERVICES } from "@/lib/data";
import {
  SPEEDS,
  formatClock,
  formatCountdown,
  formatDistance,
} from "@/lib/sim";
import { SERVICE_ICONS } from "./take-ticket";
import { useStore } from "./store";
import {
  backdropClass,
  cx,
  dangerButton,
  focusRing,
  navyButton,
  popupAnimation,
  primaryButton,
  secondaryButton,
} from "./ui";

const R = 84;
const CIRC = 2 * Math.PI * R;

/** Ring that empties as the queue moves, after sketch ③ ("a shrinking graph"). */
function QueueRing({
  progress,
  children,
  label,
}: {
  progress: number;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Progress.Root
      value={Math.round(progress * 100)}
      aria-label={label}
      className="queue-ring-progress-root"
    >
      <svg viewBox="0 0 200 200" className="queue-ring-svg" aria-hidden>
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke="var(--color-gold-100)"
          strokeWidth="12"
        />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke="var(--color-gold-500)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${CIRC * (1 - progress)} ${CIRC}`}
          className="queue-ring-circle"
        />
      </svg>
      <div className="queue-ring-div">{children}</div>
    </Progress.Root>
  );
}

function QrCode({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const { data, size } = React.useMemo(
    () => encode(value, { ecc: "M" }),
    [value],
  );
  let d = "";
  data.forEach((row, y) =>
    row.forEach((on, x) => on && (d += `M${x} ${y}h1v1h-1z`)),
  );
  return (
    <svg
      viewBox={`-2 -2 ${size + 4} ${size + 4}`}
      className={className}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      <rect x="-2" y="-2" width={size + 4} height={size + 4} fill="white" />
      <path d={d} fill="var(--color-navy-950)" />
    </svg>
  );
}

/**
 * Demo only: the clock runs in real time, so this puts fast-forward next to the
 * countdown instead of leaving it in the options menu.
 */
function DemoSpeed() {
  const { speed, setSpeed, t } = useStore();
  return (
    <div className="demo-speed">
      <span className="demo-speed-label">
        <FastForward className="demo-speed-icon" aria-hidden />
        {t("demoSpeedShort")}
      </span>
      <ToggleGroup
        value={[String(speed)]}
        onValueChange={(v) => v[0] && setSpeed(Number(v[0]))}
        aria-label={t("demoSpeed")}
        className="demo-speed-group"
      >
        {SPEEDS.map((s) => (
          <Toggle
            key={s}
            value={String(s)}
            className={cx("demo-speed-item", focusRing)}
          >
            {s === 1 ? t("realtime") : `${s}×`}
          </Toggle>
        ))}
      </ToggleGroup>
    </div>
  );
}

export function TicketStub({ className }: { className?: string }) {
  const {
    ticket,
    ticketBranch,
    status,
    t,
    lang,
    showOnMap,
    setCancelOpen,
    finishTicket,
    delayTurn,
  } = useStore();
  if (!ticket || !ticketBranch || !status) return null;

  const serving = status.called
    ? ticket.number
    : ticket.number - 1 - status.ahead;
  const ServiceIcon = SERVICE_ICONS[ticket.service];

  return (
    <div className={cx("ticket-stub-div-cancel-ticket", className)}>
      <div className="ticket-stub-div-cancel-ticket-2">
        <div className="ticket-stub-div-cancel-ticket-3">
          <span className="ticket-stub-span">
            <ServiceIcon className="ticket-stub-service-icon" aria-hidden />
            {SERVICES[ticket.service].name[lang]}
          </span>
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            aria-label={t("cancelTicket")}
            className={cx("ticket-stub-button", focusRing)}
          >
            <X className="ticket-stub-x" />
          </button>
        </div>

        <p
          className={cx(
            "ticket-stub-p-go-to-counter",
            status.called
              ? "ticket-stub-p-go-to-counter-2"
              : "ticket-stub-p-go-to-counter-3",
          )}
        >
          {status.called
            ? t("goToCounter", { n: ticket.counter })
            : t("beThereBy", { t: formatClock(status.calledAt) })}
        </p>
        <p className="ticket-stub-p">{ticket.number}</p>
        <p className="ticket-stub-p-2">
          <span className="ticket-stub-span-2">{ticketBranch.bankName}</span>{" "}
          <span className="ticket-stub-span-3">{ticketBranch.branchName}</span>
        </p>
        <p className="ticket-stub-p-walk-min">
          {formatDistance(ticketBranch.distance)} ·{" "}
          {t("walkMin", { n: ticketBranch.travel.walk })}
        </p>

        <div className="ticket-stub-div-grace-note">
          {status.called ? (
            <div className="ticket-stub-div-grace-note-2">
              <img
                src="/images/your-turn.webp"
                alt=""
                className="ticket-stub-img"
              />
              <p className="ticket-stub-p-grace-note">
                {t("graceNote", {
                  c: ticket.counter,
                  t: formatCountdown(status.grace),
                })}
              </p>
            </div>
          ) : (
            <QueueRing
              progress={status.progress}
              label={t("aheadOfYou", { n: status.ahead })}
            >
              <p className="ticket-stub-p-ahead-of-you">
                <User className="ticket-stub-user" aria-hidden />
                <span className="ticket-stub-span-ahead-of-you">
                  {t("aheadOfYou", { n: status.ahead })}
                </span>
              </p>
              <p className="ticket-stub-p-3" aria-live="off">
                {formatCountdown(status.remaining)}
              </p>
              <p className="ticket-stub-p-time-left">{t("timeLeft")}</p>
            </QueueRing>
          )}
        </div>
        <p className="ticket-stub-p-now-serving">
          {t("nowServing", { n: serving })} ·{" "}
          {t("counterLabel", { n: ticket.counter })}
        </p>
        <DemoSpeed />

        <div className="ticket-stub-div" />

        <div className="ticket-stub-div-check-in">
          <QrCode
            value={`DASHHOUR:${ticket.id}:${ticket.number}`}
            label={t("checkInQr")}
            className="ticket-stub-qr-code"
          />
          <div className="ticket-stub-div-check-in-2">
            <p className="ticket-stub-p-check-in">{t("checkIn")}</p>
            <p className="ticket-stub-p-4">{ticket.id}</p>
          </div>
        </div>

        {status.called ? (
          <button
            type="button"
            className={cx(navyButton, "ticket-stub-button-finish")}
            onClick={finishTicket}
          >
            <CircleCheck className="ticket-stub-x" aria-hidden />
            {t("finish")}
          </button>
        ) : (
          <div className="ticket-stub-div-directions">
            <button
              type="button"
              onClick={() => showOnMap(ticketBranch.id)}
              className={secondaryButton}
            >
              <Navigation className="ticket-stub-user" aria-hidden />
              {t("directions")}
            </button>
            <button
              type="button"
              onClick={delayTurn}
              disabled={ticket.delayed > 0}
              className={cx(secondaryButton, "ticket-stub-button-delay-turn")}
            >
              <Undo2 className="ticket-stub-user" aria-hidden />
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
    {
      label: t("tlLeave"),
      at: Math.max(ticket.issuedAt, leaveAt),
      note: t("walkMin", { n: ticketBranch.travel.walk }),
    },
    ...(ticket.ahead + ticket.delayed > 3
      ? [{ label: t("tlAlmost"), at: almostAt }]
      : []),
    {
      label: t("tlCalled"),
      at: status.calledAt,
      note: t("counterLabel", { n: ticket.counter }),
    },
  ];
  const current = steps.findIndex((s) => s.at > sim);
  return (
    <section className={cx("ticket-timeline-section-timeline", className)}>
      <h2 className="ticket-timeline-h2-timeline">{t("timeline")}</h2>
      <ol className="ticket-timeline-ol">
        {steps.map((s, i) => {
          const done = current === -1 || i < current;
          const next = i === current;
          return (
            <li key={s.label} className="ticket-timeline-li">
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cx(
                    "ticket-timeline-span",
                    done ? "ticket-timeline-span-2" : "ticket-timeline-span-3",
                  )}
                />
              )}
              <span
                aria-hidden
                className={cx(
                  "ticket-timeline-span-4",
                  done
                    ? "ticket-timeline-span-5"
                    : next
                      ? "ticket-timeline-span-6"
                      : "ticket-timeline-span-7",
                )}
              >
                {done && (
                  <Check className="ticket-stub-service-icon" strokeWidth={3} />
                )}
              </span>
              <div className="ticket-timeline-div">
                <div>
                  <p
                    className={cx(
                      "ticket-timeline-p",
                      done || next
                        ? "ticket-timeline-p-2"
                        : "ticket-timeline-p-3",
                    )}
                  >
                    {s.label}
                  </p>
                  {s.note && <p className="ticket-timeline-p-4">{s.note}</p>}
                </div>
                <span className="ticket-timeline-span-8">
                  {formatClock(s.at)}
                </span>
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
    <section className={cx("ticket-timeline-section-timeline", className)}>
      <h2 className="bring-list-h2-what-to-bring">
        <ListChecks className="ticket-stub-user" aria-hidden />
        {t("whatToBring")}
      </h2>
      <ul className="bring-list-ul">
        {SERVICES[ticket.service].bring.map((item) => (
          <li key={item.en} className="bring-list-li">
            <span className="bring-list-span">
              <Check className="bring-list-check" strokeWidth={3} aria-hidden />
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
      className={cx(
        "ticket-branch-card-link-hours-value",
        focusRing,
        className,
      )}
    >
      <img
        src={`/images/${ticketBranch.photo}-sm.webp`}
        alt=""
        className="ticket-branch-card-img"
      />
      <div className="ticket-branch-card-div-hours-value">
        <p className="ticket-timeline-p-4">{ticketBranch.bankName}</p>
        <p className="ticket-branch-card-p">{ticketBranch.branchName}</p>
        <p className="ticket-branch-card-p-2">{ticketBranch.address[lang]}</p>
        <p className="ticket-branch-card-p-hours-value">
          <Clock className="bring-list-check" aria-hidden />
          {t("hoursValue")}
        </p>
      </div>
    </Link>
  );
}

export function EmptyTicket() {
  const { t } = useStore();
  return (
    <div className="empty-ticket-div-no-ticket">
      <img
        src="/images/empty-ticket.webp"
        alt=""
        className="empty-ticket-img"
      />
      <p className="empty-ticket-p-no-ticket">{t("noTicket")}</p>
      <p className="empty-ticket-p-no-ticket-body">{t("noTicketBody")}</p>
      <Link
        href="/"
        className={cx(primaryButton, "ticket-stub-div-grace-note")}
      >
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
            "cancel-ticket-dialog-alert-dialog-popup-cancel-title",
            popupAnimation,
          )}
        >
          <AlertDialog.Title className="cancel-ticket-dialog-alert-dialog-title-cancel-title">
            {t("cancelTitle", { num: ticket?.number ?? "" })}
          </AlertDialog.Title>
          <AlertDialog.Description className="cancel-ticket-dialog-alert-dialog-description-cancel-body">
            {t("cancelBody")}
          </AlertDialog.Description>
          <div className="cancel-ticket-dialog-div-keep-ticket">
            <AlertDialog.Close className={secondaryButton}>
              {t("keepTicket")}
            </AlertDialog.Close>
            <button
              type="button"
              onClick={cancelTicket}
              className={dangerButton}
            >
              {t("cancelTicket")}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
