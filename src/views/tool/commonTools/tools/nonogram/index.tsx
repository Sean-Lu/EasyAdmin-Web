import React, { useState } from "react";
import { Segmented } from "antd";
import PuzzleShell, { usePuzzleSession } from "../puzzle/PuzzleShell";
import { isNonogramSolved, nonogramClues, nonogramLevels, runs } from "./game";

export default function Nonogram({ onBack }: { onBack: () => void }) {
	const [level, setLevel] = useState(0);
	const [mode, setMode] = useState("fill");
	const puzzle = nonogramLevels[level];
	const width = puzzle.picture[0].length;
	const blank = (index: number) =>
		Array(nonogramLevels[index].picture.length * nonogramLevels[index].picture[0].length).fill(0) as number[];
	const session = usePuzzleSession(blank(0), cells => isNonogramSolved(puzzle.picture, cells), "nonogram", level);
	const clues = nonogramClues(puzzle.picture);
	const mark = (index: number, empty = mode === "empty") => {
		const next = [...session.state];
		const value = empty ? -1 : 1;
		next[index] = next[index] === value ? 0 : value;
		session.commit(next);
	};
	return (
		<PuzzleShell
			title="数织"
			description="让数字带你发现一幅小小的像素画"
			onBack={onBack}
			levels={nonogramLevels.map(item => item.name)}
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
				"目标：根据棋盘上方和左侧的数字，填出全部黑格。填对黑格即可完成，空格不必全部打叉。",
				"数字按顺序表示连续黑格的长度。例如 2、1 表示先有连续 2 格，再有 1 格，两组之间至少空一格。",
				"0 表示这一行或列没有黑格。绿色线索表示当前填法已满足该行或列，但仍需结合另一方向推理。",
				"左键填黑，再点一次擦除；右键标空。触屏可切换下方的填黑／标空模式。"
			]}
			controls={
				<Segmented
					aria-label="数织操作模式"
					value={mode}
					onChange={value => setMode(String(value))}
					options={[
						{ label: "填黑", value: "fill" },
						{ label: "标空 ×", value: "empty" }
					]}
				/>
			}
		>
			<div
				className="nonogram-board"
				role="group"
				aria-label="数织棋盘"
				style={{
					gridTemplateColumns: `var(--nonogram-clue-width) repeat(${width}, 32px)`,
					gridTemplateRows: `max-content repeat(${puzzle.picture.length}, 32px)`
				}}
			>
				<div />
				{clues.columns.map((clue, column) => (
					<div
						key={`column-${column}`}
						className={`nonogram-clue is-column${
							runs(puzzle.picture.map((_, row) => session.state[row * width + column])).join() === clue.join()
								? " is-complete"
								: ""
						}`}
						aria-label={`第 ${column + 1} 列线索 ${clue.join("、")}`}
					>
						{clue.map((n, i) => (
							<span key={i}>{n}</span>
						))}
					</div>
				))}
				{clues.rows.map((clue, row) => (
					<React.Fragment key={row}>
						<div
							className={`nonogram-clue${
								runs(session.state.slice(row * width, (row + 1) * width)).join() === clue.join() ? " is-complete" : ""
							}`}
							aria-label={`第 ${row + 1} 行线索 ${clue.join("、")}`}
						>
							{clue.join(" ")}
						</div>
						{[...puzzle.picture[row]].map((_, column) => {
							const index = row * width + column;
							const value = session.state[index];
							return (
								<button
									key={index}
									type="button"
									className={`puzzle-cell nonogram-cell${value === 1 ? " is-filled" : value === -1 ? " is-empty" : ""}`}
									aria-label={`第 ${row + 1} 行第 ${column + 1} 列，${
										value === 1 ? "已填黑" : value === -1 ? "已标空" : "未确定"
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
						})}
					</React.Fragment>
				))}
			</div>
		</PuzzleShell>
	);
}
