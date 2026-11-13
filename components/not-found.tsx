"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  House,
  Info,
  Map as MapIcon,
  Ticket,
} from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { MobileTopBar } from "./shell";
import { SiteHeader } from "./site-header";
import { useOptionalStore } from "./store";
import { useSavedLang } from "./use-saved-lang";

const COPY = {
  ko: {
    about: "소개",
    open: "앱 열기",
    topBar: "페이지를 찾을 수 없음",
    ticketLabel: "404 오류",
    ticketNote: "찾을 수 없음",
    title: "이 페이지는 대기열에 없어요",
    body: "주소가 바뀌었거나 잘못 입력된 것 같아요. 번호표와 즐겨찾기는 그대로 남아 있어요.",
    requested: "요청한 주소",
    home: "홈으로 가기",
    back: "이전 페이지로",
    next: "이런 곳은 어떠세요?",
    alt: "갈림길 표지판 앞에서 휴대폰과 번호표를 들고 머리를 긁적이는 사람",
    links: [
      { href: "/map", icon: MapIcon, title: "지도", desc: "강남역 주변 지점 위치와 대기 시간" },
      { href: "/ticket", icon: Ticket, title: "내 번호표", desc: "지금 가진 번호표와 남은 시간" },
      { href: "/about", icon: Info, title: "Dash Hour 소개", desc: "어떤 문제를 풀려고 만들었는지" },
      { href: "/story", icon: BookOpen, title: "스케치", desc: "노트 여섯 장에서 시작한 이야기" },
    ],
  },
  en: {
    about: "About",
    open: "Open the app",
    topBar: "Page not found",
    ticketLabel: "Error 404",
    ticketNote: "Not found",
    title: "This page isn’t in the queue",
    body: "The link may be out of date, or the address may have a typo. Your ticket and favorites are still saved.",
    requested: "You asked for",
    home: "Go to home",
    back: "Go back",
    next: "Try one of these",
    alt: "A puzzled man scratching his head at a signpost, holding a phone and a queue ticket.",
    links: [
      { href: "/map", icon: MapIcon, title: "Map", desc: "Branches and waits around Gangnam Station" },
      { href: "/ticket", icon: Ticket, title: "My ticket", desc: "The ticket you hold and the time left" },
      { href: "/about", icon: Info, title: "About Dash Hour", desc: "What problem it sets out to solve" },
      { href: "/story", icon: BookOpen, title: "Sketches", desc: "How it started as six notepad pages" },
    ],
  },
} satisfies Record<Lang, unknown>;

/** A torn paper queue ticket numbered 404; the digits roll in like a queue display. */
function NotFoundTicket({ label, note }: { label: string; note: string }) {
  return (
    <div className="nf-ticket" role="img" aria-label={label}>
      <div className="nf-ticket-paper">
        <div className="nf-ticket-main">
          <span className="nf-ticket-no" aria-hidden>
            No.
          </span>
          <span className="nf-ticket-number" aria-hidden>
            {["4", "0", "4"].map((d, i) => (
              <span key={i} className="nf-ticket-digit">
                <span style={{ "--i": i } as React.CSSProperties}>{d}</span>
              </span>
            ))}
          </span>
        </div>
        <span className="nf-ticket-stub" aria-hidden>
          {note}
        </span>
      </div>
    </div>
  );
}

/**
 * Vinext renders not-found inside the app's layout, so the page normally sits in the
 * app shell and follows the app's language. Outside it, the page brings its own header.
 */
export function NotFoundPage() {
  const store = useOptionalStore();
  return store ? <InAppNotFound lang={store.lang} /> : <StandaloneNotFound />;
}

function InAppNotFound({ lang }: { lang: Lang }) {
  return (
    <>
      <MobileTopBar title={COPY[lang].topBar} heading={false} />
      <NotFoundContent lang={lang} />
    </>
  );
}

function StandaloneNotFound() {
  const [lang, setLang] = useSavedLang();
  return (
    <>
      <SiteHeader
        lang={lang}
        setLang={setLang}
        link={{ href: "/about", label: COPY[lang].about }}
        cta={COPY[lang].open}
      />
      <NotFoundContent lang={lang} />
    </>
  );
}

function NotFoundContent({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  // Read on the client: this page can be served for any address.
  const [path, setPath] = React.useState<string | null>(null);
  const [canGoBack, setCanGoBack] = React.useState(false);

  React.useEffect(() => {
    setPath(decodeURI(window.location.pathname));
    setCanGoBack(window.history.length > 1);
  }, []);

  return (
    <div lang={lang} className="nf plain-page">
      <main className="nf-main">
        <section className="nf-hero">
          <div className="nf-copy">
            <NotFoundTicket label={c.ticketLabel} note={c.ticketNote} />
            <h1 className="nf-title">{c.title}</h1>
            <p className="nf-body">{c.body}</p>
            {path && path !== "/" && (
              <p className="nf-path">
                <span className="nf-path-label">{c.requested}</span>
                <code className="nf-path-code" lang="en">
                  {path}
                </code>
              </p>
            )}
            <div className="nf-actions">
              <Link href="/" className="nf-button">
                <House className="nf-icon" aria-hidden />
                {c.home}
              </Link>
              {canGoBack && (
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="nf-button-secondary"
                >
                  <ArrowLeft className="nf-icon" aria-hidden />
                  {c.back}
                </button>
              )}
            </div>
          </div>
          <div className="nf-art">
            <div className="nf-blob" aria-hidden />
            <img
              src="/images/not-found.webp"
              alt={c.alt}
              width={664}
              height={800}
              className="nf-img"
            />
          </div>
        </section>

        <section className="nf-next" aria-labelledby="nf-next">
          <h2 id="nf-next" className="nf-next-title">
            {c.next}
          </h2>
          <ul className="nf-links">
            {c.links.map(({ href, icon: Icon, title, desc }) => (
              <li key={href}>
                <Link href={href} className="nf-link">
                  <span className="nf-link-icon">
                    <Icon aria-hidden />
                  </span>
                  <span className="nf-link-text">
                    <span className="nf-link-title">{title}</span>
                    <span className="nf-link-desc">{desc}</span>
                  </span>
                  <ArrowRight className="nf-link-arrow" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
