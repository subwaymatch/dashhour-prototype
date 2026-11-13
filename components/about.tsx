"use client";

import Link from "next/link";
import { Accordion } from "@base-ui/react/accordion";
import { ArrowRight, Plus } from "lucide-react";
import { BANKS, BRANCHES, SERVICES } from "@/lib/data";
import type { Lang } from "@/lib/i18n";
import { GRACE_MIN } from "@/lib/sim";
import { AnimatedLogo, LogoMark } from "./logo";
import { CountUp, Reveal } from "./motion";
import { cx } from "./ui";
import { useSavedLang } from "./use-saved-lang";

/** Intrinsic sizes of public/images/about-*.webp, so the layout holds before they load. */
const IMAGES = {
  hero: [1120, 862],
  problem: [800, 626],
  "step-find": [654, 800],
  "step-ticket": [647, 800],
  "step-arrive": [800, 762],
  fair: [535, 800],
  crowd: [800, 611],
  access: [800, 591],
  branch: [800, 508],
  origin: [773, 800],
} as const;

type ImageKey = keyof typeof IMAGES;

function Art({
  name,
  alt,
  className,
  eager,
}: {
  name: ImageKey;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [width, height] = IMAGES[name];
  return (
    <img
      src={`/images/about-${name}.webp`}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cx("about-art", className)}
    />
  );
}

type Copy = {
  open: string;
  eyebrow: string;
  title: [string, string];
  lead: string;
  story: string;
  heroAlt: string;
  problem: { label: string; title: string; body: string[]; alt: string };
  steps: {
    label: string;
    title: string;
    items: Array<{ image: ImageKey; title: string; body: string; alt: string }>;
  };
  principles: {
    label: string;
    title: string;
    items: Array<{ image: ImageKey; title: string; body: string; alt: string }>;
  };
  numbers: { title: string; items: Array<{ value: number; unit: string; label: string }> };
  origin: {
    label: string;
    title: string;
    body: string[];
    alt: string;
    team: Array<{ role: string; name: string; note?: string }>;
    link: string;
  };
  faq: { title: string; items: Array<{ q: string; a: string }> };
  cta: { title: string; body: string; button: string };
  disclaimer: string;
};

const COUNTS = {
  branches: BRANCHES.length,
  banks: Object.keys(BANKS).length,
  services: Object.keys(SERVICES).length,
};

const COPY: Record<Lang, Copy> = {
  ko: {
    open: "앱 열기",
    eyebrow: "Dash Hour 소개",
    title: ["줄은 저희가 설게요.", "제시간에만 오세요."],
    lead: "Dash Hour는 은행에 도착하기 전에 번호표를 미리 뽑는 앱입니다. 지점마다 지금 몇 명이 기다리는지, 하루 중 언제 덜 붐비는지 보여주고, 내 번호가 불릴 때에 맞춰 출발할 시간을 알려드려요.",
    story: "스케치에서 프로토타입까지",
    heroAlt: "카페에 앉아 휴대폰으로 번호표를 받는 사람. 멀리 은행 앞에는 줄이 서 있다.",
    problem: {
      label: "왜 만들었나요",
      title: "볼일은 5분인데, 기다림은 점심시간 내내",
      body: [
        "번호표를 뽑고, 자리에 앉아, 전광판만 바라봅니다. 얼마나 걸릴지는 가 봐야 알 수 있고, 잠깐 자리를 뜨면 순서를 놓칩니다.",
        "Dash Hour는 한 가지 질문에서 출발했습니다. 번호표를 꼭 은행에 가서 뽑아야 할까요?",
      ],
      alt: "은행 대기석에 앉아 번호표를 든 채 지쳐 있는 네 사람",
    },
    steps: {
      label: "이용 방법",
      title: "세 단계면 충분합니다",
      items: [
        {
          image: "step-find",
          title: "가까운 지점을 고르세요",
          body: "지점마다 지금 몇 명이 기다리는지, 걸어서 몇 분인지 한눈에 비교합니다.",
          alt: "지도에 지점 핀이 표시된 휴대폰을 든 손",
        },
        {
          image: "step-ticket",
          title: "어디서든 번호표를 뽑으세요",
          body: "볼 업무를 고르면 번호표가 발급되고, 이동하는 동안 순번이 유지됩니다.",
          alt: "휴대폰에서 번호표가 나오는 것을 보며 웃는 사람",
        },
        {
          image: "step-arrive",
          title: "딱 맞춰 도착하세요",
          body: "출발할 시각을 알려드리고, 앞에 3명이 남으면 한 번 더 알려드려요.",
          alt: "제시간에 창구에 도착해 직원의 안내를 받는 사람",
        },
      ],
    },
    principles: {
      label: "우리가 지키는 원칙",
      title: "빨리 가는 줄보다, 믿을 수 있는 줄",
      items: [
        {
          image: "fair",
          title: "공정한 줄",
          body: "번호표는 한 번에 한 장입니다. 취소 없이 세 번 불참하면 30일간 발급이 제한됩니다. 휴대폰으로 뽑은 번호표도 은행에서 뽑은 번호표와 똑같이 한 자리입니다.",
          alt: "수평을 이룬 저울과, 번호표를 한 장씩 들고 줄을 선 세 사람",
        },
        {
          image: "crowd",
          title: "정직한 숫자",
          body: "대기 시간은 추정치로 보여주고, 시간대별 혼잡도와 오늘 가장 한산한 시간을 함께 알려드립니다. 급한 일이 아니라면 덜 붐빌 때 가세요.",
          alt: "혼잡도 그래프에서 가장 한산한 시간을 가리키는 사람",
        },
        {
          image: "access",
          title: "누구에게나",
          body: "휠체어 접근, 영어 상담, 주차, 24시간 ATM처럼 가기 전에 알아야 할 것을 지점마다 표시합니다. 앱은 한국어와 영어로 쓸 수 있습니다.",
          alt: "지팡이를 짚은 어르신, 휠체어 이용자, 여행자를 맞이하는 은행 직원",
        },
        {
          image: "branch",
          title: "지점에도 좋은 일",
          body: "방문이 붐비는 시간을 피해 고르게 나뉘면 대기석이 한산해지고, 창구는 한 사람 한 사람에게 더 집중할 수 있습니다.",
          alt: "손님 두 명만 상담 중인 한산한 은행 창구",
        },
      ],
    },
    numbers: {
      title: "숫자로 보는 프로토타입",
      items: [
        { value: COUNTS.branches, unit: "곳", label: "강남역 주변 지점" },
        { value: COUNTS.banks, unit: "개", label: "은행" },
        { value: COUNTS.services, unit: "가지", label: "창구 업무" },
        { value: GRACE_MIN, unit: "분", label: "호출 후 창구까지 주어지는 시간" },
      ],
    },
    origin: {
      label: "시작",
      title: "노트 여섯 장에서 시작했습니다",
      body: [
        "Dash Hour는 2016년 첫 BlueHack 삼성 해커톤에서 펜으로 그린 스케치 여섯 장으로 시작해 우승했습니다.",
        "이 프로토타입은 그 스케치를 반응형 웹 앱으로 다시 만든 것입니다. 휴대폰에서는 스케치 그대로 탭으로, 큰 화면에서는 목록과 지도, 지점 상세를 나란히 보여줍니다.",
      ],
      alt: "앱 화면 스케치가 그려진 노트를 보는 두 사람, 만년필과 커피, 트로피",
      team: [
        { role: "팀 리드", name: "Bolim Lee", note: "전 삼성전자 디자이너" },
        { role: "개발", name: "Ye Joo Park" },
      ],
      link: "스케치 여섯 장 보기",
    },
    faq: {
      title: "자주 묻는 질문",
      items: [
        {
          q: "실제 은행에서 쓸 수 있나요?",
          a: "아직은 아닙니다. Dash Hour는 디자인 프로토타입이고 대기 현황은 시뮬레이션입니다. 화면에 나오는 은행들과 제휴나 후원 관계가 없습니다.",
        },
        {
          q: "제 차례를 놓치면 어떻게 되나요?",
          a: `번호가 호출된 뒤 ${GRACE_MIN}분 안에 창구에 오지 않으면 불참으로 처리됩니다. 늦을 것 같으면 순번을 한 번 미루거나 번호표를 취소하세요. 취소는 불참으로 세지 않습니다.`,
        },
        {
          q: "번호표를 여러 장 뽑을 수 있나요?",
          a: "한 번에 한 장만 가능합니다. 여러 지점에 자리만 잡아 두고 나타나지 않는 일을 막기 위해서입니다.",
        },
        {
          q: "지도와 경로는 실제 데이터인가요?",
          a: "지도와 지하철역, 도보 경로는 OpenStreetMap의 실제 데이터입니다. 지점의 위치와 주소, 전화번호는 예시입니다.",
        },
      ],
    },
    cta: {
      title: "지금 번호표를 뽑아 보세요",
      body: "데모 시계는 10:32에 시작해 실시간으로 흐릅니다. 메뉴에서 속도를 10×로 바꾸면 차례가 오는 과정을 금방 볼 수 있어요.",
      button: "앱 열기",
    },
    disclaimer:
      "Dash Hour는 어떤 은행과도 제휴하지 않은 독립 프로토타입입니다. 은행 이름과 로고는 각 소유자의 상표이며, 지점을 구분하기 위해서만 사용했습니다.",
  },
  en: {
    open: "Open the app",
    eyebrow: "About Dash Hour",
    title: ["We’ll hold your place in line.", "You just show up on time."],
    lead: "Dash Hour lets you take a bank’s queue number before you get there. It shows how many people are waiting at each branch and when it gets quieter through the day, and tells you when to leave so you arrive as your number is called.",
    story: "From sketch to prototype",
    heroAlt:
      "A woman at a café table receiving a queue ticket on her phone, with a line outside a bank in the distance.",
    problem: {
      label: "Why we made it",
      title: "The errand takes five minutes. The wait takes your lunch break.",
      body: [
        "You take a number, find a seat and watch the display. You can’t know how long it will take until you’re there, and if you step out you lose your place.",
        "Dash Hour started from one question: why do you have to be at the bank to take a number?",
      ],
      alt: "Four tired people sitting in a bank waiting area holding paper tickets.",
    },
    steps: {
      label: "How it works",
      title: "Three steps",
      items: [
        {
          image: "step-find",
          title: "Pick a nearby branch",
          body: "Compare how many people are waiting at each branch and how far the walk is.",
          alt: "A hand holding a phone that shows a map with branch pins.",
        },
        {
          image: "step-ticket",
          title: "Take a ticket from anywhere",
          body: "Choose the counter you need. Your place is held while you’re on the way.",
          alt: "A smiling person watching a queue ticket come out of their phone.",
        },
        {
          image: "step-arrive",
          title: "Arrive just in time",
          body: "We tell you when to leave, and remind you again when three people are ahead.",
          alt: "A man arriving at the counter on time and being welcomed by a teller.",
        },
      ],
    },
    principles: {
      label: "What we hold to",
      title: "A line you can trust, not a way to cut it",
      items: [
        {
          image: "fair",
          title: "A fair line",
          body: "One ticket at a time. Miss your turn three times without cancelling and ticketing pauses for 30 days. A ticket taken on a phone is one place in line, the same as one taken at the bank.",
          alt: "A level balance scale above three people in line, each holding one ticket.",
        },
        {
          image: "crowd",
          title: "Honest numbers",
          body: "Wait times are shown as estimates, next to how busy each hour usually is and the quietest time today. If it can wait, go when it’s quiet.",
          alt: "A woman pointing at the quietest hour on a crowd chart.",
        },
        {
          image: "access",
          title: "For everyone",
          body: "Each branch lists what you need to know before you go: step-free access, English service, parking and 24-hour ATMs. The app works in Korean and English.",
          alt: "A teller welcoming an older woman with a cane, a wheelchair user and a traveller.",
        },
        {
          image: "branch",
          title: "Better for branches too",
          body: "When visits spread away from the busiest hours, the waiting area empties and tellers can give each customer their full attention.",
          alt: "A calm bank counter with two customers being served.",
        },
      ],
    },
    numbers: {
      title: "The prototype in numbers",
      items: [
        { value: COUNTS.branches, unit: "", label: "branches around Gangnam Station" },
        { value: COUNTS.banks, unit: "", label: "banks" },
        { value: COUNTS.services, unit: "", label: "counter types" },
        { value: GRACE_MIN, unit: "min", label: "to reach the counter once you’re called" },
      ],
    },
    origin: {
      label: "Where it started",
      title: "It started as six notepad pages",
      body: [
        "Dash Hour began as six pages of pen sketches and won the first BlueHack Samsung Hackathon in 2016.",
        "This prototype rebuilds those sketches as a responsive web app: the original tabs on phones, and a list, map and branch panel side by side on larger screens.",
      ],
      alt: "Two people looking at a notepad of app sketches, with a fountain pen, a coffee and a trophy.",
      team: [
        { role: "Team lead", name: "Bolim Lee", note: "Former designer at Samsung Electronics" },
        { role: "Developer", name: "Ye Joo Park" },
      ],
      link: "See the six sketches",
    },
    faq: {
      title: "Questions",
      items: [
        {
          q: "Can I use it at a real bank?",
          a: "Not yet. Dash Hour is a design prototype and its queue data is simulated. It isn’t affiliated with or sponsored by the banks shown.",
        },
        {
          q: "What happens if I miss my turn?",
          a: `If you don’t reach the counter within ${GRACE_MIN} minutes of being called, the ticket is released as a no-show. If you’re running late, delay your turn once or cancel the ticket. Cancelling doesn’t count as a no-show.`,
        },
        {
          q: "Can I hold more than one ticket?",
          a: "One at a time. That keeps people from reserving places at several branches and not showing up.",
        },
        {
          q: "Are the map and routes real?",
          a: "The map, subway stations and walking routes are real OpenStreetMap data. Branch locations, addresses and phone numbers are illustrative.",
        },
      ],
    },
    cta: {
      title: "Take a ticket now",
      body: "The demo clock starts at 10:32 and runs in real time. Switch it to 10× from the menu to watch your turn come up in a minute.",
      button: "Open the app",
    },
    disclaimer:
      "Dash Hour is an independent prototype and isn’t affiliated with any bank. Bank names and logos are trademarks of their owners, used only to identify each branch.",
  },
};

const LANGS: Array<[Lang, string]> = [
  ["en", "EN"],
  ["ko", "한국어"],
];

export function AboutPage() {
  const [lang, setLang] = useSavedLang();
  const c = COPY[lang];

  return (
    <div lang={lang} className="about plain-page">
      <header className="about-header">
        <div className="about-header-inner">
          <Link href="/" aria-label="Dash Hour" className="about-header-logo">
            <LogoMark className="about-header-logo-mark" />
          </Link>
          <div className="about-header-space" />
          <div role="group" aria-label="Language" className="about-lang">
            {LANGS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                lang={value}
                aria-pressed={lang === value}
                onClick={() => setLang(value)}
                className="about-lang-button"
              >
                {label}
              </button>
            ))}
          </div>
          <Link href="/" className="about-header-cta">
            {c.open} <ArrowRight className="about-icon" aria-hidden />
          </Link>
        </div>
      </header>

      <main>
        <section className="about-hero">
          <div className="about-hero-copy">
            <AnimatedLogo className="about-hero-logo" />
            <p className="about-eyebrow">{c.eyebrow}</p>
            <h1 className="about-hero-title">
              <span>{c.title[0]}</span>
              <span>{c.title[1]}</span>
            </h1>
            <p className="about-hero-lead">{c.lead}</p>
            <div className="about-hero-actions">
              <Link href="/" className="about-button">
                {c.open} <ArrowRight className="about-icon" aria-hidden />
              </Link>
              <Link href="/story" className="about-text-link">
                {c.story} <ArrowRight className="about-icon" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="about-hero-art">
            <div className="about-hero-blob" aria-hidden />
            <Art name="hero" alt={c.heroAlt} eager className="about-float" />
          </div>
        </section>

        <section className="about-section about-split">
          <Reveal className="about-split-art">
            <Art name="problem" alt={c.problem.alt} />
          </Reveal>
          <Reveal className="about-split-copy" delay={120}>
            <p className="about-eyebrow">{c.problem.label}</p>
            <h2 className="about-h2">{c.problem.title}</h2>
            {c.problem.body.map((p) => (
              <p key={p} className="about-body">
                {p}
              </p>
            ))}
          </Reveal>
        </section>

        <section className="about-tint">
          <div className="about-section">
            <Reveal>
              <p className="about-eyebrow">{c.steps.label}</p>
              <h2 className="about-h2">{c.steps.title}</h2>
            </Reveal>
            <ol className="about-steps">
              {c.steps.items.map((s, i) => (
                <Reveal as="li" key={s.image} delay={i * 120} className="about-step">
                  <div className="about-step-art">
                    <Art name={s.image} alt={s.alt} />
                  </div>
                  <p className="about-step-number minute-number" aria-hidden>
                    {i + 1}
                  </p>
                  <h3 className="about-h3">{s.title}</h3>
                  <p className="about-small">{s.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="about-section">
          <Reveal>
            <p className="about-eyebrow">{c.principles.label}</p>
            <h2 className="about-h2">{c.principles.title}</h2>
          </Reveal>
          <ul className="about-principles">
            {c.principles.items.map((p, i) => (
              <Reveal as="li" key={p.image} delay={(i % 2) * 120} className="about-principle">
                <div className="about-principle-art">
                  <Art name={p.image} alt={p.alt} />
                </div>
                <div>
                  <h3 className="about-h3">{p.title}</h3>
                  <p className="about-small">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="about-numbers" aria-labelledby="about-numbers">
          <div className="about-section">
            <h2 id="about-numbers" className="about-numbers-title">
              {c.numbers.title}
            </h2>
            <dl className="about-numbers-list">
              {c.numbers.items.map((n, i) => (
                <Reveal key={n.label} delay={i * 90} className="about-number">
                  <dt className="about-number-label">{n.label}</dt>
                  <dd className="about-number-value">
                    <CountUp value={n.value} />
                    {n.unit && <span className="about-number-unit">{n.unit}</span>}
                  </dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        <section className="about-section about-split about-split-reverse">
          <Reveal className="about-split-art">
            <Art name="origin" alt={c.origin.alt} />
          </Reveal>
          <Reveal className="about-split-copy" delay={120}>
            <p className="about-eyebrow">{c.origin.label}</p>
            <h2 className="about-h2">{c.origin.title}</h2>
            {c.origin.body.map((p) => (
              <p key={p} className="about-body">
                {p}
              </p>
            ))}
            <dl className="about-team">
              {c.origin.team.map((m) => (
                <div key={m.name}>
                  <dt className="about-team-role">{m.role}</dt>
                  <dd className="about-team-name" lang="en">
                    {m.name}
                  </dd>
                  {m.note && <dd className="about-team-role">{m.note}</dd>}
                </div>
              ))}
            </dl>
            <Link href="/story" className="about-text-link">
              {c.origin.link} <ArrowRight className="about-icon" aria-hidden />
            </Link>
          </Reveal>
        </section>

        <section className="about-section about-faq" aria-labelledby="about-faq">
          <Reveal>
            <h2 id="about-faq" className="about-h2">
              {c.faq.title}
            </h2>
          </Reveal>
          <Accordion.Root className="about-faq-list">
            {c.faq.items.map((f) => (
              <Accordion.Item key={f.q} className="about-faq-item">
                <Accordion.Header className="about-faq-header">
                  <Accordion.Trigger className="about-faq-trigger">
                    {f.q}
                    <Plus className="about-faq-icon" aria-hidden />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel className="about-faq-panel">
                  <p className="about-faq-answer">{f.a}</p>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </section>

        <section className="about-cta">
          <Reveal className="about-cta-inner">
            <AnimatedLogo className="about-cta-logo" />
            <h2 className="about-h2">{c.cta.title}</h2>
            <p className="about-body">{c.cta.body}</p>
            <Link href="/" className="about-button">
              {c.cta.button} <ArrowRight className="about-icon" aria-hidden />
            </Link>
          </Reveal>
        </section>
      </main>

      <footer className="about-footer">
        <p>{c.disclaimer}</p>
      </footer>
    </div>
  );
}
