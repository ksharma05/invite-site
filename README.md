# Sanjukta & Khushal — Wedding Invitation (Next.js)

Bilingual (English/Hindi), bride-side/groom-side personalized wedding invitation.
See `DECISIONS.md` for what is confirmed vs. still open, and the project brief's
phased plan for the overall roadmap.

## Status

Current up to **Phase 7**: bilingual bride/groom-side personalized invitation,
with a live Google Sheets content source (Phase 5), a durable last-known-good
snapshot and publication safeguards (Phase 6), plus motion and guest utilities
(Phase 7): content-driven countdown, per-event map links, Google Calendar action,
and `.ics` calendar downloads.

## Motion & guest utilities (Phase 7)

- **Motion:** dependency-free, one-shot reveal-on-scroll (`src/components/Reveal.tsx`
  - CSS). Content is fully visible by default and under `prefers-reduced-motion`;
    it only fades in when JS + IntersectionObserver are present and the user has
    not asked for reduced motion. Scrolling stays native (touch + keyboard intact) —
    no scroll hijacking, parallax, or continuous loops. Lenis is deliberately **not**
    used: it is only worth adding where it measurably improves the experience.
- **Countdown:** targets the **wedding ceremony** resolved from the side-visible
  events (`src/lib/invitation/resolveCountdownTarget.ts`) — never blindly the first
  row. If no visible event exists it shows the "events coming soon" text.
- **Per-event utilities** on the current side only:
  - **Map links** — `mapUrl` per event, new tab.
  - **Add to calendar** — Google Calendar action from validated ISO timestamps.
  - **Download (.ics)** — RFC 5545 file from a tested generator
    (`src/lib/calendar/ics.ts`): UTC timestamps preserve the instant (an IST
    guest sees IST, others their local zone), RFC 5545-escaped text, multi-day
    events handled, long lines folded to ≤ 75 octets.
- **Contact links are not added yet** — there is no approved real contact detail
  to link to, and we don't fabricate one. Like venue/map URLs this is deferred
  until the family provides it.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Try:

- `http://localhost:3000` — side chooser (no default side).
- `http://localhost:3000/?side=bride` — bride-side invitation, English.
- `http://localhost:3000/?side=groom&lang=hi` — groom-side invitation, Hindi draft.

## Checks

```bash
npm run check        # format:check + lint + typecheck + test + build
```

Individual steps: `npm run format:check`, `npm run lint`, `npm run typecheck`,
`npm run test`, `npm run build`. CI (`.github/workflows/ci.yml`) runs the same steps on every push and pull request.

## Side & language resolution (Phase 3)

- `src/middleware.ts` resolves the language once per request, before any page
  renders, and forwards it as the `x-lang` request header so `<html lang>`
  (root layout) and the page body always agree — no hydration flash.
- Precedence: explicit `?lang=` → saved `lang` cookie (1 year) → `en` default.
  An explicit `?lang=` always wins and also refreshes the saved cookie.
- There is no saved/default side — an unset or invalid `?side=` always shows
  the bride/groom chooser; only an explicit `?side=bride`/`?side=groom` goes
  straight to the invitation. This is by design (see `DECISIONS.md`).
- The side switcher and language switcher each preserve the other parameter
  when navigating (see `src/lib/invitation/resolveLang.ts#buildHref`).

## Visual checks (Phase 4)

Headless Playwright checks (chromium). Start a production server with fixtures
enabled, then run the scripts:

```bash
ALLOW_FIXTURE_CONTENT=true npm run build
ALLOW_FIXTURE_CONTENT=true npm start -- -p 3150   # in one terminal
npm run visual:check    # captures 10 PNGs (desktop+mobile × chooser + both sides × both languages) to visual-check/, reports overflow
npm run dom:check       # checks <html lang>, theme, font application, body contrast ratio, skip-link
```

Output PNGs are gitignored. Open `visual-check/*.png` locally to eyeball the
aesthetic — the scripts verify structure/responsive/contrast, not taste.

## Setting up the Google Sheet (Phase 5)

The site reads content from one spreadsheet with **four tabs**. Create them with
exactly these names and header rows (frozen header row recommended).

### Tab "Events"

| id  | order | active | visibleTo | title_en | title_hi | subtitle_en | subtitle_hi | startAt | endAt | venueName_en | venueName_hi | venueAddress_en | venueAddress_hi | mapUrl | dressCode_en | dressCode_hi | notes_en | notes_hi | imageUrl |
| --- | ----- | ------ | --------- | -------- | -------- | ----------- | ----------- | ------- | ----- | ------------ | ------------ | --------------- | --------------- | ------ | ------------ | ------------ | -------- | -------- | -------- |

- `id`: a short stable slug (e.g. `haldi`, `mehendi`, `sangeet`, `wedding-ceremony`). Never reuse an id for a different event; never change an existing id.
- `order`: a number controlling display order.
- `active`: `TRUE`/`FALSE` (use a checkbox or dropdown). `FALSE` hides the event without deleting its row — this is how you "hide and restore".
- `visibleTo`: `bride`, `groom`, or `both`.
- `startAt` / `endAt`: ISO 8601 with the `+05:30` offset, e.g. `2026-11-23T09:00:00+05:30`. `endAt` is optional.
- `mapUrl`, `imageUrl`: full URLs, optional.
- `subtitle_*`, `dressCode_*`, `notes_*`: optional; leave both language cells blank to omit the whole field.

**To add a new event** (e.g. another ceremony): add a new row with a new `id`. It appears automatically within the configured refresh window — no code change or deployment needed. **To delete**: remove the row (or set `active` to `FALSE` to hide without deleting). **To reorder**: change the `order` numbers.

### Tab "Faqs" (optional — leave empty to skip the FAQ section entirely)

| id  | order | active | question_en | question_hi | answer_en | answer_hi |
| --- | ----- | ------ | ----------- | ----------- | --------- | --------- |

If this tab has no active rows, the FAQ section does not render at all on the site.

### Tab "Family"

One row per person. `role` must be exactly one of: `brideName`, `groomName`, `brideParent`, `groomParent`, `brideGrandparent`, `groomGrandparent`.

| role | order | name_en | name_hi | honorific_en | honorific_hi |
| ---- | ----- | ------- | ------- | ------------ | ------------ |

`order` only matters for `brideParent`/`groomParent`/`*Grandparent` rows (controls the order they're listed in). `brideName`/`groomName` should have exactly one row each.

### Tab "Wording"

| side | text_en | text_hi |
| ---- | ------- | ------- |

Three possible rows: `side=bride` (bride-side invitation passage), `side=groom` (groom-side passage), and an optional `side=blessing` row. Write complete sentences per language — do not expect the app to stitch fragments together.

### Getting credentials

1. In Google Cloud Console, create (or reuse) a project and enable the **Google Sheets API**.
2. Create a **Service Account**, then an **Email key** (JSON) for it under that account.
3. Open the JSON key file: copy `client_email` into `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `private_key` into `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` in `.env.local` (keep the `\n` sequences as-is; the app converts them to real newlines).
4. In the spreadsheet, click **Share** and give that service account's email **Viewer** access. Do not share the whole Google Drive folder — only this spreadsheet.
5. Copy the spreadsheet ID from its URL (`https://docs.google.com/spreadsheets/d/<THIS PART>/edit`) into `GOOGLE_SHEETS_SPREADSHEET_ID`.
6. Set `CONTENT_SOURCE=sheets` in `.env.local`.

### Update behavior

- The server re-fetches the spreadsheet at most every `SHEETS_REVALIDATE_SECONDS` (default 60). An edit can take up to that long to appear on a page a guest is already viewing or newly loading; it is not instant.
- A malformed row (bad timestamp, missing required text, invalid URL) is skipped and logged server-side; it does not break the rest of the page. A duplicate event `id` is dropped (both rows) and logged. One bad optional row does **not** block the update — the rest of the sheet still publishes (documented decision).
- An invalid `Family`/`Wording` row, or the spreadsheet being unreachable, is treated as a **critical failure**: the site serves the last published **durable snapshot** (see "Resilience / last-known-good" below) rather than showing broken or fabricated content indefinitely.
- If there is no snapshot yet and a critical failure occurs, the site shows the bilingual "temporarily unavailable" page rather than guessing.

### Resilience / last-known-good snapshot (Phase 6)

Sheets edits are treated as **candidate content**. Each refresh:

1. **Fetch** the spreadsheet.
2. **Validate** it (malformed/duplicate rows are handled above).
3. **Publish** — only acceptable, fully-validated content is written to a durable snapshot store.
4. On a **critical failure**, the previous valid snapshot is **retained and served**; without one, the site shows "unavailable". Invalid edits can never overwrite a good snapshot, because snapshots are only ever written after full validation.

The snapshot store (`src/lib/content/snapshot/`) is:

- **Upstash KV (REST)** when `KV_REST_API_URL` + `KV_REST_API_TOKEN` are set — durable across Vercel serverless **cold starts and deployments**. This is the recommended durable option for the confirmed Vercel host (deployment is Phase 10).
- **Filesystem** (`SNAPSHOT_DIR`, default `./.data`) otherwise — durable on a persistent filesystem (local `next start`, self-hosting). On Vercel serverless the filesystem is per-instance/ephemeral, so set up the Upstash backend there for true cross-deployment durability.
- **Best-effort:** a snapshot read/write failure is logged and never makes a valid page fail, and never exposes API errors or credentials.

Recovery: fix the invalid sheet edit (make `Family`/`Wording` valid) and the next refresh publishes fresh content over the snapshot. The snapshot only ever holds publicly-rendered invitation content — no credentials and no private guest data.

## Content safeguards

- Placeholder fixtures (`src/data/fixtures.ts`) are served **only outside production builds**.
  A production build shows a bilingual "temporarily unavailable" page unless
  `ALLOW_FIXTURE_CONTENT=true` is set explicitly (e.g. for a preview deploy).
- `CONTENT_SOURCE=sheets` is the real source; on a critical failure the durable
  last-known-good snapshot is served (see "Resilience" above), and with no
  snapshot it reports "unavailable" rather than silently falling back.
- Server-only config lives in `src/lib/env/server.ts`, which imports `server-only`, so
  bundling it into browser code fails the build. Missing or malformed variables produce
  an error that names the variable and never echoes its value.

## Project layout

```
src/app/              Next.js App Router pages, global styles
src/components/        UI: InvitationView, Countdown, Reveal, DownloadIcsButton, LanguageSwitcher, etc.
src/components/ornaments/  Theme artwork: SVG source modules, renderer (Ornament), motif resolver (Phase A)
src/lib/content/       Content types, zod validation schema, Sheets fetch/mapping/validation pipeline (Phase 1 & 5)
src/lib/content/snapshot/  Durable last-known-good snapshot store (Phase 6) — format, filesystem + Upstash backends
src/lib/calendar/      RFC 5545 (.ics) calendar download generator (Phase 7)
src/lib/invitation/    Side/language + countdown-target resolution rules (Phase 3 & 7)
src/lib/i18n/          Interface string dictionary (EN/HI)
src/data/fixtures.ts   Development-only fixture content — clearly flagged, not production copy
```

## Ornaments & asset export (Phase A)

All decoration lives in `src/components/ornaments/artwork/` as `{ name, viewBox,
defs, body }` SVG strings — one authored source of truth shared by the inline
renderer and the exporter.

- **Inline rendering:** `Ornament.tsx` draws an ornament with `currentColor`,
  so the theme owns the hue; `EventMotif` maps a ceremony to a motif by stable
  id, then bilingual title (mehendi/मेहंदी, विवाह, …), else a neutral `kalash`
  fallback (pure `resolveMotif`, unit-tested).
- **Exporting the files:** `npm run ornaments:export` writes real, browser/view
  openable `.svg` assets to `public/ornaments/` (committed). Run it after
  changing any artwork module.
- **Auspicious line (शुभ विवाह):** appears only once the optional `side=blessing`
  row is added to the sheet's `Wording` tab (`family.blessing` is already read
  by `sheetsMapping`). It ships as a family-pending draft because religious
  wording is still OPEN in DECISIONS.md.
- **No raster images:** artwork is purely vector; the confirmed "Photos:
  placeholder only" decision is unchanged.

## Known limitations of this build

- Live spreadsheet connected and verified — `CONTENT_SOURCE=sheets` reads
  the real sheet through the validated pipeline (`src/lib/content/sheetsSource.ts`)
  and renders in the production build. See DECISIONS.md "Phase 5
  implementation notes" for exactly what was verified.
  Setup steps are in "Setting up the Google Sheet" above.
- The durable last-known-good snapshot (Phase 6) is implemented. On the Vercel
  host it is durable across cold starts and deployments only once an Upstash KV
  backend (`KV_REST_API_URL`/`KV_REST_API_TOKEN`) is configured; without it, the
  filesystem store is used (durable on a persistent filesystem only). Provisioning
  the durable store is part of the Phase 10 deployment work.
- Hindi invitation wording is a draft translation, explicitly flagged as
  unapproved in `src/data/fixtures.ts` and `DECISIONS.md`. It can be corrected
  directly in the `Wording`/`Family` sheet tabs once approved, with no code
  change needed.
- Real event venues/addresses (including Google Maps links) are placeholders;
  fill in `mapUrl` per event in the `Events` tab once confirmed.
- No RSVP or music — out of scope per current decisions. FAQ section is
  built but renders only once the `Faqs` tab has active rows.
- Vercel is the intended host (confirmed); production deployment/config is
  Phase 10, not done here.
