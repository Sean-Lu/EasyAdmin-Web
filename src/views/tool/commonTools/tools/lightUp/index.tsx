import React, { useState } from "react";
import { BulbFilled } from "@ant-design/icons";
import { Segmented, Typography } from "antd";
import PuzzleShell, { usePuzzleSession } from "../puzzle/PuzzleShell";
import { analyzeLights, lightUpLevels } from "./game";

export default function LightUp({ onBack }: { onBack: () => void }) {
	const [level, setLevel] = useState(0);
	const [mode, setMode] = useState("bulb");
	const puzzle = lightUpLevels[level];
	const width = puzzle.board[0].length;
	const blank = (index: number) =>
		Array(lightUpLevels[index].board.length * lightUpLevels[index].board[0].length).fill(0) as number[];
	const session = usePuzzleSession(blank(0), cells => analyzeLights(puzzle.board, cells).solved, "lightUp", level);
	const analysis = analyzeLights(puzzle.board, session.state);
	const mark = (index: number, empty = mode === "empty") => {
		const next = [...session.state];
		const value = empty ? -1 : 1;
		next[index] = next[index] === value ? 0 : value;
		session.commit(next);
	};
	return (
		<PuzzleShell
			title="点灯"
			description="用恰到好处的灯光，照亮每一个角落"
			onBack={onBack}
			levels={lightUpLevels.map(item => item.name)}
			level={level}
			onLevelChange={index => {
				setLevel(index);
				session.reset(blank(index));
			}}
			onReset={() => session.reset(blank(level))}
			onUndo={session.undo}
			solved={session.solved}
			seconds={session.seconds}
			moves={session.moves}
			canUndo={session.canUndo}
			records={session.records}
			rules={[
				"目标：在白格中放灯泡，让所有白格都被照亮。灯泡会照亮自身，以及横竖方向上直到黑墙为止的格子。",
				"任意两盏灯不能直接互相照到，冲突的灯泡会变红。光线经过已标空的白格时不会被阻挡。",
				"黑墙上的数字表示上下左右四格中必须恰好放几盏灯。例如 0 周围不能放灯，斜角不计数。数字过量时会变红。",
				"左键放灯，再点一次移除；右键用叉号标记不能放灯的位置。触屏可切换下方模式。"
			]}
			controls={
				<>
					<Segmented
						aria-label="点灯操作模式"
						value={mode}
						onChange={value => setMode(String(value))}
						options={[
							{ label: "放灯泡", value: "bulb" },
							{ label: "标空 ×", value: "empty" }
						]}
					/>
					<Typography.Text type="secondary">
						已照亮 {analysis.lit.filter(Boolean).length} / {puzzle.board.join("").split(".").length - 1} 格
					</Typography.Text>
				</>
			}
		>
			<div
				className="light-up-board"
				role="group"
				aria-label="点灯棋盘"
				style={{ gridTemplateColumns: `repeat(${width}, 32px)`, gridAutoRows: "32px" }}
			>
				{puzzle.board.flatMap((row, r) =>
					[...row].map((value, c) => {
						const index = r * width + c;
						const wall = value !== ".";
						const clue = analysis.clues.find(item => item.index === index);
						const error = analysis.conflicts.has(index) || (clue && clue.count > clue.required);
						const label = wall
							? `黑墙数字 ${value}`
							: session.state[index] === 1
							? "灯泡"
							: session.state[index] === -1
							? "已标空"
							: analysis.lit[index]
							? "已照亮"
							: "未照亮";
						return wall ? (
							<div
								key={index}
								className={`puzzle-cell light-up-cell is-wall${error ? " is-error" : ""}`}
								aria-label={`第 ${r + 1} 行第 ${c + 1} 列，${label}`}
							>
								{value}
							</div>
						) : (
							<button
								key={index}
								type="button"
								className={`puzzle-cell light-up-cell${analysis.lit[index] ? " is-lit" : ""}${error ? " is-error" : ""}`}
								aria-label={`第 ${r + 1} 行第 ${c + 1} 列，${label}`}
								aria-disabled={session.solved}
								onClick={() => mark(index)}
								onContextMenu={event => {
									event.preventDefault();
									mark(index, true);
								}}
							>
								{session.state[index] === 1 ? <BulbFilled /> : session.state[index] === -1 ? "×" : ""}
							</button>
						);
					})
				)}
			</div>
		</PuzzleShell>
	);
}
