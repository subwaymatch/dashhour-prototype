"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Drawer } from "@base-ui/react/drawer";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Switch } from "@base-ui/react/switch";
import {
  BellRing,
  BriefcaseBusiness,
  Footprints,
  Globe,
  HandCoins,
  Banknote,
  CircleAlert,
  Clock3,
  X,
} from "lucide-react";
import { SERVICES, type ServiceKey } from "@/lib/data";
import { formatClock } from "@/lib/sim";
import { BankBadge } from "./bank-badge";
import { useStore, type BranchView } from "./store";
import {
  cx,
  focusRing,
  navyButton,
  primaryButton,
  secondaryButton,
} from "./ui";

export const SERVICE_ICONS: Record<ServiceKey, typeof Banknote> = {
  general: Banknote,
  loan: HandCoins,
  fx: Globe,
  business: BriefcaseBusiness,
};

const ALL_SERVICES: ServiceKey[] = ["general", "loan", "fx", "business"];

function ServiceOption({
  view,
  service,
}: {
  view: BranchView;
  service: ServiceKey;
}) {
  const { lang, t } = useStore();
  const queue = view.queues[service];
  const Icon = SERVICE_ICONS[service];
  return (
    <Radio.Root
      value={service}
      disabled={!queue}
      className="interaction-group service-option"
    >
      <span className="service-option-span">
        <Icon className="service-option-icon" aria-hidden />
      </span>
      <span className="service-option-span-not-offered">
        <span className="service-option-span-2">
          {SERVICES[service].name[lang]}
        </span>
        <span className="service-option-span-not-offered-2">
          {queue ? SERVICES[service].desc[lang] : t("notOffered")}
        </span>
      </span>
      {queue && (
        <span className="service-option-span-min">
          <span className="service-option-span-min-2">
            <span className="minute-number">{queue.wait}</span>
            <span className="service-option-span-min-3">{t("min")}</span>
          </span>
          <span className="service-option-span-waiting-count">
            {t("waitingCount", { n: queue.waiting })}
          </span>
        </span>
      )}
      <span className="service-option-span-3">
        <Radio.Indicator className="service-option-radio-indicator" />
      </span>
    </Radio.Root>
  );
}

function SheetBody({ view }: { view: BranchView }) {
  const {
    t,
    lang,
    sim,
    ticket,
    ticketBranch,
    noShows,
    settings,
    takeTicket,
    closeSheet,
    goToTicket,
  } = useStore();
  const [service, setService] = React.useState<ServiceKey>("general");
  const [alert, setAlert] = React.useState(settings.aheadAlerts);
  const queue = view.queues[service];

  const header = (
    <div className="header-div-close">
      <BankBadge bank={view.bank} className="header-bank-badge" />
      <div className="service-option-span-not-offered">
        <Drawer.Title className="header-drawer-title">
          {view.fullName}
        </Drawer.Title>
        <Drawer.Description className="header-drawer-description">
          {view.address[lang]}
        </Drawer.Description>
      </div>
      <Drawer.Close
        aria-label={t("close")}
        className={cx("header-drawer-close", focusRing)}
      >
        <X className="service-option-icon" />
      </Drawer.Close>
    </div>
  );

  if (ticket || noShows >= 3) {
    const restricted = !ticket;
    return (
      <>
        {header}
        <div className="sheet-body-div-restricted-body">
          <CircleAlert className="sheet-body-circle-alert" aria-hidden />
          <div>
            <p className="sheet-body-p">
              {t(restricted ? "restrictedTitle" : "oneTicketTitle")}
            </p>
            <p className="sheet-body-p-restricted-body">
              {restricted
                ? t("restrictedBody")
                : t("oneTicketBody", {
                    num: ticket!.number,
                    branch: ticketBranch?.fullName ?? "",
                  })}
            </p>
          </div>
        </div>
        <div className="sheet-body-div-close">
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
      <h3 className="sheet-body-h3-choose-service">{t("chooseService")}</h3>
      <RadioGroup
        value={service}
        onValueChange={(v) => setService(v as ServiceKey)}
        aria-label={t("chooseService")}
        className="sheet-body-radio-group"
      >
        {ALL_SERVICES.map((s) => (
          <ServiceOption key={s} view={view} service={s} />
        ))}
      </RadioGroup>

      <div className="sheet-body-div-eta-label">
        <div>
          <p className="sheet-body-p-eta-label">
            <Clock3 className="sheet-body-clock3" aria-hidden />
            {queue && queue.wait > 0 ? t("etaLabel") : t("turnNow")}
          </p>
          <p className="sheet-body-p-2">{formatClock(turnAt)}</p>
        </div>
        <div>
          <p className="sheet-body-p-eta-label">
            <Footprints className="sheet-body-clock3" aria-hidden />
            {t("walkMin", { n: view.travel.walk })}
          </p>
          <p className="sheet-body-p-leave-now-short">
            {leaveAt <= sim
              ? t("leaveNowShort")
              : t("leaveByShort", { t: formatClock(leaveAt) })}
          </p>
        </div>
      </div>

      <label className="sheet-body-label-alert-me">
        <BellRing className="sheet-body-bell-ring" aria-hidden />
        <span className="sheet-body-span-alert-me">{t("alertMe")}</span>
        <Switch.Root
          checked={alert}
          onCheckedChange={setAlert}
          className={cx("sheet-body-switch-root", focusRing)}
        >
          <Switch.Thumb className="sheet-body-switch-thumb" />
        </Switch.Root>
      </label>

      <p className="sheet-body-p-policy">{t("policy")}</p>

      <button
        type="button"
        disabled={!queue}
        onClick={() => takeTicket(service, alert)}
        className={cx(primaryButton, "sheet-body-button-confirm")}
      >
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
    <Drawer.Root
      open={sheetBranch !== null}
      onOpenChange={(open) => !open && closeSheet()}
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="take-ticket-sheet-drawer-backdrop" />
        <Drawer.Viewport className="take-ticket-sheet-drawer-viewport">
          <Drawer.Popup
            className={cx(
              "take-ticket-sheet-drawer-popup",
              "take-ticket-sheet-drawer-popup-2",
              "take-ticket-sheet-drawer-popup-3",
              "take-ticket-sheet-drawer-popup-4",
            )}
          >
            <div className="take-ticket-sheet-div" aria-hidden>
              <span className="take-ticket-sheet-span" />
            </div>
            <Drawer.Content className="take-ticket-sheet-drawer-content">
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
    <svg
      viewBox="0 0 120 170"
      className="kiosk-svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="22" y="6" width="76" height="24" rx="3" />
      <text
        x="60"
        y="24.5"
        textAnchor="middle"
        fontSize="15"
        fontWeight="900"
        letterSpacing="4"
        fill="currentColor"
        stroke="none"
      >
        BANK
      </text>
      <rect x="10" y="34" width="100" height="94" rx="5" />
      <path d="M26 50h68M26 60h68M26 70h40" strokeLinecap="round" />
      <rect x="24" y="82" width="34" height="22" rx="2.5" />
      <g className="kiosk-g">
        <path
          d="M31 93h20"
          strokeLinecap="round"
          strokeWidth="4"
          strokeDasharray="4 4"
        />
      </g>
      <ellipse cx="80" cy="93" rx="14" ry="10" />
      <path d="M30 118h60" strokeWidth="5" strokeLinecap="round" />
      <path d="M22 128v10M98 128v10" />
      {/* Ticket feeding out of the slot. */}
      <svg x="30" y="118" width="60" height="70" overflow="kiosk-svg-2">
        <g className="kiosk-g-2" style={{ transformOrigin: "30px 10px" }}>
          <path
            d="M8 0h44v34l-5.5 5-5.5-5-5.5 5-5.5-5-5.5 5-5.5-5-5.5 5L8 34Z"
            fill="white"
            stroke="none"
          />
          <path
            d="M18 12h24M22 22h16"
            stroke="var(--color-navy-900)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
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
        <Dialog.Backdrop className="issuing-overlay-dialog-backdrop" />
        <Dialog.Popup
          className="issuing-overlay-dialog-popup-issuing"
          aria-busy
        >
          <Dialog.Title className="issuing-overlay-dialog-title-issuing">
            {t("issuing")}
          </Dialog.Title>
          <Kiosk />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
