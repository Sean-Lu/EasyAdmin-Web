/** 固定图案关卡：线索从图案计算，判胜检查行列约束，允许满足线索的等价解 */
export const nonogramLevels = [
	{ name: "01 · 初心 · 5×5", picture: ["01110", "11111", "11111", "01110", "00100"] },
	{ name: "02 · 菱形 · 7×7", picture: ["0001000", "0011100", "0111110", "1111111", "0111110", "0011100", "0001000"] },
	{ name: "03 · 小猫 · 7×7", picture: ["1000001", "1100011", "1111111", "1011101", "1111111", "0111110", "0011100"] }
];

/** 连续黑格组之间必须至少有一个空格；全空行用 0 提示 */
export function runs(values: number[]): number[] {
	const groups: number[] = [];
	let count = 0;
	for (const value of [...values, 0]) {
		if (value === 1) count++;
		else if (count) {
			groups.push(count);
			count = 0;
		}
	}
	return groups.length ? groups : [0];
}

export function nonogramClues(picture: string[]) {
	return {
		rows: picture.map(row => runs([...row].map(Number))),
		columns: [...picture[0]].map((_, column) => runs(picture.map(row => Number(row[column]))))
	};
}

export function isNonogramSolved(picture: string[], cells: number[]): boolean {
	if (cells.length !== picture.length * picture[0].length) return false;
	const clues = nonogramClues(picture);
	const width = picture[0].length;
	return (
		clues.rows.every((clue, row) => runs(cells.slice(row * width, (row + 1) * width)).join(",") === clue.join(",")) &&
		clues.columns.every((clue, column) => runs(picture.map((_, row) => cells[row * width + column])).join(",") === clue.join(","))
	);
}
