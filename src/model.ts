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
