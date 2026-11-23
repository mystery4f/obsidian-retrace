import * as assert from "node:assert/strict";
import { test } from "node:test";
import { matchesSubsequence } from "../src/fuzzy";

test("an empty query keeps every item", () => {
	assert.equal(matchesSubsequence("anything at all", ""), true);
});

test("matches a sparse subsequence", () => {
	assert.equal(matchesSubsequence("Install > Jump", "ilj"), true);
});

test("ignores case on both sides", () => {
	assert.equal(matchesSubsequence("Recent Files", "rf"), true);
	assert.equal(matchesSubsequence("recent files", "RF"), true);
});

test("rejects characters out of order", () => {
	assert.equal(matchesSubsequence("Recent Files", "fr"), false);
});

test("rejects a character that is absent", () => {
	assert.equal(matchesSubsequence("Recent Files", "rz"), false);
});

test("matches CJK titles", () => {
	assert.equal(matchesSubsequence("核心问题：唯一标识", "核标"), true);
	assert.equal(matchesSubsequence("核心问题：唯一标识", "标核"), false);
});
