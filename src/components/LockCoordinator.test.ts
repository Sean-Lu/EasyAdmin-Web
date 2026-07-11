import { describe, expect, it, vi } from "vitest";
import {
	acceptNewerRuntime,
	applyPreloadedLockAvatar,
	clearRuntimeForEmptyToken,
	completeLockHydrationAfterUserInfoFailure,
	isLockHydratedForToken,
	loadLockAvatar,
	preloadLockAvatar,
	refreshLockAvatar,
	releaseLockAvatar,
	shouldAcceptProfileUpdate,
	setLockedContentAccessibility
} from "./lockCoordinatorUtils";

describe("lock coordinator synchronization", () => {
	it("accepts storage runtime only when its version is newer", () => {
		const dispatch = vi.fn();
		expect(
			acceptNewerRuntime(
				'{"userId":"7","runtime":{"locked":true,"lockedAt":20,"lastActiveAt":10,"version":20}}',
				"7",
				20,
				dispatch
			)
		).toBe(false);
		expect(
			acceptNewerRuntime(
				'{"userId":"8","runtime":{"locked":true,"lockedAt":21,"lastActiveAt":10,"version":21}}',
				"7",
				20,
				dispatch
			)
		).toBe(false);
		expect(
			acceptNewerRuntime(
				'{"userId":"7","runtime":{"locked":true,"lockedAt":21,"lastActiveAt":10,"version":21}}',
				"7",
				20,
				dispatch
			)
		).toBe(true);
		expect(dispatch).toHaveBeenCalledTimes(1);
	});

	it("does not hydrate persisted runtime when user identity lookup fails", () => {
		const hydrate = vi.fn();
		const record = vi.fn();
		completeLockHydrationAfterUserInfoFailure(hydrate, record, 123);
		expect(hydrate).toHaveBeenCalledWith(null);
		expect(record).toHaveBeenCalledWith(123);
	});

	it("clears persisted runtime when the token is empty", () => {
		const clear = vi.fn();
		const reset = vi.fn();
		clearRuntimeForEmptyToken("", clear, reset);
		expect(clear).toHaveBeenCalledOnce();
		expect(reset).toHaveBeenCalledOnce();
	});

	it("requires hydration again whenever the authenticated token changes", () => {
		expect(isLockHydratedForToken("token-b", "token-a")).toBe(false);
		expect(isLockHydratedForToken("token-b", "token-b")).toBe(true);
		expect(isLockHydratedForToken("", "")).toBe(true);
	});

	it("accepts a current-session profile update before initial avatar loading completes", () => {
		expect(shouldAcceptProfileUpdate("", "7")).toBe(true);
		expect(shouldAcceptProfileUpdate("7", "7")).toBe(true);
		expect(shouldAcceptProfileUpdate("7", "8")).toBe(false);
	});

	it("makes routed content inert and hidden from assistive technology only while locked", () => {
		const element = { setAttribute: vi.fn(), removeAttribute: vi.fn() };
		setLockedContentAccessibility(element, true);
		expect(element.setAttribute).toHaveBeenCalledWith("inert", "");
		expect(element.setAttribute).toHaveBeenCalledWith("aria-hidden", "true");
		setLockedContentAccessibility(element, false);
		expect(element.removeAttribute).toHaveBeenCalledWith("inert");
		expect(element.removeAttribute).toHaveBeenCalledWith("aria-hidden");
	});

	it("preloads the uploaded avatar before hydrating the lock screen", async () => {
		const load = vi.fn().mockResolvedValue("blob:uploaded-avatar");

		await expect(loadLockAvatar("7", load)).resolves.toBe("blob:uploaded-avatar");
		expect(load).toHaveBeenCalledWith("7");
	});

	it("falls back when lock-avatar preloading fails", async () => {
		await expect(loadLockAvatar("7", () => Promise.reject(new Error("download failed")))).resolves.toBe("");
	});

	it("applies the preloaded avatar before hydrating the lock state", async () => {
		const order: string[] = [];
		await preloadLockAvatar(
			"7",
			async () => {
				order.push("download");
				return "blob:uploaded-avatar";
			},
			avatar => order.push(`avatar:${avatar}`),
			() => order.push("hydrate")
		);
		expect(order).toEqual(["download", "avatar:blob:uploaded-avatar", "hydrate"]);
	});

	it("releases current and stale lock avatar Blob URLs", () => {
		const revoke = vi.fn();
		releaseLockAvatar("blob:current", revoke);
		releaseLockAvatar("https://example.com/avatar", revoke);
		expect(revoke).toHaveBeenCalledTimes(1);
		expect(revoke).toHaveBeenCalledWith("blob:current");
	});

	it("discards a preloaded avatar when its session becomes inactive", () => {
		const replace = vi.fn();
		const hydrate = vi.fn();
		const record = vi.fn();
		const revoke = vi.fn();

		expect(
			applyPreloadedLockAvatar(false, "blob:stale-avatar", {
				replace,
				hydrate,
				record,
				revoke,
				runtime: null,
				at: 123
			})
		).toBe(false);
		expect(revoke).toHaveBeenCalledWith("blob:stale-avatar");
		expect(replace).not.toHaveBeenCalled();
		expect(hydrate).not.toHaveBeenCalled();
		expect(record).not.toHaveBeenCalled();
	});

	it("replaces the lock avatar when a saved profile has a new avatar file", async () => {
		const replace = vi.fn();
		const revoke = vi.fn();

		await refreshLockAvatar(true, "22", async avatarFileId => `blob:avatar-${avatarFileId}`, { replace, revoke });

		expect(replace).toHaveBeenCalledWith("blob:avatar-22");
		expect(revoke).not.toHaveBeenCalled();
	});
});
