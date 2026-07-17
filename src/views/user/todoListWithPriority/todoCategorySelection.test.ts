import { describe, expect, it } from "vitest";
import { resolveTodoCategorySelection } from "./todoCategorySelection";

describe("todo category selection", () => {
	it("clears a stale category even when no categories remain", () => {
		expect(resolveTodoCategorySelection("9", [])).toEqual({
			categoryId: null,
			selectedValue: null,
			shouldClear: true
		});
	});

	it("selects the first category locally without clearing a missing query", () => {
		expect(resolveTodoCategorySelection(null, [{ id: 1 }, { id: 2 }])).toEqual({
			categoryId: 1,
			selectedValue: "1",
			shouldClear: false
		});
	});
});
