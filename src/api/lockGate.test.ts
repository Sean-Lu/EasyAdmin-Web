import { beforeEach, describe, expect, it, vi } from "vitest";
import { assertRequestAllowedWhenLocked, shouldSkipGlobalRequestErrorHandling } from "./lockGate";

const post = vi.fn();

vi.mock("@/api", () => ({ default: { post } }));

describe("locked request gate", () => {
	it("allows exactly password verification, logout, and token refresh", () => {
		for (const url of [
			"/auth/verifyPassword",
			"/auth/logout",
			"/auth/refreshToken",
			"/api/auth/verifyPassword",
			"/api/auth/logout",
			"/api/auth/refreshToken"
		]) {
			expect(() => assertRequestAllowedWhenLocked(true, url)).not.toThrow();
		}
		for (const url of [
			"/auth/verifyPassword/extra",
			"/api/auth/verifyPassword?next=/menu/listTree",
			"/auth/logoutAll",
			"/other/auth/refreshToken"
		]) {
			expect(() => assertRequestAllowedWhenLocked(true, url)).toThrow();
		}
	});

	it("rejects a non-allowed request while locked with a recognizable error", () => {
		try {
			assertRequestAllowedWhenLocked(true, "/menu/listTree");
		} catch (error) {
			expect(error).toMatchObject({ code: "APP_LOCKED" });
			expect(shouldSkipGlobalRequestErrorHandling(error)).toBe(true);
		}
		expect(() => assertRequestAllowedWhenLocked(false, "/menu/listTree")).not.toThrow();
	});

	it("allows only an explicitly marked avatar preload while locked", () => {
		expect(() => assertRequestAllowedWhenLocked(true, "/file/downloadfile", true)).not.toThrow();
		expect(() => assertRequestAllowedWhenLocked(true, "/file/downloadfile")).toThrow();
		expect(() => assertRequestAllowedWhenLocked(true, "/menu/listTree", true)).toThrow();
	});

	it("does not classify an ordinary error as a locked request rejection", () => {
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
