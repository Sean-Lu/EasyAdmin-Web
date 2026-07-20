import { describe, expect, it } from "vitest";
import {
	hydrateLock,
	lockScreen,
	recordActivity,
	resetLockRuntime,
	setLockPreference,
	synchronizeLockRuntime,
	unlockScreen
} from "./action";
import lockReducer from "./reducer";

const initialLockState = lockReducer(undefined, { type: "@@init" });

describe("lock reducer", () => {
	it("provides safe defaults", () => {
		expect(initialLockState).toMatchObject({
			hydrated: false,
			locked: false,
			autoLockEnabled: false,
			idleTimeoutMinutes: 15
		});
	});

	it("locks and unlocks using the event time as the version", () => {
		const locked = lockReducer(initialLockState, lockScreen(100));
		expect(locked).toMatchObject({ locked: true, lockedAt: 100, version: 100 });
		expect(lockReducer(locked, unlockScreen(200))).toMatchObject({
			locked: false,
			lockedAt: null,
			lastActiveAt: 200,
			version: 200
		});
	});

	it("replaces a previous user's higher-version runtime during identity hydration", () => {
		const current = { ...initialLockState, hydrated: true, locked: true, lockedAt: 200, version: 200 };
		expect(lockReducer(current, hydrateLock({ locked: false, lockedAt: null, lastActiveAt: 100, version: 100 }))).toMatchObject({
			hydrated: true,
			locked: false,
			version: 100
		});
	});

	it("rejects stale versions only during same-identity storage synchronization", () => {
		const current = { ...initialLockState, hydrated: true, locked: true, lockedAt: 200, version: 200 };
		expect(lockReducer(current, synchronizeLockRuntime({ locked: false, lockedAt: null, lastActiveAt: 100, version: 100 }))).toBe(
			current
		);
		expect(
			lockReducer(current, synchronizeLockRuntime({ locked: false, lockedAt: null, lastActiveAt: 300, version: 300 }))
		).toMatchObject({
			locked: false,
			version: 300
		});
	});

	it("clears stale in-memory runtime when the authenticated user has no matching runtime", () => {
		const stale = { ...initialLockState, hydrated: true, locked: true, lockedAt: 200, lastActiveAt: 100, version: 200 };
		expect(lockReducer(stale, hydrateLock(null))).toMatchObject({
			hydrated: true,
			locked: false,
			lockedAt: null,
			lastActiveAt: 0,
			version: 0
		});
	});

	it("records activity and preferences", () => {
		expect(lockReducer(initialLockState, recordActivity(50))).toMatchObject({ lastActiveAt: 50, version: 50 });
		expect(lockReducer(initialLockState, setLockPreference({ autoLockEnabled: true, idleTimeoutMinutes: 30 }))).toMatchObject({
			autoLockEnabled: true,
			idleTimeoutMinutes: 30
		});
	});

	it("resets in-memory runtime while remaining hydrated", () => {
		const locked = { ...initialLockState, hydrated: true, locked: true, lockedAt: 200, lastActiveAt: 100, version: 200 };
		expect(lockReducer(locked, resetLockRuntime())).toMatchObject({
			hydrated: true,
			locked: false,
			lockedAt: null,
			lastActiveAt: 0,
			version: 0
		});
	});
});
