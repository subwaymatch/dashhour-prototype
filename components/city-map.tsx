"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import type {
  ExpressionSpecification,
  GeoJSONSource,
  LayerSpecification,
  Map as MapLibreMap,
  MapOptions,
  StyleSpecification,
} from "maplibre-gl";
import { LocateFixed, Minus, Plus, Star } from "lucide-react";
import { USER, type Branch } from "@/lib/data";
import type { Lang, Localized } from "@/lib/i18n";
import { WALKING_ROUTES } from "@/lib/routes";
import { BankBadge } from "./bank-badge";
import { useStore, type BranchView } from "./store";
import { cx } from "./ui";

type MapLibre = typeof import("maplibre-gl");
type MapHandle = { lib: MapLibre; map: MapLibreMap };
type LngLat = [number, number];

/* ------------------------------------------------------------------ */
/* Base map: OpenFreeMap's Positron style over OpenStreetMap data,     */
/* recoloured to the app's paper palette, with labels in the app's     */
/* language. No API key needed.                                        */
/* ------------------------------------------------------------------ */

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
const MIN_ZOOM = 12;
const DEFAULT_ZOOM = 14.6;
const MAX_ZOOM = 18;

const C = {
  land: "#f3f0e8",
  park: "#dbe5cc",
  wood: "#dfe6d2",
  water: "#cddbe4",
  building: "#e9e4d7",
  buildingLine: "#ddd6c4",
  path: "#e6e0d1",
  minor: "#ffffff",
  majorCasing: "#e0d8c5",
  major: "#fffdf7",
  motorwayCasing: "#d6cdb6",
  rail: "#d6cfbd",
  label: "#8a8371",
  place: "#6b6b76",
};

const PAINT: Record<string, Record<string, unknown>> = {
  background: { "background-color": C.land },
  park: { "fill-color": C.park },
  water: { "fill-color": C.water },
  waterway: { "line-color": C.water },
  landuse_residential: { "fill-opacity": 0 },
  landcover_wood: { "fill-color": C.wood },
  building: { "fill-color": C.building, "fill-outline-color": C.buildingLine },
  road_area_pier: { "fill-color": C.land },
  road_pier: { "line-color": C.land },
  highway_path: { "line-color": C.path },
  highway_minor: { "line-color": C.minor, "line-opacity": 1 },
  highway_major_casing: { "line-color": C.majorCasing },
  highway_major_inner: { "line-color": C.major },
  highway_major_subtle: { "line-color": C.majorCasing },
  tunnel_motorway_casing: { "line-color": C.motorwayCasing },
  tunnel_motorway_inner: { "line-color": C.major },
  highway_motorway_casing: { "line-color": C.motorwayCasing },
  highway_motorway_inner: { "line-color": C.major },
  highway_motorway_subtle: { "line-color": C.motorwayCasing },
  highway_motorway_bridge_casing: { "line-color": C.motorwayCasing },
  highway_motorway_bridge_inner: { "line-color": C.major },
  railway: { "line-color": C.rail },
  railway_transit: { "line-color": C.rail },
  railway_service: { "line-color": C.rail },
  railway_dashline: { "line-color": C.land },
  railway_transit_dashline: { "line-color": C.land },
  railway_service_dashline: { "line-color": C.land },
};

/** Side-street names only once you zoom in, so the branch pins stay readable. */
const MIN_ZOOMS: Record<string, number> = { "highway-name-minor": 16, "highway-name-path": 16.5 };

function nameField(lang: Lang): ExpressionSpecification {
  return lang === "ko"
    ? ["coalesce", ["get", "name:ko"], ["get", "name"]]
    : ["coalesce", ["get", "name:en"], ["get", "name:latin"], ["get", "name"]];
}

function isNameLayer(layer: LayerSpecification) {
  return layer.type === "symbol" && JSON.stringify(layer.layout?.["text-field"] ?? "").includes('"name');
}

function brandStyle(base: StyleSpecification, lang: Lang): StyleSpecification {
  const layers = base.layers
    // Route-number shields add clutter and nothing a pedestrian needs.
    .filter((l) => !l.id.includes("shield"))
    .map((l) => {
      const layer = { ...l, paint: { ...("paint" in l ? l.paint : {}), ...PAINT[l.id] } } as LayerSpecification;
      if (MIN_ZOOMS[l.id]) layer.minzoom = MIN_ZOOMS[l.id];
      if (layer.type === "symbol" && isNameLayer(layer)) {
        layer.layout = { ...layer.layout, "text-field": nameField(lang) };
        layer.paint = {
          ...layer.paint,
          "text-color": layer["source-layer"] === "place" ? C.place : C.label,
          "text-halo-color": C.land,
          "text-halo-width": 1.5,
        };
      }
      return layer;
    });
  return { ...base, layers };
}

let libPromise: Promise<MapLibre> | null = null;
let stylePromise: Promise<StyleSpecification> | null = null;

/** MapLibre is large, so it only loads once a map is actually on screen, and never on the server. */
function loadMapLibre() {
  if (import.meta.env.SSR) return Promise.reject(new Error("MapLibre runs in the browser only"));
  libPromise ??= Promise.all([
    import("maplibre-gl"),
    import("maplibre-gl/dist/maplibre-gl-worker.mjs?url"),
    import("maplibre-gl/dist/maplibre-gl.css"),
  ])
    .then(([lib, worker]) => {
      lib.setWorkerUrl(worker.default);
      return lib;
    })
    .catch((error) => {
      libPromise = null;
      throw error;
    });
  return libPromise;
}

function loadStyle() {
  stylePromise ??= fetch(STYLE_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Map style: HTTP ${res.status}`);
      return res.json() as Promise<StyleSpecification>;
    })
    .catch((error) => {
      stylePromise = null;
      throw error;
    });
  return stylePromise;
}

/** Korean labels are drawn in the browser, in the app's own Korean font. */
function koreanFont() {
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-noto-kr").trim();
  return family ? `${family}, sans-serif` : "sans-serif";
}

/**
 * Creates a map in `container` once it has a size, so layouts hidden at this breakpoint
 * never load MapLibre. `options` is read once, when the map is created.
 */
function useMapLibre(container: React.RefObject<HTMLDivElement | null>, options: () => Omit<MapOptions, "container" | "style">) {
  const { lang } = useStore();
  const [handle, setHandle] = React.useState<MapHandle | null>(null);
  const [failed, setFailed] = React.useState(false);
  const latest = React.useRef({ lang, options });
  latest.current = { lang, options };

  React.useEffect(() => {
    const el = container.current;
    if (!el) return;
    let map: MapLibreMap | undefined;
    let cancelled = false;
    const start = () =>
      Promise.all([loadMapLibre(), loadStyle()])
        .then(([lib, base]) => {
          if (cancelled) return;
          map = new lib.Map({
            container: el,
            style: brandStyle(base, latest.current.lang),
            attributionControl: false,
            localIdeographFontFamily: koreanFont(),
            ...latest.current.options(),
          });
          map.on("load", () => !cancelled && setHandle({ lib, map: map! }));
        })
        .catch(() => !cancelled && setFailed(true));
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        observer.disconnect();
        start();
      }
    });
    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
      map?.remove();
      setHandle(null);
    };
  }, [container]);

  React.useEffect(() => {
    if (!handle) return;
    for (const layer of handle.map.getStyle().layers) {
      if (isNameLayer(layer)) handle.map.setLayoutProperty(layer.id, "text-field", nameField(lang));
    }
  }, [handle, lang]);

  return { handle, failed };
}

/** Renders React content as a MapLibre marker, so it moves with the map. */
function MapMarker({
  handle,
  at,
  anchor = "center",
  z = 0,
  children,
}: {
  handle: MapHandle;
  at: LngLat;
  anchor?: "center" | "bottom";
  z?: number;
  children: React.ReactNode;
}) {
  const [el] = React.useState(() => document.createElement("div"));
  const [lng, lat] = at;
  React.useEffect(() => {
    const marker = new handle.lib.Marker({ element: el, anchor }).setLngLat([lng, lat]).addTo(handle.map);
    return () => void marker.remove();
  }, [handle, el, anchor, lng, lat]);
  React.useEffect(() => {
    el.style.zIndex = String(z);
  }, [el, z]);
  return createPortal(children, el);
}

/* ------------------------------------------------------------------ */
/* Walking route                                                       */
/* ------------------------------------------------------------------ */

/** The OpenStreetMap walking route from the user to a branch (see scripts/fetch-routes.mjs). */
function routeTo(b: Pick<Branch, "id" | "lat" | "lng">): LngLat[] {
  return [[USER.lng, USER.lat], ...(WALKING_ROUTES[b.id]?.path ?? []), [b.lng, b.lat]];
}

function routeData(coordinates: LngLat[]) {
  return { type: "Feature" as const, properties: {}, geometry: { type: "LineString" as const, coordinates } };
}

function boundsOf(points: LngLat[]): [LngLat, LngLat] {
  const lngs = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

/** A dotted navy line on a white casing, under the place labels. */
function addRouteLayer(map: MapLibreMap) {
  const beforeLabels = map.getStyle().layers.find((l) => l.type === "symbol")?.id;
  map.addSource("route", { type: "geojson", data: routeData([]) });
  const layout = { "line-cap": "round", "line-join": "round" } as const;
  map.addLayer({ id: "route-casing", type: "line", source: "route", layout, paint: { "line-color": "#ffffff", "line-width": 10 } }, beforeLabels);
  map.addLayer(
    { id: "route", type: "line", source: "route", layout, paint: { "line-color": "#1d2468", "line-width": 4.5, "line-dasharray": [0, 2] } },
    beforeLabels,
  );
}

function setRoute(map: MapLibreMap, coordinates: LngLat[]) {
  (map.getSource("route") as GeoJSONSource | undefined)?.setData(routeData(coordinates));
}

/* ------------------------------------------------------------------ */
/* Markers                                                             */
/* ------------------------------------------------------------------ */

const STATIONS: Array<{ at: LngLat; name: Localized; lines: Array<"2" | "sb"> }> = [
  { at: [127.027621, 37.497942], name: { en: "Gangnam", ko: "강남" }, lines: ["2", "sb"] },
  { at: [127.036456, 37.500622], name: { en: "Yeoksam", ko: "역삼" }, lines: ["2"] },
  { at: [127.02506, 37.504598], name: { en: "Sinnonhyeon", ko: "신논현" }, lines: ["sb"] },
  { at: [127.049008, 37.504503], name: { en: "Seolleung", ko: "선릉" }, lines: ["2"] },
  { at: [127.01408, 37.493415], name: { en: "Gyodae", ko: "교대" }, lines: ["2"] },
];

function StationMarker({ station, lang }: { station: (typeof STATIONS)[number]; lang: Lang }) {
  return (
    <span aria-hidden className="pointer-events-none relative flex size-5 items-center justify-center gap-px rounded-full border-2 border-ink bg-white">
      {station.lines.map((l) => (
        <span key={l} className={cx("size-[7px] rounded-full", l === "2" ? "bg-subway-2" : "bg-subway-sb")} />
      ))}
      <span className="absolute top-1/2 left-full ml-1.5 -translate-y-1/2 text-xs font-extrabold whitespace-nowrap text-ink [text-shadow:0_0_2px_var(--color-map-land),0_0_2px_var(--color-map-land),0_0_4px_var(--color-map-land)]">
        {station.name[lang]}
      </span>
    </span>
  );
}

function UserDot({ label }: { label: string }) {
  return (
    <span role="img" aria-label={label} className="relative block size-4">
      <span className="absolute inset-0 animate-pulse-ring rounded-full bg-sky-500" />
      <span className="relative block size-4 rounded-full border-[3px] border-white bg-sky-500 shadow-md" />
    </span>
  );
}

function Pin({ view, selected, onSelect }: { view: BranchView; selected: boolean; onSelect: () => void }) {
  const { t } = useStore();
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${view.fullName}, ${view.wait} ${t("min")}, ${t("waitingCount", { n: view.waiting })}`}
      className="group block cursor-pointer outline-none"
    >
      <span
        className={cx(
          "flex origin-bottom flex-col items-center transition-transform duration-200",
          selected ? "scale-110" : "group-hover:scale-105",
        )}
      >
        <span
          className={cx(
            "flex items-center gap-1 rounded-md py-1 pr-2.5 pl-1 text-xs font-bold whitespace-nowrap shadow-float ring-1 transition-colors tabular",
            selected ? "bg-navy-900 text-white ring-navy-900" : "bg-white text-ink ring-black/5",
            "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-navy-700",
          )}
        >
          <BankBadge bank={view.bank} className="size-5 text-[7.5px]" />
          {view.favorite && <Star className="size-3 fill-gold-500 text-gold-500" aria-hidden />}
          {view.wait}
          <span className="-ml-0.5 text-2xs font-semibold opacity-70">{t("min")}</span>
        </span>
        <span className={cx("-mt-1 size-2.5 rotate-45 rounded-[2px]", selected ? "bg-navy-900" : "bg-white")} />
      </span>
    </button>
  );
}

function MapStatus({ failed, label }: { failed: boolean; label: string }) {
  if (!failed) return <div aria-hidden className="skeleton pointer-events-none absolute inset-0 opacity-40" />;
  return <p className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-sm text-muted">{label}</p>;
}

/* ------------------------------------------------------------------ */
/* Full map                                                            */
/* ------------------------------------------------------------------ */

const controlButton = cx(
  "inline-flex size-11 items-center justify-center bg-white text-ink transition-colors hover:bg-paper disabled:text-muted/50",
  "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy-700",
);

export function CityMap({
  className,
  zoom = DEFAULT_ZOOM,
  controlsClassName = "right-3 bottom-3",
  focusTop = 0.42,
}: {
  className?: string;
  zoom?: number;
  controlsClassName?: string;
  /** Where to place the selected branch vertically, as a fraction of the viewport. */
  focusTop?: number;
}) {
  const { favorites, others, selected, select, lang, t, ticketBranch } = useStore();
  const container = React.useRef<HTMLDivElement>(null);
  const { handle, failed } = useMapLibre(container, () => ({
    center: [selected.lng, selected.lat],
    zoom,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
  }));
  const [zoomLevel, setZoomLevel] = React.useState(zoom);
  const placed = React.useRef(false);
  const pins = [...favorites, ...others];
  if (!pins.some((p) => p.id === selected.id)) pins.push(selected);

  React.useEffect(() => {
    if (!handle) return;
    const { map, lib } = handle;
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    const attribution = new lib.AttributionControl({ compact: true });
    map.addControl(attribution, "bottom-left");
    // Start as the small (i) button; it opens on tap instead of covering the map.
    map.getContainer().querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
    addRouteLayer(map);
    const onZoom = () => setZoomLevel(map.getZoom());
    map.on("zoomend", onZoom);
    return () => {
      map.off("zoomend", onZoom);
    };
  }, [handle]);

  const focus = React.useCallback(
    (at: LngLat, duration: number) => {
      const map = handle?.map;
      if (!map) return;
      map.easeTo({ center: at, offset: [0, (focusTop - 0.5) * map.getContainer().clientHeight], duration });
    },
    [handle, focusTop],
  );

  // Keep the selected branch in view.
  React.useEffect(() => {
    if (!handle) return;
    focus([selected.lng, selected.lat], placed.current ? 600 : 0);
    placed.current = true;
  }, [handle, selected.lng, selected.lat, focus]);

  React.useEffect(() => {
    if (handle) setRoute(handle.map, ticketBranch ? routeTo(ticketBranch) : []);
  }, [handle, ticketBranch]);

  return (
    <div className={cx("relative h-full w-full overflow-hidden bg-map-land", className)}>
      <div ref={container} role="region" aria-label={t("mapLabel")} className="isolate size-full" />
      {!handle && <MapStatus failed={failed} label={t("mapError")} />}
      {handle && (
        <>
          {STATIONS.map((s) => (
            <MapMarker key={s.name.en} handle={handle} at={s.at}>
              <StationMarker station={s} lang={lang} />
            </MapMarker>
          ))}
          <MapMarker handle={handle} at={[USER.lng, USER.lat]} z={5}>
            <UserDot label={t("you")} />
          </MapMarker>
          {pins.map((v) => (
            <MapMarker key={v.id} handle={handle} at={[v.lng, v.lat]} anchor="bottom" z={v.id === selected.id ? 30 : v.favorite ? 20 : 10}>
              <Pin view={v} selected={v.id === selected.id} onSelect={() => select(v.id)} />
            </MapMarker>
          ))}
        </>
      )}
      <div className={cx("absolute flex flex-col gap-2", controlsClassName)}>
        <button
          type="button"
          className={cx(controlButton, "rounded-md shadow-float")}
          aria-label={t("recenter")}
          onClick={() => handle?.map.easeTo({ center: [USER.lng, USER.lat], duration: 600 })}
        >
          <LocateFixed className="size-5" />
        </button>
        <div className="flex flex-col overflow-hidden rounded-md shadow-float">
          <button type="button" className={controlButton} aria-label={t("zoomIn")} disabled={zoomLevel >= MAX_ZOOM - 0.01} onClick={() => handle?.map.zoomIn()}>
            <Plus className="size-5" />
          </button>
          <span className="h-px bg-line" aria-hidden />
          <button type="button" className={controlButton} aria-label={t("zoomOut")} disabled={zoomLevel <= MIN_ZOOM + 0.01} onClick={() => handle?.map.zoomOut()}>
            <Minus className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Route preview                                                       */
/* ------------------------------------------------------------------ */

/** A small, non-interactive map of the walk from the user to one branch (sketch ④). */
export function MiniMap({ branch, className }: { branch: BranchView; className?: string }) {
  const { t } = useStore();
  const container = React.useRef<HTMLDivElement>(null);
  const route = routeTo(branch);
  const { handle, failed } = useMapLibre(container, () => ({
    bounds: boundsOf(route),
    fitBoundsOptions: { padding: { top: 44, bottom: 20, left: 28, right: 28 } },
    interactive: false,
  }));

  React.useEffect(() => {
    if (handle) addRouteLayer(handle.map);
  }, [handle]);

  React.useEffect(() => {
    if (!handle) return;
    const path = routeTo(branch);
    setRoute(handle.map, path);
    handle.map.fitBounds(boundsOf(path), { padding: { top: 44, bottom: 20, left: 28, right: 28 }, duration: 0 });
  }, [handle, branch]);

  return (
    <div className={cx("relative w-full overflow-hidden bg-map-land", className)}>
      <div ref={container} aria-hidden className="isolate size-full" />
      {!handle && <MapStatus failed={failed} label={t("mapError")} />}
      {handle && (
        <>
          <MapMarker handle={handle} at={[USER.lng, USER.lat]}>
            <UserDot label={t("you")} />
          </MapMarker>
          <MapMarker handle={handle} at={[branch.lng, branch.lat]} anchor="bottom">
            <svg viewBox="0 0 28 36" className="block h-9 w-7 drop-shadow" aria-hidden>
              <path d="M14 35s12-11.6 12-21A12 12 0 0 0 2 14c0 9.4 12 21 12 21Z" fill="var(--color-navy-900)" stroke="white" strokeWidth="2" />
              <circle cx="14" cy="14" r="4.5" fill="var(--color-gold-500)" />
            </svg>
          </MapMarker>
        </>
      )}
      <span className="pointer-events-none absolute right-0 bottom-0 rounded-tl-sm bg-white/80 px-1.5 text-2xs text-muted">© OpenStreetMap</span>
    </div>
  );
}
