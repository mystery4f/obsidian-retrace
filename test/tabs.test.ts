import * as assert from "node:assert/strict";
import { test } from "node:test";

import type { RecentFile } from "../src/model";
import { unknownOpenPaths } from "../src/tabs";

const at = (path: string, openedAt: number): RecentFile => ({ path, openedAt, openCount: 1 });

test("an empty history leaves every open path, in tab order", () => {
	assert.deepEqual(unknownOpenPaths([], ["a.md", "b.md"]), ["a.md", "b.md"]);
});

test("a path the history already has is not repeated", () => {
	assert.deepEqual(unknownOpenPaths([at("a.md", 5)], ["a.md", "b.md"]), ["b.md"]);
});

test("nothing is left when every open file is known", () => {
	assert.deepEqual(unknownOpenPaths([at("a.md", 5), at("b.md", 9)], ["b.md", "a.md"]), []);
});
