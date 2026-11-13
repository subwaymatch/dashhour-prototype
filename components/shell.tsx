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
  Info,
  CircleUserRound,
  EllipsisVertical,
  House,
  Map as MapIcon,
  RotateCcw,
  RotateCw,
  Search,
  CirclePlay,
  Ticket,
  X,
} from "lucide-react";
import { appSection } from "@/lib/app-paths";
import { SPEEDS, formatCountdown } from "@/lib/sim";
import { BankBadge } from "./bank-badge";
import { LogoMark } from "./logo";
import { useStore } from "./store";
import { backdropClass, cx, popupAnimation } from "./ui";

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

function normalise(s: string) {
  return s.toLowerCase().replace(/\s+/g, "");
}

export function SearchDialog({
  trigger,
}: {
  trigger: React.ReactElement<Record<string, unknown>>;
}) {
  const { views, t, lang } = useStore();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest(
        "input, textarea, [contenteditable=true]",
      );
      if (
        (e.key === "/" && !typing) ||
        (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))
      ) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = normalise(query);
  const results = views
    .filter(
      (v) =>
        !q ||
        [
          v.fullName,
          v.bankName,
          v.branchName,
          v.name.en,
          v.name.ko,
          v.address[lang],
        ].some((s) => normalise(s).includes(q)),
    )
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
          className={cx("search-dialog-dialog-popup-search", popupAnimation)}
        >
          <Dialog.Title className="search-dialog-dialog-title-search">
            {t("search")}
          </Dialog.Title>
          <div className="search-dialog-div-search-placeholder">
            <Search className="search-dialog-search" aria-hidden />
            <Input
              autoFocus
              value={query}
              onValueChange={(v) => setQuery(v)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className="search-dialog-input"
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) pick(results[0].id);
              }}
            />
            <Dialog.Close
              aria-label={t("close")}
              className="search-dialog-dialog-close"
            >
              <X className="search-dialog-x" />
            </Dialog.Close>
          </div>
          <ul className="search-dialog-ul-no-results">
            {results.length === 0 && (
              <li className="search-dialog-li-no-results">{t("noResults")}</li>
            )}
            {results.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => pick(v.id)}
                  className="search-dialog-button-min"
                >
                  <BankBadge
                    bank={v.bank}
                    className="search-dialog-bank-badge"
                  />
                  <span className="search-dialog-span">
                    <span className="search-dialog-span-2">{v.fullName}</span>
                    <span className="search-dialog-span-3">
                      {v.address[lang]}
                    </span>
                  </span>
                  <span className="search-dialog-span-min">
                    <span className="search-dialog-span-min-2">
                      <span className="minute-number">{v.wait}</span>
                      <span className="search-dialog-span-min-3">
                        {t("min")}
                      </span>
                    </span>
                    <span className="search-dialog-span-waiting-count">
                      {t("waitingCount", { n: v.waiting })}
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

const itemClass = cx("options-item");

export function OptionsMenu({ className }: { className?: string }) {
  const { t, lang, setLang, speed, setSpeed, resetDemo, setShowOnboarding } =
    useStore();
  return (
    <Menu.Root>
      <Menu.Trigger aria-label={t("options")} className={className}>
        <EllipsisVertical className="search-dialog-x" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          sideOffset={6}
          align="end"
          className="options-menu-menu-positioner-language"
        >
          <Menu.Popup
            className={cx("options-menu-menu-popup-language", popupAnimation)}
          >
            <Menu.RadioGroup
              value={lang}
              onValueChange={(v) => setLang(v as "en" | "ko")}
            >
              <Menu.GroupLabel className="options-menu-menu-group-label-language">
                {t("language")}
              </Menu.GroupLabel>
              {(
                [
                  ["en", "English"],
                  ["ko", "한국어"],
                ] as const
              ).map(([value, label]) => (
                <Menu.RadioItem
                  key={value}
                  value={value}
                  closeOnClick
                  className={itemClass}
                >
                  <span className="options-menu-span">
                    <Menu.RadioItemIndicator>
                      <Check className="options-menu-check" />
                    </Menu.RadioItemIndicator>
                  </span>
                  <span lang={value}>{label}</span>
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
            <Menu.Separator className="options-menu-menu-separator" />
            <Menu.RadioGroup
              value={String(speed)}
              onValueChange={(v) => setSpeed(Number(v))}
            >
              <Menu.GroupLabel className="options-menu-menu-group-label-language">
                {t("demoSpeed")}
              </Menu.GroupLabel>
              {SPEEDS.map((s) => (
                <Menu.RadioItem
                  key={s}
                  value={String(s)}
                  closeOnClick
                  className={itemClass}
                >
                  <span className="options-menu-span">
                    <Menu.RadioItemIndicator>
                      <Check className="options-menu-check" />
                    </Menu.RadioItemIndicator>
                  </span>
                  {s === 1 ? t("realtime") : `${s}×`}
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
            <Menu.Separator className="options-menu-menu-separator" />
            <Menu.Item
              className={itemClass}
              onClick={() => setShowOnboarding(true)}
            >
              <CirclePlay className="options-menu-sparkles" aria-hidden />
              {t("replayIntro")}
            </Menu.Item>
            <Menu.Item className={itemClass} onClick={resetDemo}>
              <RotateCcw className="options-menu-sparkles" aria-hidden />
              {t("resetDemo")}
            </Menu.Item>
            <Menu.LinkItem
              className={itemClass}
              render={<Link href="/about" />}
            >
              <Info className="options-menu-sparkles" aria-hidden />
              {t("aboutApp")}
            </Menu.LinkItem>
            <Menu.LinkItem
              className={itemClass}
              render={<Link href="/story" />}
            >
              <BookOpen className="options-menu-sparkles" aria-hidden />
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
    <button
      type="button"
      onClick={refresh}
      aria-label={t("refresh")}
      className={className}
      disabled={refreshing}
    >
      <RotateCw
        className={cx(
          "search-dialog-x",
          refreshing && "refresh-button-rotate-cw",
        )}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop header                                                      */
/* ------------------------------------------------------------------ */

const darkIconButton = cx("dark-icon-button");

/** The current tab; null on the 404 page, where no tab is the current page. */
export function useSection() {
  return appSection(usePathname() ?? "/");
}

function TicketChip() {
  const { ticket, status, t } = useStore();
  if (!ticket || !status) return null;
  return (
    <Link href="/ticket" className="ticket-chip-link-go-to-counter">
      <Ticket className="ticket-chip-ticket" aria-hidden />
      <span className="ticket-chip-span">#{ticket.number}</span>
      <span className="ticket-chip-span-2" aria-hidden />
      <span className="ticket-chip-span-go-to-counter">
        {status.called
          ? t("goToCounter", { n: ticket.counter })
          : formatCountdown(status.remaining)}
      </span>
    </Link>
  );
}

export function DesktopHeader() {
  const { t } = useStore();
  const section = useSection();
  const nav = [
    {
      href: "/",
      label: t("branches"),
      active: section === "home" || section === "map",
    },
    { href: "/ticket", label: t("myTicket"), active: section === "ticket" },
    { href: "/me", label: t("account"), active: section === "me" },
  ];
  return (
    <header className="desktop-header-header-search-placeholder">
      <Link href="/" aria-label="Dash Hour" className="desktop-header-link">
        <LogoMark className="desktop-header-logo-mark" />
      </Link>
      <nav aria-label={t("mainNav")} className="desktop-header-nav">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={n.active ? "page" : undefined}
            className={cx(
              "desktop-header-link-2",
              n.active ? "desktop-header-link-3" : "desktop-header-link-4",
            )}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="desktop-header-div" />
      <SearchDialog
        trigger={
          <button
            type="button"
            className="desktop-header-button-search-placeholder"
          >
            <Search className="desktop-header-search" aria-hidden />
            <span className="desktop-header-span-search-placeholder">
              {t("searchPlaceholder")}
            </span>
            <kbd className="desktop-header-kbd">/</kbd>
          </button>
        }
      />
      <TicketChip />
      <div className="desktop-header-div-2">
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
    <nav aria-label={t("mainNav")} className="bottom-nav-nav">
      <ul className="bottom-nav-ul">
        {items.map(({ href, key, label, icon: Icon }) => {
          const active = section === key;
          return (
            <li key={key} className="desktop-header-div">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "bottom-nav-link",
                  active ? "bottom-nav-link-2" : "bottom-nav-link-3",
                )}
              >
                <span
                  className={cx(
                    "bottom-nav-span",
                    active && "bottom-nav-span-2",
                  )}
                >
                  <Icon
                    className="bottom-nav-icon"
                    strokeWidth={active ? 2.1 : 1.8}
                    aria-hidden
                  />
                  {key === "ticket" && ticket && (
                    <span
                      key={status?.called ? "called" : status?.ahead}
                      className={cx(
                        "bottom-nav-span-3",
                        status?.called
                          ? "bottom-nav-span-4"
                          : "bottom-nav-span-5",
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

const lightIconButton = cx("light-icon-button");

/** Light, sticky title bar for secondary mobile screens. */
export function MobileTopBar({
  title,
  children,
  heading = true,
}: {
  title: string;
  children?: React.ReactNode;
  /** False when the page has its own h1 on phones. */
  heading?: boolean;
}) {
  const Title = heading ? "h1" : "p";
  return (
    <div className="mobile-top-bar-div">
      <div className="mobile-top-bar-div-2">
        <Title className="mobile-top-bar-h1">{title}</Title>
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
      <div className="app-shell-div">{children}</div>
      <BottomNav />
    </>
  );
}
