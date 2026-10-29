# Dash Hour prototype

Dash Hour lets you take a bank's queue number before you get there. You can see how long each nearby branch's queue is and how busy it usually gets through the day, and the ticket counts down so you know when to leave.

It started as a hackathon project in 2016 with six pages of pen sketches. This repository rebuilds it as a responsive web app:

- **Phones:** the original three-tab app (Home, Map, Ticket), installable to the home screen.
- **Desktop:** branch list, map and detail panel side by side.
- **`/story`:** a "from sketch to prototype" page. It shows the redrawn sketches, a switch to see each original notepad page, and English summaries of the Korean notes.

Queue data is simulated. A demo clock starts at 10:32 and runs 10× faster than real time, so you can watch a ticket count down. You can change the speed, switch between English and 한국어, or reset the demo from the ⋮ menu.

## What's in it

| Sketch | In the prototype |
| --- | --- |
| ① Home | Favorite branch pinned above a divider, then nearby branches by shortest wait (or nearest). Shows five at first, with "Show more" for the rest. Star to favorite. |
| ④ Branch details | Tap a card to expand it: route times, a map preview with the walking route, and a crowd-by-hour chart with a "now" marker. |
| ② Take a ticket | Confirmation popup with OK / Cancel, then a ticket-machine animation. |
| ③ / ⑥ Ticket | Torn-paper ticket with your number, the time to arrive by, people ahead, and a ring and countdown that empty as the queue moves. Includes Get directions and cancel. You can hold only one ticket at a time. |
| ⑤ Map | Stylized Gangnam Station map with ranked pins and your location. The selected branch shows in a card at the bottom. A favorite is selected by default, otherwise the shortest queue. |

## Stack

- [Vinext](https://github.com/cloudflare/vinext) 1.4: the Next.js App Router API on Vite. Both routes are prerendered, and the app is served from Cloudflare Workers.
- [Base UI](https://base-ui.com) 1.9: Tabs, Dialog, Alert Dialog, Menu, Toast, Collapsible, Toggle Group, Meter, Progress, Switch, Input.
- Tailwind CSS 4, [Lucide](https://lucide.dev) icons, Inter and Noto Sans KR.

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

## Sketches

`sketches/` holds the full-size redrawn sketches as transparent PNGs. `public/sketches/` holds the web-sized copies and the original notepad photos used on `/story`. Each sketch was made by sending the original photo to OpenAI's image edit endpoint with `gpt-image-2.5-sunburst`, `quality: "low"` and `background: "transparent"`. The prompt asked for black pen line work only, with no text and none of the paper, annotations or arrows. `sketches/generate.py` is the script that was used.

## Project layout

```
app/                 layout, home page (the app) and /story
components/          app shell, cards, map, ticket, dialogs, header, store
lib/                 branch data and crowd model, demo clock, EN/KO strings
public/sketches/     redrawn sketches (WebP) and original pages
sketches/            full-size transparent PNG sketches + generator script
```
