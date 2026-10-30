"use client";

import { MobileTopBar } from "../shell";
import { useStore } from "../store";
import { BringList, EmptyTicket, TicketBranchCard, TicketStub, TicketTimeline } from "../ticket";

export function TicketScreen() {
  const { ticket, ready, t } = useStore();
  return (
    <>
      <MobileTopBar title={t("myTicket")} />
      <div className="mx-auto max-w-xl px-4 py-6 lg:max-w-5xl lg:px-6 lg:py-10">
        <h1 className="mb-6 hidden text-xl font-bold tracking-tight text-ink lg:block">{t("myTicket")}</h1>
        {!ready ? (
          <div className="skeleton mx-auto h-[640px] max-w-[400px] rounded-lg" />
        ) : ticket ? (
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start lg:gap-8">
            <TicketStub className="lg:sticky lg:top-24" />
            <div className="flex flex-col gap-4">
              <TicketTimeline />
              <BringList />
              <TicketBranchCard />
            </div>
          </div>
        ) : (
          <EmptyTicket />
        )}
      </div>
    </>
  );
}
