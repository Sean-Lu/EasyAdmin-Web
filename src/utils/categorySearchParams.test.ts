import { describe, expect, it } from "vitest";
import { deleteCategorySearchValue, resolveCategorySearchState, setCategorySearchValue } from "./categorySearchParams";

describe("category search params", () => {
	it("restores a valid category and rejects all when it is not allowed", () => {
		expect(resolveCategorySearchState("2", [1, 2], { allowAll: false, fallback: "1" }).selectedValue).toBe("2");
		expect(resolveCategorySearchState("all", [1, 2], { allowAll: false, fallback: "1" }).selectedValue).toBe("1");
	});

	it("restores all and falls back when the category is missing or stale", () => {
		expect(resolveCategorySearchState("all", [1, 2], { allowAll: true, fallback: "1" }).selectedValue).toBe("all");
		expect(resolveCategorySearchState("9", [1, 2], { allowAll: true, fallback: "1" }).selectedValue).toBe("1");
		expect(resolveCategorySearchState(null, [], { allowAll: true, fallback: "all" }).selectedValue).toBe("all");
	});

	it("updates category without dropping other query values", () => {
		const result = setCategorySearchValue(new URLSearchParams("openNoteId=8&q=hello"), "all");
		expect(result.toString()).toBe("openNoteId=8&q=hello&category=all");
	});

	it("keeps a missing category absent while selecting the default locally", () => {
		expect(resolveCategorySearchState(null, [1, 2], { allowAll: false, fallback: "1" })).toEqual({
			selectedValue: "1",
			shouldClear: false
		});
	});

	it("marks only an existing invalid category for removal", () => {
		expect(resolveCategorySearchState("9", [1, 2], { allowAll: false, fallback: "1" })).toEqual({
			selectedValue: "1",
			shouldClear: true
		});
		expect(resolveCategorySearchState("2", [1, 2], { allowAll: false, fallback: "1" })).toEqual({
			selectedValue: "2",
			shouldClear: false
		});
	});

	it("removes category without dropping other query values", () => {
		const result = deleteCategorySearchValue(new URLSearchParams("openNoteId=8&category=9"));
		expect(result.toString()).toBe("openNoteId=8");
	});
});
