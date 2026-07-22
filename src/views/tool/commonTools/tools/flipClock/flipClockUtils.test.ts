import { describe, expect, it } from "vitest";
import { getChangedDigitIndexes } from "./flipClockUtils";

describe("flip clock digit changes", () => {
	it("returns only changed numeric positions", () => {
		expect(getChangedDigitIndexes("12:34:56", "12:35:06")).toEqual([3, 4]);
	});

	it("marks all positions when the clock is first rendered", () => {
		expect(getChangedDigitIndexes(undefined, "12:34")).toEqual([0, 1, 2, 3]);
	});
});
