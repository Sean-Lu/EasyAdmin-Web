import React, { useState } from "react";
import { Segmented } from "antd";
import PuzzleShell, { usePuzzleSession } from "../puzzle/PuzzleShell";
import { analyzeLoop, slitherlinkLevels } from "./game";

export default function Slitherlink({ onBack }: { onBack: () => void }) {
	const [level, setLevel] = useState(0);
	const [mode, setMode] = useState("line");
	const puzzle = slitherlinkLevels[level];
	const { rows, columns } = puzzle;
	const blank = (index: number) => {
		const p = slitherlinkLevels[index];
		return Array((p.rows + 1) * p.columns + p.rows * (p.columns + 1)).fill(0) as number[];
	};
	const session = usePuzzleSession(blank(0), lines => analyzeLoop(puzzle, lines).solved, "slitherlink", level);
	const analysis = analyzeLoop(puzzle, session.state);
	const mark = (edge: number, empty = mode === "empty") => {
		const next = [...session.state];
		const value = empty ? -1 : 1;
		next[edge] = next[edge] === value ? 0 : value;
		session.commit(next);
	};
	const elements: React.ReactNode[] = [];
	for (let r = 0; r <= rows * 2; r++)
		for (let c = 0; c <= columns * 2; c++) {
			const key = `${r}-${c}`;
			if (r % 2 === 0 && c % 2 === 0) elements.push(<span key={key} className="loop-dot" aria-hidden="true" />);
			else if (r % 2 && c % 2) {
				const index = Math.floor(r / 2) * columns + Math.floor(c / 2);
				const count = analysis.counts[index],
					clue = puzzle.clues[index];
				elements.push(
					<span
						key={key}
						className={`loop-clue${count > clue ? " is-error" : count === clue ? " is-complete" : ""}`}
						aria-label={`第 ${Math.floor(r / 2) + 1} 行第 ${Math.floor(c / 2) + 1} 列线索 ${clue}`}
					>
						{clue}
					</span>
				);
			} else {
				const horizontal = r % 2 === 0;
				const row = Math.floor(r / 2),
					column = Math.floor(c / 2);
				const index = horizontal ? row * columns + column : (rows + 1) * columns + row * (columns + 1) + column;
				const value = session.state[index];
				elements.push(
					<button
						key={key}
						type="button"
						className={`loop-edge${value === 1 ? " is-line" : ""}`}
						aria-label={`${horizontal ? "横边" : "竖边"} 第 ${row + 1} 行第 ${column + 1} 列，${
							value === 1 ? "已连线" : value === -1 ? "已排除" : "未确定"
						}`}
						aria-disabled={session.solved}
						onClick={() => mark(index)}
						onContextMenu={event => {
							event.preventDefault();
							mark(index, true);
						}}
					>
						{value === -1 ? "×" : ""}
					</button>
				);
			}
		}
	return (
		<PuzzleShell
			title="数回"
			description="让零散的线索，连成一条完整的回路"
			onBack={onBack}
			levels={slitherlinkLevels.map(item => item.name)}
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
				"目标：连接相邻圆点，画出一条闭合回路。线不能分叉、交叉，也不能出现多个独立小环。",
				"每格数字表示该格四条边中，恰好有几条属于回路。例如 0 的四边都不能连，3 则需要连上三边。",
				"绿色数字表示当前边数满足线索，红色表示边数超出线索。全部数字满足后，还需要形成一条完整回路才算完成。",
				"左键点击横边或竖边连线，再点一次擦除；右键打叉排除。触屏可切换下方模式。"
			]}
			controls={
				<Segmented
					aria-label="数回操作模式"
					value={mode}
					onChange={value => setMode(String(value))}
					options={[
						{ label: "连线", value: "line" },
						{ label: "排除 ×", value: "empty" }
					]}
				/>
			}
		>
			<div
				className="slitherlink-board"
				role="group"
				aria-label="数回棋盘"
				style={{ gridTemplateColumns: `repeat(${columns}, 12px 28px) 12px`, gridTemplateRows: `repeat(${rows}, 12px 28px) 12px` }}
			>
				{elements}
			</div>
		</PuzzleShell>
	);
}
