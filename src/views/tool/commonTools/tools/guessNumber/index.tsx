import React, { useState } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { Button, Input, Tag, Typography } from "antd";
import PuzzleShell, { usePuzzleSession } from "../puzzle/PuzzleShell";
import { createSecret, judgeGuess, validateGuess } from "./game";
import "./index.less";

const levels = [
	{ name: "初级 · 3 位数字", length: 3 },
	{ name: "中级 · 4 位数字", length: 4 },
	{ name: "高级 · 5 位数字", length: 5 }
];

interface GuessRecord {
	guess: string;
	a: number;
	b: number;
}

export default function GuessNumber({ onBack }: { onBack: () => void }) {
	const [level, setLevel] = useState(0);
	const [secretRef, setSecretRef] = useState(() => createSecret(levels[0].length));
	const [input, setInput] = useState("");
	const [error, setError] = useState("");
	const { length } = levels[level];
	const session = usePuzzleSession(
		[] as GuessRecord[],
		records => records.length > 0 && records[records.length - 1].a === length,
		"guessNumber",
		level
	);

	const restart = (nextLength: number) => {
		setSecretRef(createSecret(nextLength));
		setInput("");
		setError("");
		session.reset([]);
	};

	const submit = () => {
		if (session.solved) return;
		const message = validateGuess(input, length);
		if (message) {
			setError(message);
			return;
		}
		const judgement = judgeGuess(secretRef, input);
		setError("");
		setInput("");
		session.commit([...session.state, { guess: input, ...judgement }]);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			event.preventDefault();
			submit();
		}
	};

	const remaining = session.solved
		? "已找出全部数字"
		: `已猜 ${session.state.length} 次${
				session.state.length
					? `，上次 ${session.state[session.state.length - 1].a}A${session.state[session.state.length - 1].b}B`
					: ""
		  }`;

	return (
		<PuzzleShell
			title="猜数字 1A2B"
			description="破解一串随机密码，用最少的次数"
			onBack={onBack}
			levels={levels.map(item => item.name)}
			level={level}
			onLevelChange={index => {
				setLevel(index);
				restart(levels[index].length);
			}}
			onReset={() => restart(length)}
			onUndo={session.undo}
			solved={session.solved}
			seconds={session.seconds}
			moves={session.moves}
			canUndo={session.canUndo}
			records={session.records}
			categoryTag="逻辑推理"
			unsolvedHint={error || "从 0A0B 开始排除，每一次猜测都在缩小范围"}
			solvedHint={`破解成功！密码是 ${secretRef}，共用了 ${session.moves} 次`}
			helpNote={
				<>
					输入后按回车或点击提交。重新开始会换一串全新密码；撤销会移除最近一次猜测（仍计一次）。
					密码的每位数字互不重复，最佳用时和最少步数分别记录。
				</>
			}
			rules={[
				"目标：猜出一串隐藏的随机密码（按所选难度为 3 / 4 / 5 位），数字完全相同且位置一致即通关。",
				"密码由 0-9 中互不重复的数字组成，每次猜测也要输入互不重复的数字。",
				"A 表示数字和位置都对，B 表示数字对但位置不对。例如密码 1234 猜 1357 会得到 1A1B。",
				"善用排除法：0A0B 的猜测说明这串数字全部不在密码里，是极有价值的线索。"
			]}
			controls={
				<>
					<Input
						className="guess-number-input"
						aria-label={`输入 ${length} 位猜测数字`}
						placeholder={`${length} 位不重复的数字`}
						inputMode="numeric"
						autoComplete="off"
						maxLength={length}
						disabled={session.solved}
						value={input}
						status={error ? "error" : undefined}
						onChange={event => setInput(event.target.value.replace(/\D/g, "").slice(0, length))}
						onKeyDown={handleKeyDown}
					/>
					<Button type="primary" icon={<CheckOutlined />} disabled={session.solved} onClick={submit}>
						提交猜测
					</Button>
					<Typography.Text type="secondary">{remaining}</Typography.Text>
				</>
			}
		>
			<div className="guess-number-history" role="table" aria-label="猜测历史">
				{session.state.length === 0 ? (
					<Typography.Text type="secondary">还没有猜测记录，输入第一组数字开始推理</Typography.Text>
				) : (
					session.state
						.map((record, index) => ({ record, index }))
						.reverse()
						.map(({ record, index }) => (
							<div key={index} className="guess-number-row" role="row">
								<span className="guess-number-order">第 {index + 1} 次</span>
								<span className="guess-number-digits" role="cell">
									{[...record.guess].map((digit, position) => (
										<span key={position}>{digit}</span>
									))}
								</span>
								<Tag role="cell" color={record.a === length ? "green" : "blue"}>
									{record.a}A{record.b}B
								</Tag>
							</div>
						))
				)}
			</div>
			{session.solved && (
				<Typography.Text type="secondary" className="guess-number-reveal">
					密码是 {secretRef}，用时 {session.seconds} 秒
				</Typography.Text>
			)}
		</PuzzleShell>
	);
}
