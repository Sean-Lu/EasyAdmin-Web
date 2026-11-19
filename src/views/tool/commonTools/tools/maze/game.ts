export type Direction = "up" | "down" | "left" | "right";

export interface Maze {
	/** 迷宫边长（格子数），为奇数 */
	size: number;
	/** true 表示墙；行列均为偶数的格子一定都是墙 */
	walls: boolean[];
	/** 起点，左上角的通路格 */
	start: number;
	/** 终点，右下角的通路格 */
	exit: number;
}

/** 用深度优先回溯法雕刻完美迷宫：通路格占奇数行列，墙占偶数行列或被打通的奇偶交界 */
export function generateMaze(size: number): Maze {
	if (!Number.isInteger(size) || size < 5 || size > 31 || size % 2 === 0) {
		throw new RangeError("迷宫尺寸需为 5 到 31 之间的奇数");
	}
	const walls = Array<boolean>(size * size).fill(true);
	const cellIndex = (row: number, column: number) => row * size + column;
	walls[cellIndex(1, 1)] = false;
	const stack: Array<[number, number]> = [[1, 1]];
	while (stack.length > 0) {
		const [row, column] = stack[stack.length - 1];
		const candidates: Array<[number, number]> = (
			[
				[row - 2, column],
				[row + 2, column],
				[row, column - 2],
				[row, column + 2]
			] as Array<[number, number]>
		).filter(
			([nextRow, nextColumn]) =>
				nextRow >= 1 && nextRow <= size - 2 && nextColumn >= 1 && nextColumn <= size - 2 && walls[cellIndex(nextRow, nextColumn)]
		);
		if (candidates.length === 0) {
			stack.pop();
			continue;
		}
		const [nextRow, nextColumn] = candidates[Math.floor(Math.random() * candidates.length)];
		walls[cellIndex((row + nextRow) / 2, (column + nextColumn) / 2)] = false;
		walls[cellIndex(nextRow, nextColumn)] = false;
		stack.push([nextRow, nextColumn]);
	}
	return { size, walls, start: cellIndex(1, 1), exit: cellIndex(size - 2, size - 2) };
}

/** 沿方向移动一格，撞墙或越界时停留在原地 */
export function movePlayer(maze: Maze, position: number, direction: Direction): number {
	const size = maze.size;
	const row = Math.floor(position / size);
	const column = position % size;
	const nextRow = direction === "up" ? row - 1 : direction === "down" ? row + 1 : row;
	const nextColumn = direction === "left" ? column - 1 : direction === "right" ? column + 1 : column;
	if (nextRow < 0 || nextRow >= size || nextColumn < 0 || nextColumn >= size) return position;
	const next = nextRow * size + nextColumn;
	return maze.walls[next] ? position : next;
}

/** 广度优先搜索，返回从起点可达的全部格子，用于校验迷宫连通性 */
export function reachableCells(maze: Maze): Set<number> {
	const { size, walls, start } = maze;
	const visited = new Set<number>([start]);
	const queue = [start];
	while (queue.length > 0) {
		const current = queue.shift()!;
		const row = Math.floor(current / size);
		const column = current % size;
		for (const [nextRow, nextColumn] of [
			[row - 1, column],
			[row + 1, column],
			[row, column - 1],
			[row, column + 1]
		] as Array<[number, number]>) {
			if (nextRow < 0 || nextRow >= size || nextColumn < 0 || nextColumn >= size) continue;
			const next = nextRow * size + nextColumn;
			if (!walls[next] && !visited.has(next)) {
				visited.add(next);
				queue.push(next);
			}
		}
	}
	return visited;
}
