"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Clock, Ticket, Users } from "lucide-react";
import { useStore } from "./store";
import { backdropClass, cx, popupAnimation } from "./ui";

const popupClass = cx(
  "fixed top-1/2 left-1/2 w-[22rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white text-ink shadow-2xl outline-none",
  popupAnimation,
);

const splitButton = cx(
  "h-14 text-[16px] font-bold transition-colors outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy-700",
);

/** Confirmation popup from sketch ②: branch and queue on top, OK / Cancel split below. */
export function TakeTicketDialog() {
  const { confirmFor, closeConfirm, confirmTicket, ticket, ticketBranch, showTicket, t } = useStore();
  const open = confirmFor !== null;
  const blocked = ticket !== null;

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && closeConfirm()}>
      <Dialog.Portal>
        <Dialog.Backdrop className={backdropClass} />
        <Dialog.Popup className={popupClass}>
          {confirmFor && (
            <>
              <div className="px-6 pt-6 pb-5 text-center">
                <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                  <Ticket className="size-6" aria-hidden />
                </span>
                <Dialog.Title className="text-lg font-extrabold text-navy-900">
                  {blocked ? t("oneTicketTitle") : t("confirmTitle")}
                </Dialog.Title>
                {blocked ? (
                  <Dialog.Description className="mt-2 text-[14px] leading-relaxed text-muted">
                    {t("oneTicketBody", { num: ticket.number, branch: ticketBranch?.fullName ?? "" })}
                  </Dialog.Description>
                ) : (
                  <>
                    <p className="mt-3 text-[17px] leading-snug">
                      <span className="font-extrabold text-gold-700">{confirmFor.bankName}</span>{" "}
                      <span className="font-semibold text-gold-700">{confirmFor.branchName}</span>
                    </p>
                    <div className="mt-3 flex justify-center gap-5 text-[14px] font-semibold text-navy-900">
                      <span className="flex items-center gap-1.5">
                        <Users className="size-4" aria-hidden />
                        {t("waitingCount", { n: confirmFor.waiting })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-4" aria-hidden />
                        {confirmFor.wait} {t("min")}
                      </span>
                    </div>
                    <Dialog.Description className="mt-3 text-[13px] text-muted">
                      {t("confirmBody", { n: confirmFor.waiting, m: confirmFor.wait })}
                    </Dialog.Description>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 border-t border-navy-900/10">
                <Dialog.Close className={cx(splitButton, "border-r border-navy-900/10 text-muted hover:bg-paper")}>
                  {blocked ? t("close") : t("cancel")}
                </Dialog.Close>
                {blocked ? (
                  <button
                    type="button"
                    className={cx(splitButton, "bg-navy-900 text-white hover:bg-navy-800")}
                    onClick={() => {
                      closeConfirm();
                      showTicket();
                    }}
                  >
                    {t("viewTicket")}
                  </button>
                ) : (
                  <button type="button" className={cx(splitButton, "bg-gold-600 text-white hover:bg-gold-700")} onClick={confirmTicket}>
                    {t("confirm")}
                  </button>
                )}
              </div>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** The ticket machine animation shown while a ticket is printing (the loading screen in sketch ②). */
function Kiosk() {
  return (
    <svg viewBox="0 0 120 170" className="h-44 w-auto overflow-visible text-white" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" aria-hidden>
      <rect x="22" y="6" width="76" height="24" rx="3" />
      <text x="60" y="24.5" textAnchor="middle" fontSize="15" fontWeight="900" letterSpacing="4" fill="currentColor" stroke="none">
        BANK
      </text>
      <rect x="10" y="34" width="100" height="94" rx="5" />
      <path d="M26 50h68M26 60h68M26 70h40" strokeLinecap="round" />
      <rect x="24" y="82" width="34" height="22" rx="2.5" />
      <g className="animate-kiosk-blink">
        <path d="M31 93h20" strokeLinecap="round" strokeWidth="4" strokeDasharray="4 4" />
      </g>
      <ellipse cx="80" cy="93" rx="14" ry="10" />
      <path d="M30 118h60" strokeWidth="5" strokeLinecap="round" />
      <path d="M22 128v10M98 128v10" />
      {/* Ticket feeding out of the slot. */}
      <svg x="30" y="118" width="60" height="70" overflow="hidden">
        <g className="animate-ticket-out" style={{ transformOrigin: "30px 10px" }}>
          <path
            d="M8 0h44v34l-5.5 5-5.5-5-5.5 5-5.5-5-5.5 5-5.5-5-5.5 5L8 34Z"
            fill="white"
            stroke="none"
          />
          <path d="M18 12h24M22 22h16" stroke="var(--color-navy-900)" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      </svg>
    </svg>
  );
}

export function IssuingOverlay() {
  const { issuing, t } = useStore();
  return (
    <Dialog.Root open={issuing} disablePointerDismissal>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-navy-950/85 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          className="fixed inset-0 flex flex-col items-center justify-center gap-8 outline-none transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0"
          aria-busy
        >
          <Dialog.Title className="text-[22px] font-extrabold text-gold-300">{t("issuing")}</Dialog.Title>
          <Kiosk />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

