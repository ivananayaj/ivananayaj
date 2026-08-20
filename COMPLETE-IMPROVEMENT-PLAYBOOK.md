# Spidey Reading Tracker — Complete Improvement Playbook

**Live site:** https://spidey-reading-tracker.netlify.app/  
**Date:** 2026-08-19  
**Purpose:** Every issue found in the diagnostic, plus deeper findings, plus how a multi-agent rebuild should work so the next version is stronger than a single Claude one-shot.

**Before & after mockups** (concept art of current vs proposed UI — not live screenshots):

| # | File | What it shows |
|---|---|---|
| 01 | `before-after/01-home-header.png` | Hero, progress, and first-run focus |
| 02 | `before-after/02-navigation.png` | 16 emoji tabs vs Read / Collect / Explore / Me |
| 03 | `before-after/03-collection-card.png` | Noisy card vs one scannable book card |
| 04 | `before-after/04-covers-and-links.png` | 📷 + broken searches vs real cover + one good link |
| 05 | `before-after/05-data-overlaps.png` | Same omnibus counted 3× vs one book, many issues |
| 06 | `before-after/06-mobile.png` | Wrapped nav on a phone vs thumb-first layout |
| 07 | `before-after/07-next-up.png` | Buried “currently reading” + AI tab vs sticky Next Up |
| 08 | `before-after/08-stats-backup.png` | Mixed 0/121 vs 0/3 + Backup-only vs journal + export |

These are **design targets**, not photos of the Netlify page. The “before” side is reconstructed from the live DOM (emoji nav, 📷 placeholders, OWN/READ, era chips, 0/121). The “after” side is what we should build.

---

## A. What already works (do not throw away)

Claude got the *product* right:

- Spine is correct: **Brand New Day → Big Time → Dying Wish → Superior → Spider-Verse → Spider-Geddon**.
- Side tracks are named: Civil War, Secret Wars 2015, Civil War II, 2099, Ultimate, Venom & Carnage, Web of Spider-Man.
- Primitives are right: **OWN**, **READ**, era groups, must-read, “Set as Currently Reading,” Surprise Me, Step-by-Step, Backup, disclaimer.
- Copy on cards is often excellent (why BND matters, what Grim Hunt is, Otto mind-swap). **Keep the blurbs.**

The rebuild is a **data model + IA + polish** job, not a new idea.

---

## B. Full issue inventory

### B1. Catalog / data (blocker)

| ID | Issue | Why it hurts later |
|---|---|---|
| D1 | Big Time `#648–656` **and** gap `#648–697` nest | Double-count read; false “buy both” |
| D2 | Dying Wish + Superior #1–16 + #17–31 all map to **Superior Omni Vol. 1** | Three OWN/READ rows, one ISBN |
| D3 | Avenging + Team-Up + Superior Vol. 2 all map to **Returns Omni** | Same |
| D4 | Worldwide gap listed as ASM 2015 `#1–32` only | Understates the hole through Red Goblin |
| D5 | Spider-Geddon is “#0–5 + tie-ins” with no issue list | Surprise Me / Step-by-Step cannot be accurate |
| D6 | Header **0/121 issues** vs era **0/3 read** (books) | Users never know “done” |
| D7 | “View issues in this omnibus (6)” repeats the same count on split cards | Looks like 6+6+6 issues in one book |
| D8 | Prices (`$99.99`, `$150`) with no date or source | Stale the week after launch |
| D9 | No ISBN / UPC / MU id / GCD id stored | Links cannot be fixed without re-research |
| D10 | No skip / optional / required flag on issues | Step-by-Step cannot honor “skip Secret Invasion if you want” |
| D11 | Events (Civil War, SW15, CWII) are **separate apps**, not tags | Reading order vs event order will diverge and rot |
| D12 | No publication date vs story date | Chronological Tracker vs Timeline will fight |
| D13 | Gap cards are first-class “books” you can OWN | You cannot own a gap |
| D14 | No reprint / new printing distinction | Collectors buy the wrong cover |
| D15 | No digital-vs-print ownership | MU “read” ≠ shelf “own” |

**Target model (agents must share this):**

```
Issue
  id, series, number, year, month?
  title, blurb
  required | recommended | optional | skip-ok
  eventTags[]
  gcdId, muId, fandomSlug
  coverRef

Collection
  id, type: omnibus | tpb | hc | digital | gap
  title, isbn?, msrp?, msrpAsOf?
  issueIds[]   // ordered
  coverRef
  buyUrl?      // one canonical link

UserState  (local, exportable)
  readIssueIds[]
  ownedCollectionIds[]
  currentlyReading: { issueId or collectionId, startedAt }
  ratings: { issueId: 1-5 }
  notes: { issueId: string }
  schemaVersion
```

**Rule:** one issue, one READ. Many collections may contain it. OWN lives on collections. Gaps are not ownable.

### B2. Links and covers (blocker for “finished” feel)

| ID | Issue |
|---|---|
| L1 | Every card cover is a 📷 placeholder |
| L2 | Fandom / GCD / Cover Browser / Marvel search the **raw card title** including “+ Secret Invasion tie-in” |
| L3 | Cover Browser points at a *series* index, not the issue |
| L4 | “Read: Marvel” is site search, not Marvel Unlimited deep link |
| L5 | Four equal-weight outbound links = decision fatigue |
| L6 | Cover Gallery tab cannot work if L1 is true |
| L7 | Hotlinking official Marvel art (if added naively) is a legal + 403 risk |

**Fix:** IDs on every issue; one primary action (“Open on GCD” or “Open in MU”); covers via allowed source, user upload, or typographic poster — never a broken `<img>`.

### B3. Information architecture

| ID | Issue |
|---|---|
| N1 | **16** top-level destinations |
| N2 | Three “order” tools: Timeline, Chronological Tracker, Collecting Roadmap |
| N3 | One tab per event (CW, SW15, CWII, Verse, Venom, 2099, Ultimate, Web) |
| N4 | Web of Destiny + Family Tree + Cover Gallery compete with reading |
| N5 | AI Companion is a peer of Timeline |
| N6 | Era chip row (BND, Big Time, …) **plus** accordion eras **plus** tabs |
| N7 | No search |
| N8 | No “you are here” besides a long scroll |
| N9 | Surprise Me and Step-by-Step are unlabeled relative to the 16 tabs |

**Target IA:**

```
Read      → step-by-step / full chrono (default)
Collect   → omnibus roadmap, OWN, gaps as “buy trades instead”
Explore   → filters: events, 2099, Ultimate, Venom, family, gallery
Me        → current, stats, journal, backup/restore, settings
```

Events are **toggles** (“include Civil War tie-ins”), not pages.

### B4. Progress, persistence, trust

| ID | Issue |
|---|---|
| P1 | Backup with no adjacent Restore |
| P2 | Browser-only; clear-site-data = total loss |
| P3 | No schema version on export → future migrations break silently |
| P4 | No last-backup timestamp |
| P5 | Currently Reading is a per-card pin, not a global chip |
| P6 | No started / finished dates |
| P7 | No rating or one-line note |
| P8 | No undo after OWN/READ |
| P9 | No “mark rest of this collection read” |
| P10 | Surprise Me can hit already-read or gaps |
| P11 | Stats will inherit D1–D6 and look precise while wrong |
| P12 | No empty-state onboarding (“start at ASM #546”) |

### B5. UX, visual, accessibility

| ID | Issue |
|---|---|
| U1 | Emoji used as icons (☀️💾📚🖼🕸️🎲📖🌳) — inconsistent across OS |
| U2 | OWN/READ hit targets likely too small for thumbs |
| U3 | Link row is a wrap of tiny text |
| U4 | Story blurbs lose to chrome |
| U5 | No dark/light *system* follow mentioned (there is a sun toggle) |
| U6 | No visible search / jump-to-era on long page |
| U7 | Reduced motion unknown |
| U8 | Screen reader: emoji + unlabeled buttons |
| U9 | Focus order through 16 tabs then 100 cards |
| U10 | Contrast of red-on-black + yellow stars needs a check |
| U11 | Light mode (if any) untested in this review |
| U12 | No print stylesheet for a paper checklist |

### B6. Mobile

| ID | Issue |
|---|---|
| M1 | 16-item nav wraps or horizontal-scrolls off a phone |
| M2 | Era chips + action buttons (Surprise, Step-by-Step) stack into a wall |
| M3 | Cards with 5 links + 2 checkboxes + pin + expand = fat-finger hell |
| M4 | Cover placeholders waste vertical space without paying off |
| M5 | Sticky header (progress + current book) missing |

This is a **couch + phone** app. Desktop-first was the wrong default.

### B7. AI Companion

| ID | Issue |
|---|---|
| A1 | Peer-level nav for an undefined job |
| A2 | If the key is in the frontend, it will leak |
| A3 | Ungrounded chat will invent reading orders that fight the tracker |
| A4 | Cost on Netlify with no rate limit |
| A5 | Does not beat a deterministic Next Up if data is clean |

**Keep AI only as:** “Given my read set, explain why the next 3 issues are next, and what I can skip.” Grounded in `issues.json`. Proxy via Netlify Function. Otherwise **cut it**.

### B8. Legal, brand, ops

| ID | Issue |
|---|---|
| O1 | Disclaimer is good — keep and surface once on first visit |
| O2 | Header “SPIDEY” + Marvel titles can look official at a glance |
| O3 | Cover gallery legal risk |
| O4 | Default `*.netlify.app` is fine; add `noindex` if private |
| O5 | This GitHub repo is **not the site** — agents cannot review diffs |
| O6 | One-file / generated monolith (inferred) — one bad Claude pass overwrites data |
| O7 | No `_headers` / cache policy visible |
| O8 | No Open Graph / share card (minor) |
| O9 | No PWA / offline (nice-to-have; data is local anyway) |
| O10 | No automated catalog tests |

### B9. Extra diagnostics (not in the first memo)

| ID | Finding |
|---|---|
| X1 | **Issue count inside omnis looks fake** — many cards say “(6)” or “(8)” for ranges that are 30+ issues (e.g. ASM #546–583 is ~38 floppies). Either those are “stories” not issues, or the expand panel is incomplete. **Audit every expand list.** |
| X2 | **ASM #648–656** is labeled Big Time lead-in, then **#666–673** Spider-Island, then **#648–697** gap — **#657–665** and **#674–697** are only in the gap, while **#648–656** is also in a real omni. The gap card should be **only the uncollected remainder**, not a re-range of the whole era. |
| X3 | **Must-read star** only on Dying Wish / Superior Vol. 1 — good idea, unused elsewhere (Kraven’s First Hunt, New Ways to Die, Spider-Island, Go Down Swinging). |
| X4 | **Secret Invasion** is glued into the BND Vol. 1 title instead of a tagged optional tie-in. |
| X5 | **Superior “Vol. 2” card** text says the Returns omni spans 2013 Team-Up through 2023 — that is a *collection* fact, not a *reading-era* fact. Mixing them on a 2018-era row confuses order. |
| X6 | **OWN on a gap** and **OWN on a book you already own via another card** have no conflict UI. |
| X7 | **Web of Destiny / Family Tree** without a data graph will be fan-art posters that drift from the tracker. They need the same IDs. |
| X8 | **No “continue on Marvel Unlimited vs on the shelf”** — a reader who owns the omni and also uses MU needs both. |
| X9 | **No League of Comic Geeks / CLZ / Comic Geeks import** — power users already have lists. |
| X10 | **No changelog** for when you fix the catalog; users will think *their* checks moved. |
| X11 | **121 total** cannot be verified from the homepage text; publish the number from `issues.length` so it cannot drift. |
| X12 | **Team-up / Avenging** as their own eras in the chip row over-weights Otto side books vs ASM. |
| X13 | **No spoiler control** — blurbs already spoil Dying Wish and Peter’s return. Add a spoiler veil for unread eras. |
| X14 | **Light/dark + red palette** will wash out covers; after covers exist, test both themes. |
| X15 | **Single-page dump** (everything in one HTML response) means first paint includes Civil War through 2099 even if you only wanted BND. Split data, lazy-load Explore packs. |
| X16 | **No agent-safe source layout** — see section D. Without it, three agents will thrash the same `index.html`. |

---

## C. What “way better” looks like (product)

A session should answer **one question in under 10 seconds:**

> What do I read or buy tonight?

That means:

1. Open site → **currently reading** is already there.
2. **Next 1–3 issues** with why, spoiler-safe.
3. Big **READ** tap. Undo if miss.
4. If the next chunk is only in a book you don’t own: **Collect** shows the cheapest container (omni vs trades) with a working link.
5. Progress: **47 / 121 issues · 3 books owned** — two numbers, never mixed.
6. Search “Grim Hunt” works.
7. Backup.json in Downloads; Restore next to it; schema version 1.

Everything else (tree, gallery, 2099, AI) is Explore.

---

## D. How several agents should work (so this does not rot)

A single Claude pass produced a clever monolith. Several agents will **destroy it** unless you freeze contracts.

### Repos and files

```
/data
  issues.json          # source of truth
  collections.json
  events.json          # tags only
  schema.json          # JSON Schema, versioned
/scripts
  audit.mjs            # overlaps, missing ids, bad counts
  lint-links.mjs
/src                   # UI only — no issue text hardcoded
/tests
  catalog.test.js      # D1–D6, X1–X2
```

**Never** let an agent rewrite `issues.json` and the React/HTML in the same PR unless the PR is “add one issue.”

### Agent roles

| Agent | Owns | Must not touch |
|---|---|---|
| **Catalog** | `data/*`, blurbs, IDs, reading order | CSS, nav, AI |
| **Audit** | `scripts/audit`, tests, CI | product copy |
| **App / IA** | Read/Collect/Explore/Me, cards, search | issue facts |
| **Visual** | type, color, covers-as-layout, a11y | data |
| **Persist** | export/import, schemaVersion, undo | reading order |
| **Links** | gcd/mu/isbn resolution | UI chrome |

### Guardrails (put in the repo README)

1. Progress = `readIssueIds.length / issues.length`. Collections never increment that number.
2. A collection with `type: "gap"` cannot be owned.
3. If two collections share an issue, UI shows one READ.
4. No outbound URL may contain a raw concatenated title. Links are stored IDs only.
5. Nav has at most 5 primary items.
6. AI cannot invent an issue not in `issues.json`.
7. Every PR that changes `data/` must print `audit.mjs` with 0 errors.
8. Spoiler blurbs live behind `spoiler: true` until that era is read (or user disables).

### Build order for the team

1. **Catalog agent** rebuilds BND → Geddon only. Side tracks as *packs* loaded later.
2. **Audit agent** fails CI on overlaps (D1–D3, X2) and fake issue counts (X1).
3. **App agent** ships Read + Collect with the new card.
4. **Persist agent** export/import/undo/current chip.
5. **Visual agent** covers strategy + mobile nav.
6. **Explore packs** (CW, 2099, tree) only after 1–5 are green.

---

## E. Before & after — what each of the 8 frames is arguing

1. **Home header** — Stop leading with a slogan and 16 tools. Lead with progress that means something and the book in your hand.
2. **Navigation** — Events are filters. Tools are four verbs.
3. **Card** — Cover, title, range, why, OWN, READ. Links live one level down.
4. **Covers & links** — Placeholders and search-spam make the research look fake. One resolved cover + one resolved URL looks finished.
5. **Overlaps** — The Superior / Returns / Big Time mess is the #1 trust killer. Show one physical book and the issues inside it.
6. **Mobile** — If it isn’t thumbable, it won’t get updated, and a stale tracker dies.
7. **Next Up** — Currently Reading + Step-by-Step + Surprise Me + AI should collapse into one honest panel.
8. **Stats & backup** — Two meters (read vs owned) and Restore beside Backup. Journal optional.

---

## F. Suggested “definition of done” for v2

- [ ] `issues.json` length is the only total; header matches it
- [ ] Zero overlapping ownable collections without a shared-issue map
- [ ] Gap cards cannot be marked OWN
- [ ] Every collection expand list count == `issueIds.length`
- [ ] No 📷 leftover; missing cover uses a designed poster
- [ ] No search-string outbound links
- [ ] Four primary nav items; events are filters
- [ ] Sticky currently-reading + Next 3
- [ ] Export + Restore + schemaVersion
- [ ] Undo toast on READ/OWN
- [ ] Spoiler veil default on
- [ ] Audit script in CI
- [ ] Mobile: OWN/READ ≥ 44px targets; nav does not wrap into 3 rows
- [ ] Disclaimer + unofficial badge in header (small)
- [ ] Source lives in git, data split from UI

---

## G. Bottom line

Claude already captured the **reading spine and the collector voice**.  
A multi-agent v2 wins by **refusing to put facts in the UI**, **refusing a second progress unit**, and **refusing a 16-tab home**.

Ship a boring, correct BND → Geddon reader first. Then hang Ultimate, 2099, and the family tree on the same IDs.

The eight frames in `before-after/` are the shared visual contract so design, catalog, and app agents are aiming at the same site.
