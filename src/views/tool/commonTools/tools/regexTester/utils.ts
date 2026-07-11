export interface RegexMatch {
	match: string;
	index: number;
	input: string;
	captures: string[];
}

export interface RegexTestResult {
	error: string | null;
	matches: RegexMatch[];
}

export function testRegex(pattern: string, flags: string, text: string): RegexTestResult {
	try {
		const regex = new RegExp(pattern, flags);
		const matches: RegexMatch[] = [];

		if (regex.global) {
			for (const match of text.matchAll(regex)) {
				matches.push({
					match: match[0],
					index: match.index ?? 0,
					input: text,
					captures: match.slice(1).map(value => value ?? "")
				});
				if (matches.length >= 100) break;
			}
		} else {
			const match = regex.exec(text);
			if (match) {
				matches.push({
					match: match[0],
					index: match.index,
					input: text,
					captures: match.slice(1).map(value => value ?? "")
				});
			}
		}

		return { error: null, matches };
	} catch (error) {
		return { error: error instanceof Error ? error.message : "正则表达式无效", matches: [] };
	}
}
