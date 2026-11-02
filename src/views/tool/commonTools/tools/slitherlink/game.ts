export interface LoopPuzzle {
	name: string;
	rows: number;
	columns: number;
	clues: number[];
}

/** 水平边在前、竖直边在后；同一条边在相邻两个数字格之间共享 */
export function cellEdges(rows: number, columns: number, row: number, column: number): number[] {
	const horizontal = (rows + 1) * columns;
	return [
		row * columns + column,
		(row + 1) * columns + column,
		horizontal + row * (columns + 1) + column,
		horizontal + row * (columns + 1) + column + 1
	];
}

function createPuzzle(name: string, inside: string[]): LoopPuzzle {
	const rows = inside.length,
		columns = inside[0].length;
	const occupied = (row: number, column: number) => inside[row]?.[column] === "1";
	const lines = Array((rows + 1) * columns + rows * (columns + 1)).fill(0) as number[];
	for (let row = 0; row < rows; row++)
		for (let column = 0; column < columns; column++) {
			if (!occupied(row, column)) continue;
			const edges = cellEdges(rows, columns, row, column);
			[
				[row - 1, column],
				[row + 1, column],
				[row, column - 1],
				[row, column + 1]
			].forEach(([r, c], index) => {
				if (!occupied(r, c)) lines[edges[index]] = 1;
			});
		}
	return {
		name,
		rows,
		columns,
		clues: inside.flatMap((line, row) =>
			[...line].map((_, column) => cellEdges(rows, columns, row, column).filter(edge => lines[edge] === 1).length)
		)
	};
}

export const slitherlinkLevels: LoopPuzzle[] = [
	createPuzzle("01 · 环环相扣 · 4×4", ["0000", "0110", "0110", "0000"]),
	createPuzzle("02 · 回转之路 · 5×5", ["00000", "01110", "01000", "01110", "00000"]),
	createPuzzle("03 · 拾阶成环 · 6×6", ["000000", "011000", "011100", "001110", "000110", "000000"])
];

export function analyzeLoop(puzzle: LoopPuzzle, lines: number[]) {
	const { rows, columns } = puzzle;
	const horizontal = (rows + 1) * columns;
	const edgeCount = horizontal + rows * (columns + 1);
	const counts = puzzle.clues.map(
		(_, index) => cellEdges(rows, columns, Math.floor(index / columns), index % columns).filter(edge => lines[edge] === 1).length
	);
	const graph = new Map<number, number[]>();
	for (let edge = 0; edge < edgeCount; edge++) {
		if (lines[edge] !== 1) continue;
		const a = edge < horizontal ? Math.floor(edge / columns) * (columns + 1) + (edge % columns) : edge - horizontal;
		const b = a + (edge < horizontal ? 1 : columns + 1);
		graph.set(a, [...(graph.get(a) ?? []), b]);
		graph.set(b, [...(graph.get(b) ?? []), a]);
	}
	// 数字全满足也可能存在多个独立小环，必须检查节点度数和整条回路连通性
	let connected = false;
	if (graph.size > 0 && [...graph.values()].every(neighbors => neighbors.length === 2)) {
		const visited = new Set<number>();
		const pending = [graph.keys().next().value as number];
		while (pending.length) {
			const vertex = pending.pop()!;
			if (visited.has(vertex)) continue;
			visited.add(vertex);
			pending.push(...graph.get(vertex)!);
		}
		connected = visited.size === graph.size;
	}
	return {
		counts,
		solved: lines.length === edgeCount && connected && puzzle.clues.every((clue, index) => clue === counts[index])
	};
}
