import { beforeEach, describe, expect, it } from "vitest";
import {
	ALLOWED_IDLE_TIMEOUTS,
	LOCK_RUNTIME_KEY,
	clearLockRuntime,
	readLockPreference,
	readLockRuntime,
	writeLockPreference,
	writeLockRuntime
} from "./lockStorage";

const lockPreferenceKey = (userId: string) => `easyadmin:lock:preference:${userId}`;
const DEFAULT_LOCK_PREFERENCE = { autoLockEnabled: false, idleTimeoutMinutes: 15 };

const values = new Map<string, string>();
const memoryStorage: Storage = {
	get length() {
		return values.size;
	},
	clear: () => values.clear(),
	getItem: key => values.get(key) ?? null,
	key: index => [...values.keys()][index] ?? null,
	removeItem: key => void values.delete(key),
	setItem: (key, value) => void values.set(key, value)
};
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: memoryStorage });

describe("lock storage", () => {
	beforeEach(() => localStorage.clear());

	it("falls back safely for malformed or invalid preferences", () => {
		localStorage.setItem(lockPreferenceKey("7"), "not-json");
		expect(readLockPreference("7")).toEqual(DEFAULT_LOCK_PREFERENCE);
		localStorage.setItem(lockPreferenceKey("7"), JSON.stringify({ autoLockEnabled: true, idleTimeoutMinutes: 20 }));
		expect(readLockPreference("7")).toEqual(DEFAULT_LOCK_PREFERENCE);
	});

	it("accepts exactly the allowed timeout values", () => {
		expect(ALLOWED_IDLE_TIMEOUTS).toEqual([5, 10, 15, 30, 60]);
		for (const idleTimeoutMinutes of ALLOWED_IDLE_TIMEOUTS) {
			localStorage.setItem(lockPreferenceKey("7"), JSON.stringify({ autoLockEnabled: true, idleTimeoutMinutes }));
			expect(readLockPreference("7")).toEqual({ autoLockEnabled: true, idleTimeoutMinutes });
		}
	});

	it("keeps preferences separate per user", () => {
		writeLockPreference("7", { autoLockEnabled: true, idleTimeoutMinutes: 5 });
		writeLockPreference("8", { autoLockEnabled: false, idleTimeoutMinutes: 60 });
		expect(lockPreferenceKey("7")).not.toBe(lockPreferenceKey("8"));
		expect(readLockPreference("7").idleTimeoutMinutes).toBe(5);
		expect(readLockPreference("8").idleTimeoutMinutes).toBe(60);
	});

	it("stores only validated non-secret runtime data and can clear it", () => {
		writeLockRuntime("7", { locked: true, lockedAt: 10, lastActiveAt: 5, version: 10 });
		expect(readLockRuntime("7")).toEqual({ locked: true, lockedAt: 10, lastActiveAt: 5, version: 10 });
		expect(localStorage.getItem(LOCK_RUNTIME_KEY)).not.toContain("token");
		clearLockRuntime();
		expect(readLockRuntime("7")).toBeNull();
	});

	it("restores runtime only for the same authenticated user", () => {
		writeLockRuntime("user-a", { locked: true, lockedAt: 10, lastActiveAt: 5, version: 10 });
		expect(readLockRuntime("user-a")?.locked).toBe(true);
		expect(readLockRuntime("user-b")).toBeNull();
		expect(localStorage.getItem(LOCK_RUNTIME_KEY)).toBeNull();
	});
});
