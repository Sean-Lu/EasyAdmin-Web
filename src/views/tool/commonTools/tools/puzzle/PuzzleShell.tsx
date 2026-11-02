import React, { useEffect, useRef, useState } from "react";
import { ArrowLeftOutlined, ReloadOutlined, TrophyOutlined, UndoOutlined } from "@ant-design/icons";
import { Button, Card, Select, Space, Tag, Typography } from "antd";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { PuzzleGame } from "@/services/user/userPreferenceService";
import { usePuzzleScores } from "./usePuzzleScores";
import GameHelp from "./GameHelp";
import "./index.less";

/** 三款关卡游戏共用的落子历史和计时；规则与胜负判定仍由各游戏负责 */
export function usePuzzleSession<T>(initial: T, check: (state: T) => boolean, game: PuzzleGame, level: number) {
	const [history, setHistory] = useState<T[]>([initial]);
	const [seconds, setSeconds] = useState(0);
	const [moves, setMoves] = useState(0);
	const records = usePuzzleScores(game, level);
	const startedAt = useRef<number | null>(null);
	const state = history[history.length - 1];
	const solved = check(state);
	useEffect(() => {
		if (startedAt.current === null || solved) return undefined;
		const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - (startedAt.current ?? Date.now())) / 1000)), 250);
		return () => window.clearInterval(timer);
	}, [history.length, solved]);
	return {
		state,
		solved,
		seconds,
		moves,
		canUndo: history.length > 1 && !solved,
		records,
		commit(next: T) {
			if (solved || !records.ready) return;
			if (startedAt.current === null) startedAt.current = Date.now();
			const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
			// 通关事件中先持久化成绩，再更新棋盘；认证跳转不会抢先丢弃成绩 effect
			if (check(next)) records.recordWin(elapsed, moves + 1);
			setSeconds(elapsed);
			setMoves(previous => previous + 1);
			setHistory(previous => [...previous, next]);
		},
		undo() {
			if (solved || history.length <= 1) return;
			setHistory(previous => previous.slice(0, -1));
			// 撤销也计入操作，不能靠撤销抹去试错步数
			setMoves(previous => previous + 1);
		},
		reset(next: T) {
			setHistory([next]);
			setSeconds(0);
			setMoves(0);
			startedAt.current = null;
		}
	};
}

interface PuzzleShellProps {
	title: string;
	description: string;
	onBack: () => void;
	levels: string[];
	level: number;
	onLevelChange: (level: number) => void;
	onReset: () => void;
	onUndo: () => void;
	solved: boolean;
	seconds: number;
	moves: number;
	canUndo: boolean;
	records: ReturnType<typeof usePuzzleScores>;
	rules: string[];
	controls?: React.ReactNode;
	children: React.ReactNode;
}

/** 游戏页面框架，玩法说明位于棋盘下方 */
export default function PuzzleShell(props: PuzzleShellProps) {
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);
	return (
		<div className={`logic-game-page${isDark ? " logic-game-dark" : ""}`}>
			<div className="logic-game-heading">
				<Button icon={<ArrowLeftOutlined />} onClick={props.onBack}>
					返回百宝箱
				</Button>
				<div>
					<Typography.Title level={2}>{props.title}</Typography.Title>
					<Typography.Text type="secondary">{props.description}</Typography.Text>
				</div>
				<Tag color="blue">逻辑推理</Tag>
			</div>
			<div className="logic-game-layout">
				<Card className="logic-game-card">
					<div className="logic-game-toolbar">
						<Select
							aria-label="游戏关卡"
							value={props.level}
							onChange={props.onLevelChange}
							options={props.levels.map((label, value) => ({
								label: `${props.records.completed(value) ? "✓ " : ""}${label}`,
								value
							}))}
						/>
						<Space wrap>
							<Button icon={<UndoOutlined />} disabled={!props.canUndo} onClick={props.onUndo}>
								撤销
							</Button>
							<Button icon={<ReloadOutlined />} onClick={props.onReset}>
								重新开始
							</Button>
						</Space>
					</div>
					<div className={`logic-game-status${props.solved ? " is-solved" : ""}`} role="status">
						{props.solved ? "挑战完成！所有线索都满足了" : "不必着急，从确定的线索开始"}
					</div>
					<div className="logic-game-record">
						<Space wrap>
							<TrophyOutlined />
							<Typography.Text strong>本关纪录</Typography.Text>
							{props.records.record ? (
								<>
									<Tag color="green">已通关</Tag>
									<span title={`达成于 ${dayjs(props.records.record.bestSecondsAt).format("YYYY-MM-DD HH:mm")}`}>
										最佳用时 {props.records.record.bestSeconds} 秒
									</span>
									<span title={`达成于 ${dayjs(props.records.record.bestMovesAt).format("YYYY-MM-DD HH:mm")}`}>
										最少操作 {props.records.record.bestMoves} 步
									</span>
								</>
							) : (
								<Typography.Text type="secondary">尚未通关</Typography.Text>
							)}
							{props.records.record?.pending && <Tag color="orange">待同步</Tag>}
						</Space>
						{props.records.record && (
							<div>
								<Typography.Text type="secondary">
									首次通关 {dayjs(props.records.record.firstCompletedAt).format("YYYY-MM-DD HH:mm")}
								</Typography.Text>
							</div>
						)}
						<div aria-live="polite">
							<Typography.Text type="secondary">{props.records.status}</Typography.Text>
							<Button type="link" size="small" onClick={props.records.retry}>
								{props.records.ready ? "同步成绩" : "重新读取账号"}
							</Button>
						</div>
					</div>
					<fieldset className="logic-game-board-scroll" disabled={!props.records.ready}>
						{props.children}
					</fieldset>
					<div className="logic-game-controls">{props.controls}</div>
					<div className="logic-game-stats">
						<span>用时 {props.seconds} 秒</span>
						<span>操作 {props.moves} 步</span>
					</div>
				</Card>
				<GameHelp rules={props.rules}>
					支持鼠标、触屏和键盘 Tab / Enter / 空格。选错了可撤销，切换关卡会重新开始。
					步数包括落子、标记和撤销。最佳用时和最少步数分别记录，可能来自不同次通关。
				</GameHelp>
			</div>
		</div>
	);
}
