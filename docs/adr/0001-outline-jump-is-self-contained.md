# Outline jump is self-contained

The `Outline jump` panel reads headings from `app.metadataCache.getFileCache(file).headings` and renders its own centred modal, instead of embedding Quiet Outline's rendered tree.

Quiet Outline is excellent at what it does, but it is a sidebar view with its own state. Our requirement is a centred, searchable modal that opens on a hotkey and closes on `Esc` — a UI Quiet Outline does not offer. Wrapping its DOM would mean depending on another plugin's markup, its release cadence and its enabled/disabled state, and would break silently whenever it changed.

Cost accepted: roughly 200 lines of our own (heading list, indent by level, filter, jump). Benefit: no plugin-to-plugin coupling, and the panel works with Quiet Outline uninstalled.
