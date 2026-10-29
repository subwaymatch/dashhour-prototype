import type { Metadata } from "next";
import { TicketScreen } from "@/components/screens/ticket";

export const metadata: Metadata = { title: "My ticket" };

export default function TicketPage() {
  return <TicketScreen />;
}
