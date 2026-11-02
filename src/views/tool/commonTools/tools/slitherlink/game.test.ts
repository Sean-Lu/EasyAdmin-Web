import { describe, expect, it } from "vitest";
import { analyzeLoop, slitherlinkLevels } from "./game";

describe("slitherlink rules", () => {
	it.each([
		{ level: 0, edges: [5, 6, 13, 14, 26, 28, 31, 33] },
		{ level: 1, edges: [6, 7, 8, 12, 13, 17, 18, 21, 22, 23, 37, 40, 43, 44, 49, 52] },
		{ level: 2, edges: [7, 8, 15, 19, 22, 26, 33, 34, 50, 52, 57, 60, 65, 68, 73, 75] }
	])("accepts the closed solution for level $level and rejects a broken line", ({ level, edges }) => {
		const puzzle = slitherlinkLevels[level];
		const lines = Array((puzzle.rows + 1) * puzzle.columns + puzzle.rows * (puzzle.columns + 1)).fill(0);
		for (const edge of edges) lines[edge] = 1;
		expect(analyzeLoop(puzzle, lines).solved).toBe(true);
		lines[edges[0]] = -1;
		expect(analyzeLoop(puzzle, lines).solved).toBe(false);
	});
	it("rejects separate small loops even when every number is satisfied", () => {
		const puzzle = { name: "two loops", rows: 1, columns: 3, clues: [4, 2, 4] };
		const lines = [1, 0, 1, 1, 0, 1, 1, 1, 1, 1];
		const result = analyzeLoop(puzzle, lines);
		expect(result.counts).toEqual(puzzle.clues);
		expect(result.solved).toBe(false);
	});
	it("does not treat an empty board as a complete loop", () => {
		expect(analyzeLoop({ name: "empty", rows: 1, columns: 1, clues: [0] }, [0, 0, 0, 0]).solved).toBe(false);
	});
});
