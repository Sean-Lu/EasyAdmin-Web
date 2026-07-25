import { describe, expect, it } from "vitest";
import { detectCodeLanguage } from "./languages";

describe("detectCodeLanguage", () => {
	it("maps common generated file extensions to syntax languages", () => {
		expect(detectCodeLanguage("User.java")).toBe("java");
		expect(detectCodeLanguage("UserController.cs")).toBe("csharp");
		expect(detectCodeLanguage("app.tsx")).toBe("typescript");
		expect(detectCodeLanguage("config.json")).toBe("json");
		expect(detectCodeLanguage("styles.less")).toBe("less");
		expect(detectCodeLanguage("query.sql")).toBe("sql");
		expect(detectCodeLanguage("src/USER.JAVA")).toBe("java");
	});

	it("falls back to plaintext for unknown extensions", () => {
		expect(detectCodeLanguage("README.unknown")).toBe("text");
	});
});
