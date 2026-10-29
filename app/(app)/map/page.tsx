import type { Metadata } from "next";
import { MapScreen } from "@/components/screens/map";

export const metadata: Metadata = { title: "Map" };

export default function MapPage() {
  return <MapScreen />;
}
