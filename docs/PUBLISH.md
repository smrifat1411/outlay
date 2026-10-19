# Publish Outlay

Everything below is prepared and validated. Publishing itself is two human actions: pushing this
repository, and opening a pull request to the Blends registry (the registry's own CI does the rest).

## 0. What is ready

| Piece | Where | State |
| --- | --- | --- |
| App, runnable | this repository | works; `bin/acryl web` |
| Shareable by git | `https://github.com/smrifat1411/outlay` | public, MIT |
| Registry entry | `registry/blends/smrifat1411.outlay/` | `blends-validate` passes |
| Index entry to add | `registry/index.json` snippet below | prepared |
| App definition | `blend.yaml` | `blends-validate` passes |

The Blends registry vendors a starter's plugin **source**; a published starter does **not** need the
plugin on npm. (The npm name `outlay` is taken by an unrelated package, so npm publishing is only
relevant for the separate plugin marketplace — see step 2.)

## 1. Push the app

The repository is the app's home; the registry entry and the git share link both point at it.

```bash
git push
```

Check: <https://github.com/smrifat1411/outlay> shows the latest commit
`Redesign the dashboard as a modern app shell`.

## 2. Optional: the plugin marketplace (npm)

Skip this to be listed in the Blends registry. The plugin marketplace lists Cordis plugins from npm;
for that, the plugin package needs a free name and catalog metadata:

- `"name"`: `outlay` is taken on npm, so use a scope you own, for example `@smrifat1411/outlay`
  (the plugin row id stays `outlay`, so the app keeps working);
- remove `"private": true` from `plugins/outlay/package.json`;
- add `"keywords": ["acryl-package"]`, a `repository` pointing at this repo, and
  `"publishConfig": { "access": "public" }`;
- then check it (`acryl_prepare_publish` in an ACRYL session, or `npm pack --dry-run`) and run
  `npm publish --access public` from `plugins/outlay` with your own npm login.

Do not paste npm tokens in a chat or commit them.

## 3. The Blends registry pull request (opened)

**Done:** fork `smrifat1411/acrylblends.github.io`, branch `add-outlay`, PR
<https://github.com/acrylblends/acrylblends.github.io/pull/5> — open, awaiting review. It was
opened at 0.2.0; before pushing a newer version, bump `version` in the entry's `index.json`
object below and in the entry's `blend.yaml` (the registry CI fails on a stale index). The steps
below are how to repeat it for a new version.

The registry lives in [acrylblends/acrylblends.github.io](https://github.com/acrylblends/acrylblends.github.io).
Its `registry/README.md` is the authority; this is the step-by-step for this entry.

```bash
# 1. Fork acrylblends/acrylblends.github.io on GitHub, then:
git clone https://github.com/<you>/acrylblends.github.io
cd acrylblends.github.io
git checkout -b add-outlay

# 2. Copy the prepared entry (from this repo) into the registry:
cp -R "/Users/rifat/Desktop/untitled folder/outlay/registry/blends/smrifat1411.outlay" registry/blends/

# 3. Add the entry to registry/index.json, keeping the list sorted by id:
#    (append this object after "acryl.organizer")
```

```json
    {
      "id": "smrifat1411.outlay",
      "name": "Outlay",
      "kind": "Blueprint",
      "version": "0.4.0",
      "path": "blends/smrifat1411.outlay",
      "license": "MIT",
      "category": "finance",
      "description": "Say what you spent; the agent writes it down. A modern dashboard: today, this week and this month, per category, against monthly budgets, with recurring rules that post themselves and CSV export.",
      "parent": "acryl.blank"
    }
```

```bash
# 4. Optional local checks (CI runs the same validation):
npm_config_cache=/tmp/npm-cache npx --yes --package @webboxes/blends-core@0.1 \
  blends-validate registry/blends/smrifat1411.outlay/blend.yaml

# 5. Commit and open the pull request:
git add registry/blends/smrifat1411.outlay registry/index.json
git commit -m "Add smrifat1411.outlay (Outlay): expense books an agent keeps"
git push -u origin add-outlay
```

PR title: `Add smrifat1411.outlay (Outlay)`.
PR body: what it is, the pull command, and that it was validated with `blends-validate`.
The registry CI validates the entry and fails if `index.json` is stale; when it merges, the site
deploys from `main`.

## 4. After it is listed

Anyone can then start from it:

```bash
acryl new my-expenses --from smrifat1411.outlay
my-expenses/bin/acryl web
```

Until then, the same works from git, with no registry at all:

```bash
acryl new my-expenses --from https://github.com/smrifat1411/outlay
```

## 5. Bumping a published version

1. Change the app (`plugins/outlay/...`), bump `version` in `plugins/outlay/package.json`,
   `blend.yaml` and the registry entry's `metadata.version`.
2. Run `node scripts/sync-registry.mjs` (copies the source, syncs the entry's version).
3. Push this repo; in the registry repository bump the entry's `version` in `index.json` (and the
   entry YAML if the sync did not run) in a small pull request.
