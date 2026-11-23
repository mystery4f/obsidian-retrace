import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { RecentFile, RecentLocation } from "../src/model";
import { pruneByPath, touchFileEntry, touchLocationEntry } from "../src/mru";

function file(path: string, openedAt: number, openCount = 1): RecentFile {
	return { path, openedAt, openCount };
}

function location(path: string, line: number, visitedAt: number): RecentLocation {
	return { path, line, ch: 0, headingPath: "", visitedAt };
}

test("a new file becomes the most recent entry", () => {
	const before = [file("b.md", 200), file("a.md", 100)];

	const after = touchFileEntry(before, "c.md", 300, 10);

	assert.deepEqual(
		after.map((entry) => entry.path),
		["c.md", "b.md", "a.md"]
	);
	assert.equal(after[0].openCount, 1);
	assert.equal(before.length, 2, "the input list is left alone");
});

test("touching a known file moves it to the front without duplicating", () => {
	const before = [file("b.md", 200), file("a.md", 100, 3)];

	const after = touchFileEntry(before, "a.md", 300, 10);

	assert.deepEqual(
		after.map((entry) => entry.path),
		["a.md", "b.md"]
	);
	assert.equal(after[0].openCount, 4);
});

test("the table keeps only the newest entries up to the cap", () => {
	const before = [file("c.md", 300), file("b.md", 200), file("a.md", 100)];

	const after = touchFileEntry(before, "a.md", 400, 2);

	assert.deepEqual(
		after.map((entry) => entry.path),
		["a.md", "c.md"]
	);
});

test("a location is one entry per file and line", () => {
	const before = [location("a.md", 5, 100)];

	const after = touchLocationEntry(before, location("a.md", 5, 200), 10);

	assert.equal(after.length, 1);
	assert.equal(after[0].visitedAt, 200);
});

test("two lines of the same file stay separate entries", () => {
	const before = [location("a.md", 5, 100)];

	const after = touchLocationEntry(before, location("a.md", 9, 200), 10);

	assert.deepEqual(
		after.map((entry) => entry.line),
		[9, 5]
	);
});

test("locations are capped like files", () => {
	const before = [location("a.md", 1, 100), location("a.md", 2, 200), location("a.md", 3, 300)];

	const after = touchLocationEntry(before, location("a.md", 4, 400), 2);

	assert.deepEqual(
		after.map((entry) => entry.line),
		[4, 3]
	);
});

test("pruning drops entries whose file is gone", () => {
	const files = [file("keep.md", 2), file("gone.md", 1)];
	const locations = [location("gone.md", 3, 1), location("keep.md", 7, 2)];
	const exists = (path: string) => path === "keep.md";

	assert.deepEqual(
		pruneByPath(files, exists).map((entry) => entry.path),
		["keep.md"]
	);
	assert.deepEqual(
		pruneByPath(locations, exists).map((entry) => entry.path),
		["keep.md"]
	);
});
