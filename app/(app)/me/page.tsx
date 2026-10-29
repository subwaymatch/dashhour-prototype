import type { Metadata } from "next";
import { MeScreen } from "@/components/screens/me";

export const metadata: Metadata = { title: "Account" };

export default function MePage() {
  return <MeScreen />;
}
