"use client";

import * as React from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { Star, Ticket, Users } from "lucide-react";
import { formatDistance } from "@/lib/sim";
import { BranchDetail } from "./branch-detail";
import { useStore, type BranchView } from "./store";
import { cx, focusRing } from "./ui";

/** The folded corner that shows a favorite star or the branch's rank, as in the later design. */
function CornerBadge({ view }: { view: BranchView }) {
  return (
    <span aria-hidden className="pointer-events-none absolute top-0 left-0 size-9 overflow-hidden rounded-tl-xl">
      <span
        className={cx(
          "absolute -top-[18px] -left-[18px] size-9 rotate-45",
          view.favorite ? "bg-navy-900" : "bg-gold-500",
        )}
      />
      <span className="absolute top-[3px] left-[4px] text-[10px] leading-none font-black text-white">
        {view.favorite ? <Star className="size-2.5 fill-gold-300 text-gold-300" /> : view.rank}
      </span>
    </span>
  );
}

export function FavoriteButton({ view, className }: { view: BranchView; className?: string }) {
  const { toggleFavorite, t } = useStore();
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(view.id)}
      aria-pressed={view.favorite}
      aria-label={view.favorite ? t("removeFavorite") : t("addFavorite")}
      className={cx(
        "inline-flex size-10 items-center justify-center rounded-full text-gold-500 transition-colors hover:bg-gold-100 active:scale-95",
        focusRing,
        className,
      )}
    >
      <Star className={cx("size-6 transition-transform", view.favorite && "fill-gold-500")} strokeWidth={1.75} />
    </button>
  );
}

function Summary({ view, large }: { view: BranchView; large?: boolean }) {
  const { t } = useStore();
  return (
    <>
      <span className="flex flex-wrap items-baseline gap-x-2">
        <span className={cx("font-display font-black tracking-tight text-navy-900 tabular", large ? "text-[44px] leading-[1]" : "text-[38px] leading-[1]")}>
          {view.wait}
          <span className="ml-1 text-[22px] font-extrabold">{t("min")}</span>
        </span>
        <span className="text-[13px] font-semibold text-navy-900">
          {view.wait > 0 ? t("availableIn", { n: view.wait }) : t("availableNow")}
        </span>
      </span>
      <span className="mt-1.5 block text-[15px] leading-snug">
        <span className="font-bold text-gold-700">{view.bankName}</span>{" "}
        <span className="font-semibold text-gold-700">{view.branchName}</span>{" "}
        <span className="text-[13px] whitespace-nowrap text-muted">
          {formatDistance(view.distance)} / {t("walk")} {view.travel.walk}
          {t("min")}
        </span>
      </span>
      <span className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
        <Users className="size-3.5" aria-hidden />
        {t("waitingCount", { n: view.waiting })}
      </span>
    </>
  );
}

function TakeTicketButton({ view }: { view: BranchView }) {
  const { requestTicket, showTicket, ticket, t } = useStore();
  const mine = ticket?.branchId === view.id;
  return (
    <button
      type="button"
      onClick={() => (mine ? showTicket() : requestTicket(view.id))}
      className={cx(
        "flex w-[92px] shrink-0 flex-col items-center justify-center gap-1 rounded-r-xl px-2 text-center text-[15px] leading-tight font-extrabold transition-colors",
        mine ? "bg-navy-900 text-white hover:bg-navy-800" : "text-gold-700 hover:bg-gold-100 active:bg-gold-100",
        "outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-navy-700",
      )}
    >
      {mine ? (
        <>
          <Ticket className="size-5" aria-hidden />
          <span className="text-[13px]">{t("myTicket")}</span>
        </>
      ) : (
        <span className="text-balance">{t("takeTicket")}</span>
      )}
    </button>
  );
}

const cardShell = "relative flex rounded-xl bg-white shadow-[0_1px_2px_rgba(13,17,55,0.06),0_4px_14px_rgba(13,17,55,0.05)]";

/** Mobile list card: tap to expand the branch details below it (sketch ④). */
export function ExpandableBranchCard({
  view,
  open,
  onOpenChange,
}: {
  view: BranchView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Collapsible.Root open={open} onOpenChange={onOpenChange} render={<article />} className="rounded-xl">
      <div className={cx(cardShell, open && "rounded-b-none")}>
        <CornerBadge view={view} />
        <Collapsible.Trigger
          className={cx(
            "min-w-0 flex-1 rounded-l-xl py-4 pr-11 pl-6 text-left",
            "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy-700",
          )}
        >
          <Summary view={view} />
        </Collapsible.Trigger>
        <FavoriteButton view={view} className="absolute top-2 right-[100px]" />
        <span aria-hidden className="perforated my-3 w-[2px] shrink-0 text-gold-500" />
        <TakeTicketButton view={view} />
      </div>
      <Collapsible.Panel
        className={cx(
          "h-(--collapsible-panel-height) overflow-hidden rounded-b-xl bg-white transition-[height] duration-250 ease-out",
          "data-ending-style:h-0 data-starting-style:h-0 [&[hidden]:not([hidden='until-found'])]:hidden",
        )}
      >
        <div className="border-t border-dashed border-gold-300">
          <BranchDetail view={view} showMiniMap />
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

/** Desktop list card and map overlay card: tap to select the branch. */
export function BranchCard({
  view,
  selected,
  onSelect,
  className,
}: {
  view: BranchView;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
}) {
  return (
    <article className={cx(cardShell, selected && "ring-2 ring-navy-900", className)}>
      <CornerBadge view={view} />
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected || undefined}
        className={cx(
          "min-w-0 flex-1 rounded-l-xl py-4 pr-11 pl-6 text-left",
          "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy-700",
        )}
      >
        <Summary view={view} />
      </button>
      <FavoriteButton view={view} className="absolute top-2 right-[100px]" />
      <span aria-hidden className="perforated my-3 w-[2px] shrink-0 text-gold-500" />
      <TakeTicketButton view={view} />
    </article>
  );
}
