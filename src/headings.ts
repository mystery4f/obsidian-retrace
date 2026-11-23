/**
 * Heading helpers over the cached heading list. Declared structurally so the
 * module stays free of `obsidian` and can be tested on its own.
 */
export interface HeadingLike {
	level: number;
	heading: string;
	position: { start: { line: number } };
}

const HEADING_NUMBER_PREFIX = /^[\s\d.、，（）()]+/;

/** Preview copies its numbering into the text; the cache keeps the authored title. */
export function normalizeHeadingText(text: string): string {
	return text.replace(HEADING_NUMBER_PREFIX, "").trim();
}

/** Ancestors plus the heading itself at `line`, ordered top to bottom. */
export function headingChainAt(headings: HeadingLike[], line: number): string[] {
	const chain: string[] = [];
	for (const heading of headings) {
		if (heading.position.start.line > line) {
			break;
		}
		chain.length = heading.level - 1;
		chain[heading.level - 1] = heading.heading;
	}
	return chain.filter((title) => Boolean(title));
}

/** Line of the last heading at or above `line`, for preselecting the outline. */
export function lastHeadingLine(headings: HeadingLike[], line: number): number | null {
	let found: number | null = null;
	for (const heading of headings) {
		if (heading.position.start.line > line) {
			break;
		}
		found = heading.position.start.line;
	}
	return found;
}
