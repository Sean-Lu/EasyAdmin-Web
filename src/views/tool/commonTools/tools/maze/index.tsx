import React, { useEffect, useRef, useState } from "react";
import { CaretDownOutlined, CaretLeftOutlined, CaretRightOutlined, CaretUpOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import PuzzleShell, { usePuzzleSession } from "../puzzle/PuzzleShell";
import { generateMaze, movePlayer, type Direction } from "./game";
import "./index.less";

const levels = [
	{ name: "初级 · 11×11", size: 11 },
	{ name: "中级 · 15×15", size: 15 },
	{ name: "高级 · 21×21", size: 21 }
];

const directionKeys: Record<string, Direction> = {
	ArrowUp: "up",
	ArrowDown: "down",
	ArrowLeft: "left",
	ArrowRight: "right",
	w: "up",
	s: "down",
	a: "left",
	d: "right"
};

export default function Maze({ onBack }: { onBack: () => void }) {
	const [level, setLevel] = useState(0);
	const [maze, setMaze] = useState(() => generateMaze(levels[0].size));
	const session = usePuzzleSession(maze.start, position => position === maze.exit, "maze", level);
	// 足迹帮助记路：撤销不擦除足迹，只有换关或重开新迷宫时清空
	const trailRef = useRef<Set<number>>(new Set([maze.start]));
	const boardRef = useRef<HTMLDivElement>(null);
	// 打开页面即聚焦棋盘，键盘用户可以直接感知焦点位置
	useEffect(() => {
		boardRef.current?.focus({ preventScroll: true });
	}, []);

	const step = (direction: Direction) => {
		if (session.solved) return;
		const next = movePlayer(maze, session.state, direction);
		if (next === session.state) return;
		trailRef.current.add(next);
		session.commit(next);
	};

	const restart = (size: number) => {
		const nextMaze = generateMaze(size);
		setMaze(nextMaze);
		trailRef.current = new Set([nextMaze.start]);
		session.reset(nextMaze.start);
	};

	// 键盘监听挂在 window 上，页面打开即可用方向键，点过按钮后也不会失效；输入框聚焦时让位
	useEffect(() => {
		const handleKey = (event: KeyboardEvent) => {
			const target = event.target;
			if (target instanceof Element && target.closest("input, textarea, select")) return;
			const direction = directionKeys[event.key] ?? directionKeys[event.key.toLowerCase()];
			if (!direction) return;
			event.preventDefault();
			if (session.solved) return;
			const next = movePlayer(maze, session.state, direction);
			if (next === session.state) return;
			trailRef.current.add(next);
			session.commit(next);
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [maze, session]);

	return (
		<PuzzleShell
			title="随机迷宫"
			description="每局都是全新的迷宫，找到通往出口的路"
			onBack={onBack}
			levels={levels.map(item => item.name)}
			level={level}
			onLevelChange={index => {
				setLevel(index);
				restart(levels[index].size);
			}}
			onReset={() => restart(levels[level].size)}
			onUndo={session.undo}
			solved={session.solved}
			seconds={session.seconds}
			moves={session.moves}
			canUndo={session.canUndo}
			records={session.records}
			categoryTag="路径探索"
			unsolvedHint="沿通路小心探索，走过的格子会留下足迹"
			solvedHint={`到达出口！用时 ${session.seconds} 秒，走了 ${session.moves} 步`}
			helpNote={
				<>
					键盘方向键或 WASD 移动，触屏可点击下方的方向按钮。重新开始会生成一座全新的随机迷宫。
					撤销会退回上一步（仍计一步）。最佳用时和最少步数分别记录。
				</>
			}
			rules={[
				"目标：从左上角出发，一路走到右下角的绿色出口。迷宫由深度优先算法随机雕刻，每局都不同。",
				"深色格子是墙，无法通行；玩家只能上下左右移动一格，不能斜走。",
				"走过的格子会留下蓝色足迹，帮助你记路和避免绕圈；撤销不会擦除足迹。",
				"每座迷宫保证存在唯一一条从入口到出口的路线，卡住时可以回溯足迹换条路走。"
			]}
			controls={
				<>
					<Space direction="vertical" align="center" size={4}>
						<Button aria-label="向上移动" icon={<CaretUpOutlined />} onClick={() => step("up")} />
						<Space size={4}>
							<Button aria-label="向左移动" icon={<CaretLeftOutlined />} onClick={() => step("left")} />
							<Button aria-label="向下移动" icon={<CaretDownOutlined />} onClick={() => step("down")} />
							<Button aria-label="向右移动" icon={<CaretRightOutlined />} onClick={() => step("right")} />
						</Space>
					</Space>
					<Typography.Text type="secondary">
						位置 {Math.floor(session.state / maze.size) + 1} 行 {(session.state % maze.size) + 1} 列 ·{" "}
						{session.solved ? "已通关" : "探索中"}
					</Typography.Text>
				</>
			}
		>
			<div
				ref={boardRef}
				className="maze-board"
				role="group"
				aria-label={`${maze.size} × ${maze.size} 的随机迷宫`}
				tabIndex={0}
				style={{ gridTemplateColumns: `repeat(${maze.size}, 1fr)` }}
			>
				{maze.walls.map((wall, index) => {
					const isPlayer = index === session.state;
					const isExit = index === maze.exit;
					const isTrail = trailRef.current.has(index) && !isPlayer;
					const label = isPlayer ? "玩家" : isExit ? "出口" : wall ? "墙" : isTrail ? "走过的通路" : "通路";
					return (
						<div
							key={index}
							className={[
								"maze-cell",
								wall ? "is-wall" : "is-path",
								isTrail ? "is-trail" : "",
								isExit ? "is-exit" : "",
								isPlayer ? "is-player" : ""
							]
								.filter(Boolean)
								.join(" ")}
							aria-label={`第 ${Math.floor(index / maze.size) + 1} 行第 ${(index % maze.size) + 1} 列，${label}`}
						/>
					);
				})}
			</div>
		</PuzzleShell>
	);
}
