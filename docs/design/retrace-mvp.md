# Retrace MVP

Scope of the first release: three commands, one jump panel, one data model.

## Commands

| Command id | Label | Default key | Opens |
| --- | --- | --- | --- |
| `recent-files` | `Retrace: Recent files` | `Ctrl+E` | MRU table of opened markdown files |
| `recent-locations` | `Retrace: Recent locations` | `Ctrl+Shift+E` | MRU table of caret positions |
| `outline-jump` | `Retrace: Outline jump` | `Ctrl+F12` | headings of the active file |

## Jump panel

One modal class renders all three panels; only the item source and the row renderer differ.

- Auto-focused text input at the top, filtering as you type.
- Filter is a case-insensitive subsequence match on the item's search text. No dependency.
- `ArrowUp` / `ArrowDown` move the selection and keep it scrolled into view.
- `Enter` opens the selection in the active leaf; `Ctrl+Enter` opens in a new leaf.
- `Esc` closes.
- Footer shows the match count.

## Data model (`data.json`)

```ts
interface RetraceData {
  version: 1;
  recentFiles: RecentFile[];
  recentLocations: RecentLocation[];
  settings: RetraceSettings;
}

interface RecentFile {
  path: string;
  openedAt: number;   // epoch ms
  openCount: number;
}

interface RecentLocation {
  path: string;
  line: number;       // 0-based
  ch: number;         // 0-based
  headingPath: string; // "Install > Develop", empty at top level
  visitedAt: number;   // epoch ms
}

interface RetraceSettings {
  maxRecentFiles: number;      // default 50
  maxRecentLocations: number;  // default 100
  previewLines: number;        // default 2 (2 above + target + 2 below)
}
```

## Recording

- **Recent files** — on `active-leaf-change`, when the active file is markdown: move its path to the front, bump `openCount`, set `openedAt`. Files that no longer exist are dropped on load.
- **Recent locations** — on editor cursor activity, throttled to one write per second: upsert by `(path, line)`, refreshing `visitedAt`; an entry older than the dedupe window is a new entry. `headingPath` comes from `metadataCache` headings by line.
- Persistence is debounced (2 s) through `saveData`.

## Row rendering

- Recent file: file name, dimmed folder path, right-aligned relative time.
- Every row: leading lucide icon (`file-text` for markdown, `hash` for headings), title, dimmed subtitle, right-aligned meta in tabular numerals.
- Recent file: file name, dimmed folder path, right-aligned relative time.
- Recent location: file name, heading path, right-aligned relative time, then a preview of `previewLines * 2 + 1` lines with a line-number gutter and the target line emphasised.
- Outline entry: indented by heading level, heading text, the chain of ancestor headings as subtitle, right-aligned line number.
- The selected row is a full-bleed bar painted with `var(--interactive-accent)` on `var(--text-on-accent)`, so it follows the active theme instead of fighting a warm palette. Both are read through `--retrace-selection` / `--retrace-selection-text`, which a snippet can override.
- The outline panel preselects and centres the heading that contains the cursor.

Relative time uses `moment(...).fromNow()` from `obsidian`, so it follows the Obsidian locale.

## Decided defaults

- **No "only edited" toggle.** IDEA's checkbox distinguishes modified from merely opened buffers; Obsidian autosaves, so the distinction has no meaning. The typed filter replaces it.
- **No IDEA left rail.** The tool-window list in IDEA's recent-files popup has no Obsidian counterpart.
- **Markdown only.** Non-markdown files are not recorded.

## Out of scope for the first release

- Jump history with back/forward (`Ctrl+Alt+Left/Right`).
- Cross-vault or synced history.
- Symbols other than headings (tags, links, blocks).
- Reordering or pinning entries.

## Open questions

- Whether a settings toggle should restore Obsidian's native `Ctrl+E` on demand.
- Whether the recent-locations preview should render markdown or raw text.
