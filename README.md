# Dash Hour prototype

Dash Hour lets you take a bank's queue number before you get there. You can see how long each nearby branch's queue is and how busy it usually gets through the day, and the ticket counts down so you know when to leave.

It started as a hackathon project in 2016 with six pages of pen sketches. This repository rebuilds it as a responsive web app:

- **Phones:** a bottom tab bar (Home, Map, Ticket, My) and an installable home-screen app.
- **Desktop:** branch list, map and branch panel side by side, with My ticket and Account pages.
- **`/story`:** a "from sketch to prototype" page. It shows the redrawn sketches, a switch to see each original notepad page, and English summaries of the Korean notes.

Queue data is simulated. A demo clock starts at 10:32 and runs 10× faster than real time, so you can watch a ticket count down, get called to a counter, or miss your turn. You can change the speed, switch between English and 한국어, replay the intro or reset the demo from the ⋮ menu or the account page.

## Screens

| Route | What's there |
| --- | --- |
| `/` | Greeting, location and search; your live ticket or the shortest queue nearby; filters (foreign exchange, parking, step-free access, 24h ATM, English service); favorites and nearby branches sorted by wait or distance. |
| `/map` | Stylized Gangnam Station map with pins showing each branch's wait, zoom and "my location" controls, filters, and a card for the selected branch. |
| `/branch/[id]` | Photo, open status and address; live queues for each counter type; crowd by hour with the quietest time; walking, bus and taxi times with a route preview; facilities; address, hours, phone and number of counters. |
| Take a ticket | Bottom sheet: pick a counter type (deposits & withdrawals, loans & consultation, foreign exchange, business banking), see when you'll be called and when to leave, and turn on a heads-up alert. One ticket at a time. |
| `/ticket` | Ticket with your number, counter type, "be there by" time, a ring and countdown that empty as the queue moves, a QR code for kiosk check-in, directions, "delay turn" (once), cancel, a timeline, what to bring, and the branch. When your number is called you get a counter number and 10 minutes to get there, or the ticket is released as a no-show. |
| `/me` | Visits, time not spent in line, no-shows (3 pauses ticketing for 30 days), recent visits, notification settings, language and demo speed. |

Each of the original sketches maps to these screens; `/story` links from each sketch to the matching part of the prototype.

## Stack

- [Vinext](https://github.com/cloudflare/vinext) 1.4: the Next.js App Router API on Vite. Every route, including all 12 branch pages, is prerendered, and the app is served from Cloudflare Workers.
- [Base UI](https://base-ui.com) 1.9: Drawer, Dialog, Alert Dialog, Menu, Toast, Radio Group, Toggle Group, Switch, Meter, Progress, Input.
- Tailwind CSS 4, [Lucide](https://lucide.dev) icons, Inter and Noto Sans KR, and [uqr](https://github.com/unjs/uqr) for the check-in QR code.

## Develop

```bash
pnpm install
pnpm dev          # dev server
pnpm build        # production build + prerender
pnpm start        # preview the built Worker locally
pnpm typecheck
```

## Deploy to Cloudflare

The Worker is named `dashhour` (see `cloudflare.config.ts`). Authenticate once with `pnpm exec cf auth login`, or set `CLOUDFLARE_API_TOKEN` (the "Edit Cloudflare Workers" template) and `CLOUDFLARE_ACCOUNT_ID`. Then run:

```bash
pnpm run deploy
```

## Images

All images were made with OpenAI GPT Image 2.5 (`gpt-image-2.5-sunburst`) at `quality: "low"`, with prompts that ask for no text, letters or logos.

- **Sketches:** `sketches/` holds the full-size redrawn sketches as transparent PNGs, and `public/sketches/` the web-sized copies plus the original notepad photos used on `/story`. Each was made by sending the original photo to the image edit endpoint with `background: "transparent"`, asking for black pen line work only. Script: `sketches/generate.py`.
- **App art:** `public/images/` holds eight branch scenes (opaque) and the onboarding, empty-ticket and "your turn" illustrations (transparent), converted to WebP. Script: `scripts/generate_image.py`.

## Project layout

```
app/(app)/           home, map, ticket, account and branch routes sharing one app shell
app/story/           the sketch-to-prototype case study
components/          shell, cards, map, ticket, sheets, onboarding, store
components/screens/  one file per screen
lib/                 branches, services and crowd model, demo clock, EN/KO strings
public/images/       generated branch scenes and illustrations
public/sketches/     redrawn sketches (WebP) and original pages
scripts/             image generation script
sketches/            full-size transparent PNG sketches + redraw script
```
