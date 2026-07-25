import { describe, expect, it } from "vitest";
import { getAppName } from "./app";

describe("app title", () => {
	it("returns the configured title", () => {
		expect(getAppName({ VITE_APP_NAME: "  My Admin  " })).toBe("My Admin");
	});

	it("removes env-file quote wrappers", () => {
		expect(getAppName({ VITE_APP_NAME: "'My Admin'" })).toBe("My Admin");
	});

	it("falls back to EasyAdmin for blank values", () => {
		expect(getAppName({ VITE_APP_NAME: "   " })).toBe("EasyAdmin");
	});
});
