import { beforeEach, describe, expect, it, vi } from "vitest";
import { ShareService } from "./shareService";

vi.mock("@/api/index", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const createMemoryStorage = (): Storage => {
	const values = new Map<string, string>();
	return {
		get length() {
			return values.size;
		},
		clear: () => values.clear(),
		getItem: key => values.get(key) ?? null,
		key: index => Array.from(values.keys())[index] ?? null,
		removeItem: key => values.delete(key),
		setItem: (key, value) => values.set(key, value)
	};
};

Object.defineProperty(globalThis, "localStorage", { configurable: true, value: createMemoryStorage() });
Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: createMemoryStorage() });

describe("share access token storage", () => {
	beforeEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});

	it("reads an unexpired token from browser-wide storage", () => {
		localStorage.setItem(
			"share-access-token:abc",
			JSON.stringify({ accessToken: "shared-token", expiresAt: Date.now() + 60_000 })
		);

		expect(ShareService.getAccessToken("abc")).toBe("shared-token");
		expect(ShareService.hasAccessToken("abc")).toBe(true);
	});

	it("removes an expired token instead of reusing it", () => {
		const key = "share-access-token:abc";
		localStorage.setItem(key, JSON.stringify({ accessToken: "expired-token", expiresAt: Date.now() - 1 }));

		expect(ShareService.getAccessToken("abc")).toBeUndefined();
		expect(localStorage.getItem(key)).toBeNull();
	});
});
