import { describe, expect, it } from "vitest";
import { formatDuration, getCountdownRemaining, normalizeCountdownInput } from "./timeUtils";

describe("timeUtils", () => {
	it("formats a duration with hours, minutes and seconds", () => {
		expect(formatDuration(3661)).toBe("01:01:01");
		expect(formatDuration(65)).toBe("00:01:05");
	});

	it("formats a short duration without hours when requested", () => {
		expect(formatDuration(65, false)).toBe("01:05");
	});

	it("normalizes non-negative countdown input into seconds", () => {
		expect(normalizeCountdownInput(1, 2, 3)).toBe(3723);
		expect(normalizeCountdownInput(-1, 2, -3)).toBe(120);
	});

	it("clamps countdown remaining time at zero", () => {
		expect(getCountdownRemaining(10, 9500)).toBe(1);
		expect(getCountdownRemaining(10, 10000)).toBe(0);
		expect(getCountdownRemaining(10, 12000)).toBe(0);
	});

	it("keeps countdown input boundaries normalized", () => {
		expect(normalizeCountdownInput(0, 60, 0)).toBe(3600);
		expect(normalizeCountdownInput(0, 0, 60)).toBe(60);
		expect(getCountdownRemaining(1, 60000)).toBe(0);
	});
});
