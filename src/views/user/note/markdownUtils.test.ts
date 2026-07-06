import { describe, expect, it } from "vitest";
import { extractNoteImageIds, readMarkdownFile } from "./markdownUtils";

describe("markdownUtils", () => {
	it("extracts distinct controlled image ids", () => {
		expect(extractNoteImageIds("![a](note-file:12) ![b](note-file:12) ![c](note-file:8)")).toEqual(["12", "8"]);
	});

	it("reads utf-8 markdown and derives title", async () => {
		const result = await readMarkdownFile(new File(["\ufeff# 标题"], "我的笔记.md"));
		expect(result).toEqual({ title: "我的笔记", contentMarkdown: "# 标题" });
	});

	it("rejects non-markdown files", async () => {
		await expect(readMarkdownFile(new File(["x"], "x.txt"))).rejects.toThrow("请选择 .md 文件");
	});
});
