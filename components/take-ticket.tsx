"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Drawer } from "@base-ui/react/drawer";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Switch } from "@base-ui/react/switch";
import { BellRing, BriefcaseBusiness, Footprints, Globe, HandCoins, Banknote, CircleAlert, Clock3, X } from "lucide-react";
import { SERVICES, type ServiceKey } from "@/lib/data";
import { formatClock } from "@/lib/sim";
import { BankBadge } from "./bank-badge";
import { useStore, type BranchView } from "./store";
import { cx, focusRing, navyButton, primaryButton, secondaryButton } from "./ui";

export const SERVICE_ICONS: Record<ServiceKey, typeof Banknote> = {
  general: Banknote,
  loan: HandCoins,
  fx: Globe,
  business: BriefcaseBusiness,
};

const ALL_SERVICES: ServiceKey[] = ["general", "loan", "fx", "business"];

function ServiceOption({ view, service }: { view: BranchView; service: ServiceKey }) {
  const { lang, t } = useStore();
  const queue = view.queues[service];
  const Icon = SERVICE_ICONS[service];
  return (
    <Radio.Root
      value={service}
      disabled={!queue}
      className={cx(
        "group flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3.5 py-3 text-left ring-1 ring-line transition-colors outline-none",
        "hover:bg-paper/70 data-checked:bg-gold-100/70 data-checked:ring-2 data-checked:ring-gold-600",
        "data-disabled:cursor-not-allowed data-disabled:opacity-45 data-disabled:hover:bg-transparent",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700",
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-paper text-navy-900 group-data-checked:bg-white">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink">{SERVICES[service].name[lang]}</span>
        <span className="block truncate text-[12.5px] text-muted">{queue ? SERVICES[service].desc[lang] : t("notOffered")}</span>
      </span>
      {queue && (
        <span className="shrink-0 text-right">
          <span className="block font-display text-[17px] font-bold text-navy-900 tabular">
            {queue.wait}
            <span className="ml-0.5 text-[12px] font-semibold">{t("min")}</span>
          </span>
          <span className="block text-[12px] text-muted">{t("waitingCount", { n: queue.waiting })}</span>
        </span>
      )}
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full ring-2 ring-line group-data-checked:ring-gold-600">
        <Radio.Indicator className="size-2.5 rounded-full bg-gold-600" />
      </span>
    </Radio.Root>
  );
}

function SheetBody({ view }: { view: BranchView }) {
  const { t, lang, sim, ticket, ticketBranch, noShows, settings, takeTicket, closeSheet, goToTicket } = useStore();
  const [service, setService] = React.useState<ServiceKey>("general");
  const [alert, setAlert] = React.useState(settings.aheadAlerts);
  const queue = view.queues[service];

  const header = (
    <div className="flex items-start gap-3">
      <BankBadge bank={view.bank} className="size-11 text-[13px]" />
      <div className="min-w-0 flex-1">
        <Drawer.Title className="text-[19px] leading-tight font-bold text-ink">{view.fullName}</Drawer.Title>
        <Drawer.Description className="mt-0.5 truncate text-[13px] text-muted">{view.address[lang]}</Drawer.Description>
      </div>
      <Drawer.Close aria-label={t("close")} className={cx("-mt-1 -mr-1 inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-paper", focusRing)}>
        <X className="size-5" />
      </Drawer.Close>
    </div>
  );

  if (ticket || noShows >= 3) {
    const restricted = !ticket;
    return (
      <>
        {header}
        <div className="mt-5 flex gap-3 rounded-2xl bg-paper p-4">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-gold-700" aria-hidden />
          <div>
            <p className="text-[15px] font-semibold text-ink">{t(restricted ? "restrictedTitle" : "oneTicketTitle")}</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
              {restricted
                ? t("restrictedBody")
                : t("oneTicketBody", { num: ticket!.number, branch: ticketBranch?.fullName ?? "" })}
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Drawer.Close className={secondaryButton}>{t("close")}</Drawer.Close>
          {!restricted && (
            <button
              type="button"
              className={navyButton}
              onClick={() => {
                closeSheet();
                goToTicket();
              }}
            >
              {t("viewTicket")}
            </button>
          )}
        </div>
      </>
    );
  }

  const turnAt = sim + (queue?.wait ?? 0);
  const leaveAt = turnAt - view.travel.walk - 2;

  return (
    <>
      {header}
      <h3 className="mt-6 mb-3 text-[14px] font-semibold text-ink">{t("chooseService")}</h3>
      <RadioGroup value={service} onValueChange={(v) => setService(v as ServiceKey)} aria-label={t("chooseService")} className="flex flex-col gap-2">
        {ALL_SERVICES.map((s) => (
          <ServiceOption key={s} view={view} service={s} />
        ))}
      </RadioGroup>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-navy-900 p-4 text-white">
        <div>
          <p className="flex items-center gap-1.5 text-[12px] text-white/60">
            <Clock3 className="size-3.5" aria-hidden />
            {queue && queue.wait > 0 ? t("etaLabel") : t("turnNow")}
          </p>
          <p className="mt-0.5 font-display text-[24px] font-bold tabular">{formatClock(turnAt)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-[12px] text-white/60">
            <Footprints className="size-3.5" aria-hidden />
            {t("walkMin", { n: view.travel.walk })}
          </p>
          <p className="mt-0.5 text-[15px] leading-tight font-semibold text-gold-300">
            {leaveAt <= sim ? t("leaveNowShort") : t("leaveByShort", { t: formatClock(leaveAt) })}
          </p>
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl px-1 py-1">
        <BellRing className="size-5 text-navy-900" aria-hidden />
        <span className="flex-1 text-[14px] text-ink">{t("alertMe")}</span>
        <Switch.Root
          checked={alert}
          onCheckedChange={setAlert}
          className={cx("relative flex h-7 w-12 shrink-0 rounded-full bg-line p-0.5 transition-colors data-checked:bg-navy-900", focusRing)}
        >
          <Switch.Thumb className="size-6 rounded-full bg-white shadow transition-transform data-checked:translate-x-5" />
        </Switch.Root>
      </label>

      <p className="mt-3 text-[12px] leading-relaxed text-muted">{t("policy")}</p>

      <button type="button" disabled={!queue} onClick={() => takeTicket(service, alert)} className={cx(primaryButton, "mt-5 h-14 w-full text-[17px]")}>
        {t("confirm")}
      </button>
    </>
  );
}

/** Bottom sheet for choosing a counter and taking a ticket (sketch ②). */
export function TakeTicketSheet() {
  const { sheetBranch, closeSheet } = useStore();
  // Keep the last branch while the sheet animates closed.
  const last = React.useRef<BranchView | null>(null);
  if (sheetBranch) last.current = sheetBranch;
  const view = sheetBranch ?? last.current;

  return (
    <Drawer.Root open={sheetBranch !== null} onOpenChange={(open) => !open && closeSheet()}>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 min-h-dvh bg-navy-950 opacity-[calc(0.5*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[400ms] data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0" />
        <Drawer.Viewport className="fixed inset-0 flex items-end justify-center lg:items-center lg:p-6">
          <Drawer.Popup
            className={cx(
              "flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl outline-none lg:rounded-[28px]",
              "[transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
              "data-starting-style:[transform:translateY(100%)] data-ending-style:[transform:translateY(100%)] data-swiping:duration-0",
              "lg:data-starting-style:[transform:translateY(24px)] lg:data-ending-style:[transform:translateY(24px)] lg:data-starting-style:opacity-0 lg:data-ending-style:opacity-0",
            )}
          >
            <div className="flex shrink-0 justify-center pt-2.5 pb-1 lg:hidden" aria-hidden>
              <span className="h-1.5 w-10 rounded-full bg-line" />
            </div>
            <Drawer.Content className="overflow-y-auto overscroll-contain px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] lg:p-6">
              {view && <SheetBody key={view.id} view={view} />}
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
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
          <path d="M8 0h44v34l-5.5 5-5.5-5-5.5 5-5.5-5-5.5 5-5.5-5-5.5 5L8 34Z" fill="white" stroke="none" />
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
        <Dialog.Backdrop className="fixed inset-0 bg-navy-950/90 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          className="fixed inset-0 flex flex-col items-center justify-center gap-8 outline-none transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0"
          aria-busy
        >
          <Dialog.Title className="text-[22px] font-bold text-gold-300">{t("issuing")}</Dialog.Title>
          <Kiosk />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
