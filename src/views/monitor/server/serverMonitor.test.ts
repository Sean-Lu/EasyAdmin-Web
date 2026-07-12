import { describe, expect, it } from "vitest";
import { clampPercent, formatBytes, getRefreshInterval } from "./display";

describe("server monitor display helpers", () => {
	it("formats byte values for compact display", () => {
		expect(formatBytes(0)).toBe("0 B");
		expect(formatBytes(1024 * 1024)).toBe("1.00 MB");
	});

	it("keeps progress values within the Ant Design range", () => {
		expect(clampPercent(-1)).toBe(0);
		expect(clampPercent(101)).toBe(100);
		expect(clampPercent(50)).toBe(50);
	});

	it("keeps automatic refresh disabled by default", () => {
		expect(getRefreshInterval(false)).toBeUndefined();
		expect(getRefreshInterval(true)).toBe(5000);
	});
});
