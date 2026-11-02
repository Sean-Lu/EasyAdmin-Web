import { describe, expect, it } from "vitest";
import { isNonogramSolved, nonogramClues, nonogramLevels, runs } from "./game";

describe("nonogram rules", () => {
	it("counts separated black groups and handles empty lines", () => {
		expect(runs([1, 1, -1, 1, 0])).toEqual([2, 1]);
		expect(runs([0, -1, 0])).toEqual([0]);
		expect(nonogramClues(["110", "001"]).columns).toEqual([[1], [1], [1]]);
	});
	it.each(nonogramLevels)("accepts the complete $name picture without requiring empty marks", ({ picture }) => {
		const filled = [...picture.join("")].map(Number);
		expect(isNonogramSolved(picture, filled)).toBe(true);
		expect(
			isNonogramSolved(
				picture,
				filled.map(value => value || -1)
			)
		).toBe(true);
		expect(
			isNonogramSolved(
				picture,
				filled.map(() => 0)
			)
		).toBe(false);
		const incorrect = [...filled];
		incorrect[0] = incorrect[0] ? 0 : 1;
		expect(isNonogramSolved(picture, incorrect)).toBe(false);
	});
	it("requires column clues as well as row clues", () => {
		expect(isNonogramSolved(["10", "10"], [1, 0, 0, 1])).toBe(false);
		expect(isNonogramSolved(["10", "10"], [1])).toBe(false);
	});
});
