export interface GameConfig {
	rows: number;
	columns: number;
	mines: number;
}

export interface Cell {
	mine: boolean;
	adjacent: number;
	revealed: boolean;
	flagged: boolean;
}

export interface GameState extends GameConfig {
	cells: Cell[];
	status: "ready" | "playing" | "won" | "lost";
	explodedIndex: number | null;
}

function neighbors(game: GameConfig, index: number): number[] {
	const row = Math.floor(index / game.columns);
	const column = index % game.columns;
	const result: number[] = [];
	for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
		for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
			const nextRow = row + rowOffset;
			const nextColumn = column + columnOffset;
			if (
				(rowOffset !== 0 || columnOffset !== 0) &&
				nextRow >= 0 &&
				nextRow < game.rows &&
				nextColumn >= 0 &&
				nextColumn < game.columns
			) {
				result.push(nextRow * game.columns + nextColumn);
			}
		}
	}
	return result;
}

export function createGame(config: GameConfig): GameState {
	const { rows, columns, mines } = config;
	const safeArea = Math.min(rows, 3) * Math.min(columns, 3);
	if (
		!Number.isInteger(rows) ||
		!Number.isInteger(columns) ||
		!Number.isInteger(mines) ||
		rows < 1 ||
		columns < 1 ||
		mines < 1 ||
		mines > rows * columns - safeArea
	) {
		throw new RangeError("棋盘尺寸或雷数无效，需为首击及周围格子预留安全区域");
	}
	return {
		...config,
		cells: Array.from({ length: rows * columns }, () => ({
			mine: false,
			adjacent: 0,
			revealed: false,
			flagged: false
		})),
		status: "ready",
		explodedIndex: null
	};
}

function placeMines(game: GameState, firstIndex: number): GameState {
	const safeIndices = new Set([firstIndex, ...neighbors(game, firstIndex)]);
	const candidates = game.cells.map((_, index) => index).filter(index => !safeIndices.has(index));
	for (let index = candidates.length - 1; index > 0; index--) {
		const target = Math.floor(Math.random() * (index + 1));
		[candidates[index], candidates[target]] = [candidates[target], candidates[index]];
	}
	const cells = game.cells.map(cell => ({ ...cell }));
	for (const index of candidates.slice(0, game.mines)) {
		cells[index].mine = true;
		for (const neighbor of neighbors(game, index)) cells[neighbor].adjacent++;
	}
	return { ...game, cells, status: "playing" };
}

export function revealCell(game: GameState, index: number): GameState {
	if (
		game.status === "won" ||
		game.status === "lost" ||
		!Number.isInteger(index) ||
		!game.cells[index] ||
		game.cells[index].flagged
	) {
		return game;
	}

	const activeGame = game.status === "ready" ? placeMines(game, index) : game;
	const selected = activeGame.cells[index];
	let pending = [index];
	if (selected.revealed) {
		const surrounding = neighbors(activeGame, index);
		if (
			selected.adjacent === 0 ||
			surrounding.filter(neighbor => activeGame.cells[neighbor].flagged).length !== selected.adjacent
		) {
			return game;
		}
		pending = surrounding.filter(neighbor => !activeGame.cells[neighbor].revealed && !activeGame.cells[neighbor].flagged);
		if (pending.length === 0) return game;
	}

	const cells = activeGame.cells.map(cell => ({ ...cell }));
	while (pending.length > 0) {
		const currentIndex = pending.pop()!;
		const cell = cells[currentIndex];
		if (cell.revealed || cell.flagged) continue;
		cell.revealed = true;
		if (cell.mine) return { ...activeGame, cells, status: "lost", explodedIndex: currentIndex };
		if (cell.adjacent === 0) pending.push(...neighbors(activeGame, currentIndex));
	}

	const won = cells.every(cell => cell.mine || cell.revealed);
	if (won) cells.forEach(cell => (cell.flagged = cell.mine));
	return { ...activeGame, cells, status: won ? "won" : "playing" };
}

export function toggleFlag(game: GameState, index: number): GameState {
	if (
		game.status === "won" ||
		game.status === "lost" ||
		!Number.isInteger(index) ||
		!game.cells[index] ||
		game.cells[index].revealed
	) {
		return game;
	}
	const selected = game.cells[index];
	if (!selected.flagged && game.cells.filter(cell => cell.flagged).length >= game.mines) return game;
	const cells = game.cells.map((cell, cellIndex) => (cellIndex === index ? { ...cell, flagged: !cell.flagged } : cell));
	return { ...game, cells };
}
