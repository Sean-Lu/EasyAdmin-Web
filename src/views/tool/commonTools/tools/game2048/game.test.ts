import { afterEach, describe, expect, it, vi } from "vitest";
import { canSlide, createBoard, maxTile, slideBoard } from "./game";

function emptyBoard(size: number): number[] {
	return Array<number>(size * size).fill(0);
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe("game2048", () => {
	it("creates a board with exactly two tiles of 2 or 4", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.99);
		const board = createBoard(4);
		const tiles = board.filter(value => value !== 0);
		expect(tiles).toHaveLength(2);
		expect(tiles.every(value => value === 2 || value === 4)).toBe(true);
	});

	it("rejects invalid board sizes", () => {
		expect(() => createBoard(2)).toThrow(RangeError);
		expect(() => createBoard(4.5)).toThrow(RangeError);
	});

	it("slides, merges equal tiles once per pair and scores the merge", () => {
		const board = emptyBoard(4);
		board[0] = 2;
		board[1] = 2;
		board[2] = 4;
		// 新方块的位置与数值由被 mock 的随机数决定，必定生成一个 2
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		const result = slideBoard(board, 4, "left");
		expect(result.moved).toBe(true);
		expect(result.gained).toBe(4);
		expect(result.board.slice(0, 3)).toEqual([4, 4, 0]);
		const spawned = result.board.filter((value, index) => index >= 3 && value !== 0);
		expect(spawned).toEqual([2]);
	});

	it("keeps double merges independent and never merges a tile twice", () => {
		const board = emptyBoard(4);
		board[0] = 2;
		board[1] = 2;
		board[2] = 2;
		board[3] = 2;
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		const result = slideBoard(board, 4, "left");
		expect(result.board.slice(0, 4)).toEqual([4, 4, 0, 0]);
		expect(result.gained).toBe(8);
	});

	it("does not merge tiles separated by a different tile", () => {
		const board = emptyBoard(4);
		board[0] = 2;
		board[1] = 4;
		board[2] = 2;
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		const result = slideBoard(board, 4, "left");
		expect(result.board.slice(0, 3)).toEqual([2, 4, 2]);
		expect(result.gained).toBe(0);
	});

	it("slides and merges in all four directions", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		const column = emptyBoard(4);
		column[0] = 2;
		column[4] = 2; // 第一列
		const up = slideBoard(column, 4, "up");
		expect(up.board[0]).toBe(4);
		expect(up.board[4]).toBe(0);

		const right = slideBoard(up.board, 4, "right");
		expect(right.board[3]).toBeGreaterThan(0);
		expect(right.board[0]).toBe(0);

		const row = emptyBoard(4);
		row[8] = 2;
		row[12] = 2; // 第一列的下面两行
		const down = slideBoard(row, 4, "down");
		expect(down.board[12]).toBe(4);
		expect(down.board[8]).toBe(0);
	});

	it("returns the original board when nothing moves", () => {
		const board = [4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4];
		const spy = vi.spyOn(Math, "random");
		expect(slideBoard(board, 4, "left")).toEqual({ board, moved: false, gained: 0 });
		expect(slideBoard(board, 4, "right").moved).toBe(false);
		expect(slideBoard(board, 4, "up").moved).toBe(false);
		expect(slideBoard(board, 4, "down").moved).toBe(false);
		expect(spy).not.toHaveBeenCalled();
	});

	it("detects stuck boards and available moves", () => {
		const stuck = [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2];
		expect(canSlide(stuck, 4)).toBe(false);
		// 任意一个空位都会让相邻方块有处可去
		const almostStuck = [...stuck];
		almostStuck[15] = 0;
		expect(canSlide(almostStuck, 4)).toBe(true);
	});

	it("tracks the largest tile on the board", () => {
		const board = emptyBoard(4);
		board[5] = 128;
		board[9] = 64;
		expect(maxTile(board)).toBe(128);
		expect(maxTile(emptyBoard(4))).toBe(0);
	});
});
