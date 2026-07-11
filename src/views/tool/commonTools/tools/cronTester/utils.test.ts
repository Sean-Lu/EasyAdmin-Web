import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import { getNextCronRuns, validateQuartzCron } from "./utils";

describe("Quartz Cron utilities", () => {
	it("accepts a six-field Quartz expression", () => {
		expect(validateQuartzCron("0 0/5 * * * ?").valid).toBe(true);
	});

	it("rejects expressions without six fields", () => {
		expect(validateQuartzCron("*/5 * * * *").valid).toBe(false);
	});

	it("calculates the next run for a daily expression", () => {
		const from = dayjs("2026-07-12T10:15:30");
		const runs = getNextCronRuns("0 0 12 * * ?", from, 1);

		expect(runs).toHaveLength(1);
		expect(runs[0].format("YYYY-MM-DD HH:mm:ss")).toBe("2026-07-12 12:00:00");
	});
});
