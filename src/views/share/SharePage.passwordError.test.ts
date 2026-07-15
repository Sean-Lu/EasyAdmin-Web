import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, test } from "vitest";

describe("protected share password error", () => {
	test("does not show a second page-level error after the request interceptor", () => {
		const source = readFileSync(resolve(__dirname, "index.tsx"), "utf8");
		const verifyBlock = source.slice(source.indexOf("const verify"), source.indexOf("const download"));

		expect(verifyBlock).not.toContain("message.error");
	});
});
