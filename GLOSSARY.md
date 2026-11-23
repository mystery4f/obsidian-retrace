# Retrace

A jump panel for Obsidian: three ways to get back to a place you were already at.

## Language

**Jump panel**:
The single centred modal that lists entries, filters them by the typed text and opens the chosen one.
_Avoid_: Picker, palette, quick switcher, popup

**Recent file**:
A markdown file the user has opened, tracked with the time it was last opened and how often it was opened.
_Avoid_: Last file, history file, MRU item

**Recent location**:
A caret position inside a markdown file — file, line, column and the heading path it sits under — tracked with the time it was last visited.
_Avoid_: Bookmark, jump point, cursor history

**Heading path**:
The chain of headings above a line, e.g. `Install > Develop`, used as the breadcrumb of a recent location.
_Avoid_: Outline path, breadcrumb, section

**Outline entry**:
A heading of the active file with its level, text and line number, as returned by Obsidian's metadata cache.
_Avoid_: Symbol, TOC item, node

**MRU table**:
The move-to-front ordered list backing the recent files and recent locations panels.
_Avoid_: History, cache, store

**Open editor**:
A file that has a tab open right now, whichever tab and pane it sits in.
_Avoid_: Opened file, live file, active file
