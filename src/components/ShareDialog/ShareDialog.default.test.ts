import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, test } from "vitest";

describe("new share default", () => {
	test("keeps sharing disabled until the owner explicitly enables it", () => {
		const source = readFileSync(resolve(__dirname, "index.tsx"), "utf8");

		expect(source).toContain("isEnabled: value.exists ? value.isEnabled : false");
		expect(source).toContain("initialValues={{ isEnabled: false }}");
	});
});
