"use client";

import * as React from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Progress } from "@base-ui/react/progress";
import { BellRing, CircleCheck, Clock, Navigation, ShieldAlert, Ticket as TicketIcon, User, X } from "lucide-react";
import { formatClock, formatCountdown, formatDistance } from "@/lib/sim";
import { useStore } from "./store";
import { backdropClass, cx, focusRing, navyButton, popupAnimation, primaryButton, secondaryButton } from "./ui";

const R = 84;
const CIRC = 2 * Math.PI * R;

/** Ring that empties as the queue moves, after sketch ③ ("a shrinking graph"). */
function QueueRing({ progress, children, label }: { progress: number; children: React.ReactNode; label: string }) {
  return (
    <Progress.Root value={Math.round(progress * 100)} aria-label={label} className="relative mx-auto size-[200px]">
      <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="100" cy="100" r={R} fill="none" stroke="var(--color-gold-500)" strokeWidth="11" />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke="var(--color-navy-900)"
          strokeWidth="11"
          strokeDasharray={`${CIRC * progress} ${CIRC}`}
          className="transition-[stroke-dasharray] duration-500 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </Progress.Root>
  );
}

export function TicketStub({ className }: { className?: string }) {
  const { ticket, ticketBranch, status, t, showOnMap, setCancelOpen, finishTicket } = useStore();
  if (!ticket || !ticketBranch || !status) return null;

  const serving = status.called ? ticket.number : ticket.number - 1 - status.ahead;

  return (
    <div className={cx("mx-auto w-full max-w-[380px] drop-shadow-[0_10px_24px_rgba(13,17,55,0.14)]", className)}>
      <div className="ticket-edges relative bg-white px-6 pt-10 pb-6 text-center">
        <button
          type="button"
          onClick={() => setCancelOpen(true)}
          aria-label={t("cancelTicket")}
          className={cx("absolute top-6 right-4 inline-flex size-10 items-center justify-center rounded-full text-muted hover:bg-paper hover:text-ink", focusRing)}
        >
          <X className="size-6" />
        </button>
        <p className="text-[14px] font-medium text-navy-900">
          {status.called ? t("yourTurn") : t("arriveBy", { t: formatClock(status.arriveBy) })}
        </p>
        <p className="mt-1 font-display text-[96px] leading-[0.95] font-black tracking-tighter text-navy-900 tabular">
          {ticket.number}
        </p>
        <p className="mt-2 text-[20px] leading-tight">
          <span className="font-extrabold text-gold-700">{ticketBranch.bankName}</span>{" "}
          <span className="font-semibold text-gold-700">{ticketBranch.branchName}</span>
        </p>
        <p className="mt-1 text-[15px] text-gold-700">({formatDistance(ticketBranch.distance)})</p>

        <div className="mt-6">
          <QueueRing progress={status.progress} label={t("aheadOfYou", { n: status.ahead })}>
            {status.called ? (
              <>
                <BellRing className="size-9 animate-bounce text-navy-900" aria-hidden />
                <p className="mt-2 max-w-[120px] text-[15px] leading-tight font-extrabold text-navy-900">{t("yourTurn")}</p>
              </>
            ) : (
              <>
                <p className="flex items-center gap-2 text-[15px] font-medium text-muted">
                  <User className="size-5" aria-hidden />
                  <span className="tabular">{t("aheadOfYou", { n: status.ahead })}</span>
                </p>
                <span className="my-2.5 h-px w-28 bg-gold-500" aria-hidden />
                <p className="flex items-center gap-2 text-[15px] font-medium text-muted" aria-live="off">
                  <Clock className="size-5" aria-hidden />
                  <span className="tabular">{formatCountdown(status.remaining)} min</span>
                </p>
              </>
            )}
          </QueueRing>
        </div>
        <p className="mt-4 text-[13px] text-muted tabular">
          {t("nowServing", { n: serving })}
        </p>

        <div className="mt-5 border-t border-dashed border-gold-500" />
        {status.called ? (
          <button type="button" className={cx(navyButton, "mt-5 w-full")} onClick={finishTicket}>
            <CircleCheck className="size-5" aria-hidden />
            {t("finish")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => showOnMap(ticketBranch.id)}
            className={cx("mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[18px] font-extrabold text-gold-700 hover:bg-gold-100", focusRing)}
          >
            <Navigation className="size-5" aria-hidden />
            {t("directions")}
          </button>
        )}
      </div>
      <ul className="mt-5 flex flex-wrap justify-center gap-2 text-[12px] font-semibold text-navy-900/80">
        <li className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5">
          <TicketIcon className="size-3.5" aria-hidden />
          {t("oneAtATime")}
        </li>
        <li className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5">
          <ShieldAlert className="size-3.5" aria-hidden />
          {t("penalty")}
        </li>
      </ul>
    </div>
  );
}

export function EmptyTicket() {
  const { t, setMobileTab, setDesktopPanel } = useStore();
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
      <span className="mb-5 flex size-16 items-center justify-center rounded-full bg-white text-gold-500 shadow-sm">
        <TicketIcon className="size-8" aria-hidden />
      </span>
      <p className="text-[22px] font-semibold text-ink/70">{t("noTicket")}</p>
      <p className="mt-2 text-[14px] text-muted">{t("noTicketBody")}</p>
      <button
        type="button"
        className={cx(secondaryButton, "mt-6")}
        onClick={() => {
          setMobileTab("home");
          setDesktopPanel("details");
        }}
      >
        {t("findBranch")}
      </button>
    </div>
  );
}

export function TicketView() {
  const { ticket } = useStore();
  return ticket ? (
    <div className="px-4 py-8">
      <TicketStub />
    </div>
  ) : (
    <EmptyTicket />
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
            "fixed top-1/2 left-1/2 w-[22rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 text-ink shadow-2xl outline-none",
            popupAnimation,
          )}
        >
          <AlertDialog.Title className="text-lg font-extrabold text-navy-900">
            {t("cancelTitle", { num: ticket?.number ?? "" })}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-[14px] leading-relaxed text-muted">{t("cancelBody")}</AlertDialog.Description>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <AlertDialog.Close className={secondaryButton}>{t("keepTicket")}</AlertDialog.Close>
            <button type="button" onClick={cancelTicket} className={cx(primaryButton, "bg-rose-700 hover:bg-rose-800 active:bg-rose-900")}>
              {t("cancelTicket")}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
