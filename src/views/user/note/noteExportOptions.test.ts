import { describe, expect, it } from "vitest";
import { getBatchNoteExportMenuItems, getNoteExportMenuItems } from "./noteExportOptions";

describe("getNoteExportMenuItems", () => {
	it("returns standard exports for rich text notes", () => {
		expect(getNoteExportMenuItems(0).map(item => item.key)).toEqual(["html", "doc", "pdf"]);
	});

	it("adds markdown exports for markdown notes", () => {
		expect(getNoteExportMenuItems(1).map(item => item.key)).toEqual(["html", "doc", "pdf", "markdown", "markdownPackage"]);
		expect(getNoteExportMenuItems(1)[4]?.label).toBe("Markdown资源包");
	});

	it("adds markdown batch exports only when every selected note is markdown", () => {
		expect(getBatchNoteExportMenuItems([1, 1]).map(item => item.key)).toEqual([
			"html",
			"doc",
			"pdf",
			"markdown",
			"markdownPackage"
		]);
		expect(getBatchNoteExportMenuItems([1, 1])[4]?.label).toBe("Markdown资源包");
		expect(getBatchNoteExportMenuItems([0]).map(item => item.key)).toEqual(["html", "doc", "pdf"]);
		expect(getBatchNoteExportMenuItems([1, 0]).map(item => item.key)).toEqual(["html", "doc", "pdf"]);
	});
});
