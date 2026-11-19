import React, { useEffect, useRef, useState } from "react";
import { CaretDownOutlined, CaretLeftOutlined, CaretRightOutlined, CaretUpOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import PuzzleShell, { usePuzzleSession } from "../puzzle/PuzzleShell";
import { canSlide, createBoard, maxTile, slideBoard, type Direction } from "./game";
import "./index.less";

const levels = [
	{ name: "初级 · 3×3 冲 128", size: 3, target: 128 },
	{ name: "中级 · 4×4 冲 1024", size: 4, target: 1024 },
	{ name: "高级 · 4×4 冲 2048", size: 4, target: 2048 }
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

export default function Game2048({ onBack }: { onBack: () => void }) {
	const [level, setLevel] = useState(0);
	const { size, target } = levels[level];
	const session = usePuzzleSession(createBoard(levels[0].size), board => maxTile(board) >= target, "game2048", level);
	const largest = maxTile(session.state);
	const stuck = !session.solved && !canSlide(session.state, size);
	// 打开页面即聚焦棋盘，键盘用户可以直接感知焦点位置
	const boardRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		boardRef.current?.focus({ preventScroll: true });
	}, []);

	const move = (direction: Direction) => {
		if (session.solved) return;
		const result = slideBoard(session.state, size, direction);
		if (result.moved) session.commit(result.board);
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
			const result = slideBoard(session.state, size, direction);
			if (result.moved) session.commit(result.board);
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [session, size]);

	return (
		<PuzzleShell
			title="2048"
			description="滑动合并相同的数字，冲向目标方块"
			onBack={onBack}
			levels={levels.map(item => item.name)}
			level={level}
			onLevelChange={index => {
				setLevel(index);
				session.reset(createBoard(levels[index].size));
			}}
			onReset={() => session.reset(createBoard(size))}
			onUndo={session.undo}
			solved={session.solved}
			seconds={session.seconds}
			moves={session.moves}
			canUndo={session.canUndo}
			records={session.records}
			categoryTag="数字合成"
			unsolvedHint={stuck ? "没有可以合并的方向了，试试撤销上一步或重新开始" : "每局随机刷新，规划好合并路线再动手"}
			solvedHint={`挑战完成！你合出了 ${target}，共用 ${session.moves} 步`}
			helpNote={
				<>
					键盘方向键或 WASD 滑动，触屏可点击棋盘下方的方向按钮。撤销会把棋盘退回上一步（仍计一步）。 每次移动会随机出现一个 2 或
					4，最佳用时和最少步数分别记录。
				</>
			}
			rules={[
				"目标：合并数字方块，先合出目标方块（按所选难度为 128 / 1024 / 2048）即通关。",
				"每次向一个方向滑动，所有方块滑到底，相同数字相撞合并成它们的和，一次滑动中每个方块最多合并一次。",
				"有效滑动后会随机出现一个新方块（90% 是 2，10% 是 4）；当棋盘填满且任何方向都无法合并时就卡住了。",
				"卡住时可以撤销之前的步数回溯路线，或直接重新开始一局全新的随机盘面。"
			]}
			controls={
				<>
					<Space direction="vertical" align="center" size={4}>
						<Button aria-label="向上滑动" icon={<CaretUpOutlined />} onClick={() => move("up")} />
						<Space size={4}>
							<Button aria-label="向左滑动" icon={<CaretLeftOutlined />} onClick={() => move("left")} />
							<Button aria-label="向下滑动" icon={<CaretDownOutlined />} onClick={() => move("down")} />
							<Button aria-label="向右滑动" icon={<CaretRightOutlined />} onClick={() => move("right")} />
						</Space>
					</Space>
					<Typography.Text type="secondary">
						当前最大 {largest} · 目标 {target}
					</Typography.Text>
				</>
			}
		>
			<div
				ref={boardRef}
				className={`game-2048-board is-${size}x${size}`}
				role="group"
				aria-label={`${size} × ${size} 的 2048 棋盘`}
				tabIndex={0}
				style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
			>
				{session.state.map((value, index) => (
					<div
						key={index}
						className={`game-2048-cell${value ? ` is-tile tile-${value}` : ""}`}
						aria-label={`第 ${Math.floor(index / size) + 1} 行第 ${(index % size) + 1} 列${value ? `，数字 ${value}` : "，空格"}`}
					>
						{value || ""}
					</div>
				))}
			</div>
		</PuzzleShell>
	);
}
