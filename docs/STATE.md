# Outlay — state of the app

A handoff note for whoever (or whatever agent) picks this up next. Keep it short and true.

## What it is

**Outlay** is an ACRYL Blends app: expense books an agent keeps for you. You say what you
spent, the agent writes it down; the dashboard is the app's front door and the assistant is
one floating button away. Grown from the `acryl.blank` Blueprint.

- Repo: <https://github.com/smrifat1411/outlay> (public, MIT)
- Pull a copy: `acryl new my-books --from https://github.com/smrifat1411/outlay`

## Layout

| Path | What |
| --- | --- |
| `blend.yaml` | the app's definition: id `app.outlay`, brand, lineage `acryl.blank`, the plugin rows |
| `plugins/outlay/index.js` | host half: tools + HTTP routes + the data file |
| `plugins/outlay/client.js` | browser half, no build step: dashboard, sidebar icon, floating assistant button |
| `plugins/outlay/cordis.patch.yml` | how the plugin row is inserted, and `currency: "$"` |
| `data/outlay.jsonl` | the books (one JSON object per line, git-ignored, the user's own data) |
| `data/outlay.categories.json` | categories the user or the agent added (git-ignored) |
| `data/outlay.budgets.json` | monthly budget per category, e.g. `{ "food": 300 }` (git-ignored) |
| `AGENTS.md` | the conventions the in-app builder agent follows |

## Run it

```bash
bin/acryl web      # serves the app on its own port and prints a tokenized URL
```

`bin/acryl` hands off to the framework launcher recorded when the app was created
(`scripts/blank.mjs` in the ACRYL checkout). Without that checkout, start it from the
checkout instead: `node scripts/blank.mjs web --dir <this folder> --port <n>`.

The launcher writes a run lock under `~/.acryl-instances/`, so it needs write access there.

## Model

One expense entry:

```json
{ "id": "uuid", "ts": "ISO date", "amount": 12.5, "note": "taxi to office", "category": "travel" }
```

- Append-only writes for adds; a full rewrite only on update/delete (single-user app).
- Amounts are positive numbers, rounded to 2 decimals; notes are capped at 200 characters.
- Categories are data, not code: `DEFAULT_CATEGORIES` plus whatever was added at runtime.
  Defaults cannot be removed.
- Totals: today, this week (from Monday), this month, all time; per category; last seven days.
- A **budget** is one positive amount per category per month: `{ "food": 300, "travel": 100 }`.
  The view joins it to what this calendar month spent, adding `spent`, `remaining` and `pct`
  per budgeted category. Setting an amount of 0 (or removing it) clears that budget.

## Tools the agent can call

`outlay_add`, `outlay_list` (shows ids and categories), `outlay_update`, `outlay_remove`,
`outlay_categories` (`list` / `add` / `remove`), `outlay_budget` (`list` / `set` / `remove`).

## HTTP routes used by the dashboard

| Route | Method | Does |
| --- | --- | --- |
| `/api/outlay/entries` | GET | the whole view: currency, categories, entries, totals, byCategory, budgets, days |
| `/api/outlay/entries` | POST | add one entry |
| `/api/outlay/update` | POST | patch one entry by id (amount, note, category, ts) |
| `/api/outlay/delete` | POST | delete one entry by id |
| `/api/outlay/category` | POST | add a category (`name`) or remove one (`remove`) |
| `/api/outlay/budget` | POST | set a monthly budget (`category`, `amount`) or remove one (`remove`) |
| `/api/outlay/export.csv` | GET | every entry as CSV (`id,date,time,amount,category,note`), oldest first |

Every mutation answers with the same whole view, so the UI never has to guess.

## UI today

Sticky top bar (name, tagline, month, currency, CSV download, refresh) → four KPI cards →
quick-add form → last-7-days bars + category donut → **Budgets** card (a bar per budgeted
category, green/amber/red by `pct`, amount editable in place, remove, and a "set a budget"
form for categories without one) → filter toolbar (search, category, period) → entries
grouped by day with inline edit and delete. A floating **Ask** button opens the assistant;
the dashboard itself is registered as the `main` panel key `outlay` and the icon in
`sidebar.panellist`, so the conversation stays optional.

## Known gaps / next steps

- The floating button *opens* the assistant; it does not embed the chat. A truly docked chat needs
  the Electron advanced shell (`acryl-app-shell`, right column), not the Web upstream slots.
- No recurring expenses or multi-currency. Removing a category leaves its budget behind (the
  budget card then shows it with 0 spent); remove that budget separately.
- No tests. The API was verified by hand and by a throwaway harness (GET, POST, update, delete,
  category, budget set/remove/validation, CSV).
- Not listed in the official Blends registry yet: that needs the plugin published to npm and
  a `registry/blends/app.outlay/blend.yaml` pull request to `acrylblends.github.io`.
