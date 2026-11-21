# Leonida Ledger — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/iwan0494/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/iwan0494/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI:
the official list with a cited guide for every trophy, a roadmap to the platinum,
and the one missable trophy flagged — in a single page that works with the network off.

## What it does

- **Checklist of all 55 trophies** — official name, description and grade for each
  (1 platinum, 2 gold, 6 silver, 46 bronze), with progress saved in the browser.
- **A guide for every trophy, in this ledger's own words** — what to do, where and how,
  and when it can be missed — each naming the published guide its facts were checked
  against (PowerPyx, PushSquare, KeenGamer).
- **Roadmap to the platinum** — four stages built from the official descriptions:
  the story (60–80 hours), strangers and side stories, 100% Completion, then the
  cleanup grinds. About 200 hours in total, difficulty 4/10, one playthrough, no
  online trophies.
- **Missables flagged** — only one trophy can be missed: Positive Mental Attitude
  (the Chapter 1 meditation). The guide says exactly when, and what save to keep.
- **Tracker** — tick trophies off, with a progress ring and per-grade counts;
  export progress to a file and import it back; filter by grade, kind
  (story, missable, collectibles, activities, milestones) and status; search;
  a spoiler setting that hides story trophies' names and descriptions until earned.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network: the page loads only
its own files (system fonts, no external assets).

## Layout

- `main.ts` — the entry program: copies `app/` and `screenshots/` to the output
  directory and writes `dossier.json` with the vendored make.fun library.
- `app/index.html`, `app/style.css` — the guide's page and its paper-ledger look.
- `app/js/` — one job per file: `store.js` (saved progress, export/import),
  `filters.js` (grade/kind/search filters and the spoiler rule), `roadmap.js`
  (the four platinum stages), `detail.js` (the guide pane), `app.js` (boot and wiring).
- `app/data/trophies.json` — the official 55 trophies with their guides.
- `screenshots/` — four real renders of the guide (see `shots.json`):
  the checklist with the missable trophy's guide open, the roadmap to the
  platinum, the missables page, and a silver-filtered detail view.

An unofficial fan guide. Not affiliated with Rockstar Games or Sony Interactive
Entertainment. No official artwork or logos are used.
