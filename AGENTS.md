# AGENTS.md

## What this repo is

Retrace — an Obsidian plugin that brings IntelliJ IDEA's jump shortcuts to the vault: recent files, recent locations, and outline jump.

## Stack

- TypeScript, bundled by esbuild into `main.js`
- Obsidian plugin API (the `obsidian` package supplies types only)
- npm, dependencies installed from the domestic mirror

## Commands

- `npm install`
- `npm run dev` — watch build into `main.js`
- `npm run build` — typecheck + production bundle
- `npm run typecheck` — types only
- `npm test` — unit tests for the modules that carry no Obsidian import

## Layout

- `main.ts` — plugin entry: commands, event recording, debounced persistence
- `src/store.ts` — the MRU store bound to the vault; the ordering rules live in `src/mru.ts`
- `src/model.ts` — data shapes, defaults, `defaultData()`
- `src/mru.ts` — pure MRU table edits: touch, cap, prune
- `src/headings.ts` — pure heading chain and current-heading helpers
- `src/fuzzy.ts` — the subsequence filter behind the panel's typing
- `test/` — `node:test` suites for those pure modules
- `src/tabs.ts` — which open files the history has not recorded yet
- `src/panel.ts` — the single jump panel modal shared by all three commands
- `src/items.ts` — turns stored data into panel items, and opens files at a line
- `src/settings.ts` — settings tab
- `docs/design/retrace-mvp.md` — the spec this code implements
- `docs/adr/` — decisions and the reasons behind them
- `GLOSSARY.md` — project vocabulary

## Conventions

- Tab indentation in `.ts`, two spaces in JSON / Markdown / CSS (see `.editorconfig`)
- LF endings, enforced by `.gitattributes`
- Read `GLOSSARY.md` before naming a concept; use its terms, not synonyms
- Read the ADRs before changing the panel architecture or the data store
- Pure logic (MRU ordering, heading chains, filtering) stays in modules with no `obsidian` import, so `npm test` can run it
- `main.js` is generated; never commit it

## Agent skills

### Issue tracker

Issues live in GitHub Issues of `mystery4f/obsidian-retrace`, driven by the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles use their default label names. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
