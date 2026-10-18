# Decision register

Status of every Phase 0 decision as of this build. Items marked **OPEN** must not
be treated as resolved by any fixture, copy, or styling choice in this repo.

| Decision                                                          | Status                                        | Current value                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Second language                                                   | **Confirmed**                                 | Hindi                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Default side on a bare link                                       | **Confirmed**                                 | No default — visitor sees a bride/groom chooser (`src/components/SideChooser.tsx`)                                                                                                                                                                                                                                                                                                                                     |
| Default language                                                  | **Confirmed**                                 | English, explicit `?lang=hi` switches to Hindi                                                                                                                                                                                                                                                                                                                                                                         |
| Side switcher UI                                                  | **Confirmed**                                 | Yes — "Choose a different side" link returns to the chooser                                                                                                                                                                                                                                                                                                                                                            |
| Language switcher UI                                              | **Confirmed**                                 | Yes — `LanguageSwitcher` component                                                                                                                                                                                                                                                                                                                                                                                     |
| Both families' parents shown                                      | **Confirmed**                                 | Yes, on both versions — inviting side's parents as primary host line, other side under "With our families"                                                                                                                                                                                                                                                                                                             |
| RSVP                                                              | **Confirmed**                                 | Out of scope for this build                                                                                                                                                                                                                                                                                                                                                                                            |
| Countdown target                                                  | **Confirmed**                                 | Resolved at render time from side-visible events: prefer the wedding ceremony (id/title marker), else earliest visible active event — never blindly the first row. Explicit policy in `resolveCountdownTarget.ts` (Phase 7). For the current fixtures that is 2026-11-25T10:00:00+05:30.                                                                                                                               |
| Photos                                                            | **Confirmed**                                 | Placeholder slot only, no real images                                                                                                                                                                                                                                                                                                                                                                                  |
| Music                                                             | **Confirmed**                                 | Out of scope for this build                                                                                                                                                                                                                                                                                                                                                                                            |
| Visual theme                                                      | **Confirmed**                                 | **Terracotta.** Set as `:root` default and via `data-theme="terracotta"` on `<html>` (`src/app/layout.tsx`). `marigold`/`jewel` tokens remain in `src/app/globals.css` for reference only — not reachable from the app.                                                                                                                                                                                                |
| Hindi invitation wording                                          | **D2 — OPEN**                                 | `src/data/fixtures.ts` contains a draft machine translation, clearly flagged `[मसौदा — पारिवारिक स्वीकृति लंबित]` (draft, family approval pending). Do not publish.                                                                                                                                                                                                                                                    |
| Religious/ceremonial wording, blessing/verse                      | **Confirmed**                                 | Implemented in `src/components/AuspiciousInvocation.tsx`: Lord Ganesha invocation with the sacred Vakratunda Mahakaya shloka, and Lord Shiva & Mata Parvati blessing (Kashi Vishwanath & Maa Annapurna) with the Karpuragauram hymn, both with bilingual English and Hindi translations.                                                                                                                               |
| Real event schedule (dates beyond the wedding day, times, venues) | **OPEN**                                      | Fixtures now include Haldi, Mehendi (bride-side), Sangeet, and Wedding Ceremony as placeholders, all with TBC venue — real dates/times/venues/map links go in the `Events` sheet tab once confirmed, no code change needed.                                                                                                                                                                                            |
| Venue Google Maps links                                           | **OPEN, low-risk to add later**               | `mapUrl` is a per-event sheet column; it can be filled in or edited any time after the sheet is live.                                                                                                                                                                                                                                                                                                                  |
| Public vs restricted link access                                  | **OPEN**                                      | Not yet decided or implemented; links are currently unauthenticated by design (side param is personalization, not access control, per the project brief).                                                                                                                                                                                                                                                              |
| Hosting provider                                                  | **Confirmed**                                 | Vercel.                                                                                                                                                                                                                                                                                                                                                                                                                |
| Google Sheets schema                                              | **Approved by use, revisable**                | Four tabs (`Events`, `Faqs`, `Family`, `Wording`) documented in README "Setting up the Google Sheet". A real spreadsheet has been created with these tabs, connected via a service account, and verified end-to-end (see Phase 5 notes). Column shape can still evolve before family sign-off.                                                                                                                         |
| Update/refresh freshness policy                                   | **Confirmed**                                 | Server re-fetches at most every `SHEETS_REVALIDATE_SECONDS` (default 60s); edits are not instant. A **critical failure** (unreachable sheet, invalid `Family`/`Wording`) serves the durable last-known-good snapshot if one exists; a single bad optional event/FAQ row is skipped+logged and does **not** block the update (Phase 6). Without a snapshot it shows "unavailable" rather than stale/fabricated content. |
| Optional sections (gallery, story, FAQs, accommodation)           | **FAQs: built, conditional.** Others **OPEN** | FAQ section only renders if the `Faqs` tab has active rows — otherwise it is skipped entirely, not shown empty. Gallery/story/accommodation not built.                                                                                                                                                                                                                                                                 |

## Rule in force

Per the project brief: no Hindi ceremonial wording, parents' honorifics, event
dates, religious verses, or venues in this repo should be read as approved
content until a named family reviewer signs off. The Hindi invitation wording
(D2, in `src/data/fixtures.ts`) is the item most likely to be mistaken for
final content — check it first.

## Phase 3 implementation notes (side & language resolution)

- `src/lib/invitation/resolveSide.ts` / `resolveLang.ts` — pure, unit-tested
  resolution: an explicit `?side=`/`?lang=` always wins; an unset or invalid
  `side` goes to the chooser (never a guessed default); an unset/invalid
  `lang` falls back to a saved `lang` cookie, then to English — a saved
  preference can never override an explicit param.
- `src/middleware.ts` resolves the language once per request (before any
  Server Component renders) and forwards it via the `x-lang` request header,
  so `src/app/layout.tsx` (`<html lang>`) and `src/app/page.tsx` always agree
  with no hydration flash. It also writes the `lang` cookie so the choice
  persists across navigation.
- Side has no equivalent persistence/cookie by design — every visitor sees
  the explicit bride/groom chooser unless their link already specifies a
  side, consistent with "no default side" above.

## Phase 4 implementation notes (visual system & static invitation)

- **Theme:** terracotta, locked as `:root` default + `data-theme="terracotta"`
  on `<html>`. `marigold`/`jewel` tokens retained only for rollback.
- **Fonts (next/font/google):** Cormorant Garamond (headings, Latin serif),
  Noto Sans (body), Noto Serif Devanagari (Hindi). Wired as CSS variables
  on `<html>` with Tailwind fallback stacks — verified applied in the DOM
  (h1 resolves to Cormorant Garamond).
- **Components built/refined:** ornamental divider (`OrnamentalDivider`,
  decorative-only, `aria-hidden`), restyled hero with stacked names + ornate
  ampersand, host-family card, event cards with notes + map + Google
  Calendar action, photo placeholder slot, footer.
- **Countdown hydration fix:** `Date.now()` in `useState` would mismatch
  server/client; now renders zeros server-side and populates after mount,
  with `min-w-[2ch]` + `tabular-nums` so ticking digits never reflow.
- **Calendar action:** `googleCalendarUrl()` builds a Google Calendar link
  from validated ISO timestamps (timezone-safe via `toISOString`).
- **Accessibility verified (programmatic):** body ink/surface contrast 12.51:1
  (≥ 4.5 ✓), skip-link present on all pages, `<html lang>` matches the
  selected language, name order correct per side (Sanjukta-first on bride,
  Khushal-first on groom), Devanagari renders.
- **Responsive verified:** no horizontal overflow at desktop (1280) or mobile
  (390) across chooser + both sides × both languages (10 screenshots).
- **Not verified:** human eyeballing of the rendered pixels. The PNGs are in
  `visual-check/` (gitignored) — open them locally to approve the aesthetic.

## Phase 5 implementation notes (Google Sheets integration)

- **Schema (4 tabs):** `Events`, `Faqs`, `Family`, `Wording` — see README
  "Setting up the Google Sheet" for exact columns. A real spreadsheet has been
  created on this basis, connected via a service account (Viewer on that sheet
  only), and verified end-to-end in the running site.
- **Pipeline:** `sheetsClient.ts` (server-only, fetches raw rows via the
  official `googleapis` Sheets v4 client, read-only scope) → `normalize.ts`
  (pure cell trimming/boolean/order parsing) → `sheetsMapping.ts` (pure
  row → candidate-object mapping) → `schema.ts` (zod validation, unchanged
  from Phase 1) → `sheetsSource.ts` (orchestrates fetch, validates every row,
  skips and logs malformed ones instead of failing the batch, drops duplicate
  event ids, sorts, returns one `InvitationContent`).
- **Caching:** explicit, via `unstable_cache` (`SHEETS_REVALIDATE_SECONDS`,
  default 60) — required because direct `googleapis` client calls bypass
  Next.js `fetch` caching.
- **Failure handling:** a Sheets fetch error or an invalid `Family`/`Wording`
  row now (Phase 6) falls back to the durable last-known-good snapshot if one
  exists, and only shows "unavailable" when there is no snapshot — same "never
  show fabricated content" rule as fixtures. See the Phase 6 notes below.
- **FAQ section:** added as a genuinely optional feature — `faqs` is absent
  or empty by default; `InvitationView` renders the section only when at
  least one active FAQ exists, otherwise the whole `<section>` is skipped
  (not rendered empty).
- **Fixtures updated:** added Haldi, Mehendi (bride-side only, demonstrating
  per-event side visibility), and Sangeet alongside the existing Wedding
  Ceremony placeholder, to exercise multi-event rendering before a real
  sheet exists.
- **Hosting:** Vercel confirmed as the deployment target (Phase 10 still
  does the actual setup).
- Checks run after this phase: `npm run typecheck`, `npm run test` (55/55
  passing across 7 files), `npm run lint`, `npm run format:check`, and
  `npm run build` — all passing.
- **Live verification (with `CONTENT_SOURCE=sheets` against the real
  spreadsheet, production build):** both side views render all four events
  from the sheet; Mehendi (visibleTo=bride) is correctly hidden on the groom
  view; the Hindi view serves `lang="hi"` with Hindi titles and FAQ texts;
  the FAQ section renders from the `Faqs` tab; the side chooser shows when no
  `side` param is present. The "without FAQs" state was verified earlier via
  the fixture run (same skip-empty-section code path); it can be reproduced
  live by setting the `Faqs` `active` cells to FALSE (allow up to
  `SHEETS_REVALIDATE_SECONDS`, default 60, before the change appears).

## Phase 6 implementation notes (resilience & publication safeguards)

- **Publication model:** sheets edits are treated as _candidate_ content. Each
  refresh fetches, validates, then **publishes only acceptable content** to a
  durable snapshot store; a **critical failure** (unreachable sheet, invalid
  `Family`/`Wording`) retains and serves the previous valid snapshot, and only
  shows "unavailable" when no snapshot exists. Invalid edits can never replace a
  valid snapshot because snapshots are written only after full validation.
- **Decision (explicit, not silent):** ONE malformed optional event/FAQ row is
  skipped and logged and does **not** block publication of the rest; a critical
  failure is what blocks a publish and triggers the last-known-good fallback.
  This preserves the Phase 5 "skip-and-log" behavior while making the
  publish/no-publish boundary an approved decision.
- **Snapshot store** (`src/lib/content/snapshot/`): a versioned, schema-validated
  envelope (`{schemaVersion, savedAt, content}`) written only after zod
  validation and re-validated on every read — a snapshot can never smuggle a
  broken page. Backends behind one `createSnapshotStore(env)` factory:
  - **Upstash KV (REST)** when `KV_REST_API_URL` + `KV_REST_API_TOKEN` are set —
    durable across Vercel serverless cold starts and deployments; the
    recommended durable option for the confirmed Vercel host. Uses the stable
    REST API via `fetch` (no SDK), base64url-keyed.
  - **Filesystem** (`SNAPSHOT_DIR`, default `./.data`) otherwise — durable on a
    persistent filesystem (local `next start`, self-hosting); atomic
    write-then-rename so a crash never leaves a truncated snapshot. On Vercel
    serverless the filesystem is per-instance/ephemeral, so the Upstash backend
    or hosting is required there for cross-cold-start duration (Phase 10).
  - **Best-effort:** read/write failures are logged and never make a valid page
    fail and never expose API errors or credentials; without a durable store the
    behavior degrades honestly to "unavailable" on a critical failure.
- **Cold-start behavior:** reads happen at request time from the durable store,
  so a brand-new instance reads the last published snapshot immediately (covered
  by a unit test that publishes with one store instance and reads with a fresh
  one over the same directory).
- **Env additions:** `KV_REST_API_URL`, `KV_REST_API_TOKEN` (Upstash),
  `SNAPSHOT_DIR` (filesystem; default `.data`). Documented in `.env.example`
  and README. `.data/` is gitignored (runtime data, not source).
- **Recovery:** fix the invalid sheet edit and the next refresh publishes fresh
  content over the snapshot. The snapshot holds only publicly-rendered
  invitation content — no credentials, no private guest data.
- Checks run after this phase: `npm run typecheck`, `npm run test` (64/64
  passing across 8 files), `npm run lint`, `npm run format:check`, and
  `npm run build` — all passing.

## Phase 7 implementation notes (motion & guest utilities)

- **Motion — decision (not silent):** stays **dependency-free and Lenis-free**.
  The phase asks to "add Lenis only where it improves the actual experience";
  nothing here measurably needs it, so it is deliberately not added. Instead a
  small, one-shot **reveal-on-scroll** (`src/components/Reveal.tsx` + CSS in
  `globals.css`) fades/translates sections into view via IntersectionObserver.
  Content is **fully visible by default**; the pre-animation state is only
  applied once JS + the observer are available AND the user has not asked for
  reduced motion (`prefers-reduced-motion: reduce` → fully visible, no
  animation). No scroll hijacking, parallax, or continuous loops; the observer
  disconnects after first reveal. So the "reduced-motion usable" and
  "useful if animation fails" acceptance criteria are met by construction.
- **Native scrolling** is preserved (`scroll-behavior: smooth` only; disabled
  under reduced motion); touch, keyboard, and keyboard-navigation scrolling are
  untouched.
- **Guest utilities**
  - **Map links:** unchanged per-event `mapUrl` buttons (approved venue), opened
    in a new tab (`rel="noopener noreferrer"`).
  - **Google Calendar action:** unchanged `googleCalendarUrl()`.
  - **Calendar download (.ics):** NEW `DownloadIcsButton` per event + a pure,
    tested `src/lib/calendar/ics.ts` RFC 5545 generator. Timestamps are emitted
    as UTC (`Z`), preserving the validated instant exactly (an IST guest sees
    IST; other zones their local equivalent) — timezone-safe without a VTIMEZONE.
    Text is RFC 5545-escaped (backslash, semicolon, comma, newline); long lines
    are folded to ≤ 75 octets; overnight/multi-day events carry a correct DTEND.
    Tested including overnight (Sangeet) and escaping.
  - **Countdown target:** now resolved from live content via
    `resolveCountdownTarget(events, side)` — prefer the wedding ceremony among
    the side-visible active events, else the earliest visible one. Never "first
    row". Also shows "Event details..." text when no visible event exists.
  - **Contact links are not added yet (explicit scope boundary):** there is no
    approved, real contact detail (email/phone) anywhere in this repo, and we
    do not fabricate contact info. Like venues/maps, it is deferred until the
    family provides real details. The footer still names the couple.
- **Events only for the current side** get utility buttons, matching Phase 5's
  side-visibility filtering (verified: Mehendi absent on groom side).
- Checks run after this phase: `npm run typecheck`, `npm run test` (76/76
  passing across 10 files), `npm run lint`, `npm run format:check`, and
  `npm run build` — all passing. Live browser checks confirmed: countdown
  renders on both sides, .ics + Google Calendar buttons present, Mehendi hidden
  on groom, and under reduced motion all reveal sections are fully visible.

## Phase 8 addendum — ornament artwork & thematic tokens (Phase A)

- **Artwork is authored once as source of truth:** every ornament lives in
  `src/components/ornaments/artwork/` as `{ name, viewBox, defs, body }` SVG
  strings. Two consumers share that single list with zero duplication: the
  inline renderer `Ornament.tsx` and `scripts/export-ornaments.mjs`, which
  writes real `.svg` files to `public/ornaments/` (`npm run ornaments:export`).
  Those exported files are the deliverable production assets and are committed.
- **Realistic, hand-authored SVG, not raster photos:** ornaments use
  procedurally-computed symmetric geometry, multi-stop metallic gold gradients
  and layered henna/foil linework. No raster images were added, preserving
  the confirmed "Photos: placeholder only" decision.
- **Motif resolution is presentation-only:** `resolveMotif(id, titleEn,
titleHi)` (pure, unit-tested) maps a ceremony to a motif by stable id, then
  bilingual title (e.g. mehendi/मेहंदी, विवाह), else a neutral `kalash` fallback.
  No change to `WeddingEvent`, `schema.ts` or any sheet column, so a new sheet
  row never requires a code change and still gets an ornament.
- **Thematic tokens stay additive to terracotta:** the gold token set
  (`--color-gold`, `--color-gold-deep`, `--color-gold-line`, `--color-card-tint`)
  is defined only under `:root, [data-theme="terracotta"]`; `marigold` and
  `jewel` remain untouched for rollback. Gold is used for ornaments, hairlines,
  fills and large numerals only — gold-toned text uses `gold-deep`.
- **Relationship to religious wording:** the auspicious line (शुभ विवाह) is
  left as a draft-only `blessing` because DECISIONS.md records "Religious /
  ceremonial wording: OPEN". It renders only when a `side=blessing` Wording row
  is added and is always marked as a family-pending draft.

- **Phase B tokens shipped:** the gold accent set (`--color-gold #c9a227`,
  `--color-gold-bright #d4af37`, `--color-gold-deep #8a6a1d`,
  `--color-gold-line`, `--color-card-tint #f7ead9`, `--color-rule`) and
  `--shadow-ornate` are added to `:root, [data-theme="terracotta"]` and exposed
  as `gold`/`gold-deep`/`gold-line`/`card-tint`/`rule`/`shadow-ornate` in
  Tailwind. Contrast verified: `gold-deep` text on cream = 4.63:1 (AA); raw
  `gold`/`gold-bright` = ≈2:1 and are therefore ornament/highlight only;
  `ink` and `ink-muted` on `card-tint` = 11.5:1 and 5.6:1.

- **Section 1 (Hero) shipped:** the hero now opens with the foil-gold
  `monogram-rings`, an eyebrow flanked by two hairlines, an optional draft
  auspicious line (`family.blessing` — off until a sheet row supplies it), the
  `mandala-arch` kudai crown in `--color-gold`, the couple's names separated by
  `❦` in `--color-gold-deep` between two `--color-gold-line` rules. Single `<h1>`
  (bride name first on bride side) and second-name-`<p>` structure preserved.
- **Ornament ID namespacing (correctness fix):** the artwork shares fixed
  gradient/filter ids (`goldFoil`, `goldSheen`, `softShadow`). `Ornament.tsx`
  now rewrites every `id="…"` and `url(#…)` to a `useId()`-scoped prefix per
  instance, so multiple ornaments on one page never clash on a global SVG id.
  Verified: 0 duplicate ids, 0 orphaned `url(#)` refs, and the ornaments paint
  `#c9a227` foil (~10% gold pixels via PIL on element renders).
