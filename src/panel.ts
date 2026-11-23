import { App, Modal, setIcon } from "obsidian";

export interface PreviewLine {
	/** 1-based line number as shown in the gutter. */
	lineNo: number;
	text: string;
	isTarget: boolean;
}

export interface JumpItem {
	id: string;
	icon?: string;
	title: string;
	subtitle?: string;
	meta?: string;
	/** Extra levels of indentation, used by the outline panel. */
	indent?: number;
	preview?: PreviewLine[];
	/** What the typed filter runs against. */
	searchText: string;
	onChoose(newLeaf: boolean): void;
}

export interface JumpPanelOptions {
	title: string;
	placeholder: string;
	items: JumpItem[];
}

const BASE_PADDING_LEFT = 10;
const INDENT_STEP = 14;

/**
 * One modal for all three commands: a title, a filter box, a list, and the
 * keyboard contract of IDEA's popups.
 */
export class JumpPanel extends Modal {
	private readonly panelTitle: string;
	private readonly placeholder: string;
	private readonly items: JumpItem[];
	private filtered: JumpItem[];
	private selected = 0;
	private listEl: HTMLElement;
	private inputEl: HTMLInputElement;
	private footerEl: HTMLElement;

	constructor(app: App, options: JumpPanelOptions) {
		super(app);
		this.panelTitle = options.title;
		this.placeholder = options.placeholder;
		this.items = options.items;
		this.filtered = options.items;
	}

	onOpen(): void {
		this.modalEl.addClass("retrace-modal");
		this.titleEl.setText(`${this.panelTitle} (${this.items.length})`);
		const { contentEl } = this;

		this.inputEl = contentEl.createEl("input", {
			type: "text",
			cls: "retrace-input",
			attr: { placeholder: this.placeholder },
		});
		this.listEl = contentEl.createDiv("retrace-list");
		this.footerEl = contentEl.createDiv("retrace-footer");

		this.inputEl.addEventListener("input", () => {
			this.selected = 0;
			this.render();
		});
		this.inputEl.addEventListener("keydown", (event) => this.onKeyDown(event));

		this.render();
		this.inputEl.focus();
	}

	onClose(): void {
		this.contentEl.empty();
	}

	private onKeyDown(event: KeyboardEvent): void {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			this.move(1);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			this.move(-1);
		} else if (event.key === "Enter") {
			event.preventDefault();
			this.choose(event.ctrlKey || event.metaKey);
		} else if (event.key === "Escape") {
			event.preventDefault();
			this.close();
		}
	}

	private move(delta: number): void {
		if (this.filtered.length === 0) {
			return;
		}
		this.selected = (this.selected + delta + this.filtered.length) % this.filtered.length;
		this.renderList();
		this.scrollSelectionIntoView();
	}

	private choose(newLeaf: boolean): void {
		const item = this.filtered[this.selected];
		if (!item) {
			return;
		}
		this.close();
		item.onChoose(newLeaf);
	}

	private render(): void {
		const query = this.inputEl.value.trim();
		this.filtered = this.items.filter((item) => matchesSubsequence(item.searchText, query));
		if (this.selected >= this.filtered.length) {
			this.selected = Math.max(0, this.filtered.length - 1);
		}
		this.renderList();
		this.footerEl.setText(`${this.filtered.length} / ${this.items.length}`);
	}

	private renderList(): void {
		this.listEl.empty();
		if (this.filtered.length === 0) {
			this.listEl.createDiv({ cls: "retrace-empty", text: "No match" });
			return;
		}
		this.filtered.forEach((item, index) => {
			const row = this.listEl.createDiv({
				cls: index === this.selected ? "retrace-item is-selected" : "retrace-item",
			});
			if (item.indent) {
				row.style.paddingLeft = `${BASE_PADDING_LEFT + item.indent * INDENT_STEP}px`;
			}
			if (item.icon) {
				setIcon(row.createSpan({ cls: "retrace-item-icon" }), item.icon);
			}
			row.createSpan({ cls: "retrace-item-title", text: item.title });
			if (item.subtitle) {
				row.createSpan({ cls: "retrace-item-subtitle", text: item.subtitle });
			}
			if (item.meta) {
				row.createSpan({ cls: "retrace-item-meta", text: item.meta });
			}
			row.addEventListener("click", () => {
				this.selected = index;
				this.choose(false);
			});
			if (item.preview && item.preview.length > 0) {
				this.renderPreview(item.preview);
			}
		});
	}

	private renderPreview(preview: PreviewLine[]): void {
		const previewEl = this.listEl.createDiv({ cls: "retrace-preview" });
		for (const line of preview) {
			const lineEl = previewEl.createDiv({
				cls: line.isTarget ? "retrace-preview-line is-target" : "retrace-preview-line",
			});
			lineEl.createSpan({ cls: "retrace-preview-no", text: String(line.lineNo) });
			lineEl.createSpan({ cls: "retrace-preview-text", text: line.text });
		}
	}

	private scrollSelectionIntoView(): void {
		const rows = this.listEl.querySelectorAll(".retrace-item.is-selected");
		const row = rows[0];
		if (row instanceof HTMLElement) {
			row.scrollIntoView({ block: "nearest" });
		}
	}
}

/** Case-insensitive subsequence match: "ilj" hits "Install > Jump". */
export function matchesSubsequence(text: string, query: string): boolean {
	if (query.length === 0) {
		return true;
	}
	const haystack = text.toLowerCase();
	const needle = query.toLowerCase();
	let cursor = 0;
	for (const char of needle) {
		const hit = haystack.indexOf(char, cursor);
		if (hit === -1) {
			return false;
		}
		cursor = hit + 1;
	}
	return true;
}
