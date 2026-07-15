import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, test } from "vitest";

describe("share source label", () => {
	test("shows the owner's display name for files and notes", () => {
		const source = readFileSync(resolve(__dirname, "index.tsx"), "utf8");

		expect(source).toContain('<div className="share-source">');
		expect(source).toContain('<strong>{file.ownerName || "分享者"}</strong>');
		expect(source).toContain('<strong>{note.ownerName || "分享者"}</strong>');
		expect(source).toContain('className="share-home-link"');
		expect(source).toContain('href="/"');
		expect(source).toContain('padding: "48px 20px 0"');
	});
});
