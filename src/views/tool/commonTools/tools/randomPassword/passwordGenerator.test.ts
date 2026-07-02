import { describe, expect, it } from "vitest";
import { CHARACTER_SETS, generatePassword, validatePasswordOptions, type PasswordOptions } from "./passwordGenerator";

const allOptions: PasswordOptions = {
	length: 16,
	uppercase: true,
	lowercase: true,
	digits: true,
	symbols: true
};

describe("generatePassword", () => {
	it("generates a password with the requested length", () => {
		expect(generatePassword(allOptions, () => 0)).toHaveLength(16);
	});

	it("uses only selected character sets", () => {
		const password = generatePassword({ ...allOptions, uppercase: false, digits: false, symbols: false }, () => 0);

		expect(password).toMatch(/^[a-z]+$/);
	});

	it("contains at least one character from every selected set", () => {
		const password = generatePassword(allOptions, () => 0);

		expect([...CHARACTER_SETS].every(([, characters]) => [...password].some(char => characters.includes(char)))).toBe(true);
	});

	it("is reproducible with an injected random source", () => {
		const values = [1, 2, 3, 4, 5, 6, 7, 8];
		const createRandom = () => {
			let index = 0;
			return (maxExclusive: number) => values[index++ % values.length] % maxExclusive;
		};

		expect(generatePassword({ ...allOptions, length: 8 }, createRandom())).toBe(
			generatePassword({ ...allOptions, length: 8 }, createRandom())
		);
	});

	it.each([
		[{ ...allOptions, uppercase: false, lowercase: false, digits: false, symbols: false }, "至少选择一种字符类型"],
		[{ ...allOptions, length: 3 }, "密码长度应在 4 到 128 位之间"],
		[{ ...allOptions, length: 129 }, "密码长度应在 4 到 128 位之间"],
		[{ ...allOptions, length: 4.5 }, "密码长度必须是整数"]
	])("rejects invalid options", (options, expectedMessage) => {
		expect(validatePasswordOptions(options)).toBe(expectedMessage);
		expect(() => generatePassword(options, () => 0)).toThrow(expectedMessage);
	});
});
