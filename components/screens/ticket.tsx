"use client";

import { MobileTopBar } from "../shell";
import { useStore } from "../store";
import {
  BringList,
  EmptyTicket,
  TicketBranchCard,
  TicketStub,
  TicketTimeline,
} from "../ticket";

export function TicketScreen() {
  const { ticket, ready, t } = useStore();
  return (
    <>
      <MobileTopBar title={t("myTicket")} />
      <div className="ticket-screen-div-my-ticket plain-page">
        <h1 className="ticket-screen-h1-my-ticket">{t("myTicket")}</h1>
        {!ready ? (
          <div className="ticket-screen-div" />
        ) : ticket ? (
          <div className="ticket-screen-div-2">
            <TicketStub className="ticket-screen-ticket-stub" />
            <div className="ticket-screen-div-3">
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
