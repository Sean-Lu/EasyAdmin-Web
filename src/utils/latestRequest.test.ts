import { describe, expect, it } from "vitest";
import { createLatestRequestGuard } from "./latestRequest";

describe("latest request guard", () => {
	it("accepts only the most recently started request", () => {
		const guard = createLatestRequestGuard();
		const firstRequest = guard.begin();
		const secondRequest = guard.begin();

		expect(guard.isLatest(firstRequest)).toBe(false);
		expect(guard.isLatest(secondRequest)).toBe(true);
	});

	it("invalidates an in-flight request without starting another one", () => {
		const guard = createLatestRequestGuard();
		const request = guard.begin();

		guard.invalidate();

		expect(guard.isLatest(request)).toBe(false);
	});
});
