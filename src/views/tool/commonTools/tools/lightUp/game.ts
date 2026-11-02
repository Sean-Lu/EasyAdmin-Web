/** . 为白格，数字为黑墙及其四邻灯泡数；墙会截断光线 */
export const lightUpLevels = [
	{ name: "01 · 初见灯光 · 5×5", board: ["1.0.0", "..1..", "..1.1", "11...", ".2..1"] },
	{ name: "02 · 曲径微光 · 6×6", board: ["1..2..", "......", "....10", "..0...", "0.0.3.", "......"] },
	{ name: "03 · 灯火迷宫 · 7×7", board: ["00.00..", "0..0002", "1...1..", "...1.11", "......0", ".1.1...", ".....10"] }
];

export function analyzeLights(board: string[], cells: number[]) {
	const width = board[0].length;
	const lit = Array(board.length * width).fill(false) as boolean[];
	const conflicts = new Set<number>();
	const clues: { index: number; required: number; count: number }[] = [];
	for (let row = 0; row < board.length; row++) {
		for (let column = 0; column < width; column++) {
			const index = row * width + column;
			if (board[row][column] !== ".") {
				const required = Number(board[row][column]);
				if (Number.isInteger(required)) {
					let count = 0;
					for (const [dr, dc] of [
						[0, 1],
						[0, -1],
						[1, 0],
						[-1, 0]
					]) {
						const r = row + dr,
							c = column + dc;
						if (r >= 0 && r < board.length && c >= 0 && c < width && board[r][c] === "." && cells[r * width + c] === 1) count++;
					}
					clues.push({ index, required, count });
				}
				continue;
			}
			if (cells[index] !== 1) continue;
			lit[index] = true;
			// 光线仅横竖传播；碰到其他灯泡时，两盏灯均冲突
			for (const [dr, dc] of [
				[0, 1],
				[0, -1],
				[1, 0],
				[-1, 0]
			]) {
				let r = row + dr,
					c = column + dc;
				while (r >= 0 && r < board.length && c >= 0 && c < width && board[r][c] === ".") {
					const next = r * width + c;
					lit[next] = true;
					if (cells[next] === 1) {
						conflicts.add(index);
						conflicts.add(next);
					}
					r += dr;
					c += dc;
				}
			}
		}
	}
	const solved =
		cells.length === lit.length &&
		conflicts.size === 0 &&
		board.every((line, row) =>
			[...line].every((value, column) => (value === "." ? lit[row * width + column] : cells[row * width + column] !== 1))
		) &&
		clues.every(clue => clue.count === clue.required);
	return { lit, conflicts, clues, solved };
}
