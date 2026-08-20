# Spidey Reading Tracker — Site Diagnostic

**Live site:** [spidey-reading-tracker.netlify.app](https://spidey-reading-tracker.netlify.app/)  
**Reviewed:** 2026-08-19  
**Source in this repo:** none (only a stub `README.md`). This is a production-only review of the deployed app.

---

## What it is (and what already works)

This is a personal **Marvel Spider-Man collecting + reading tracker**, not a generic “read comics” list. The core idea is strong:

- Scope is explicit: **Brand New Day → Spider-Geddon**, plus side tracks (Civil War, Secret Wars 2015, Civil War II, 2099, Ultimate, Venom/Carnage, etc.).
- **OWN / READ** checkboxes, era grouping, omnibus notes, “must-read” flags, and **Set as Currently Reading** are the right primitives.
- **Backup**, **Surprise Me**, **Step-by-Step Mode**, stats, and a legal disclaimer at the bottom show real thought, not a one-hour mock.

The product problem is not “needs more features.” It already has **too many surfaces** on a dataset that is **internally inconsistent**, and the **links/covers** don’t do what a collector actually needs.

---

## Severity snapshot

| Area | Grade | Why |
|---|---|---|
| Product concept | A− | Clear personal use case, good era framing |
| Data accuracy | D+ | Overlapping collections, gaps that collide with listed books |
| Navigation / IA | C− | 16 top-level modes; three “timelines” |
| Covers & outbound links | D | Broken covers; search URLs are raw dump strings |
| Progress model | C | Local-only; 0/121 vs 0/3-per-era mixed units |
| Mobile / a11y | C− | Emoji UI, huge nav, image placeholders |
| Legal / ops | B | Disclaimer present; still a fan-art/hotlink risk |
| Maintainability | D | Not in this repo; looks like one giant generated page |

---

## 1. Data integrity (highest-impact fix)

The homepage already contradicts itself. Fix the catalog before adding more tabs.

**Overlapping ranges**

- **Big Time** lists `ASM #648–656` *and* a gap card `ASM #648–697`. Those ranges nest. A reader who marks both “read” double-counts; a collector who buys both thinks they need two books for the same issues.
- **Dying Wish** (`ASM #698–700`) is called out as “opening of the Superior omnibus,” then **Superior #1–16** and **#17–31** are *also* “Superior Spider-Man Omnibus Vol. 1.” Three cards, one book.
- **Avenging Spider-Man**, **Superior Team-Up**, and **Superior Vol. 2 / Returns** all claim the **Returns omnibus**. Same physical book, three (or four) OWN/READ rows.

**Incomplete / imprecise collections**

- “Worldwide” gap is `ASM #1–32 (2015)`. The Slott Worldwide/Red Goblin stretch is much longer; #1–32 understates the hole.
- **Spider-Geddon** is a single TPB + “tie-ins” with no issue map. The rest of the site is issue-aware; this era is not.
- Progress says **0/121 issues** while era headers say **0/3 read** (omnibuses). Users will not know what “done” means.

**What to do**

1. Model **issues** as the source of truth (id, series, number, year, event tags).
2. Model **collections** (omnibus / TPB / digital) as *containers* of issue IDs — never as a second progress unit unless labeled “books owned.”
3. If an issue appears in two books, show **one read checkbox** and **multiple own options**.
4. Add a tiny “data audit” view: orphan issues, overlapping collections, missing covers, bad links.

Until that’s done, Stats, Surprise Me, and Step-by-Step will recommend nonsense.

---

## 2. Covers and “where do I read this?” links are broken

Every card shows a **📷 placeholder**. Collectors live on covers; this makes the site feel unfinished.

Outbound links search **the entire card title as a query**, e.g.

`Amazing Spider-Man #546–583 + Secret Invasion tie-in`

That will not hit the right Fandom page, GCD issue, Cover Browser series, or Marvel Unlimited title. “Read: Marvel” is a site search, not a MU deep link.

**What to do**

- Store per-issue: `gcd_id`, `marvel_unlimited_id` / slug, `fandom_slug`, `cover_url` (or a local/cached file).
- Prefer **Grand Comics Database** + **Marvel.com / MU** canonical URLs.
- If you cannot host Marvel art: use GCD’s linking policy, or a **user-uploaded** cover, or a **generated silhouette** — not a broken `<img>`.
- One “Open this book” button that actually lands on the collection, not four failing search tabs.

---

## 3. Information architecture is overcrowded

Top nav (as deployed):

Timeline · Collecting Roadmap · Civil War · Secret Wars '15 · Civil War II · Spider-Verse (Full) · Venom & Carnage · Spider-Man 2099 · Ultimate Spider-Man · Web of Spider-Man · Web of Destiny · Family Tree · Cover Gallery · Chronological Tracker · Stats · AI Companion

That’s **three different “order” tools** (Timeline, Chronological Tracker, Collecting Roadmap) plus **a tab per event**. New visitors will not know where to start.

**What to do**

Collapse to **4–5 primary modes**:

1. **Read** — chronological / step-by-step (default)
2. **Collect** — omnibus/TPB roadmap + OWN
3. **Explore** — events, 2099, Ultimate, Venom as *filters*, not pages
4. **Gallery / tree** — visual extras
5. **Me** — currently reading, stats, backup, settings

Put Civil War / Secret Wars / etc. as **toggles on the same list** (“include event tie-ins”).  
Hide AI Companion until it has a defined job (see below).

---

## 4. Progress, persistence, and trust

- **Backup** implies everything lives in the browser. That’s fine for a personal tool, but:
  - No restore UX called out next to Backup
  - No “last synced” / export JSON preview
  - A cleared site data = lost collection
- **Currently Reading** is the best feature on the page — make it a persistent **header chip** on every view, not a per-card action that disappears into the scroll.
- Add **started / finished dates** and optional **1–5 rating + 1-line note**. That’s what turns a checklist into a journal.

**Nice, small upgrades**

- Import/export JSON + optional Google Drive / file pick (no account required).
- “Mark remaining issues in this omnibus read.”
- Undo toast (accidental OWN/READ is common on mobile).

---

## 5. UX / visual / accessibility

- Emoji-as-icons (☀️💾📚🖼🕸️) look playful but fail contrast, screen readers, and Windows-vs-Apple consistency.
- 16-item nav will wrap or overflow on a phone — this is a **couch + phone** app.
- Placeholders and tiny link rows create visual noise; the **era story blurb** is the good part and gets buried.
- No obvious search (“where is Grim Hunt?”).
- Dark/light toggle is good; pair it with a **larger tap target** for OWN/READ.

**What to do**

- One card layout: cover | title + issue range | 2-line why-it-matters | OWN · READ · current.
- Real icons or a small SVG set (spider, book, check).
- Sticky era progress bar.
- Keyboard: `j/k` next issue in Step-by-Step, `r` toggle read.
- `prefers-reduced-motion` if there is web-slinging chrome.

---

## 6. “AI Companion”

On a fan tracker this is usually one of:

- a thin wrapper around a public model (cost + key leakage if the key is in the frontend), or  
- canned blurbs that don’t know *your* read state.

**Only keep it if** it answers: *“I just finished Grim Hunt — what do I read tomorrow, and what can I skip?”* using **your** OWN/READ graph.

Otherwise replace it with a deterministic **Next up** panel (cheaper, more trusted, no API key on Netlify).

If it stays: proxy the model on a function, never ship the key, and ground answers in the issue database (RAG over your own notes), not generic Wikipedia Spider-Man.

---

## 7. Legal & ops

The footer disclaimer is the right idea (unofficial, no hosted Marvel content, not affiliated).

Still watch:

- Cover gallery / hotlinked official art
- Marvel wordmarks in the header at a scale that looks “official”
- Netlify default domain — fine for personal; a custom domain + `noindex` if you want it private

**Engineering hygiene**

- This GitHub workspace is **not** the site source. Put the real project in git (or this repo) so you can review diffs, not a black-box Netlify drop.
- Split **data** (`issues.json`, `collections.json`) from **UI**. Claude-generated monoliths rot the first time you fix one omnibus.
- Add a Netlify `_headers` file: cache static data, don’t cache `index.html` forever if you iterate daily.

---

## Recommended roadmap (do this order)

### Week 1 — Trust the list
- Rebuild the catalog as issues ⊃ collections; kill double-counted Superior / Big Time / Returns rows.
- Fix or remove the four outbound search links.
- Define progress as **issues read** + separate **books owned**.

### Week 2 — Make it usable on a phone
- Cut nav to Read / Collect / Explore / Me.
- Sticky currently-reading + search.
- Covers that actually load (or honest typography-only cards).

### Week 3 — Delight
- Step-by-Step that respects skip-optional flags.
- Export/import + undo.
- Family tree / Web of Destiny only after the list is correct (they’re dessert).

### Later / maybe never
- Accounts, social sharing, AI chat, full Ultimate + 2099 encyclopedias.

---

## Bottom line

You already have a **collector’s brain** encoded in the copy (BND → Big Time → Dying Wish → Superior → Spider-Verse → Geddon is the right spine). The site feels worse than the research behind it because:

1. **the same comic is tracked 2–3 times**,  
2. **covers and store/wiki links don’t resolve**, and  
3. **every side project is a top-level tab**.

Tighten the data model and the home path (“what do I read or buy next?”). Everything else is costume.

If you want a follow-up, the highest-leverage next step is a **corrected `issues.json` + `collections.json`** for BND → Geddon only — I can draft that schema and the first era’s data here even without the original Claude project files.
