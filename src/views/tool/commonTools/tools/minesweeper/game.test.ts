import { afterEach, describe, expect, it, vi } from "vitest";
import { createGame, revealCell, toggleFlag, type GameState } from "./game";

// Fixed positions make loss, flood-fill, and chord scenarios independent of random layouts.
function board(rows: number, columns: number, mines: number[]): GameState {
	return {
		rows,
		columns,
		mines: mines.length,
		status: "playing",
		explodedIndex: null,
		cells: Array.from({ length: rows * columns }, (_, index) => ({
			mine: mines.includes(index),
			adjacent: mines.filter(mine => {
				const rowDistance = Math.abs(Math.floor(mine / columns) - Math.floor(index / columns));
				const columnDistance = Math.abs((mine % columns) - (index % columns));
				return mine !== index && rowDistance <= 1 && columnDistance <= 1;
			}).length,
			revealed: false,
			flagged: false
		}))
	};
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe("minesweeper", () => {
	it.each([
		{ rows: 9, columns: 9, mines: 10 },
		{ rows: 16, columns: 16, mines: 40 },
		{ rows: 16, columns: 30, mines: 99 }
	])("defers mine placement and protects the first click and its neighbors on $rows × $columns", config => {
		vi.spyOn(Math, "random").mockReturnValue(0.42);
		for (const first of [0, config.columns + 1, config.rows * config.columns - 1]) {
			const initial = createGame(config);
			expect(initial.status).toBe("ready");
			expect(initial.cells.every(cell => !cell.mine && !cell.revealed)).toBe(true);
			const started = revealCell(initial, first);
			expect(started.cells.filter(cell => cell.mine)).toHaveLength(config.mines);
			expect(started.cells[first]).toMatchObject({ mine: false, adjacent: 0, revealed: true });
			for (let index = 0; index < started.cells.length; index++) {
				const adjacentMines = started.cells.filter((cell, other) => {
					return (
						cell.mine &&
						other !== index &&
						Math.abs(Math.floor(other / config.columns) - Math.floor(index / config.columns)) <= 1 &&
						Math.abs((other % config.columns) - (index % config.columns)) <= 1
					);
				}).length;
				expect(started.cells[index].adjacent).toBe(adjacentMines);
			}
			expect(initial.cells.every(cell => !cell.mine && !cell.revealed)).toBe(true);
		}
	});

	it("supports flags before the first reveal without placing mines or exceeding the mine count", () => {
		const initial = createGame({ rows: 9, columns: 9, mines: 10 });
		let flagged = initial;
		for (let index = 0; index < 10; index++) flagged = toggleFlag(flagged, index);
		expect(flagged.status).toBe("ready");
		expect(flagged.cells.every(cell => !cell.mine)).toBe(true);
		expect(flagged.cells.filter(cell => cell.flagged)).toHaveLength(10);
		expect(toggleFlag(flagged, 10)).toBe(flagged);
		expect(revealCell(flagged, 0)).toBe(flagged);
		const unflagged = toggleFlag(flagged, 0);
		expect(unflagged.cells[0].flagged).toBe(false);
		expect(toggleFlag(unflagged, 10).cells[10].flagged).toBe(true);
		expect(initial.cells.every(cell => !cell.flagged)).toBe(true);
	});

	it("floods connected empty cells and their border numbers, preserving flagged cells", () => {
		const initial = board(4, 4, [0]);
		const flagged = toggleFlag(initial, 15);
		const opened = revealCell(flagged, 12);
		expect(opened.status).toBe("playing");
		expect(opened.cells[0].revealed).toBe(false);
		expect(opened.cells[15]).toMatchObject({ flagged: true, revealed: false });
		expect(opened.cells.filter(cell => cell.revealed)).toHaveLength(14);
		expect(initial.cells.every(cell => !cell.revealed)).toBe(true);
		const won = revealCell(toggleFlag(opened, 15), 15);
		expect(won.status).toBe("won");
		expect(won.cells[0]).toMatchObject({ mine: true, flagged: true, revealed: false });
		expect(won.cells.filter(cell => cell.revealed)).toHaveLength(15);
	});

	it("does not wrap flood-fill across left and right row boundaries", () => {
		const initial = board(3, 4, [0, 4, 8]);
		const opened = revealCell(initial, 3);
		expect(opened.status).toBe("won");
		expect(opened.cells[1].revealed).toBe(true);
		expect(opened.cells[5].revealed).toBe(true);
		expect(opened.cells[9].revealed).toBe(true);
		expect(opened.cells.filter(cell => cell.mine && cell.revealed)).toHaveLength(0);
	});

	it("opens a single number without revealing adjacent cells, and prevents flagging revealed cells", () => {
		const opened = revealCell(board(3, 3, [0]), 4);
		expect(opened.cells.filter(cell => cell.revealed)).toHaveLength(1);
		expect(opened.cells[4].adjacent).toBe(1);
		expect(toggleFlag(opened, 4)).toBe(opened);
		expect(revealCell(opened, 4)).toBe(opened);
	});

	it("chords a revealed number when its surrounding flags are correct", () => {
		const opened = revealCell(board(3, 3, [0]), 4);
		const flagged = toggleFlag(opened, 0);
		const chorded = revealCell(flagged, 4);
		expect(chorded.status).toBe("won");
		expect(chorded.cells.every(cell => cell.mine || cell.revealed)).toBe(true);
		expect(chorded.cells[0].revealed).toBe(false);
	});

	it("loses when chording with an incorrect flag even if the flag count matches", () => {
		const opened = revealCell(board(3, 3, [0]), 4);
		const wronglyFlagged = toggleFlag(opened, 1);
		const lost = revealCell(wronglyFlagged, 4);
		expect(lost.status).toBe("lost");
		expect(lost.explodedIndex).toBe(0);
		expect(lost.cells[0].revealed).toBe(true);
		expect(lost.cells[1]).toMatchObject({ flagged: true, revealed: false });
	});

	it("does not chord until the adjacent flag count matches", () => {
		const opened = revealCell(board(3, 3, [0, 2]), 4);
		expect(revealCell(opened, 4)).toBe(opened);
		const partialFlags = toggleFlag(opened, 0);
		expect(revealCell(partialFlags, 4)).toBe(partialFlags);
	});

	it("records the exploded mine and locks all actions after a loss", () => {
		const initial = board(3, 3, [0, 8]);
		const lost = revealCell(initial, 8);
		expect(lost.status).toBe("lost");
		expect(lost.explodedIndex).toBe(8);
		expect(revealCell(lost, 1)).toBe(lost);
		expect(toggleFlag(lost, 0)).toBe(lost);
		expect(initial.cells[8].revealed).toBe(false);
	});

	it("wins after all safe cells are revealed without requiring manual flags and locks the result", () => {
		const won = revealCell(board(3, 3, [0]), 8);
		expect(won.status).toBe("won");
		expect(won.cells[0].flagged).toBe(true);
		expect(revealCell(won, 0)).toBe(won);
		expect(toggleFlag(won, 0)).toBe(won);
	});
});
