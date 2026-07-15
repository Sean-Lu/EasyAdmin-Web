import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, test } from "vitest";

describe("public note share page", () => {
	test("uses the read-only note preview styling for shared content", () => {
		const source = readFileSync(resolve(__dirname, "index.tsx"), "utf8");

		expect(source).toContain('import "../user/note/note.less"');
		expect(source).toContain('import "./share.less"');
		expect(source).toContain('className="note-preview share-note-content"');
	});
});
