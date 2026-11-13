import { getBranch } from "./data";

export type AppSection = "home" | "map" | "ticket" | "me";

/**
 * The app screen an address belongs to, or null when the app has no such screen.
 * Vinext renders the 404 page inside the app shell, so the shell uses this to tell
 * a real screen from a not-found one.
 */
export function appSection(path: string): AppSection | null {
  if (path === "/") return "home";
  if (path === "/map") return "map";
  if (path === "/ticket") return "ticket";
  if (path === "/me") return "me";
  const branch = /^\/branch\/([^/]+)$/.exec(path);
  if (branch && getBranch(decodeURIComponent(branch[1]))) return "home";
  return null;
}
