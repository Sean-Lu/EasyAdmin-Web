import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	LockedRequestError,
	assertRequestAllowedWhenLocked,
	isLockAllowedRequest,
	shouldSkipGlobalRequestErrorHandling
} from "./lockGate";

const post = vi.fn();

vi.mock("@/api", () => ({ default: { post } }));

describe("locked request gate", () => {
	it("allows exactly password verification, logout, and token refresh", () => {
		expect(isLockAllowedRequest("/auth/verifyPassword")).toBe(true);
		expect(isLockAllowedRequest("/auth/logout")).toBe(true);
		expect(isLockAllowedRequest("/auth/refreshToken")).toBe(true);
		expect(isLockAllowedRequest("/api/auth/verifyPassword")).toBe(true);
		expect(isLockAllowedRequest("/api/auth/logout")).toBe(true);
		expect(isLockAllowedRequest("/api/auth/refreshToken")).toBe(true);
		expect(isLockAllowedRequest("/auth/verifyPassword/extra")).toBe(false);
		expect(isLockAllowedRequest("/api/auth/verifyPassword?next=/menu/listTree")).toBe(false);
		expect(isLockAllowedRequest("/auth/logoutAll")).toBe(false);
		expect(isLockAllowedRequest("/other/auth/refreshToken")).toBe(false);
	});

	it("rejects a non-allowed request while locked with a recognizable error", () => {
		expect(() => assertRequestAllowedWhenLocked(true, "/menu/listTree")).toThrow(LockedRequestError);
		try {
			assertRequestAllowedWhenLocked(true, "/menu/listTree");
		} catch (error) {
			expect(error).toMatchObject({ code: "APP_LOCKED" });
		}
		expect(() => assertRequestAllowedWhenLocked(false, "/menu/listTree")).not.toThrow();
	});

	it("allows only an explicitly marked avatar preload while locked", () => {
		expect(() => assertRequestAllowedWhenLocked(true, "/file/downloadfile", true)).not.toThrow();
		expect(() => assertRequestAllowedWhenLocked(true, "/file/downloadfile")).toThrow(LockedRequestError);
		expect(() => assertRequestAllowedWhenLocked(true, "/menu/listTree", true)).toThrow(LockedRequestError);
	});

	it("identifies only locked request errors for zero-side-effect rejection", () => {
		expect(shouldSkipGlobalRequestErrorHandling(new LockedRequestError())).toBe(true);
		expect(shouldSkipGlobalRequestErrorHandling(new Error("network"))).toBe(false);
	});
});

describe("verify password API", () => {
	beforeEach(() => post.mockReset());

	it("posts the password without enabling global loading", async () => {
		post.mockResolvedValue({ code: 200, data: true });
		const { verifyPasswordApi } = await import("./modules/login");

		await verifyPasswordApi("hashed-password");

		expect(post).toHaveBeenCalledWith("/auth/verifyPassword", { password: "hashed-password" }, { headers: { noLoading: true } });
	});
});
