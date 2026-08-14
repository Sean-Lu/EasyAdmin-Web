import { describe, expect, it } from "vitest";
import { buildNoteOutlineItems } from "./outlineUtils";

describe("buildNoteOutlineItems", () => {
	it("preserves heading order and levels", () => {
		expect(
			buildNoteOutlineItems(
				[
					{ level: 1, text: "总览", sourceIndex: 0 },
					{ level: 3, text: "细节", sourceIndex: 1 },
					{ level: 6, text: "附录", sourceIndex: 2 }
				],
				"note-heading"
			)
		).toEqual([
			{ id: "note-heading-1", level: 1, text: "总览", sourceIndex: 0 },
			{ id: "note-heading-2", level: 3, text: "细节", sourceIndex: 1 },
			{ id: "note-heading-3", level: 6, text: "附录", sourceIndex: 2 }
		]);
	});

	it("keeps duplicate titles addressable and ignores blank headings", () => {
		expect(
			buildNoteOutlineItems(
				[
					{ level: 2, text: " 重复标题 ", sourceIndex: 0 },
					{ level: 3, text: "   ", sourceIndex: 1 },
					{ level: 2, text: "重复标题", sourceIndex: 2 }
				],
				"shared-heading"
			)
		).toEqual([
			{ id: "shared-heading-1", level: 2, text: "重复标题", sourceIndex: 0 },
			{ id: "shared-heading-3", level: 2, text: "重复标题", sourceIndex: 2 }
		]);
	});
});
