import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Monitor,
  Smartphone,
  SquarePlus,
  Trophy,
} from "lucide-react";
import { LogoMark, Wordmark } from "@/components/logo";
import { SketchCard, type Sketch } from "@/components/sketch-card";

export const metadata: Metadata = {
  title: "From sketch to prototype",
  description:
    "How Dash Hour, winner of the first BlueHack Samsung Hackathon in 2016, went from six notepad sketches to a working web and mobile prototype.",
};

const SKETCHES: Sketch[] = [
  {
    slug: "01-main",
    number: 1,
    title: "Home",
    titleKo: "메인화면",
    notes: [
      "Refresh, search and an options menu in the top bar; Home, Map and Ticket tabs below it.",
      "Your favorite branch is pinned first, then a divider, then nearby branches with the fewest people waiting.",
      "Show five branches at first; “+ more” reveals the rest. Tap the star to favorite a branch.",
    ],
    href: "/",
  },
  {
    slug: "04-detail",
    number: 2,
    title: "Branch details",
    titleKo: "상세설명 페이지",
    notes: [
      "Tapping a list sort-option slides the details open underneath it.",
      "A small map (tap to open the full map), walking, bus and taxi times, and a crowd-by-hour chart.",
      "A one-line summary such as “60% quieter than other times”.",
    ],
    href: "/branch/shinhan-gangnam",
  },
  {
    slug: "02-take-ticket",
    number: 3,
    title: "Take a ticket",
    titleKo: "번호표 뽑기 팝업",
    notes: [
      "A confirmation popup with the branch and the number of people waiting, then OK or Cancel.",
      "OK plays a short loading screen while the ticket prints.",
    ],
    href: "/branch/shinhan-gangnam",
    wide: true,
    row: true,
  },
  {
    slug: "03-ticket",
    number: 4,
    title: "Ticket",
    titleKo: "번호표 화면",
    notes: [
      "Your number on a torn paper ticket over a dimmed screen.",
      "The people-waiting count goes down as the queue moves, and a ring shows the wait running out.",
      "A route button gets you to the branch in time.",
    ],
    href: "/ticket",
  },
  {
    slug: "05-map",
    number: 5,
    title: "Map",
    titleKo: "지도화면",
    notes: [
      "Numbered pins rank nearby branches; the selected branch appears in a card at the bottom.",
      "Selected by default: your favorite within 5 km, or else the branch with the shortest queue.",
    ],
    href: "/map",
  },
  {
    slug: "06-ticket-box",
    number: 6,
    title: "Ticket box",
    titleKo: "번호표 보관함",
    notes: [
      "Holds your current ticket, with a button to cancel it.",
      "One ticket per person at a time, so people can't hold places in several queues.",
      "Missing your turn three times without cancelling adds a penalty.",
    ],
    href: "/ticket",
    row: true,
  },
];

const TEAM = [
  {
    role: "Team lead",
    name: "Bolim Lee",
    note: "Former designer at Samsung Electronics",
  },
  { role: "Developer", name: "Ye Joo Park" },
];

export default function StoryPage() {
  return (
    <div className="story-page-div plain-page">
      <header className="story-page-header">
        <div className="story-page-div-2">
          <Link href="/" className="story-page-link">
            <LogoMark className="story-page-logo-mark" />
            <Wordmark className="story-page-wordmark" />
          </Link>
          <div className="story-page-div-3" />
          <Link href="/" className="story-page-link-2">
            Open the prototype{" "}
            <ArrowRight className="story-page-arrow-right" aria-hidden />
          </Link>
        </div>
      </header>

      <main className="story-page-main">
        <section className="story-page-section">
          <p className="story-page-p">
            <Trophy className="story-page-trophy" aria-hidden />
            Winner of the first BlueHack Samsung Hackathon · 2016
          </p>
          <h1 className="story-page-h1">
            From a notepad to a working prototype
          </h1>
          <p className="story-page-p-2">
            Dash Hour lets you take a bank&rsquo;s queue number before you get
            there. It shows how long each nearby branch&rsquo;s queue is, how
            busy it usually gets through the day, and when you need to leave so
            you arrive just as your number is called.
          </p>
          <p className="story-page-p-3">
            The idea started as six pages of pen sketches. Those pages have been
            redrawn below, with the Korean notes from each page summarised in
            English. The prototype rebuilds the app from them as a responsive
            web app: the original three-tab layout on phones and a list, map and
            detail view on larger screens.
          </p>
          {/* Wide screens get the desktop pitch; phones, where the app is
              already the three-tab layout, get "Open the app". */}
          <div className="story-page-div-4">
            <Link href="/" className="story-page-link-3">
              <Monitor className="story-page-monitor story-wide" aria-hidden />
              <Smartphone
                className="story-page-monitor story-narrow"
                aria-hidden
              />
              <span className="story-wide">Try it on desktop</span>
              <span className="story-narrow">Open the app</span>
            </Link>
            <p className="story-page-p-4 story-wide">
              <Smartphone className="story-page-smartphone" aria-hidden />
              On a phone it switches to the original three-tab app, and you can
              add it to your home screen.
            </p>
            <p className="story-page-p-4 story-narrow">
              <SquarePlus className="story-page-smartphone" aria-hidden />
              It opens as the original three-tab app. Add it to your home screen
              from your browser&rsquo;s share menu to use it like an installed
              app.
            </p>
          </div>
          <div className="story-team">
            <h2 className="story-team-title">Built by a hackathon team</h2>
            <dl className="story-team-list">
              {TEAM.map((m) => (
                <div key={m.name} className="story-team-member">
                  <dt className="story-team-role">{m.role}</dt>
                  <dd className="story-team-name">{m.name}</dd>
                  {m.note && <dd className="story-team-note">{m.note}</dd>}
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="story-page-section-2" aria-labelledby="sketches">
          <h2 id="sketches" className="story-page-h2">
            The sketches
          </h2>
          <p className="story-page-p-5">
            Turn on “Original page” to see each scanned notepad page.
          </p>
          <div className="story-page-div-6">
            {SKETCHES.map((s) => (
              <SketchCard key={s.slug} sketch={s} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
