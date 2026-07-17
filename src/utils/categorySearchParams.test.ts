import { describe, expect, it } from "vitest";
import {
	deleteCategorySearchValue,
	resolveCategorySearchState,
	resolveCategorySearchValue,
	setCategorySearchValue
} from "./categorySearchParams";

describe("category search params", () => {
	it("restores a valid category and rejects all when it is not allowed", () => {
		expect(resolveCategorySearchValue("2", [1, 2], { allowAll: false, fallback: "1" })).toBe("2");
		expect(resolveCategorySearchValue("all", [1, 2], { allowAll: false, fallback: "1" })).toBe("1");
	});

	it("restores all and falls back when the category is missing or stale", () => {
		expect(resolveCategorySearchValue("all", [1, 2], { allowAll: true, fallback: "1" })).toBe("all");
		expect(resolveCategorySearchValue("9", [1, 2], { allowAll: true, fallback: "1" })).toBe("1");
		expect(resolveCategorySearchValue(null, [], { allowAll: true, fallback: "all" })).toBe("all");
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
