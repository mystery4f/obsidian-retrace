# Own MRU store instead of workspace.getLastOpenFiles

`Recent files` and `Recent locations` are backed by our own move-to-front table persisted in the plugin's `data.json`, not by `app.workspace.getLastOpenFiles()`.

The native list is a convenience array with three limits we cannot accept: it holds no timestamps, so it cannot be sorted by "when did I open this"; its length is fixed by Obsidian, so it cannot be configured; and it is rebuilt from the workspace, so it does not survive a restart in the way a history should.

Cost accepted: we own persistence, dedupe, capping and migration. Benefit: configurable length, stable ordering across restarts, and one data model shared by both panels.
