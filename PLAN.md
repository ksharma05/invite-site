### Development plan: Bilingual Indian wedding invitation website

Below is a phased plan you can give to your VS Code coding assistant. It separates **confirmed requirements**, **decisions still needed**, and **implementation tasks**, so development does not lock us into assumptions.

The goal is a **beautiful, vibrant, smoothly animated invitation that remains fast, readable, and dependable**, with event management through Google Sheets.

### 1. Project brief

Build one responsive wedding invitation website with:

- **Two invitation perspectives**
  - Bride's side: bride's name first, with her parents presented as hosts.
  - Groom's side: groom's name first, with his parents presented as hosts.
- **Two languages**
  - English and a second language to be confirmed.
  - Family-approved translations rather than automatically generated ceremonial wording.
- **Google Sheets content management**
  - Add, edit, reorder, hide, restore, and delete events without changing code.
- **An elegant guest experience**
  - Mobile-first layouts.
  - Rich Indian wedding visual styling.
  - Smooth scrolling and restrained animation.
  - Clear event times, venues, and navigation actions.
- **Resilient operation**
  - Essential invitation information must not depend on animations.
  - Temporary spreadsheet/API problems must not cause an otherwise available invitation to become an empty page.

**Important distinction:** bride/groom links personalize the invitation; they are not access control. Anyone who can change the link could view the other perspective unless we explicitly build authentication.

### 2. Scope and decision register

#### Confirmed requirements

| Area | Requirement |
|---|---|
| Website | Indian wedding invitation |
| Design | Beautiful, vibrant, smooth-scrolling, resilient |
| Content editing | Google Sheets-based event management |
| Event operations | Add, edit, reorder, hide, restore, delete |
| Personalization | Bride-side and groom-side presentation |
| Name order | Inviting side's name appears first |
| Family presentation | Inviting side's parents appear as hosts |
| Languages | Bilingual |

#### Decisions to confirm before the relevant phase

| Decision | Why it matters |
|---|---|
| Second language | Translation structure, fonts, date formatting, text direction |
| Default invitation side | What happens when a visitor opens a link without a side |
| Default language | Initial experience for ordinary shared links |
| Whether guests can switch sides | Optional UI; not required just because two links exist |
| Whether both families' parents appear | We know who hosts each version, but not whether the other parents should also appear |
| Religious/cultural wording | Must match the families' preferences |
| Visual theme | Palette, typography, illustrations, ornamentation |
| RSVP inclusion | Determines whether a submission backend is needed |
| Public link or restricted invitation | Determines privacy architecture |
| Hosting provider | Affects caching, deployment, and fallback storage |
| Update freshness | Determines the spreadsheet refresh strategy |
| Photos, story, music, gallery | Optional scope, not yet confirmed |

**Implementation rule:** unresolved decisions must remain marked as unresolved. Do not substitute Hindi, sample parents' names, event dates, religious verses, or venues as if they were approved content.

### 3. Proposed technical stack

| Layer | Recommendation | Purpose |
|---|---|---|
| Application | Next.js App Router with TypeScript | Server-rendered invitation and server-only integrations |
| Styling | Tailwind CSS with CSS design tokens | Responsive styling and consistent visual themes |
| Scrolling | Native browser scrolling first; Lenis where justified | Smooth desktop experience without compromising touch behavior |
| Animation | Motion for React, previously Framer Motion | Selective entrance and interaction animations |
| Content | Google Sheets | Familiar editing interface |
| Sheets integration | Official Google Sheets API, server-side only | Avoid exposing credentials or private spreadsheet data |
| Validation | A runtime validation library, selected during setup | Validate spreadsheet content before rendering |
| Localization | Locale-aware routing and formatting | Language selection, dates, translated interface text |
| Testing | Unit/component tests plus Playwright browser tests | Verify content logic and guest journeys |
| Deployment | Vercel proposed, subject to confirmation | Hosting and preview deployments |

Use supported, compatible package versions verified during setup. Do not hard-code a framework version into the plan before checking compatibility.

**Architecture principle:** keep the animated presentation separate from spreadsheet access and content validation. The page should receive validated invitation data—not raw spreadsheet rows.

### Phase 0 — Finalize requirements and boundaries

**Objective:** establish the minimum buildable scope before writing application code.

#### Tasks

1. Confirm the unresolved decisions above.
2. Identify the people who approve:
   - English wording.
   - Second-language wording.
   - Family names and honorifics.
   - Events and logistics.
3. Decide the initial page sections.

**Recommended core sections:**

- Invitation hero.
- Host-family invitation message.
- Event itinerary.
- Venue and travel information.
- Family/coordinator contact information.
- Language switcher.

**Optional sections:**

- Countdown.
- Couple's story.
- Photo gallery.
- RSVP.
- Guestbook.
- Music.
- Accommodation.
- FAQs.

4. Define what "editable" includes:
   - Events only?
   - Family wording and names?
   - Contact information?
   - Travel information?
   - Images?
5. Define the freshness expectation:
   - Periodic refresh, or
   - An explicit publish/update workflow.
6. Confirm privacy expectations for family contact details, addresses, and photographs.

#### Deliverables

- Approved scope checklist.
- Decision register.
- Initial content inventory.
- List of optional features postponed until after the core invitation works.

#### Acceptance criteria

- Second language and default behavior are confirmed before localization implementation.
- No optional feature is treated as approved automatically.
- Public versus restricted access is explicitly decided.

### Phase 1 — Define the content model and spreadsheet

**Objective:** make spreadsheet editing predictable and safe.

The earlier spreadsheet examples were sketches. This phase should produce **one approved schema** before the coding assistant writes integration code.

#### A. Family and invitation content

Use the previously discussed `FamilyConfig` concept for:

- Bride's name in both languages.
- Groom's name in both languages.
- Bride's parents in both languages.
- Groom's parents in both languages.
- Optional grandparents.
- Bride-side invitation wording.
- Groom-side invitation wording.
- Optional approved blessing or verse.

**Refinement:** keep behavior such as "bride first on bride-side links" in application logic. It does not need to be repeated as translated spreadsheet content.

**Wording rule:** store complete invitation passages where grammar differs between languages or sides. Do not construct ceremonial sentences by stitching together translated fragments.

#### B. Events

Review and approve the existing `Events` fields, including:

- A stable event identifier.
- Display order.
- Active/hidden status.
- Side visibility: bride, groom, or both.
- Event title in both languages.
- Optional subtitle in both languages.
- Start and end timestamps with time-zone information.
- Venue name and address in both languages.
- Map link.
- Optional dress code and notes in both languages.
- Optional image.

**Important refinements to the earlier draft:**

- Use a **stable identifier**, not a sheet row number or event title, as an event's identity.
- Make timestamps the canonical date/time source.
- Generate ordinary date and time labels from timestamps and the selected language.
- Avoid separately maintaining display dates and machine dates unless a ceremonial date line is genuinely needed.
- Include an end timestamp if calendar exports require it; do not invent an event duration silently.
- Defer second-language column suffixes until the language is confirmed.

#### C. Spreadsheet usability

Configure:

- Frozen header rows.
- Clear column descriptions.
- Dropdowns for side visibility.
- Checkboxes or validated values for active status.
- Numeric validation for event order.
- Protected headers and non-editable structural cells.
- Instructions for adding and hiding events.
- A documented rule for clearing optional values.

Keep the structure simple; avoid merged cells in machine-read tables.

#### D. Permissions and privacy

A correction to the earlier proposal: **ordinary Google Sheets sharing permissions apply to the spreadsheet file, not independently to each tab.**

Therefore:

- If the site only reads invitation content, use a read-only service account.
- If RSVP is added, prefer a separate private spreadsheet for submissions.
- Do not assume putting RSVPs in another tab isolates them from editors of the same file.
- Protected ranges help prevent accidental edits; they are not a confidentiality boundary.

#### Deliverables

- Approved spreadsheet schema.
- Field validation rules.
- Spreadsheet editor instructions.
- Deliberately fictional development fixtures, clearly separate from production content.

#### Acceptance criteria

- A family member can understand how to add, hide, and reorder events.
- Required and optional fields are documented.
- The schema is approved before integration code depends on it.
- Private guest data is not mixed into the public content feed.

### Phase 2 — Establish the application foundation

**Objective:** create a maintainable project before building visual effects.

#### Tasks

1. Initialize Next.js and TypeScript.
2. Configure Tailwind CSS.
3. Configure linting, type checking, and formatting.
4. Establish responsibility boundaries for:
   - Page composition.
   - Reusable UI.
   - Invitation-side rules.
   - Localization.
   - Server-only spreadsheet integration.
   - Content validation.
   - Tests.
5. Configure environment variables for credentials and spreadsheet references.
6. Ensure secrets are excluded from version control.
7. Add environment-variable validation with helpful setup errors.
8. Establish a basic CI check for:
   - Linting.
   - Type checking.
   - Tests.
   - Production build.
9. Add an environment example with placeholders only.
10. Ensure development fixtures cannot silently ship as the real invitation.

#### Deliverables

- Running development application.
- Setup instructions.
- Working automated checks.
- Clear configuration documentation.

#### Acceptance criteria

- Application builds successfully.
- No credentials appear in source control or browser code.
- Missing configuration produces an actionable error.
- The project can be started on another machine using documented steps.

### Phase 3 — Implement invitation-side and language behavior

**Objective:** prove the personalization rules before styling them heavily.

Use the previously discussed `side` and `lang` URL parameters unless we choose a different routing approach during Phase 0.

#### Invitation-side behavior

For bride-side links:

- Bride appears first.
- Bride's parents are the inviting hosts.
- Bride-side invitation wording is used.
- Bride-only and shared events appear.

For groom-side links:

- Groom appears first.
- Groom's parents are the inviting hosts.
- Groom-side invitation wording is used.
- Groom-only and shared events appear.

Whether the other family's parents appear elsewhere remains a content decision.

#### Language behavior

1. An explicit supported URL language takes precedence.
2. Any saved language preference is used only according to the approved default behavior.
3. The selected language persists across relevant navigation.
4. Switching language preserves the invitation side.
5. Switching side, if available, preserves language.
6. Unsupported values resolve to documented defaults.
7. Initial server rendering and browser rendering must agree to avoid flashing the wrong language or name order.

#### Translation rules

Translate:

- Invitation text.
- Event text.
- Buttons and labels.
- Navigation.
- Validation messages.
- Empty states.
- Accessibility labels.
- Calendar action labels.

Do not translate:

- Identifiers.
- URLs.
- Visibility rules.
- Timestamp values.

Names and addresses must use family-approved spellings or transliterations.

Choose a clear policy for missing translations. Recommended:

- Block publication for missing essential names or invitation wording.
- Permit a documented fallback for optional notes, with a warning for editors.

#### Required tests

Test every side/language combination, plus:

- Missing parameters.
- Invalid parameters.
- Language switching.
- Side switching, if included.
- Shared links retaining their chosen perspective.

#### Acceptance criteria

- No bride/groom name-order errors.
- Correct parents and wording in every combination.
- Side-specific events filter correctly.
- No initial flash of the wrong invitation perspective.

### Phase 4 — Design the visual system and static invitation

**Objective:** approve the appearance using validated fixture content before connecting live data.

#### Tasks

1. Select one design direction:
   - Regal jewel tones.
   - Vibrant marigold and festive pink.
   - Warm terracotta and ivory.
   - Another agreed palette.
2. Define design tokens for:
   - Colors.
   - Typography.
   - Spacing.
   - Border treatments.
   - Shadows.
   - Corner styles.
   - Motion timing.
3. Select fonts that support both languages correctly.
4. Design the mobile experience first.
5. Build:
   - Hero.
   - Host-family message.
   - Language control.
   - Event cards or timeline.
   - Venue/contact sections.
   - Footer.
6. Test long names and longer second-language paragraphs.
7. Ensure ornaments enhance the invitation without competing with essential information.
8. Reserve appropriate space for images to prevent layout shifts.

#### Accessibility requirements

- Readable text contrast.
- Comfortable touch targets.
- Visible keyboard focus.
- Logical headings.
- Semantic links and buttons.
- Proper document language.
- Correct text direction for the selected language.
- Decorative artwork hidden from assistive technologies where appropriate.

#### Deliverables

- Responsive static invitation.
- Agreed design tokens.
- Both invitation perspectives and both languages represented in review.

#### Acceptance criteria

- The site looks intentional without animation.
- Long names do not overflow.
- Mobile layouts have no unintended horizontal scrolling.
- Both languages receive equal visual care.

### Phase 5 — Build the Google Sheets integration

**Objective:** replace fixture content with validated spreadsheet data.

#### Tasks

1. Configure Google Sheets API access.
2. Share only the necessary spreadsheet with the service account.
3. Keep all credential use server-side.
4. Fetch approved ranges.
5. Normalize cell values:
   - Trim unwanted whitespace.
   - Interpret active flags consistently.
   - Parse display order.
   - Validate timestamps and URLs.
6. Validate rows against the approved schema.
7. Detect duplicate event identifiers.
8. Sort valid events deterministically.
9. Apply side visibility and active status.
10. Handle optional blank values without broken UI.
11. Create sanitized logs for rejected rows and API errors.
12. Verify actual server-side caching behavior.

**Important:** direct Google API client calls do not automatically receive Next.js `fetch` caching. Implement caching explicitly using the supported mechanism for the chosen Next.js version.

#### Update behavior

Document:

- How often the app attempts to refresh.
- Whether an existing page requires a reload.
- What happens after an invalid spreadsheet edit.
- What an editor should do when changes are not visible.

Do not promise that edits appear "instantly" or "within exactly one minute" unless the implemented system has been tested to provide that guarantee.

#### Acceptance criteria

- Spreadsheet edits appear without a code deployment.
- Hidden and deleted events disappear after the documented refresh process.
- Reordering works consistently.
- Malformed content does not crash the page.
- Credentials and raw private sheet content are not exposed.

### Phase 6 — Add resilience and publishing safeguards

**Objective:** keep the invitation usable when a dependency fails.

#### Failure scenarios

Test behavior when:

- Google Sheets is temporarily unavailable.
- Credentials are invalid.
- The spreadsheet is accidentally emptied.
- Required family content is missing.
- One event row is malformed.
- An image URL fails.
- All events are hidden.
- A fresh deployment has no cached content.

#### Recommended publication model

Treat sheet edits as candidate content:

1. Fetch.
2. Validate.
3. Publish only an acceptable content snapshot.
4. Retain the previous valid snapshot when critical validation fails.

Decide whether one invalid optional event should be skipped or should block the entire update. Do not make that choice silently.

**Durability requirement:** a process-local variable or ordinary cache is not a dependable last-known-good store across deployments and cold starts. Select a durable snapshot approach appropriate to the hosting platform.

#### Guest-facing fallbacks

- Replace missing decorative images gracefully.
- Preserve readable event information when imagery fails.
- Never show fabricated times, venues, or family details.
- Do not expose API errors or credentials.
- If no valid invitation content exists, show a clear unavailable state rather than a misleading invitation.

#### Acceptance criteria

- A simulated Sheets outage preserves the last published invitation when a durable snapshot exists.
- Cold-start behavior is tested.
- Invalid edits cannot replace valid content with a broken page.
- The fallback strategy and recovery steps are documented.

### Phase 7 — Add motion and guest utilities

**Objective:** enhance the approved invitation without reducing usability.

#### Scrolling and motion

- Start with native scrolling.
- Add Lenis only where it improves the actual experience.
- Preserve normal touch scrolling and keyboard navigation.
- Respect reduced-motion settings.
- Avoid scroll hijacking.
- Avoid hiding essential content until JavaScript animation runs.
- Limit heavy parallax and continuous effects.
- Clean up animation loops and event listeners correctly.

#### Guest utilities

Add approved features such as:

- Venue map links.
- Contact links.
- Calendar downloads.
- Google Calendar actions.
- Countdown.

For calendars:

- Use validated start/end timestamps.
- Preserve the intended time zone.
- Escape calendar text correctly.
- Test overnight events.
- Include only events visible to the selected invitation side.

For countdowns:

- Confirm the target event explicitly.
- Do not simply choose the first spreadsheet row.
- Define what appears when the countdown reaches zero.

Music remains optional and, if added, should require guest interaction to begin playback.

#### Acceptance criteria

- Reduced-motion mode remains fully usable.
- Calendar entries have correct dates, times, and venues.
- Map buttons point to the approved venue.
- Scrolling works in mobile browsers and with keyboard navigation.
- The invitation remains useful if animation fails.

### Phase 8 — Optional RSVP implementation

**Start this phase only if RSVP is approved.**

#### Confirm first

- Individual or household responses.
- Attendance per event.
- Contact fields.
- Guest-count rules.
- Dietary preferences.
- Whether responses can be edited.
- Submission deadline.
- Whether any invite identity needs verification.

#### Implementation tasks

- Create a server-side submission endpoint.
- Validate all inputs.
- Prevent spreadsheet formula injection in user-provided values.
- Apply appropriate abuse protection.
- Avoid public write access to the sheet.
- Prevent duplicate clicks from creating accidental duplicate responses.
- Store submissions separately from invitation content.
- Include invitation side as contextual information.
- Do not treat the side parameter as proof of guest identity.
- Show success only after a confirmed successful submission.

If events can change, decide how historical responses retain their original meaning. Event identifiers should remain stable, and submissions should preserve sufficient event context for later review.

#### Acceptance criteria

- Valid submissions are stored correctly.
- Failed submissions preserve entered information where practical.
- Guest data is never returned through the public invitation data endpoint.
- Duplicate and abusive submission handling is tested.

### Phase 9 — Quality assurance and family review

**Objective:** verify real guest journeys and approve actual content.

#### Functional checks

- Both invitation perspectives.
- Both languages.
- Shared and side-specific events.
- Event addition, update, reorder, hiding, restoration, and deletion.
- Invalid spreadsheet data.
- Language persistence and shared links.
- Map and calendar actions.
- RSVP, if included.

#### Content checks

Family reviewers approve:

- Names and spelling.
- Honorifics.
- Parent and grandparent details.
- Invitation passages.
- Translations.
- Ceremonial wording.
- Event dates and times.
- Venue addresses and map locations.
- Contact information.

#### Device and accessibility checks

Test representative:

- Android Chrome.
- iPhone Safari.
- Desktop Chrome, Safari, Firefox, and Edge where available.
- WhatsApp in-app browsing.
- Slow connections.
- Keyboard navigation.
- Screen-reader basics.
- Reduced motion.
- Increased text size.

#### Sharing checks

- Page title matches the invitation side.
- Supported language metadata is correct.
- Share preview is appropriate.
- No private content is exposed in metadata.

Messaging applications can cache link previews. Test real shared links rather than assuming a metadata update will immediately replace a previously cached preview.

#### Acceptance criteria

- No critical functional or privacy issues.
- Both families approve the relevant invitation versions.
- Both languages receive a complete review.
- Performance is measured on the implemented site—not asserted from the stack alone.

### Phase 10 — Deployment and handover

**Objective:** launch a site the family can maintain confidently.

#### Tasks

1. Configure production hosting and domain.
2. Add production credentials securely.
3. Apply the agreed search-indexing policy.
4. Verify HTTPS and redirects.
5. Test the actual production spreadsheet integration.
6. Test refresh and last-known-good behavior in production.
7. Verify final bride-side and groom-side links in both languages.
8. Document rollback and credential-replacement procedures.
9. Provide a short editor guide covering:
   - Adding an event.
   - Editing text and logistics.
   - Reordering.
   - Hiding/restoring.
   - Deleting.
   - Providing translations.
   - Checking publication.
   - Recovering from an invalid edit.

#### Acceptance criteria

- Production behavior matches the tested preview.
- A non-developer can update an event using the guide.
- The freshness window and recovery process are understood.
- Only approved content is live.

### Instructions to give your VS Code assistant

Paste this brief before asking it to implement any phase:

> Build the wedding invitation incrementally using the phased plan above.
>
> Begin with Phase 0. Identify unresolved decisions and confirm them before writing code that depends on them.
>
> Use Next.js, TypeScript, Tailwind CSS, and server-side Google Sheets integration as the proposed baseline. Verify compatible package versions during setup.
>
> Do not assume the second language is Hindi. Do not invent production names, dates, venues, contact details, religious text, or translations.
>
> Before writing integration code, propose and obtain approval for the exact spreadsheet schema. Use stable event identifiers and canonical timezone-aware timestamps.
>
> Implement bride-side and groom-side presentation as one shared application with tested perspective rules—not duplicated pages with independently maintained content.
>
> Keep secrets and spreadsheet access server-side. Treat URL side selection as personalization, not authorization.
>
> Build the static, accessible invitation before adding elaborate animations. Respect reduced motion and preserve native mobile scrolling.
>
> Implement explicit content validation, caching, and a documented durable last-known-good strategy. Do not assume an ordinary cache survives every deployment or cold start.
>
> Do not implement RSVP, music, guestbook, or other optional modules without approval.
>
> For each phase, report the changes made, checks actually run, unresolved issues, and acceptance criteria met. Do not claim tests passed unless they were executed. Stop at the phase boundary for review.

**Recommended next step:** complete Phase 0 first—especially the **second language, default side/language, family presentation, and RSVP decision**—then approve the spreadsheet structure before development begins.
