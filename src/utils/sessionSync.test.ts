import { describe, expect, it, vi } from "vitest";
import { applyRemoteLogout, createLogoutEvent, handleLogoutStorageEvent, LOGOUT_EVENT_KEY } from "./sessionSync";

describe("session synchronization", () => {
	it("creates a versioned logout event", () => {
		expect(createLogoutEvent(123)).toEqual({ type: "logout", version: 1, at: 123 });
	});

	it("applies valid logout events once without rebroadcasting", () => {
		const cleanup = vi.fn();
		expect(handleLogoutStorageEvent(LOGOUT_EVENT_KEY, JSON.stringify(createLogoutEvent(123)), cleanup)).toBe(true);
		expect(cleanup).toHaveBeenCalledOnce();
		expect(handleLogoutStorageEvent(LOGOUT_EVENT_KEY, "{}", cleanup)).toBe(false);
	});

	it("performs complete remote cleanup without broadcasting another event", () => {
		const deps = {
			setToken: vi.fn(),
			setTabsList: vi.fn(),
			resetRuntime: vi.fn(),
			clearRuntime: vi.fn(),
			removeStorage: vi.fn(),
			navigateLogin: vi.fn()
		};
		applyRemoteLogout(deps);
		expect(deps.setToken).toHaveBeenCalledWith("");
		expect(deps.setTabsList).toHaveBeenCalledWith([]);
		expect(deps.resetRuntime).toHaveBeenCalledOnce();
		expect(deps.clearRuntime).toHaveBeenCalledOnce();
		expect(deps.removeStorage.mock.calls.map(([key]) => key)).toEqual(["Token", "token", "refreshToken"]);
		expect(deps.navigateLogin).toHaveBeenCalledOnce();
		expect("broadcastLogout" in deps).toBe(false);
	});
});
