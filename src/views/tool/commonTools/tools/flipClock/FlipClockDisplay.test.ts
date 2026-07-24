import { describe, expect, it } from "vitest";
import {
	getClockText,
	getDateText,
	getFlipClockStageClassName,
	getFlipDigitLayerValues,
	getWeekdayText
} from "./FlipClockDisplay";

describe("flip clock display formatting", () => {
	it("formats time with or without seconds", () => {
		const now = new Date(2026, 6, 25, 9, 8, 7);
		expect(getClockText(now, true)).toBe("09:08:07");
		expect(getClockText(now, false)).toBe("09:08");
	});

	it("formats date and weekday using the existing Chinese locale", () => {
		const now = new Date(2026, 6, 25, 9, 8, 7);
		expect(getDateText(now)).toContain("2026");
		expect(getWeekdayText(now)).toContain("星期");
	});

	it("marks the display stage as fullscreen when requested", () => {
		expect(getFlipClockStageClassName(false)).toBe("flip-clock-stage");
		expect(getFlipClockStageClassName(true)).toBe("flip-clock-stage is-fullscreen");
	});

	it("uses the current digit for both static halves after a flip", () => {
		expect(getFlipDigitLayerValues("9", "8", false)).toEqual({
			staticTop: "9",
			staticBottom: "9",
			flapTop: "8",
			flapBottom: "9"
		});
	});
});
