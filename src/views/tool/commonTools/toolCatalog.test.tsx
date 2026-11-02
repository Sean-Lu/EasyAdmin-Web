import { describe, expect, it } from "vitest";
import { applyToolOrder, filterAndPrioritizeTools, reorderToolWithinGroup, tools } from "./toolCatalog";

describe("toolCatalog", () => {
	it("combines category, keyword and favorites without leaking other categories", () => {
		const result = filterAndPrioritizeTools("数", new Set(["23", "1"]), tools, "game_tools");
		expect(result.map(tool => tool.key)).toEqual(["slitherlink", "nonogram", "lightUp"]);
		expect(filterAndPrioritizeTools("JSON", new Set(), tools, "game_tools")).toEqual([]);
	});

	it("keeps hidden category positions when reordering visible tools", () => {
		const reordered = reorderToolWithinGroup(tools, new Set(), "23", "20", "game_tools")!;
		expect(reordered.filter(tool => tool.tag !== "game_tools")).toEqual(tools.filter(tool => tool.tag !== "game_tools"));
		expect(reordered.filter(tool => tool.tag === "game_tools").map(tool => tool.id)).toEqual(["23", "20", "21", "22"]);
		expect(reorderToolWithinGroup(tools, new Set(), "1", "20", "game_tools")).toBeNull();
	});
	it("applies a stored order and appends tools unknown to an older preference", () => {
		const ordered = applyToolOrder(["3", "1"]);

		expect(ordered.slice(0, 4).map(tool => tool.id)).toEqual(["3", "1", "2", "4"]);
		expect(ordered).toHaveLength(tools.length);
	});

	it("keeps favorites before non-favorites while preserving each group order", () => {
		const ordered = applyToolOrder(["3", "2", "1", "4"]);
		const displayed = filterAndPrioritizeTools("", new Set(["1", "4"]), ordered);

		expect(displayed.slice(0, 4).map(tool => tool.id)).toEqual(["1", "4", "3", "2"]);
	});

	it("reorders only inside the same favorite group", () => {
		const ordered = applyToolOrder(["1", "2", "3", "4"]);
		const favorites = new Set(["1", "3"]);

		expect(
			reorderToolWithinGroup(ordered, favorites, "3", "1")
				?.slice(0, 4)
				.map(tool => tool.id)
		).toEqual(["3", "2", "1", "4"]);
		expect(reorderToolWithinGroup(ordered, favorites, "1", "2")).toBeNull();
	});

	it("filters before prioritizing favorites", () => {
		const displayed = filterAndPrioritizeTools("JSON", new Set(["1", "3"]));

		expect(displayed.map(tool => tool.key)).toEqual(["jsonParser", "jsonToTable"]);
	});
});
