import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, test } from "vitest";

describe("protected share refresh", () => {
	test("reuses a stored access token before showing the password prompt", () => {
		const source = readFileSync(resolve(__dirname, "index.tsx"), "utf8");

		expect(source).toContain("ShareService.hasAccessToken(shareCode)");
		expect(source).toContain("ShareService.clearAccessToken(shareCode)");
	});

	test("clears previous shared content before showing the password prompt", () => {
		const source = readFileSync(resolve(__dirname, "index.tsx"), "utf8");
		const loadBlock = source.slice(source.indexOf("const load = async"), source.indexOf("useEffect(() => {\n\t\tvoid load"));

		expect(loadBlock).toContain("setFile(undefined)");
		expect(loadBlock).toContain("setNote(undefined)");
		expect(loadBlock).toContain("setNeedPassword(false)");
	});
});
