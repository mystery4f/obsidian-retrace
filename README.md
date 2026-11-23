# Retrace

An Obsidian plugin that brings IntelliJ IDEA's jump shortcuts to your vault.

| Command | Default hotkey | IDEA equivalent |
| --- | --- | --- |
| `Retrace: Recent files` | `Ctrl+E` | Recent Files |
| `Retrace: Recent locations` | `Ctrl+Shift+E` | Recent Locations |
| `Retrace: Outline jump` | `Ctrl+F12` | File Structure |

Every panel is the same centred modal: type to filter, arrow keys to move, `Enter` to jump.

## What each panel shows

- **Recent files** — markdown files you opened, most recent first, with a relative timestamp.
- **Recent locations** — caret positions you visited: file, heading path, relative time and a short preview of the lines around the target.
- **Outline jump** — the heading tree of the active file, indented by level, filterable.

## Install

Until the plugin is listed in the community directory, copy `manifest.json`, `main.js` and `styles.css` into `<vault>/.obsidian/plugins/retrace/` and enable it in Settings → Community plugins.

## Develop

```bash
npm install
npm run dev     # watch build into main.js
npm run build   # typecheck + production bundle
```

`main.js` is a build artefact and is not committed.

## Keybindings

The plugin ships the three defaults above. `Ctrl+E` also toggles reading view in Obsidian, so rebind whichever of the two you prefer in Settings → Hotkeys.

## License

MIT
