import type { Metadata } from "next";
import { StoryPage } from "@/components/story";

export const metadata: Metadata = {
  title: "From sketch to prototype",
  description:
    "How Dash Hour, winner of the first BlueHack Samsung Hackathon in 2016, went from six notepad sketches to a working web and mobile prototype.",
};

export default function Story() {
  return <StoryPage />;
}
