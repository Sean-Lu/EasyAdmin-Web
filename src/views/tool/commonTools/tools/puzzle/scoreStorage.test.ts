import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PuzzleScore } from "@/services/user/userPreferenceService";
import { mergePuzzleScores, puzzleScoreKey, puzzleStorageKey, readPuzzleScores, recordPuzzleWin } from "./scoreStorage";

const first: PuzzleScore = {
	game: "nonogram",
	level: "v1-1",
	bestSeconds: 30,
	bestMoves: 25,
	bestSecondsAt: "2026-10-29T01:00:00Z",
	bestMovesAt: "2026-10-29T01:00:00Z",
	firstCompletedAt: "2026-10-29T01:00:00Z"
};
const key = puzzleScoreKey(first.game, first.level);
beforeEach(() => {
	const data = new Map<string, string>();
	vi.stubGlobal("localStorage", {
		getItem: (name: string) => data.get(name) ?? null,
		setItem: (name: string, value: string) => {
			data.set(name, value);
		}
	});
});
afterEach(() => {
	vi.unstubAllGlobals();
});

describe("puzzle score persistence", () => {
	it("uses server achievement dates on tied scores from another device", () => {
		const later = "2026-10-29T03:00:00Z";
		recordPuzzleWin("2:10", { ...first, firstCompletedAt: later, bestSecondsAt: later, bestMovesAt: later });
		mergePuzzleScores("2:10", [first]);
		expect(readPuzzleScores("2:10")[key]).toEqual({ ...first, pending: false });
	});
	it("keeps games and versioned levels separate", () => {
		recordPuzzleWin("2:10", first);
		recordPuzzleWin("2:10", { ...first, game: "lightUp" });
		recordPuzzleWin("2:10", { ...first, level: "v1-2" });
		expect(Object.keys(readPuzzleScores("2:10"))).toHaveLength(3);
	});
	it("merges time and move records independently and retains the first completion", () => {
		recordPuzzleWin("2:10", first);
		recordPuzzleWin("2:10", {
			...first,
			bestSeconds: 20,
			bestMoves: 40,
			bestSecondsAt: "2026-10-29T02:00:00Z",
			firstCompletedAt: "2026-10-29T02:00:00Z",
			bestMovesAt: "2026-10-29T02:00:00Z"
		});
		const saved = readPuzzleScores("2:10")[key];
		expect(saved).toMatchObject({
			bestSeconds: 20,
			bestMoves: 25,
			bestSecondsAt: "2026-10-29T02:00:00Z",
			bestMovesAt: first.bestMovesAt,
			firstCompletedAt: first.firstCompletedAt
		});
	});
	it("does not clear pending when an older response confirms only one record", () => {
		recordPuzzleWin("2:10", first);
		mergePuzzleScores("2:10", [first]);
		expect(readPuzzleScores("2:10")[key].pending).toBe(false);
		recordPuzzleWin("2:10", { ...first, bestSeconds: 15, bestMoves: 50 });
		mergePuzzleScores("2:10", [{ ...first, bestMoves: 10 }]);
		expect(readPuzzleScores("2:10")[key]).toMatchObject({ bestSeconds: 15, bestMoves: 10, pending: true });
		mergePuzzleScores("2:10", [{ ...first, bestSeconds: 15, bestMoves: 10 }]);
		expect(readPuzzleScores("2:10")[key].pending).toBe(false);
	});
	it("requires first completion to be acknowledged as well", () => {
		recordPuzzleWin("2:10", first);
		mergePuzzleScores("2:10", [
			{
				...first,
				firstCompletedAt: "2026-10-29T01:30:00Z",
				bestSecondsAt: "2026-10-29T01:30:00Z",
				bestMovesAt: "2026-10-29T01:30:00Z"
			}
		]);
		expect(readPuzzleScores("2:10")[key].pending).toBe(true);
	});
	it("does not mark a slower replay as pending and ignores malformed storage", () => {
		mergePuzzleScores("2:10", [first]);
		recordPuzzleWin("2:10", { ...first, bestSeconds: 60, bestMoves: 50 });
		expect(readPuzzleScores("2:10")[key].pending).toBe(false);
		localStorage.setItem(puzzleStorageKey("2:10"), "broken");
		expect(readPuzzleScores("2:10")).toEqual({});
		localStorage.setItem(puzzleStorageKey("2:10"), JSON.stringify({ [key]: { ...first, bestMoves: 0, pending: true } }));
		expect(readPuzzleScores("2:10")).toEqual({});
	});
});
