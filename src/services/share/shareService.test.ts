import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, test } from "vitest";

describe("share list service", () => {
	test("uses the authenticated share list endpoint and excludes password fields", () => {
		const source = readFileSync(resolve(__dirname, "shareService.ts"), "utf8");

		expect(source).toContain('request.get<PageRes<ShareListItemDto>>("/Share/List", params)');
		expect(source).toContain("hasPassword: boolean");
		expect(source).not.toContain("password?: string;\n\tshareCode");
	});
});
