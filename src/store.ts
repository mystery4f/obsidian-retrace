import { App, TFile } from "obsidian";
import { headingChainAt } from "./headings";
import type { RecentLocation, RetraceData } from "./model";
import { pruneByPath, touchFileEntry, touchLocationEntry } from "./mru";

/**
 * The MRU tables behind both history panels, bound to the live vault: it reads
 * headings for a location and asks the vault whether a recorded file still
 * exists. The ordering rules themselves live in `mru.ts`.
 */
export class MruStore {
	constructor(
		private app: App,
		private data: RetraceData,
		private onChange: () => void
	) {}

	touchFile(file: TFile): void {
		this.data.recentFiles = touchFileEntry(
			this.data.recentFiles,
			file.path,
			Date.now(),
			this.data.settings.maxRecentFiles
		);
		this.onChange();
	}

	touchLocation(file: TFile, line: number, ch: number): void {
		const headings = this.app.metadataCache.getFileCache(file)?.headings ?? [];
		const entry: RecentLocation = {
			path: file.path,
			line,
			ch,
			headingPath: headingChainAt(headings, line).join(" > "),
			visitedAt: Date.now(),
		};
		this.data.recentLocations = touchLocationEntry(
			this.data.recentLocations,
			entry,
			this.data.settings.maxRecentLocations
		);
		this.onChange();
	}

	/** Drop entries whose file was deleted or renamed while the plugin was off. */
	pruneMissing(): void {
		const exists = (path: string) => this.app.vault.getAbstractFileByPath(path) !== null;
		const files = pruneByPath(this.data.recentFiles, exists);
		const locations = pruneByPath(this.data.recentLocations, exists);
		if (
			files.length === this.data.recentFiles.length &&
			locations.length === this.data.recentLocations.length
		) {
			return;
		}
		this.data.recentFiles = files;
		this.data.recentLocations = locations;
		this.onChange();
	}
}
