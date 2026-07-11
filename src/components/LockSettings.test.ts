import { describe, expect, it, vi } from "vitest";
import { ALLOWED_IDLE_TIMEOUTS } from "@/utils/lockStorage";
import { saveLockSettings } from "./LockSettings";

describe("lock settings", () => {
	it("offers exactly the supported timeout values", () => {
		expect([...ALLOWED_IDLE_TIMEOUTS]).toEqual([5, 10, 15, 30, 60]);
	});

	it("persists settings under the backend user id", () => {
		const write = vi.fn();
		const dispatch = vi.fn();
		saveLockSettings("42", { autoLockEnabled: true, idleTimeoutMinutes: 30 }, write, dispatch);
		expect(write).toHaveBeenCalledWith("42", { autoLockEnabled: true, idleTimeoutMinutes: 30 });
		expect(dispatch).toHaveBeenCalledWith({ autoLockEnabled: true, idleTimeoutMinutes: 30 });
	});
});
