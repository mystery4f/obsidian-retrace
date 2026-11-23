# Ship default keybindings that shadow the native Ctrl+E

All three commands are registered with a default hotkey (`Ctrl+E`, `Ctrl+Shift+E`, `Ctrl+F12`), even though `Ctrl+E` is already Obsidian's "toggle reading view".

The point of the plugin is that muscle memory from IDEA works on install. A plugin that registers commands but no keys forces every user to open Settings → Hotkeys three times before it does anything, which defeats the purpose. Obsidian lets the user rebind either side, so the conflict is visible and fixable rather than destructive — the user decides which of the two commands owns `Ctrl+E`.

Accepted consequence: on a fresh install, `Ctrl+E` no longer toggles reading view. This is documented in the README and surfaced in the plugin settings tab.
