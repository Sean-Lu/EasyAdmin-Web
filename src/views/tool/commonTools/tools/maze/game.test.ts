import { describe, expect, it } from "vitest";
import { generateMaze, movePlayer, reachableCells } from "./game";

function openCells(maze: ReturnType<typeof generateMaze>): number[] {
	return maze.walls.map((wall, index) => (wall ? -1 : index)).filter(index => index >= 0);
}

describe("maze", () => {
	it("rejects invalid sizes", () => {
		expect(() => generateMaze(4)).toThrow(RangeError);
		expect(() => generateMaze(33)).toThrow(RangeError);
		expect(() => generateMaze(9.5)).toThrow(RangeError);
	});

	it.each([11, 15, 21])("carves a connected perfect maze on %s × %s", size => {
		for (let round = 0; round < 5; round++) {
			const maze = generateMaze(size);
			const visited = reachableCells(maze);
			// 完美迷宫：通路格（奇数行列）全部连通，数量恰好为格子数
			const expectedCells = ((size - 1) / 2) ** 2;
			expect(openCells(maze)).toHaveLength(expectedCells + (expectedCells - 1));
			// 通路格 = 奇数行 × 奇数列的格子数；额外开放的墙 = 被打通的 (expectedCells - 1) 段
			const pathCells: number[] = [];
			for (let row = 1; row < size; row += 2) {
				for (let column = 1; column < size; column += 2) {
					pathCells.push(row * size + column);
				}
			}
			expect(pathCells).toHaveLength(expectedCells);
			for (const cell of pathCells) {
				expect(maze.walls[cell]).toBe(false);
				expect(visited.has(cell)).toBe(true);
			}
			expect(maze.start).toBe(1 * size + 1);
			expect(maze.exit).toBe((size - 2) * size + (size - 2));
			expect(visited.has(maze.start)).toBe(true);
			expect(visited.has(maze.exit)).toBe(true);
			// 四周边界保持封闭，玩家只能从入口走到出口
			for (let index = 0; index < size; index++) {
				expect(maze.walls[index]).toBe(true);
				expect(maze.walls[(size - 1) * size + index]).toBe(true);
				expect(maze.walls[index * size]).toBe(true);
				expect(maze.walls[index * size + size - 1]).toBe(true);
			}
		}
	});

	it("generates different mazes across rounds", () => {
		const layouts = new Set<string>();
		for (let round = 0; round < 10; round++) {
			layouts.add(
				generateMaze(11)
					.walls.map(wall => (wall ? 1 : 0))
					.join("")
			);
		}
		expect(layouts.size).toBeGreaterThan(5);
	});

	it("moves the player through open cells and blocks walls or edges", () => {
		const size = 5;
		const walls = Array<boolean>(size * size).fill(true);
		const open = (row: number, column: number) => {
			walls[row * size + column] = false;
		};
		open(1, 1);
		open(1, 2);
		open(1, 3);
		open(2, 3);
		open(3, 3);
		const maze = { size, walls, start: 1 * size + 1, exit: 3 * size + 3 };
		const player = maze.start;
		expect(movePlayer(maze, player, "down")).toBe(player); // (2,1) 是墙
		expect(movePlayer(maze, player, "left")).toBe(player); // 越界
		expect(movePlayer(maze, player, "right")).toBe(1 * size + 2);
		let position = player;
		for (const direction of ["right", "right", "down", "down"] as const) {
			position = movePlayer(maze, position, direction);
		}
		expect(position).toBe(maze.exit);
		expect(movePlayer(maze, position, "right")).toBe(position); // 边界外是墙
	});
});
