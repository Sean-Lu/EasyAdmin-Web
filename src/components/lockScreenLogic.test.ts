import { describe, expect, it, vi } from "vitest";
import md5 from "js-md5";
import { runUnlock, switchAccountCleanup, unlockErrorTranslationKey } from "./lockScreenLogic";

describe("lock screen handlers", () => {
	it("resets the field and unlocks with the current time after success", async () => {
		const resetFields = vi.fn();
		const unlock = vi.fn();
		const verify = vi.fn().mockResolvedValue(true);
		await runUnlock("admin", {
			verify,
			now: () => 123,
			unlock,
			resetFields,
			setError: vi.fn()
		});
		expect(resetFields).toHaveBeenCalledOnce();
		expect(unlock).toHaveBeenCalledWith(123);
		expect(verify).toHaveBeenCalledWith(md5("admin"));
	});

	it("resets a rejected password, reports inline feedback, and does not unlock", async () => {
		const resetFields = vi.fn();
		const unlock = vi.fn();
		const setError = vi.fn();
		expect(
			await runUnlock("bad", {
				verify: vi.fn().mockResolvedValue(false),
				now: () => 123,
				unlock,
				resetFields,
				setError
			})
		).toBe("rejected");
		expect(resetFields).toHaveBeenCalledOnce();
		expect(unlock).not.toHaveBeenCalled();
		expect(setError).toHaveBeenLastCalledWith("rejected");
	});

	it("exposes translation keys for the inline error render contract", () => {
		expect(unlockErrorTranslationKey("rejected")).toBe("lockScreen.wrongPassword");
		expect(unlockErrorTranslationKey("network-error")).toBe("lockScreen.networkFailure");
		expect(unlockErrorTranslationKey(null)).toBeNull();
	});

	it("returns a business message directly for inline rendering", () => {
		expect(unlockErrorTranslationKey({ type: "business-error", message: "当前密码错误" })).toBe("当前密码错误");
	});

	it("cleans all local session state and navigates to login when switching accounts", async () => {
		const deps = {
			logout: vi.fn().mockRejectedValue(new Error("offline")),
			clearToken: vi.fn(),
			clearTabs: vi.fn(),
			resetRuntime: vi.fn(),
			removeStorage: vi.fn(),
			clearRuntime: vi.fn(),
			navigateLogin: vi.fn()
		};
		await switchAccountCleanup(deps);
		expect(deps.logout).toHaveBeenCalledOnce();
		expect(deps.clearToken).toHaveBeenCalledWith("");
		expect(deps.clearTabs).toHaveBeenCalledWith([]);
		expect(deps.resetRuntime).toHaveBeenCalledOnce();
		expect(deps.removeStorage.mock.calls.map(([key]) => key)).toEqual(["Token", "token", "refreshToken"]);
		expect(deps.clearRuntime).toHaveBeenCalledOnce();
		expect(deps.navigateLogin).toHaveBeenCalledOnce();
	});

	it("broadcasts logout after local cleanup", async () => {
		const broadcastLogout = vi.fn();
		await switchAccountCleanup({
			logout: vi.fn(),
			clearToken: vi.fn(),
			clearTabs: vi.fn(),
			resetRuntime: vi.fn(),
			removeStorage: vi.fn(),
			clearRuntime: vi.fn(),
			navigateLogin: vi.fn(),
			broadcastLogout
		});
		expect(broadcastLogout).toHaveBeenCalledOnce();
	});

	it("does not apply an unlock result after the attempt becomes stale", async () => {
		const unlock = vi.fn();
		const setError = vi.fn();
		const isCurrent = vi.fn().mockReturnValue(false);
		const result = await runUnlock("admin", {
			verify: vi.fn().mockResolvedValue(true),
			now: () => 123,
			unlock,
			resetFields: vi.fn(),
			setError,
			isCurrent
		});

		expect(result).toBe("network-error");
		expect(unlock).not.toHaveBeenCalled();
		expect(setError).not.toHaveBeenCalledWith(null);
	});
});
