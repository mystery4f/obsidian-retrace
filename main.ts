import { MarkdownView, Notice, Plugin, TFile } from "obsidian";
import {
	buildFileItems,
	buildLocationItems,
	buildOpenFileItems,
	buildOutlineItems,
	headingLineAt,
	lineAtTopOfPreview,
} from "./src/items";
import { JumpPanel } from "./src/panel";
import { RetraceSettingTab } from "./src/settings";
import { RetraceData, defaultData } from "./src/model";
import { MruStore } from "./src/store";

const SAVE_DELAY_MS = 2000;

export default class RetracePlugin extends Plugin {
	data: RetraceData;
	store: MruStore;

	private saveTimer: number | null = null;
	private lastPositionKey = "";

	async onload(): Promise<void> {
		const loaded = (await this.loadData()) as Partial<RetraceData> | null;
		const base = defaultData();
		this.data = {
			version: base.version,
			recentFiles: loaded?.recentFiles ?? base.recentFiles,
			recentLocations: loaded?.recentLocations ?? base.recentLocations,
			settings: Object.assign({}, base.settings, loaded?.settings ?? {}),
		};

		this.store = new MruStore(this.app, this.data, () => this.scheduleSave());
		this.store.pruneMissing();

		this.addSettingTab(new RetraceSettingTab(this.app, this));
		this.registerCommands();
		this.registerRecording();
	}

	onunload(): void {
		if (this.saveTimer !== null) {
			window.clearTimeout(this.saveTimer);
			this.saveTimer = null;
			void this.saveData(this.data);
		}
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.data);
	}

	private registerCommands(): void {
		this.addCommand({
			id: "recent-files",
			name: "Recent files",
			hotkeys: [{ modifiers: ["Mod"], key: "E" }],
			callback: () => this.openRecentFiles(),
		});
		this.addCommand({
			id: "recent-locations",
			name: "Recent locations",
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "E" }],
			callback: () => void this.openRecentLocations(),
		});
		this.addCommand({
			id: "outline-jump",
			name: "Outline jump",
			hotkeys: [{ modifiers: ["Mod"], key: "F12" }],
			callback: () => this.openOutline(),
		});
	}

	private registerRecording(): void {
		this.registerEvent(
			this.app.workspace.on("file-open", (file) => {
				if (file instanceof TFile && file.extension === "md") {
					this.store.touchFile(file);
				}
			})
		);
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => this.recordCursor())
		);
		// Obsidian fires editor-change for document edits only; polling is the
		// portable way to observe a caret that moves without typing.
		this.registerInterval(window.setInterval(() => this.recordCursor(), 1000));
	}

	private recordCursor(): void {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const file = view?.file;
		if (!view || !file) {
			return;
		}
		const cursor = view.editor.getCursor();
		const key = `${file.path}:${cursor.line}`;
		if (key === this.lastPositionKey) {
			return;
		}
		this.lastPositionKey = key;
		this.store.touchLocation(file, cursor.line, cursor.ch);
	}

	private openRecentFiles(): void {
		const items = buildFileItems(this.app, this.data);
		if (items.length === 0) {
			new Notice("Retrace: no recent files yet.");
			return;
		}
		new JumpPanel(this.app, {
			views: [
				{ title: "Recent files", placeholder: "Filter recent files…", items },
				{ title: "Open editors", placeholder: "Filter open editors…", items: buildOpenFileItems(this.app) },
			],
		}).open();
	}

	private async openRecentLocations(): Promise<void> {
		const items = await buildLocationItems(this.app, this.data);
		if (items.length === 0) {
			new Notice("Retrace: no recent locations yet.");
			return;
		}
		new JumpPanel(this.app, {
			views: [{ title: "Recent locations", placeholder: "Filter recent locations…", items }],
		}).open();
	}

	private openOutline(): void {
		const items = buildOutlineItems(this.app);
		if (items.length === 0) {
			new Notice("Retrace: the active file has no headings.");
			return;
		}
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const cursorLine = this.lineOf(view);
		const headingLine =
			view?.file && cursorLine !== null ? headingLineAt(this.app, view.file, cursorLine) : null;
		const initialSelectionId = headingLine === null ? undefined : `heading:${headingLine}`;
		new JumpPanel(this.app, {
			views: [{ title: "Outline", placeholder: "Filter headings…", items }],
			initialSelectionId,
		}).open();
	}

	/** Reading mode keeps no caret, so the same jump follows the top of the pane. */
	private lineOf(view: MarkdownView | null): number | null {
		if (!view) {
			return null;
		}
		if (view.getMode() === "preview") {
			return lineAtTopOfPreview(this.app, view);
		}
		return view.editor.getCursor().line;
	}

	private scheduleSave(): void {
		if (this.saveTimer !== null) {
			window.clearTimeout(this.saveTimer);
		}
		this.saveTimer = window.setTimeout(() => {
			this.saveTimer = null;
			void this.saveData(this.data);
		}, SAVE_DELAY_MS);
	}
}
