export type Direction = "up" | "down" | "left" | "right";

export interface SlideResult {
	board: number[];
	moved: boolean;
	gained: number;
}

function spawnTile(board: number[]): void {
	const empties = board.map((value, index) => (value === 0 ? index : -1)).filter(index => index >= 0);
	if (empties.length === 0) return;
	const index = empties[Math.floor(Math.random() * empties.length)];
	board[index] = Math.random() < 0.9 ? 2 : 4;
}

export function createBoard(size: number): number[] {
	if (!Number.isInteger(size) || size < 3 || size > 6) throw new RangeError("盘面尺寸需在 3 到 6 之间");
	const board = Array<number>(size * size).fill(0);
	spawnTile(board);
	spawnTile(board);
	return board;
}

/** 把一行（或一列）向数组起始方向压缩合并，返回新行、得分与本行是否移动 */
function slideLine(line: number[]): { line: number[]; gained: number; moved: boolean } {
	const tiles = line.filter(value => value !== 0);
	const merged: number[] = [];
	let gained = 0;
	for (let index = 0; index < tiles.length; index++) {
		if (index + 1 < tiles.length && tiles[index] === tiles[index + 1]) {
			const value = tiles[index] * 2;
			merged.push(value);
			gained += value;
			index++;
		} else {
			merged.push(tiles[index]);
		}
	}
	while (merged.length < line.length) merged.push(0);
	return { line: merged, gained, moved: merged.some((value, index) => value !== line[index]) };
}

function lineIndices(size: number, group: number, direction: Direction): number[] {
	const indices: number[] = [];
	for (let step = 0; step < size; step++) {
		if (direction === "left" || direction === "right") {
			const column = direction === "left" ? step : size - 1 - step;
			indices.push(group * size + column);
		} else {
			const row = direction === "up" ? step : size - 1 - step;
			indices.push(row * size + group);
		}
	}
	return indices;
}

export function slideBoard(board: number[], size: number, direction: Direction): SlideResult {
	if (!Number.isInteger(size) || size < 1 || board.length !== size * size) throw new RangeError("盘面尺寸与棋盘数据不一致");
	const next = [...board];
	let moved = false;
	let gained = 0;
	for (let group = 0; group < size; group++) {
		const indices = lineIndices(size, group, direction);
		const result = slideLine(indices.map(index => board[index]));
		if (!result.moved) continue;
		moved = true;
		gained += result.gained;
		indices.forEach((index, position) => {
			next[index] = result.line[position];
		});
	}
	if (moved) spawnTile(next);
	return moved ? { board: next, moved, gained } : { board, moved: false, gained: 0 };
}

export function maxTile(board: number[]): number {
	return board.reduce((largest, value) => Math.max(largest, value), 0);
}

export function canSlide(board: number[], size: number): boolean {
	return (["up", "down", "left", "right"] as Direction[]).some(direction => slideBoard(board, size, direction).moved);
}
