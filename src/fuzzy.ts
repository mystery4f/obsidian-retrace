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
