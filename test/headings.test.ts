import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { HeadingLike } from "../src/headings";
import { headingChainAt, lastHeadingLine, normalizeHeadingText } from "../src/headings";

function heading(level: number, text: string, line: number): HeadingLike {
	return { level, heading: text, position: { start: { line } } };
}

const document: HeadingLike[] = [
	heading(1, "Top", 0),
	heading(2, "Install", 5),
	heading(3, "Develop", 9),
	heading(1, "Other", 20),
];

test("the chain is the ancestors plus the heading at the line", () => {
	assert.deepEqual(headingChainAt(document, 12), ["Top", "Install", "Develop"]);
});

test("a line inside a later section switches to that section", () => {
	assert.deepEqual(headingChainAt(document, 25), ["Other"]);
});

test("a line above the first heading has no chain", () => {
	assert.deepEqual(headingChainAt([heading(1, "Top", 3)], 1), []);
});

test("a skipped level leaves no hole in the chain", () => {
	assert.deepEqual(headingChainAt([heading(1, "Top", 0), heading(3, "Deep", 4)], 5), [
		"Top",
		"Deep",
	]);
});

test("the last heading at or above a line is the current one", () => {
	assert.equal(lastHeadingLine(document, 12), 9);
	assert.equal(lastHeadingLine(document, 9), 9);
	assert.equal(lastHeadingLine(document, 4), 0);
});

test("a line above every heading has no current heading", () => {
	assert.equal(lastHeadingLine([heading(1, "Top", 3)], 1), null);
});

test("preview numbering is stripped before comparing titles", () => {
	assert.equal(normalizeHeadingText("2.1 Develop"), "Develop");
	assert.equal(normalizeHeadingText("3、样式"), "样式");
	assert.equal(normalizeHeadingText("Develop"), "Develop");
});
