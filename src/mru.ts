import type { RecentFile, RecentLocation } from "./model";

/**
 * Edits to the two MRU tables, kept as functions over plain arrays so the
 * ordering rules can be tested without an Obsidian runtime. Every touch moves
 * the entry to the front, so index 0 is always the most recent.
 */

function newest<T>(list: T[], max: number): T[] {
	return list.slice(0, Math.max(0, max));
}

export function touchFileEntry(
	files: RecentFile[],
	path: string,
	now: number,
	max: number
): RecentFile[] {
	const existing = files.find((entry) => entry.path === path);
	const touched: RecentFile = existing
		? { path, openedAt: now, openCount: existing.openCount + 1 }
		: { path, openedAt: now, openCount: 1 };
	const rest = files.filter((entry) => entry.path !== path);
	return newest([touched, ...rest].sort((a, b) => b.openedAt - a.openedAt), max);
}

export function touchLocationEntry(
	locations: RecentLocation[],
	entry: RecentLocation,
	max: number
): RecentLocation[] {
	const rest = locations.filter(
		(existing) => !(existing.path === entry.path && existing.line === entry.line)
	);
	return newest([entry, ...rest].sort((a, b) => b.visitedAt - a.visitedAt), max);
}

/** Drop entries whose file was deleted or renamed while the plugin was off. */
export function pruneByPath<T extends { path: string }>(
	entries: T[],
	exists: (path: string) => boolean
): T[] {
	return entries.filter((entry) => exists(entry.path));
}
