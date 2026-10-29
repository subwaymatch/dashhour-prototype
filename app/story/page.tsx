import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Smartphone, Monitor } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/logo";
import { SketchCard, type Sketch } from "@/components/sketch-card";

export const metadata: Metadata = {
  title: "From sketch to prototype",
  description: "How Dash Hour went from six notepad sketches at a 2016 hackathon to a working web and mobile prototype.",
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
      "Tapping a list item slides the details open underneath it.",
      "A small map (tap to open the full map), walking, bus and taxi times, and a crowd-by-hour chart.",
      "A one-line summary such as “60% quieter than other times”.",
    ],
    href: "/",
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
    href: "/",
    wide: true,
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
    href: "/?tab=ticket",
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
    href: "/?tab=map",
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
    href: "/?tab=ticket",
  },
];

const STACK = [
  { name: "Vinext", detail: "Next.js App Router on Vite, prerendered and served from Cloudflare Workers" },
  { name: "Base UI", detail: "Tabs, Dialog, Alert Dialog, Menu, Toast, Collapsible, Toggle Group, Meter, Progress, Switch, Input" },
  { name: "Tailwind CSS 4", detail: "Navy and gold palette carried over from the 2016 visual design" },
  { name: "Lucide", detail: "Open-source icons in place of the original hand-drawn set" },
  { name: "GPT Image 2.5", detail: "Redrew the notepad photos as clean, text-free pen sketches with transparent backgrounds" },
];

export default function StoryPage() {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="bg-navy-950 text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5">
          <Link href="/" className="flex items-center gap-3 rounded-md outline-none focus-visible:outline-2 focus-visible:outline-gold-300">
            <LogoMark className="h-8 w-auto text-white" />
            <Wordmark className="text-[20px]" />
          </Link>
          <div className="flex-1" />
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-gold-500 px-4 text-[14px] font-bold text-navy-950 transition-colors hover:bg-gold-300"
          >
            Open the prototype <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pt-14 pb-24">
        <section className="max-w-3xl">
          <p className="text-[13px] font-bold tracking-[0.18em] text-gold-700 uppercase">Hackathon project · 2016</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] font-black tracking-tight text-navy-900 sm:text-6xl">
            From a notepad to a working prototype
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink/80">
            Dash Hour lets you take a bank&rsquo;s queue number before you get there. It shows how long each nearby branch&rsquo;s
            queue is, how busy it usually gets through the day, and when you need to leave so you arrive just as your
            number is called.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink/80">
            The idea started as six pages of pen sketches. Those pages have been redrawn below, with the Korean notes from
            each page summarised in English. The prototype rebuilds the app from them as a responsive web app: the original
            three-tab layout on phones and a list, map and detail view on larger screens.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-navy-900 px-5 text-[15px] font-bold text-white transition-colors hover:bg-navy-800"
            >
              <Monitor className="size-5" aria-hidden /> Try it on desktop
            </Link>
            <p className="flex items-center gap-2 text-[15px] text-ink/70">
              <Smartphone className="size-5 text-navy-900" aria-hidden />
              On a phone it switches to the original three-tab app, and you can add it to your home screen.
            </p>
          </div>
        </section>

        <section className="mt-20" aria-labelledby="sketches">
          <div className="flex items-end justify-between gap-4">
            <h2 id="sketches" className="font-display text-3xl font-black tracking-tight text-navy-900">
              The sketches
            </h2>
            <p className="hidden text-[14px] text-muted sm:block">Turn on “Original page” to see each scanned notepad page.</p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {SKETCHES.map((s) => (
              <SketchCard key={s.slug} sketch={s} />
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-10 md:grid-cols-[1fr_1.4fr]" aria-labelledby="stack">
          <div>
            <h2 id="stack" className="font-display text-3xl font-black tracking-tight text-navy-900">
              How it&rsquo;s built
            </h2>
            <p className="mt-4 leading-relaxed text-ink/80">
              Queue lengths are simulated from a typical day at a Korean bank branch, with a quiet mid-morning and rushes at
              lunch and before closing. A demo clock runs ten times faster than real time so you can watch a ticket count
              down, and you can change its speed from the ⋮ menu.
            </p>
          </div>
          <dl className="divide-y divide-navy-900/10 rounded-2xl bg-white px-6 shadow-[0_1px_2px_rgba(13,17,55,0.06)]">
            {STACK.map((s) => (
              <div key={s.name} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="font-extrabold text-navy-900">{s.name}</dt>
                <dd className="text-[15px] text-ink/75">{s.detail}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}
