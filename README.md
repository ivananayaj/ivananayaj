# Spidey Reading Tracker (v2 prototype)

Interactive rebuild of [spidey-reading-tracker.netlify.app](https://spidey-reading-tracker.netlify.app/).

- Click around: `app/index.html` (served from the repo root so `data/catalog.json` loads).
- Agent contract: `CLAUDE.md`
- Full diagnostic: `COMPLETE-IMPROVEMENT-PLAYBOOK.md`

```bash
python3 scripts/build_catalog.py
python3 scripts/audit.py
python3 -m http.server 8080 --bind 0.0.0.0
# open /app/
```
