# Agent brief — Spidey Reading Tracker v2

Read this before changing anything. The live Netlify site (`spidey-reading-tracker.netlify.app`) was a one-shot Claude monolith. **This repo is the v2 source.** Do not paste facts into HTML.

## What this product is

A personal **read + own** tracker for Amazing Spider-Man **Brand New Day → Spider-Geddon**.

One question per session: **what do I read or buy tonight?**

## Hard rules

1. Progress **issues read** = `user.readIssueIds.length / catalog.issues.length`. Never count collections as issues.
2. Progress **books owned** = owned collections whose `type !== "gap"`.
3. **One issue, one READ.** If two books contain the same issue, the UI still has one Read button.
4. **OWN lives on collections.** Gaps cannot be owned.
5. **No outbound URL built from a concatenated title.** Store `links.gcd` etc. on the collection.
6. **Nav is only** Read / Collect / Explore / Me.
7. **AI cannot invent an issue** that is not in `data/issues.json`. Prefer the deterministic Tonight panel.
8. Spoiler blurbs (`spoiler: true`) stay veiled until the user reveals them or marks the issue read.
9. Do not rewrite `data/*.json` and `app/*` in the same change unless you are adding a single issue end-to-end.
10. After any catalog edit, run `python3 scripts/build_catalog.py` if you changed the generator, then `python3 scripts/audit.py`.

## Layout

```
data/catalog.json       # generated bundle the app loads
data/issues.json
data/collections.json
scripts/build_catalog.py
scripts/audit.py
app/                    # UI only
CLAUDE.md               # this file
COMPLETE-IMPROVEMENT-PLAYBOOK.md
```

## How to update the *live* Netlify site

This prototype is not automatically the Netlify site. To ship:

1. Replace the Netlify publish directory with `app/` **and** `data/` (site must be able to `fetch('../data/catalog.json')` or copy `catalog.json` next to `index.html` and point the fetch there).
2. Do not upload the old single-file tracker on top of this.
3. Keep the unofficial disclaimer.

## If you are Claude / another agent asked to “make it better”

- First run the audit. Fix catalog errors before CSS.
- Do not add tabs.
- Do not add an AI companion in the primary nav.
- Do not hotlink Marvel cover art.
- Keep tap targets ≥ 44px.
- Export/import must keep `schemaVersion: 1` or bump it with a migrator.

## Definition of done

See `COMPLETE-IMPROVEMENT-PLAYBOOK.md` section F.
