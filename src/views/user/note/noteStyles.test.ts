import fs from "fs";
import path from "path";
// @ts-expect-error The installed Less package does not provide TypeScript declarations.
import less from "less";
import { describe, expect, it } from "vitest";

const compileNoteStyles = async () => {
	const source = fs.readFileSync(path.resolve(__dirname, "note.less"), "utf8");
	return (await less.render(source)).css;
};

const expectRule = (css: string, selector: string, declaration: string) => {
	const rule = css.split("}").find(block =>
		block
			.slice(0, block.indexOf("{"))
			.split(",")
			.some(item => item.trim() === selector)
	);
	expect(rule, `Missing CSS rule for ${selector}`).toBeDefined();
	expect(rule).toContain(declaration);
};

describe("read-only note preview styles", () => {
	it("matches Markdown preview styles for rendered block elements", async () => {
		const css = await compileNoteStyles();

		expectRule(css, ".note-preview pre", "background: #f5f5f5");
		expectRule(css, ".note-preview table", "border-collapse: collapse");
		expectRule(css, ".note-preview th", "border: 1px solid #d9d9d9");
		expectRule(css, ".note-preview img", "max-width: 100%");
	});

	it("matches Markdown preview styles in dark mode", async () => {
		const css = await compileNoteStyles();

		expectRule(css, ".note-dark .note-preview pre", "background: #1f1f1f");
		expectRule(css, ".note-dark .note-preview pre", "border: 1px solid #303030");
		expectRule(css, ".note-dark .note-markdown-preview pre", "background: #1f1f1f");
		expectRule(css, ".note-dark .note-preview th", "border-color: #303030");
		expectRule(css, ".note-dark .note-preview code", "background: #262626");
		expectRule(css, ".note-dark .note-preview blockquote", "border-left-color: #434343");
	});
});
