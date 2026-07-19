import { describe, expect, it } from "vitest";
import { ALLOWED_IDLE_TIMEOUTS } from "@/utils/lockStorage";

describe("lock settings", () => {
	it("offers exactly the supported timeout values", () => {
		expect([...ALLOWED_IDLE_TIMEOUTS]).toEqual([5, 10, 15, 30, 60]);
	});
});
