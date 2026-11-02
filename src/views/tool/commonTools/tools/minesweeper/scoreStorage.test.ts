import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mergeRemoteScores, readScores, saveLocalScore } from "./scoreStorage";

beforeEach(() => {
	const values = new Map<string, string>();
	vi.stubGlobal("localStorage", {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => values.set(key, value)
	});
});
afterEach(() => {
	vi.unstubAllGlobals();
});
const score = { difficulty: "beginner" as const, seconds: 30, achievedAt: "2026-10-30T01:00:00Z" };

describe("minesweeper score recovery", () => {
	it("keeps the fastest local result and its date across unsuccessful or tied games", () => {
		saveLocalScore("1:10", score);
		saveLocalScore("1:10", { ...score, seconds: 60 });
		saveLocalScore("1:10", { ...score, achievedAt: "2026-10-31T01:00:00Z" });
		expect(readScores("1:10").beginner).toEqual({ ...score, pending: true });
	});
	it("acknowledges a saved result but preserves a faster result achieved during the request", () => {
		saveLocalScore("1:10", score);
		mergeRemoteScores("1:10", [score]);
		expect(readScores("1:10").beginner?.pending).toBe(false);
		saveLocalScore("1:10", { ...score, seconds: 20 });
		mergeRemoteScores("1:10", [score]);
		expect(readScores("1:10").beginner).toMatchObject({ seconds: 20, pending: true });
		mergeRemoteScores("1:10", [{ ...score, seconds: 15 }]);
		expect(readScores("1:10").beginner).toMatchObject({ seconds: 15, pending: false });
	});
	it("keeps difficulty records independent and tolerates damaged storage", () => {
		saveLocalScore("1:10", score);
		saveLocalScore("1:10", { ...score, difficulty: "expert", seconds: 90 });
		expect(Object.keys(readScores("1:10"))).toHaveLength(2);
		localStorage.setItem("easyadmin:minesweeper:scores:1:10", "broken");
		expect(readScores("1:10")).toEqual({});
	});
});
