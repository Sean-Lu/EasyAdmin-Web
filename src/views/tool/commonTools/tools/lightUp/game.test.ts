import { describe, expect, it } from "vitest";
import { analyzeLights, lightUpLevels } from "./game";

describe("light up rules", () => {
	it.each([
		{ level: 0, bulbs: [5, 8, 11, 19, 20, 22] },
		{ level: 1, bulbs: [1, 4, 9, 12, 22, 29, 34] },
		{ level: 2, bulbs: [6, 15, 20, 25, 30, 35, 40, 45] }
	])("provides a playable solution for level $level", ({ level, bulbs }) => {
		const board = lightUpLevels[level].board;
		const cells = Array(board.length * board[0].length).fill(0);
		for (const index of bulbs) cells[index] = 1;
		expect(analyzeLights(board, cells).solved).toBe(true);
		cells[bulbs[0]] = 0;
		expect(analyzeLights(board, cells).solved).toBe(false);
	});
	it("illuminates horizontal and vertical cells through empty marks", () => {
		const result = analyzeLights(["...", "..."], [1, -1, 0, 0, 0, 0]);
		expect(result.lit).toEqual([true, true, true, true, false, false]);
		expect(result.solved).toBe(false);
	});
	it("reports mutually visible bulbs, but walls stop the light", () => {
		expect([...analyzeLights(["..."], [1, 0, 1]).conflicts]).toEqual([0, 2]);
		expect(analyzeLights([".#."], [1, 0, 1]).solved).toBe(true);
	});
	it("requires exact four-neighbor counts and never accepts bulbs on walls", () => {
		expect(analyzeLights([".0."], [1, 0, 1]).solved).toBe(false);
		expect(analyzeLights([".2."], [1, 0, 1]).solved).toBe(true);
		expect(analyzeLights([".2."], [1, 1, 1]).solved).toBe(false);
	});
});
