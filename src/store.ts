import { App, TFile } from "obsidian";

export const DATA_VERSION = 1;

export interface RecentFile {
	path: string;
	openedAt: number;
	openCount: number;
}

export interface RecentLocation {
	path: string;
	line: number;
	ch: number;
	headingPath: string;
	visitedAt: number;
}

export interface RetraceSettings {
	maxRecentFiles: number;
	maxRecentLocations: number;
	previewLines: number;
}

export interface RetraceData {
	version: number;
	recentFiles: RecentFile[];
	recentLocations: RecentLocation[];
	settings: RetraceSettings;
}

export const DEFAULT_SETTINGS: RetraceSettings = {
	maxRecentFiles: 50,
	maxRecentLocations: 100,
	previewLines: 1,
};

export function defaultData(): RetraceData {
	return {
		version: DATA_VERSION,
		recentFiles: [],
		recentLocations: [],
		settings: { ...DEFAULT_SETTINGS },
	};
}

/**
 * The MRU tables behind both history panels. Every touch moves the entry to the
 * front, so index 0 is always the most recent.
 */
export class MruStore {
	constructor(
		private app: App,
		private data: RetraceData,
		private onChange: () => void
	) {}

	touchFile(file: TFile): void {
		const now = Date.now();
		const existing = this.data.recentFiles.find((entry) => entry.path === file.path);
		if (existing) {
			existing.openedAt = now;
			existing.openCount += 1;
		} else {
			this.data.recentFiles.push({
				path: file.path,
				openedAt: now,
				openCount: 1,
			});
		}
		this.data.recentFiles.sort((a, b) => b.openedAt - a.openedAt);
		this.cap(this.data.recentFiles, this.data.settings.maxRecentFiles);
		this.onChange();
	}

	touchLocation(file: TFile, line: number, ch: number): void {
		const now = Date.now();
		const headingPath = this.headingPathAt(file, line);
		const existing = this.data.recentLocations.find(
			(entry) => entry.path === file.path && entry.line === line
		);
		if (existing) {
			existing.ch = ch;
			existing.visitedAt = now;
			existing.headingPath = headingPath;
		} else {
			this.data.recentLocations.push({
				path: file.path,
				line,
				ch,
				headingPath,
				visitedAt: now,
			});
		}
		this.data.recentLocations.sort((a, b) => b.visitedAt - a.visitedAt);
		this.cap(this.data.recentLocations, this.data.settings.maxRecentLocations);
		this.onChange();
	}

	/** Drop entries whose file was deleted or renamed while the plugin was off. */
	pruneMissing(): void {
		const exists = (path: string) => this.app.vault.getAbstractFileByPath(path) !== null;
		const filesBefore = this.data.recentFiles.length;
		const locationsBefore = this.data.recentLocations.length;
		this.data.recentFiles = this.data.recentFiles.filter((entry) => exists(entry.path));
		this.data.recentLocations = this.data.recentLocations.filter((entry) => exists(entry.path));
		if (
			filesBefore !== this.data.recentFiles.length ||
			locationsBefore !== this.data.recentLocations.length
		) {
			this.onChange();
		}
	}

	private cap<T>(list: T[], max: number): void {
		if (list.length > max) {
			list.length = Math.max(0, max);
		}
	}

	/** "Install > Develop": the chain of headings above the given line. */
	private headingPathAt(file: TFile, line: number): string {
		const headings = this.app.metadataCache.getFileCache(file)?.headings ?? [];
		const chain: string[] = [];
		for (const heading of headings) {
			if (heading.position.start.line > line) {
				break;
			}
			chain.length = heading.level - 1;
			chain[heading.level - 1] = heading.heading;
		}
		return chain.filter((entry) => Boolean(entry)).join(" > ");
	}
}
