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
    <div className="mobile-map-div-search-placeholder">
      <CityMap
        controlsClassName="mobile-map-city-map"
        focusTop={0.45}
        // Keep the attribution above the mobile branch card.
        className="mobile-map-city-map-2"
      />
      <div className="mobile-map-div-search-placeholder-2">
        {/* Search and filters share one surface so the plain toggles stay
            legible over the map. */}
        <div className="mobile-map-div-search-placeholder-3 mobile-map-panel">
          <SearchDialog
            trigger={
              <button
                type="button"
                className={cx(
                  "mobile-map-button-search-placeholder",
                  focusRing,
                )}
              >
                <Search className="mobile-map-search" aria-hidden />
                {t("searchPlaceholder")}
              </button>
            }
          />
          <FilterChips compact className="mobile-map-filter-chips" />
        </div>
      </div>
      <div className="mobile-map-div">
        <div className="mobile-map-div-search-placeholder-3">
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
