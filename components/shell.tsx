"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import {
  BookOpen,
  Check,
  CircleUserRound,
  EllipsisVertical,
  House,
  Map as MapIcon,
  RotateCcw,
  RotateCw,
  Search,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import { SPEEDS, formatCountdown } from "@/lib/sim";
import { BankBadge } from "./bank-badge";
import { LogoMark, Wordmark } from "./logo";
import { useStore } from "./store";
import { backdropClass, cx, popupAnimation } from "./ui";

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

function normalise(s: string) {
  return s.toLowerCase().replace(/\s+/g, "");
}

export function SearchDialog({ trigger }: { trigger: React.ReactElement<Record<string, unknown>> }) {
  const { views, t, lang } = useStore();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable=true]");
      if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = normalise(query);
  const results = views
    .filter((v) => !q || [v.fullName, v.bankName, v.branchName, v.name.en, v.name.ko, v.address[lang]].some((s) => normalise(s).includes(q)))
    .sort((a, b) => a.wait - b.wait);

  const pick = (id: string) => {
    setOpen(false);
    router.push(`/branch/${id}`);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <Dialog.Trigger render={trigger} />
      <Dialog.Portal>
        <Dialog.Backdrop className={backdropClass} />
        <Dialog.Popup
          className={cx(
            "fixed top-3 left-1/2 flex max-h-[min(36rem,calc(100dvh-1.5rem))] w-[34rem] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 flex-col overflow-hidden rounded-3xl bg-white shadow-2xl outline-none sm:top-[12vh]",
            popupAnimation,
          )}
        >
          <Dialog.Title className="sr-only">{t("search")}</Dialog.Title>
          <div className="flex items-center gap-2 border-b border-line px-4">
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
            {results.length === 0 && <li className="px-3 py-10 text-center text-[14px] text-muted">{t("noResults")}</li>}
            {results.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => pick(v.id)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left outline-none hover:bg-paper focus-visible:bg-paper"
                >
                  <BankBadge bank={v.bank} className="size-10 text-[13px]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-ink">{v.fullName}</span>
                    <span className="block truncate text-[13px] text-muted">{v.address[lang]}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-display text-[17px] font-bold text-navy-900 tabular">
                      {v.wait}
                      <span className="ml-0.5 text-[12px] font-semibold">{t("min")}</span>
                    </span>
                    <span className="block text-[12px] text-muted">{t("waitingCount", { n: v.waiting })}</span>
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
  "flex cursor-default items-center gap-3 rounded-xl py-2.5 pr-4 pl-3 text-[14px] text-ink outline-none select-none",
  "data-highlighted:bg-paper",
);

export function OptionsMenu({ className }: { className?: string }) {
  const { t, lang, setLang, speed, setSpeed, resetDemo, setShowOnboarding } = useStore();
  return (
    <Menu.Root>
      <Menu.Trigger aria-label={t("options")} className={className}>
        <EllipsisVertical className="size-5" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align="end" className="z-50 outline-none">
          <Menu.Popup
            className={cx(
              "min-w-60 origin-(--transform-origin) rounded-2xl bg-white p-1.5 shadow-[0_16px_48px_rgba(13,17,55,0.22)] outline-none",
              popupAnimation,
            )}
          >
            <Menu.RadioGroup value={lang} onValueChange={(v) => setLang(v as "en" | "ko")}>
              <Menu.GroupLabel className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-muted uppercase">
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
            <Menu.Separator className="mx-2 my-1.5 h-px bg-line" />
            <Menu.RadioGroup value={String(speed)} onValueChange={(v) => setSpeed(Number(v))}>
              <Menu.GroupLabel className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-muted uppercase">
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
            <Menu.Separator className="mx-2 my-1.5 h-px bg-line" />
            <Menu.Item className={itemClass} onClick={() => setShowOnboarding(true)}>
              <Sparkles className="size-4 text-muted" aria-hidden />
              {t("replayIntro")}
            </Menu.Item>
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

export function RefreshButton({ className }: { className?: string }) {
  const { refresh, refreshing, t } = useStore();
  return (
    <button type="button" onClick={refresh} aria-label={t("refresh")} className={className} disabled={refreshing}>
      <RotateCw className={cx("size-5", refreshing && "animate-spin-once")} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop header                                                      */
/* ------------------------------------------------------------------ */

const darkIconButton = cx(
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-white/85 transition-colors",
  "hover:bg-white/10 active:bg-white/20 data-popup-open:bg-white/15",
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-300",
);

function useSection() {
  const path = usePathname() ?? "/";
  if (path.startsWith("/ticket")) return "ticket";
  if (path.startsWith("/me")) return "me";
  if (path.startsWith("/map")) return "map";
  return "home";
}

function TicketChip() {
  const { ticket, status, t } = useStore();
  if (!ticket || !status) return null;
  return (
    <Link
      href="/ticket"
      className="flex h-10 items-center gap-2 rounded-full bg-gold-500 pr-4 pl-3 text-[14px] font-semibold text-navy-950 transition-colors outline-none hover:bg-gold-300 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-300"
    >
      <Ticket className="size-4" aria-hidden />
      <span className="font-bold tabular">#{ticket.number}</span>
      <span className="h-4 w-px bg-navy-950/25" aria-hidden />
      <span className="tabular">{status.called ? t("goToCounter", { n: ticket.counter }) : formatCountdown(status.remaining)}</span>
    </Link>
  );
}

export function DesktopHeader() {
  const { t, clockLabel, speed } = useStore();
  const section = useSection();
  const nav = [
    { href: "/", label: t("branches"), active: section === "home" || section === "map" },
    { href: "/ticket", label: t("myTicket"), active: section === "ticket" },
    { href: "/me", label: t("account"), active: section === "me" },
  ];
  return (
    <header className="sticky top-0 z-30 hidden h-16 shrink-0 items-center gap-6 bg-navy-950 px-5 text-white lg:flex">
      <Link href="/" className="flex items-center gap-3 rounded-md outline-none focus-visible:outline-2 focus-visible:outline-gold-300">
        <LogoMark className="h-8 w-auto text-white" />
        <Wordmark className="text-[19px]" />
      </Link>
      <nav aria-label="Main" className="flex items-center gap-1">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={n.active ? "page" : undefined}
            className={cx(
              "rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-gold-300",
              n.active ? "bg-white/12 text-white" : "text-white/65 hover:text-white",
            )}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="flex-1" />
      <SearchDialog
        trigger={
          <button
            type="button"
            className="flex h-10 w-64 items-center gap-2 rounded-full bg-white/10 px-4 text-[14px] text-white/65 transition-colors outline-none hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-300 xl:w-80"
          >
            <Search className="size-[18px] shrink-0" aria-hidden />
            <span className="flex-1 truncate text-left">{t("searchPlaceholder")}</span>
            <kbd className="rounded-md border border-white/20 px-1.5 font-sans text-[11px] text-white/55">/</kbd>
          </button>
        }
      />
      <span className="hidden items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[13px] text-white/75 xl:flex" title={t("simulated")}>
        <span className="relative flex size-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative size-2 rounded-full bg-emerald-400" />
        </span>
        {t("demoClock")} <b className="font-semibold text-white tabular">{clockLabel}</b>
        <span className="text-white/45">· {speed === 1 ? t("realtime") : `${speed}×`}</span>
      </span>
      <TicketChip />
      <div className="-mr-2 flex items-center">
        <RefreshButton className={darkIconButton} />
        <OptionsMenu className={darkIconButton} />
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile                                                              */
/* ------------------------------------------------------------------ */

export function BottomNav() {
  const { t, ticket, status } = useStore();
  const section = useSection();
  const items = [
    { href: "/", key: "home", label: t("home"), icon: House },
    { href: "/map", key: "map", label: t("map"), icon: MapIcon },
    { href: "/ticket", key: "ticket", label: t("ticket"), icon: Ticket },
    { href: "/me", key: "me", label: t("me"), icon: CircleUserRound },
  ] as const;
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto flex max-w-xl">
        {items.map(({ href, key, label, icon: Icon }) => {
          const active = section === key;
          return (
            <li key={key} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors outline-none focus-visible:bg-paper",
                  active ? "text-navy-900" : "text-muted",
                )}
              >
                <span className={cx("relative flex h-7 w-12 items-center justify-center rounded-full transition-colors", active && "bg-gold-100")}>
                  <Icon className="size-[22px]" strokeWidth={active ? 2.1 : 1.8} aria-hidden />
                  {key === "ticket" && ticket && (
                    <span
                      className={cx(
                        "absolute -top-1 right-0.5 min-w-[18px] rounded-full px-1 text-center text-[10px] leading-[18px] font-bold text-white ring-2 ring-white tabular",
                        status?.called ? "animate-pulse bg-rose-600" : "bg-navy-900",
                      )}
                    >
                      {status?.called ? "!" : status?.ahead}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const lightIconButton = cx(
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink transition-colors",
  "hover:bg-black/5 active:bg-black/10 data-popup-open:bg-black/5",
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-navy-700",
);

/** Light, sticky title bar for secondary mobile screens. */
export function MobileTopBar({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-20 border-b border-line/70 bg-paper/88 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex h-14 max-w-xl items-center gap-1 pr-2 pl-5">
        <h1 className="flex-1 truncate text-[19px] font-bold text-ink">{title}</h1>
        {children}
        <OptionsMenu className={lightIconButton} />
      </div>
    </div>
  );
}

export { darkIconButton, lightIconButton };

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DesktopHeader />
      <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</div>
      <BottomNav />
    </>
  );
}
