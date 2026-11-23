import { App, MarkdownView, TFile, moment } from "obsidian";
import type { JumpItem, PreviewLine } from "./panel";
import type { RetraceData } from "./store";

export function buildFileItems(app: App, data: RetraceData): JumpItem[] {
	const items: JumpItem[] = [];
	for (const entry of data.recentFiles) {
		const file = app.vault.getAbstractFileByPath(entry.path);
		if (!(file instanceof TFile)) {
			continue;
		}
		items.push({
			id: entry.path,
			title: file.basename,
			subtitle: file.parent?.path ?? "/",
			meta: moment(entry.openedAt).fromNow(),
			searchText: entry.path,
			onChoose: (newLeaf) => {
				void openFileAt(app, file, undefined, newLeaf);
			},
		});
	}
	return items;
}

export async function buildLocationItems(
	app: App,
	data: RetraceData
): Promise<JumpItem[]> {
	const items: JumpItem[] = [];
	for (const entry of data.recentLocations) {
		const file = app.vault.getAbstractFileByPath(entry.path);
		if (!(file instanceof TFile)) {
			continue;
		}
		items.push({
			id: `${entry.path}:${entry.line}`,
			title: file.basename,
			subtitle: entry.headingPath,
			meta: moment(entry.visitedAt).fromNow(),
			preview: await readPreview(app, file, entry.line, data.settings.previewLines),
			searchText: `${entry.path} ${entry.headingPath}`,
			onChoose: (newLeaf) => {
				void openFileAt(app, file, entry.line, newLeaf);
			},
		});
	}
	return items;
}

export function buildOutlineItems(app: App): JumpItem[] {
	const file = app.workspace.getActiveFile();
	if (!file) {
		return [];
	}
	const headings = app.metadataCache.getFileCache(file)?.headings ?? [];
	return headings.map((heading) => ({
		id: `heading:${heading.position.start.line}`,
		title: heading.heading,
		indent: Math.max(0, heading.level - 1),
		meta: String(heading.position.start.line + 1),
		searchText: heading.heading,
		onChoose: (newLeaf) => {
			void openFileAt(app, file, heading.position.start.line, newLeaf);
		},
	}));
}

async function openFileAt(
	app: App,
	file: TFile,
	line: number | undefined,
	newLeaf: boolean
): Promise<void> {
	const leaf = newLeaf ? app.workspace.getLeaf("tab") : app.workspace.getLeaf(false);
	await leaf.openFile(file, line === undefined ? {} : { eState: { line } });
	if (line === undefined) {
		return;
	}
	if (leaf.view instanceof MarkdownView) {
		const position = { line, ch: 0 };
		leaf.view.editor.setCursor(position);
		leaf.view.editor.scrollIntoView({ from: position, to: position }, true);
	}
}

async function readPreview(
	app: App,
	file: TFile,
	line: number,
	radius: number
): Promise<PreviewLine[]> {
	const content = await app.vault.cachedRead(file);
	const lines = content.split("\n");
	const start = Math.max(0, line - radius);
	const end = Math.min(lines.length - 1, line + radius);
	const preview: PreviewLine[] = [];
	for (let index = start; index <= end; index++) {
		preview.push({ text: lines[index] ?? "", isTarget: index === line });
	}
	return preview;
}
