import { beforeEach, describe, expect, it } from "vitest";
import {
	beginExplicitLogout,
	captureLoginRedirect,
	consumeAuthorizedLoginRedirect,
	finishExplicitLogout,
	LOGIN_REDIRECT_KEY
} from "./authRedirect";

const createMemoryStorage = (): Storage => {
	const values = new Map<string, string>();
	return {
		get length() {
			return values.size;
		},
		clear: () => values.clear(),
		getItem: key => values.get(key) ?? null,
		key: index => [...values.keys()][index] ?? null,
		removeItem: key => void values.delete(key),
		setItem: (key, value) => void values.set(key, value)
	};
};

Object.defineProperty(globalThis, "localStorage", { configurable: true, value: createMemoryStorage() });
Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: createMemoryStorage() });

describe("login redirect authorization", () => {
	beforeEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});

	it("captures a protected path for a normal unauthenticated visit", () => {
		captureLoginRedirect("/system/menu");

		expect(localStorage.getItem(LOGIN_REDIRECT_KEY)).toBe("/system/menu");
	});

	it("clears and suppresses redirect capture during explicit logout", () => {
		localStorage.setItem(LOGIN_REDIRECT_KEY, "/system/menu");

		beginExplicitLogout();
		captureLoginRedirect("/system/menu");

		expect(localStorage.getItem(LOGIN_REDIRECT_KEY)).toBeNull();
	});

	it("restores an authorized redirect and consumes it once", () => {
		localStorage.setItem(LOGIN_REDIRECT_KEY, "/system/menu");

		expect(consumeAuthorizedLoginRedirect(["/system/menu"], "/home/index", "/403")).toBe("/system/menu");
		expect(consumeAuthorizedLoginRedirect(["/system/menu"], "/home/index", "/403")).toBe("/home/index");
	});

	it("does not overwrite the protected redirect while already on the login page", () => {
		localStorage.setItem(LOGIN_REDIRECT_KEY, "/user/todoList?status=pending");

		captureLoginRedirect("/login");

		expect(localStorage.getItem(LOGIN_REDIRECT_KEY)).toBe("/user/todoList?status=pending");
	});

	it("authorizes by pathname and restores the redirect query string", () => {
		localStorage.setItem(LOGIN_REDIRECT_KEY, "/user/todoList?status=pending");

		expect(consumeAuthorizedLoginRedirect(["/user/todoList"], "/home/index", "/403")).toBe("/user/todoList?status=pending");
	});

	it("returns the forbidden page when the new account does not authorize the redirect", () => {
		localStorage.setItem(LOGIN_REDIRECT_KEY, "/system/menu");

		expect(consumeAuthorizedLoginRedirect(["/user/profile"], "/home/index", "/403")).toBe("/403");
		expect(localStorage.getItem(LOGIN_REDIRECT_KEY)).toBeNull();
	});

	it("allows redirect capture again after the explicit logout phase finishes", () => {
		beginExplicitLogout();
		finishExplicitLogout();

		captureLoginRedirect("/system/menu");

		expect(localStorage.getItem(LOGIN_REDIRECT_KEY)).toBe("/system/menu");
	});
});
