# Dash Hour prototype

Dash Hour lets you take a bank's queue number before you get there. You can see how long each nearby branch's queue is and how busy it usually gets through the day, and the ticket counts down so you know when to leave.

It started in 2016 as six pages of pen sketches and won the first BlueHack Samsung Hackathon that year. The team was led by Bolim Lee, a former designer at Samsung Electronics, with Ye Joo Park as the developer. This repository rebuilds it as a responsive web app:

- **Phones:** a bottom tab bar (Home, Map, Ticket, My) and an installable home-screen app.
- **Desktop:** branch list, map and branch panel side by side, with My ticket and Account pages.
- **`/about`:** an About page for the product as if it had shipped: what it's for, how it works, the rules it keeps and where it came from, in Korean and English, with an animated logo.
- **`/story`:** a "from sketch to prototype" page. It shows the redrawn sketches, a switch to see each original notepad page, and summaries of the handwritten notes, in Korean and English.

> **Not affiliated with any bank.** Dash Hour is an independent prototype. The banks named in it have not endorsed or sponsored it, and their names and logos are trademarks of their owners, used only to identify each bank. See [Bank names and logos](#bank-names-and-logos).

Queue data is simulated; the map, stations and walking routes are real, and branch locations, addresses and phone numbers are illustrative. A demo clock starts at 10:32 and runs in real time by default; switch it to 10× or 30× to watch a ticket count down, get called to a counter, or miss your turn in a minute or two. You can change the speed, switch between English and 한국어, replay the intro or reset the demo from the ⋮ menu or the account page.

## Screens

| Route | What's there |
| --- | --- |
| `/` | Greeting, location and search; your live ticket or the shortest queue nearby; filters (foreign exchange, parking, step-free access, 24h ATM, English service); favorites and nearby branches sorted by wait or distance. |
| `/map` | Real street map of Gangnam Station (OpenStreetMap) with pins showing each branch's wait, the subway stations, your walking route once you hold a ticket, zoom and "my location" controls, filters, and a card for the selected branch. Labels follow the app language. |
| `/branch/[id]` | Photo, open status and address; live queues for each counter type; crowd by hour with the quietest time; walking, bus and taxi times with a map of the walking route; facilities; address, hours, phone and number of counters. |
| Take a ticket | Bottom sheet: pick a counter type (deposits & withdrawals, loans & consultation, foreign exchange, business banking), see when you'll be called and when to leave, and turn on a heads-up alert. One ticket at a time. |
| `/ticket` | Ticket with your number, counter type, "be there by" time, a ring and countdown that empty as the queue moves, a demo-speed switch (real time, 10×, 30×) under the ring, a QR code for kiosk check-in, directions, "delay turn" (once), cancel, a timeline, a map of the walking route with walk, bus and taxi times, what to bring, and the branch. When your number is called you get a counter number and 10 minutes to get there, or the ticket is released as a no-show. |
| `/me` | Visits, time not spent in line, no-shows (3 pauses ticketing for 30 days), recent visits, notification settings, language and demo speed. |

| `/about` | The product's About page: the pitch, the problem, three steps, four principles, the prototype in numbers, the hackathon origin, questions and a closing call to action. Follows the app's language and has its own EN/한국어 switch. The ticket logo assembles on load, then tears along its perforation and snaps back every few seconds. |

Each of the original sketches maps to these screens; `/story` links from each sketch to the matching part of the prototype.

## Stack

- [Vinext](https://github.com/cloudflare/vinext) 1.4: the Next.js App Router API on Vite. Every route, including all 12 branch pages, is prerendered, and the app is served from Cloudflare Workers.
- [Base UI](https://base-ui.com) 1.9: Drawer, Dialog, Alert Dialog, Menu, Toast, Radio Group, Toggle Group, Switch, Meter, Progress, Input.
- [MapLibre GL JS](https://maplibre.org) with [OpenFreeMap](https://openfreemap.org) vector tiles (OpenStreetMap data, no API key), recoloured to the app's palette. MapLibre loads only when a map is on screen.
- Walking routes come from OpenStreetMap via the OSRM foot profile at [routing.openstreetmap.de](https://routing.openstreetmap.de). They are fetched once by `scripts/fetch-routes.mjs` and stored in `lib/routes.ts`, so the app makes no routing calls.
- Regular CSS organized by component in `app/styles/`, [Lucide](https://lucide.dev) icons, Inter (set slightly tight, `--tracking-inter`) and Noto Sans KR, and [uqr](https://github.com/unjs/uqr) for the check-in QR code.

## Develop

```bash
pnpm install
pnpm dev          # dev server
pnpm build        # production build + prerender
pnpm start        # preview the built Worker locally
pnpm typecheck
pnpm exec playwright install chromium  # once, for browser checks
pnpm test:ui
node scripts/fetch-routes.mjs   # refresh walking routes after moving a branch
```

## Deploy to Cloudflare

The Worker is named `dashhour` (see `cloudflare.config.ts`). Authenticate once with `pnpm exec cf auth login`, or set `CLOUDFLARE_API_TOKEN` (the "Edit Cloudflare Workers" template) and `CLOUDFLARE_ACCOUNT_ID`. Then run:

```bash
pnpm run deploy
```

## Images

**Every new image is generated with OpenAI GPT Image 2.6 (`gpt-image-2.6-sunburst`) at `quality: "low"` with `background: "transparent"`,** on both the generations and the edit endpoint. Both scripts below pin all three, so there is no model, quality or background argument to get wrong. Prompts still ask for no text, letters or logos.

- **Sketches:** `sketches/` holds the full-size redrawn sketches as transparent PNGs, and `public/sketches/` the web-sized copies plus the original notepad photos used on `/story`. Each was made by sending the original photo to the image edit endpoint with `background: "transparent"`, asking for black pen line work only. Script: `sketches/generate.py`.
- **App art:** `public/images/` holds eight branch scenes (opaque, made before the transparent-background rule) and the onboarding, empty-ticket and "your turn" illustrations (transparent), converted to WebP. Script: `scripts/generate_image.py`.
- **About page:** the ten `public/images/about-*.webp` illustrations were made with `scripts/generate_image.py` (2.6 sunburst, low, transparent; the hero at 1536x1024, the rest at 1024x1024), then trimmed to the artwork and converted to WebP. Each prompt described one scene and ended with the same style line: flat illustration with paper grain, the app's navy, gold and cream, no text.

The other images were made earlier with GPT Image 2.5 (`gpt-image-2.5-sunburst`), also at `quality: "low"`. They stay as they are and do not need regenerating.

Two things to know about 2.6. OpenAI's Batch API does not accept either 2.6 model (`-sunburst` or `-flare`; it answers `model_not_found`), so every request is synchronous. And a `low` image costs more than it did on 2.5: 664 image output tokens at 1536x1024 or 1024x1536 and 824 at 1024x1024 (2.5 used 158 and 196), which at $30 per 1M is about $0.02-0.025 per image. A subject on a transparent background comes back at alpha 254 rather than 255, so treat 250 and above as opaque when measuring a cut-out.

App icons (`public/icon-*.png`, `apple-touch-icon.png`) are rendered from `public/icon.svg`.

## Bank names and logos

Dash Hour is not affiliated with, endorsed by or sponsored by Shinhan Bank, Woori Bank, Hana Bank, KB Kookmin Bank, IBK Industrial Bank of Korea, NH NongHyup Bank, Citibank Korea, SC First Bank or MG Saemaeul Geumgo. Their names and logos are trademarks of their respective owners and appear here only to identify each bank in a design demo. The branches' locations, addresses, phone numbers, counters and queues are illustrative and are not the banks' real information. If you represent one of these banks and want its logo removed, please open an issue.

The logos are cut from files on Wikimedia Commons that Commons lists as public domain. Copyright status aside, every one of them is a trademark. `scripts/fetch_bank_logos.py` downloads each file, keeps the symbol and writes `public/banks/<bank>.webp`.

| Bank | Commons file | Commons licence |
| --- | --- | --- |
| Shinhan Bank | [Shinhan Bank Logo (ENG).svg](https://commons.wikimedia.org/wiki/File:Shinhan_Bank_Logo_(ENG).svg) | Public domain, trademarked |
| Woori Bank | [Logo of Woori Bank.svg](https://commons.wikimedia.org/wiki/File:Logo_of_Woori_Bank.svg) | Public domain |
| Hana Bank | [Hana Bank Logo (eng).svg](https://commons.wikimedia.org/wiki/File:Hana_Bank_Logo_(eng).svg) | Public domain, trademarked |
| KB Kookmin Bank | [KB logo.svg](https://commons.wikimedia.org/wiki/File:KB_logo.svg) | Public domain, trademarked |
| IBK | [Industrial Bank of Korea Logo.svg](https://commons.wikimedia.org/wiki/File:Industrial_Bank_of_Korea_Logo.svg) | Public domain, trademarked |
| NH NongHyup Bank | [NACF (NongHyup) Logo.svg](https://commons.wikimedia.org/wiki/File:NACF_(NongHyup)_Logo.svg) | Public domain, trademarked |
| Citibank | [Citibank.svg](https://commons.wikimedia.org/wiki/File:Citibank.svg) | Public domain, trademarked |
| SC First Bank | [Standard Chartered Logo (2021, Logo only).svg](https://commons.wikimedia.org/wiki/File:Standard_Chartered_Logo_(2021,_Logo_only).svg) | Public domain, trademarked |

MG Saemaeul Geumgo has no freely licensed logo file on Commons, so its badge shows the letters "MG" in the bank's blue instead of its logo.

## Project layout

```
app/(app)/           home, map, ticket, account and branch routes sharing one app shell
app/about/           the product's About page
app/story/           the sketch-to-prototype case study
components/          shell, cards, map, ticket, sheets, onboarding, store
app/styles/          design tokens, reset, component styles and responsive states
components/screens/  one file per screen
lib/                 branches, services and crowd model, demo clock, EN/KO strings, walking routes
public/banks/        bank logos (see Bank names and logos)
public/images/       generated branch scenes and illustrations
public/sketches/     redrawn sketches (WebP) and original pages
scripts/             image generation, walking-route and bank-logo scripts
sketches/            full-size transparent PNG sketches + redraw script
```
