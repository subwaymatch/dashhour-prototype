"use client";

import Link from "next/link";
import { Monitor, Smartphone, SquarePlus, Trophy } from "lucide-react";
import type { Lang, Localized } from "@/lib/i18n";
import { SiteHeader } from "./site-header";
import { SketchCard, type Sketch } from "./sketch-card";
import { useSavedLang } from "./use-saved-lang";

const SKETCHES: Sketch[] = [
  {
    slug: "01-main",
    number: 1,
    title: { en: "Home", ko: "메인화면" },
    notes: {
      en: [
        "Refresh, search and an options menu in the top bar; Home, Map and Ticket tabs below it.",
        "Your favorite branch is pinned first, then a divider, then nearby branches with the fewest people waiting.",
        "Show five branches at first; “+ more” reveals the rest. Tap the star to favorite a branch.",
      ],
      ko: [
        "상단 바에 새로고침, 검색, 옵션 메뉴가 있고 그 아래에 홈, 지도, 번호표 탭이 있습니다.",
        "즐겨찾는 지점이 맨 위에 고정되고, 구분선 아래로 대기 인원이 적은 주변 지점이 이어집니다.",
        "처음에는 다섯 곳만 보여주고 ‘+ 더보기’로 나머지를 펼칩니다. 별을 누르면 즐겨찾기에 추가됩니다.",
      ],
    },
    href: "/",
  },
  {
    slug: "04-detail",
    number: 2,
    title: { en: "Branch details", ko: "상세설명 페이지" },
    notes: {
      en: [
        "Tapping a list sort-option slides the details open underneath it.",
        "A small map (tap to open the full map), walking, bus and taxi times, and a crowd-by-hour chart.",
        "A one-line summary such as “60% quieter than other times”.",
      ],
      ko: [
        "목록에서 항목을 누르면 그 아래로 상세 설명이 펼쳐집니다.",
        "작은 지도(누르면 전체 지도로 이동), 도보·버스·택시 소요 시간, 시간대별 혼잡도 그래프가 들어갑니다.",
        "‘다른 시간대보다 60% 한산’ 같은 한 줄 요약을 보여줍니다.",
      ],
    },
    href: "/branch/shinhan-gangnam",
  },
  {
    slug: "02-take-ticket",
    number: 3,
    title: { en: "Take a ticket", ko: "번호표 뽑기 팝업" },
    notes: {
      en: [
        "A confirmation popup with the branch and the number of people waiting, then OK or Cancel.",
        "OK plays a short loading screen while the ticket prints.",
      ],
      ko: [
        "지점과 대기 인원을 보여주는 확인 팝업이 뜨고, 확인 또는 취소를 고릅니다.",
        "확인을 누르면 번호표가 나오는 동안 짧은 로딩 화면이 나옵니다.",
      ],
    },
    href: "/branch/shinhan-gangnam",
    wide: true,
    row: true,
  },
  {
    slug: "03-ticket",
    number: 4,
    title: { en: "Ticket", ko: "번호표 화면" },
    notes: {
      en: [
        "Your number on a torn paper ticket over a dimmed screen.",
        "The people-waiting count goes down as the queue moves, and a ring shows the wait running out.",
        "A route button gets you to the branch in time.",
      ],
      ko: [
        "어두워진 화면 위에 찢어진 종이 번호표 모양으로 내 번호를 보여줍니다.",
        "순서가 가까워질수록 대기 인원 숫자가 줄어들고, 원형 그래프가 남은 대기를 보여줍니다.",
        "길찾기 버튼으로 제시간에 지점까지 갈 수 있습니다.",
      ],
    },
    href: "/ticket",
  },
  {
    slug: "05-map",
    number: 5,
    title: { en: "Map", ko: "지도화면" },
    notes: {
      en: [
        "Numbered pins rank nearby branches; the selected branch appears in a card at the bottom.",
        "Selected by default: your favorite within 5 km, or else the branch with the shortest queue.",
      ],
      ko: [
        "번호가 붙은 핀으로 주변 지점의 순위를 표시하고, 선택한 지점은 아래 카드에 나타납니다.",
        "기본 선택은 5km 안의 즐겨찾는 지점이고, 없으면 대기가 가장 짧은 지점입니다.",
      ],
    },
    href: "/map",
  },
  {
    slug: "06-ticket-box",
    number: 6,
    title: { en: "Ticket box", ko: "번호표 보관함" },
    notes: {
      en: [
        "Holds your current ticket, with a button to cancel it.",
        "One ticket per person at a time, so people can't hold places in several queues.",
        "Missing your turn three times without cancelling adds a penalty.",
      ],
      ko: [
        "현재 번호표와 취소 버튼이 들어 있습니다.",
        "여러 줄에 자리를 잡아둘 수 없도록 번호표는 한 사람이 한 번에 한 장만 가질 수 있습니다.",
        "취소 없이 세 번 차례를 놓치면 불이익이 주어집니다.",
      ],
    },
    href: "/ticket",
    row: true,
  },
];

const TEAM: Array<{ role: Localized; name: string; note?: Localized }> = [
  {
    role: { en: "Team lead", ko: "팀 리드" },
    name: "Bolim Lee",
    note: { en: "Former designer at Samsung Electronics", ko: "전 삼성전자 디자이너" },
  },
  { role: { en: "Developer", ko: "개발" }, name: "Ye Joo Park" },
];

const COPY = {
  en: {
    about: "About",
    open: "Open the prototype",
    eyebrow: "Winner of the first BlueHack Samsung Hackathon · 2016",
    title: "From a notepad to a working prototype",
    lead: "Dash Hour lets you take a bank’s queue number before you get there. It shows how long each nearby branch’s queue is, how busy it usually gets through the day, and when you need to leave so you arrive just as your number is called.",
    body: "The idea started as six pages of pen sketches. Those pages have been redrawn below, with the Korean notes from each page summarised in English. The prototype rebuilds the app from them as a responsive web app: the original three-tab layout on phones and a list, map and detail view on larger screens.",
    tryWide: "Try it on desktop",
    tryNarrow: "Open the app",
    noteWide:
      "On a phone it switches to the original three-tab app, and you can add it to your home screen.",
    noteNarrow:
      "It opens as the original three-tab app. Add it to your home screen from your browser’s share menu to use it like an installed app.",
    team: "Built by a hackathon team",
    sketches: "The sketches",
    sketchesHint: "Turn on “Original page” to see each scanned notepad page.",
  },
  ko: {
    about: "소개",
    open: "프로토타입 열기",
    eyebrow: "2016년 첫 BlueHack 삼성 해커톤 우승",
    title: "노트 여섯 장에서 작동하는 프로토타입까지",
    lead: "Dash Hour는 은행에 도착하기 전에 번호표를 미리 뽑는 앱입니다. 주변 지점마다 줄이 얼마나 긴지, 하루 중 언제 붐비는지 보여주고, 내 번호가 불릴 때 도착하려면 언제 출발해야 하는지 알려줍니다.",
    body: "이 아이디어는 펜으로 그린 스케치 여섯 장에서 시작했습니다. 아래에 그 스케치를 다시 그려 싣고, 각 장에 손으로 적은 메모를 정리했습니다. 프로토타입은 이 스케치를 반응형 웹 앱으로 다시 만든 것입니다. 휴대폰에서는 스케치의 탭 구성 그대로, 큰 화면에서는 목록과 지도, 상세 화면을 나란히 보여줍니다.",
    tryWide: "데스크톱에서 써 보기",
    tryNarrow: "앱 열기",
    noteWide: "휴대폰에서는 스케치와 같은 탭 앱으로 바뀌고, 홈 화면에 추가할 수 있습니다.",
    noteNarrow:
      "스케치와 같은 탭 앱으로 열립니다. 브라우저의 공유 메뉴에서 홈 화면에 추가하면 설치한 앱처럼 쓸 수 있습니다.",
    team: "해커톤 팀이 만들었습니다",
    sketches: "스케치",
    sketchesHint: "‘원본 보기’를 켜면 스캔한 노트 원본을 볼 수 있습니다.",
  },
} satisfies Record<Lang, Record<string, string>>;

export function StoryPage() {
  const [lang, setLang] = useSavedLang();
  const c = COPY[lang];

  return (
    <div lang={lang} className="story-page-div plain-page">
      <SiteHeader
        lang={lang}
        setLang={setLang}
        link={{ href: "/about", label: c.about }}
        cta={c.open}
      />

      <main className="story-page-main">
        <section className="story-page-section">
          <p className="story-page-p">
            <Trophy className="story-page-trophy" aria-hidden />
            {c.eyebrow}
          </p>
          <h1 className="story-page-h1">{c.title}</h1>
          <p className="story-page-p-2">{c.lead}</p>
          <p className="story-page-p-3">{c.body}</p>
          {/* Wide screens get the desktop pitch; phones, where the app is
              already the tab layout, get "Open the app". */}
          <div className="story-page-div-4">
            <Link href="/" className="story-page-link-3">
              <Monitor className="story-page-monitor story-wide" aria-hidden />
              <Smartphone
                className="story-page-monitor story-narrow"
                aria-hidden
              />
              <span className="story-wide">{c.tryWide}</span>
              <span className="story-narrow">{c.tryNarrow}</span>
            </Link>
            <p className="story-page-p-4 story-wide">
              <Smartphone className="story-page-smartphone" aria-hidden />
              {c.noteWide}
            </p>
            <p className="story-page-p-4 story-narrow">
              <SquarePlus className="story-page-smartphone" aria-hidden />
              {c.noteNarrow}
            </p>
          </div>
          <div className="story-team">
            <h2 className="story-team-title">{c.team}</h2>
            <dl className="story-team-list">
              {TEAM.map((m) => (
                <div key={m.name} className="story-team-member">
                  <dt className="story-team-role">{m.role[lang]}</dt>
                  <dd className="story-team-name" lang="en">
                    {m.name}
                  </dd>
                  {m.note && (
                    <dd className="story-team-note">{m.note[lang]}</dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="story-page-section-2" aria-labelledby="sketches">
          <h2 id="sketches" className="story-page-h2">
            {c.sketches}
          </h2>
          <p className="story-page-p-5">{c.sketchesHint}</p>
          <div className="story-page-div-6">
            {SKETCHES.map((s) => (
              <SketchCard key={s.slug} sketch={s} lang={lang} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
