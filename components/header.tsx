"use client";

import * as React from "react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import { BookOpen, Check, EllipsisVertical, RotateCcw, RotateCw, Search, Ticket, X } from "lucide-react";
import { BANKS } from "@/lib/data";
import { SPEEDS, formatCountdown } from "@/lib/sim";
import { LogoMark, Wordmark } from "./logo";
import { useStore } from "./store";
import { backdropClass, cx, headerIconButton, popupAnimation } from "./ui";

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

function matches(query: string, haystack: string[]) {
  const q = query.trim().toLowerCase().replace(/\s+/g, "");
  if (!q) return true;
  return haystack.some((s) => s.toLowerCase().replace(/\s+/g, "").includes(q));
}

export function SearchDialog({ variant }: { variant: "mobile" | "desktop" }) {
  const { views, t, select, setMobileTab } = useStore();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (variant !== "desktop") return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, [contenteditable=true]");
      if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant]);

  const results = views
    .filter((v) => matches(query, [v.fullName, BANKS[v.bank].en, BANKS[v.bank].ko, v.name.en, v.name.ko]))
    .sort((a, b) => a.wait - b.wait);

  const pick = (id: string) => {
    select(id);
    setMobileTab("map");
    setOpen(false);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <Dialog.Trigger
        aria-label={t("search")}
        className={
          variant === "mobile"
            ? headerIconButton
            : cx(
                "flex h-10 w-72 items-center gap-2 rounded-full bg-white/10 px-4 text-[14px] text-white/70 transition-colors xl:w-80",
                "hover:bg-white/15 outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-300",
              )
        }
      >
        <Search className="size-5 shrink-0" aria-hidden />
        {variant === "desktop" && (
          <>
            <span className="flex-1 truncate text-left">{t("searchPlaceholder")}</span>
            <kbd className="rounded border border-white/20 px-1.5 font-sans text-[11px] text-white/60">/</kbd>
          </>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={backdropClass} />
        <Dialog.Popup
          className={cx(
            "fixed top-3 left-1/2 flex max-h-[min(36rem,calc(100dvh-1.5rem))] w-[34rem] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none sm:top-[12vh]",
            popupAnimation,
          )}
        >
          <Dialog.Title className="sr-only">{t("search")}</Dialog.Title>
          <div className="flex items-center gap-2 border-b border-navy-900/10 px-4">
            <Search className="size-5 shrink-0 text-muted" aria-hidden />
            <Input
              autoFocus
              value={query}
              onValueChange={(v) => setQuery(v)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className="h-14 min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted"
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) pick(results[0].id);
              }}
            />
            <Dialog.Close aria-label={t("close")} className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-paper">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <ul className="scrollbar-thin overflow-y-auto p-2">
            {results.length === 0 && <li className="px-3 py-8 text-center text-[14px] text-muted">{t("noResults")}</li>}
            {results.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => pick(v.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none hover:bg-paper focus-visible:bg-paper"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy-100 font-display text-[15px] font-black text-navy-900 tabular">
                    {v.wait}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold text-navy-900">{v.fullName}</span>
                    <span className="block text-[13px] text-muted">
                      {t("waitingCount", { n: v.waiting })} · {v.wait} {t("min")}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Options menu                                                        */
/* ------------------------------------------------------------------ */

const itemClass = cx(
  "flex cursor-default items-center gap-3 rounded-lg py-2.5 pr-4 pl-3 text-[14px] text-ink outline-none select-none",
  "data-highlighted:bg-paper",
);

export function OptionsMenu() {
  const { t, lang, setLang, speed, setSpeed, resetDemo } = useStore();
  return (
    <Menu.Root>
      <Menu.Trigger aria-label={t("options")} className={headerIconButton}>
        <EllipsisVertical className="size-5" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align="end" className="z-50 outline-none">
          <Menu.Popup
            className={cx(
              "min-w-60 origin-(--transform-origin) rounded-xl bg-white p-1.5 shadow-[0_12px_40px_rgba(13,17,55,0.22)] outline-none",
              popupAnimation,
            )}
          >
            <Menu.RadioGroup value={lang} onValueChange={(v) => setLang(v as "en" | "ko")}>
              <Menu.GroupLabel className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-wider text-muted uppercase">
                {t("language")}
              </Menu.GroupLabel>
              {(
                [
                  ["en", "English"],
                  ["ko", "한국어"],
                ] as const
              ).map(([value, label]) => (
                <Menu.RadioItem key={value} value={value} closeOnClick className={itemClass}>
                  <span className="flex size-4 items-center justify-center">
                    <Menu.RadioItemIndicator>
                      <Check className="size-4 text-gold-700" />
                    </Menu.RadioItemIndicator>
                  </span>
                  <span lang={value}>{label}</span>
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
            <Menu.Separator className="mx-2 my-1.5 h-px bg-navy-900/10" />
            <Menu.RadioGroup value={String(speed)} onValueChange={(v) => setSpeed(Number(v))}>
              <Menu.GroupLabel className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-wider text-muted uppercase">
                {t("demoSpeed")}
              </Menu.GroupLabel>
              {SPEEDS.map((s) => (
                <Menu.RadioItem key={s} value={String(s)} closeOnClick className={itemClass}>
                  <span className="flex size-4 items-center justify-center">
                    <Menu.RadioItemIndicator>
                      <Check className="size-4 text-gold-700" />
                    </Menu.RadioItemIndicator>
                  </span>
                  {s === 1 ? t("realtime") : `${s}×`}
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
            <Menu.Separator className="mx-2 my-1.5 h-px bg-navy-900/10" />
            <Menu.Item className={itemClass} onClick={resetDemo}>
              <RotateCcw className="size-4 text-muted" aria-hidden />
              {t("resetDemo")}
            </Menu.Item>
            <Menu.LinkItem className={itemClass} render={<Link href="/story" />}>
              <BookOpen className="size-4 text-muted" aria-hidden />
              {t("aboutProject")}
            </Menu.LinkItem>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Headers                                                             */
/* ------------------------------------------------------------------ */

function RefreshButton() {
  const { refresh, refreshing, t } = useStore();
  return (
    <button type="button" onClick={refresh} aria-label={t("refresh")} className={headerIconButton} disabled={refreshing}>
      <RotateCw className={cx("size-5", refreshing && "animate-spin-once")} />
    </button>
  );
}

export function MobileHeader() {
  return (
    <header className="bg-navy-950 pt-[env(safe-area-inset-top)] text-white">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-1 px-2">
        <RefreshButton />
        <div className="flex flex-1 justify-center pl-10">
          <h1>
            <Wordmark className="text-[22px]" />
          </h1>
        </div>
        <SearchDialog variant="mobile" />
        <OptionsMenu />
      </div>
    </header>
  );
}

function TicketChip() {
  const { ticket, status, showTicket, t } = useStore();
  if (!ticket || !status) return null;
  return (
    <button
      type="button"
      onClick={showTicket}
      className="flex h-10 items-center gap-2 rounded-full bg-gold-500 pr-4 pl-3 text-[14px] font-bold text-navy-950 transition-colors outline-none hover:bg-gold-300 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-300"
    >
      <Ticket className="size-4" aria-hidden />
      <span className="tabular">#{ticket.number}</span>
      <span className="h-4 w-px bg-navy-950/25" aria-hidden />
      <span className="tabular">{status.called ? t("yourTurn") : formatCountdown(status.remaining)}</span>
    </button>
  );
}

export function DesktopHeader() {
  const { t, clockLabel, speed } = useStore();
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 bg-navy-950 px-5 text-white">
      <Link href="/" className="flex items-center gap-3 rounded-md outline-none focus-visible:outline-2 focus-visible:outline-gold-300">
        <LogoMark className="h-8 w-auto text-white" />
        <Wordmark className="text-[20px]" />
      </Link>
      <span className="hidden text-[14px] text-navy-200 xl:inline">{t("tagline")}</span>
      <div className="flex-1" />
      <SearchDialog variant="desktop" />
      <span
        className="hidden items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[13px] text-white/80 xl:flex"
        title={t("simulated")}
      >
        <span className="size-2 rounded-full bg-emerald-400" aria-hidden />
        {t("demoClock")} <b className="font-bold text-white tabular">{clockLabel}</b>
        <span className="text-white/50">· {speed === 1 ? t("realtime") : `${speed}×`}</span>
      </span>
      <TicketChip />
      <div className="flex items-center">
        <RefreshButton />
        <OptionsMenu />
      </div>
    </header>
  );
}
