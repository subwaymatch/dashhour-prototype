import type { Metadata } from "next";
import { AboutPage } from "@/components/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Dash Hour is for: take a bank's queue number before you arrive, see how busy each branch is, and show up as your number is called.",
};

export default function About() {
  return <AboutPage />;
}
