import { describe, expect, it } from "vitest";
import { testRegex } from "./utils";

describe("testRegex", () => {
	it("returns all global matches and capture groups", () => {
		const result = testRegex("(foo)-(\\d+)", "g", "foo-12 bar foo-34");

		expect(result.error).toBeNull();
		expect(result.matches.map(item => item.match)).toEqual(["foo-12", "foo-34"]);
		expect(result.matches[0].captures).toEqual(["foo", "12"]);
	});

	it("returns a readable error for an invalid expression", () => {
		const result = testRegex("[", "", "text");

		expect(result.matches).toEqual([]);
		expect(result.error).toBeTruthy();
	});
});
