import type { RecentFile } from "./model";

/**
 * Open files the history has never recorded, in tab order. They carry no
 * timestamp of their own, so the recent-files panel lists them above the
 * history rather than inventing one.
 */
export function unknownOpenPaths(files: RecentFile[], openPaths: string[]): string[] {
	const known = new Set(files.map((entry) => entry.path));
	return openPaths.filter((path) => !known.has(path));
}
