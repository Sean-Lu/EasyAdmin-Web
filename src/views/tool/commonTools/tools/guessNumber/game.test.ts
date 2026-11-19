import { describe, expect, it } from "vitest";
import { createSecret, judgeGuess, validateGuess } from "./game";

describe("guessNumber", () => {
	it("rejects invalid secret lengths", () => {
		expect(() => createSecret(2)).toThrow(RangeError);
		expect(() => createSecret(6)).toThrow(RangeError);
		expect(() => createSecret(4.5)).toThrow(RangeError);
	});

	it("creates secrets with distinct digits only", () => {
		for (let round = 0; round < 50; round++) {
			for (const length of [3, 4, 5]) {
				const secret = createSecret(length);
				expect(secret).toHaveLength(length);
				expect(new Set(secret).size).toBe(length);
				expect(secret).toMatch(/^\d+$/);
			}
		}
	});

	it("counts A for exact positions and B for misplaced digits", () => {
		const secret = "1234";
		expect(judgeGuess(secret, "1234")).toEqual({ a: 4, b: 0 });
		expect(judgeGuess(secret, "4321")).toEqual({ a: 0, b: 4 });
		expect(judgeGuess(secret, "1357")).toEqual({ a: 1, b: 1 });
		expect(judgeGuess(secret, "5678")).toEqual({ a: 0, b: 0 });
		expect(judgeGuess(secret, "1203")).toEqual({ a: 2, b: 1 });
	});

	it("does not count a digit more often than it appears", () => {
		const secret = "1234";
		expect(judgeGuess(secret, "1111")).toEqual({ a: 1, b: 0 });
		expect(judgeGuess(secret, "5551")).toEqual({ a: 0, b: 1 });
	});

	it("validates guess input with friendly messages", () => {
		expect(validateGuess("123", 4)).toBe("请输入 4 位数字");
		expect(validateGuess("12a4", 4)).toBe("只能包含数字");
		expect(validateGuess("1224", 4)).toBe("数字不能重复");
		expect(validateGuess("1234", 4)).toBeNull();
		expect(validateGuess("012", 3)).toBeNull();
	});
});
