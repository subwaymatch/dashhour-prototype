"use client";

import { Search } from "lucide-react";
import { FilterChips, MapBranchCard } from "../branch-card";
import { CityMap } from "../city-map";
import { SearchDialog } from "../shell";
import { useStore } from "../store";
import { cx, focusRing } from "../ui";
import { DesktopExplorer } from "./home";

function MobileMap() {
  const { selected, t } = useStore();
  return (
    <div className="fixed inset-x-0 top-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] lg:hidden">
      <CityMap minSize={760} controlsClassName="right-3 bottom-[10.5rem]" focusTop={0.45} />
      <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-map-land/90 via-map-land/50 to-transparent px-3 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-6">
        <div className="pointer-events-auto mx-auto max-w-xl">
          <SearchDialog
            trigger={
              <button
                type="button"
                className={cx("flex h-12 w-full items-center gap-3 rounded-2xl bg-white px-4 text-left text-[15px] text-muted shadow-float", focusRing)}
              >
                <Search className="size-5 text-ink" aria-hidden />
                {t("searchPlaceholder")}
              </button>
            }
          />
          <FilterChips className="-mx-3 mt-2 px-3 py-1" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-3">
        <div className="pointer-events-auto mx-auto max-w-xl">
          <MapBranchCard view={selected} />
        </div>
      </div>
    </div>
  );
}

export function MapScreen() {
  return (
    <>
      <MobileMap />
      <DesktopExplorer />
    </>
  );
}
