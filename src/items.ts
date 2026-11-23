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
			icon: "file-text",
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
			icon: "file-text",
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
	const chain: string[] = [];
	return headings.map((heading) => {
		chain.length = heading.level - 1;
		chain[heading.level - 1] = heading.heading;
		const parents = chain
			.slice(0, Math.max(0, heading.level - 1))
			.filter((entry) => Boolean(entry));
		const line = heading.position.start.line;
		return {
			id: `heading:${line}`,
			icon: "hash",
			title: heading.heading,
			subtitle: parents.length > 0 ? parents.join(" › ") : undefined,
			indent: Math.max(0, heading.level - 1),
			meta: String(line + 1),
			searchText: [...parents, heading.heading].join(" "),
			onChoose: (newLeaf: boolean) => {
				void openFileAt(app, file, line, newLeaf);
			},
		};
	});
}

/** Line of the last heading at or above `line`, for preselecting the outline. */
export function headingLineAt(app: App, file: TFile, line: number): number | null {
	const headings = app.metadataCache.getFileCache(file)?.headings ?? [];
	let found: number | null = null;
	for (const heading of headings) {
		if (heading.position.start.line > line) {
			break;
		}
		found = heading.position.start.line;
	}
	return found;
}

const HEADING_NUMBER_PREFIX = /^[\s\d.、，（）()]+/;

function normalizeHeadingText(text: string): string {
	return text.replace(HEADING_NUMBER_PREFIX, "").trim();
}

/**
 * Reading mode has no caret, so the section at the top of the pane decides
 * which heading is current. Preview headings map back to cache headings by
 * level and text in document order: duplicate names stay apart, and headings
 * of embedded notes are skipped because they belong to another file.
 */
export function lineAtTopOfPreview(app: App, view: MarkdownView): number | null {
	const file = view.file;
	if (!file) {
		return null;
	}
	const headings = app.metadataCache.getFileCache(file)?.headings ?? [];
	const scroller = view.previewMode.containerEl;
	const elements = Array.from(
		scroller.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6")
	).filter((element) => element.closest(".markdown-embed") === null);
	if (headings.length === 0 || elements.length === 0) {
		return null;
	}

	const lines: (number | null)[] = [];
	let searchFrom = 0;
	for (const element of elements) {
		const level = Number(element.tagName.slice(1));
		const text = normalizeHeadingText(
			element.getAttribute("data-heading") ?? element.textContent ?? ""
		);
		let line: number | null = null;
		for (let index = searchFrom; index < headings.length; index++) {
			const heading = headings[index];
			if (heading.level === level && normalizeHeadingText(heading.heading) === text) {
				line = heading.position.start.line;
				searchFrom = index + 1;
				break;
			}
		}
		lines.push(line);
	}

	const fold = scroller.getBoundingClientRect().top + 8;
	let current: number | null = null;
	for (let index = 0; index < elements.length; index++) {
		if (elements[index].getBoundingClientRect().top > fold) {
			break;
		}
		if (lines[index] !== null) {
			current = lines[index];
		}
	}
	if (current !== null) {
		return current;
	}
	return lines.find((line) => line !== null) ?? null;
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
		preview.push({ lineNo: index + 1, text: lines[index] ?? "", isTarget: index === line });
	}
	return preview;
}
