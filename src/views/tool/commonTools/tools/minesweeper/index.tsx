import React, { useEffect, useRef, useState } from "react";
import {
	ArrowLeftOutlined,
	ClockCircleOutlined,
	FlagFilled,
	ReloadOutlined,
	SafetyCertificateOutlined,
	SmileOutlined,
	TrophyOutlined
} from "@ant-design/icons";
import { Button, Card, Segmented, Space, Tag, Typography } from "antd";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { getUserInfo } from "@/api/modules/login";
import { MinesweeperScore, UserPreferenceService } from "@/services/user/userPreferenceService";
import { store } from "@/redux";
import { mergeRemoteScores, readScores, saveLocalScore, Scores } from "./scoreStorage";
import { createGame, revealCell, toggleFlag } from "./game";
import GameHelp from "../puzzle/GameHelp";
import "./index.less";

const difficulties = {
	beginner: { label: "初级", rows: 9, columns: 9, mines: 10 },
	intermediate: { label: "中级", rows: 16, columns: 16, mines: 40 },
	expert: { label: "高级", rows: 16, columns: 30, mines: 99 }
};

type Difficulty = keyof typeof difficulties;

interface MinesweeperProps {
	onBack: () => void;
}

const Minesweeper: React.FC<MinesweeperProps> = ({ onBack }) => {
	const isDark = useSelector((state: any) => state.global.themeConfig.isDark);
	const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
	const [game, setGame] = useState(() => createGame(difficulties.beginner));
	const [flagMode, setFlagMode] = useState(false);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [focusIndex, setFocusIndex] = useState(0);
	const startedAtRef = useRef<number | null>(null);
	const [owner, setOwner] = useState("");
	const ownerRef = useRef("");
	const [scores, setScores] = useState<Scores>({});
	const [scoreStatus, setScoreStatus] = useState("正在读取最佳成绩…");
	const syncingRef = useRef(false);
	const loadingOwnerRef = useRef(false);
	const volatileWinsRef = useRef<MinesweeperScore[]>([]);
	const mountedRef = useRef(true);
	const bestScore = scores[difficulty];

	const syncScores = async (key = ownerRef.current) => {
		if (!key) {
			void loadOwner();
			return;
		}
		if (!mountedRef.current || syncingRef.current) return;
		const token = store.getState().global.token;
		if (!token) return;
		syncingRef.current = true;
		let resync = false;
		setScoreStatus("正在同步成绩…");
		try {
			if (volatileWinsRef.current.length) {
				// 不让内存中的新成绩挡住之前落盘的其他难度纪录
				const queued = [...Object.values(readScores(key)).filter(score => score?.pending), ...volatileWinsRef.current];
				for (const entry of queued) {
					if (!mountedRef.current || store.getState().global.token !== token) return;
					const saved = await UserPreferenceService.saveMinesweeperScore(entry.difficulty, entry.seconds);
					if (!mountedRef.current || store.getState().global.token !== token) return;
					volatileWinsRef.current = volatileWinsRef.current.filter(win => win !== entry);
					try {
						mergeRemoteScores(key, [saved]);
					} catch {
						// 后端已确认，本地写入失败不应阻止后续纪录补传
					}
					setScores(previous => {
						const local = previous[saved.difficulty];
						return {
							...previous,
							[saved.difficulty]: !local || saved.seconds <= local.seconds ? { ...saved, pending: false } : local
						};
					});
				}
				resync = volatileWinsRef.current.length > 0;
				setScoreStatus("成绩已保存后端，本地备份不可用");
				return;
			}
			const remote = await UserPreferenceService.getMinesweeperScores();
			if (!mountedRef.current || store.getState().global.token !== token) return;
			let latest = mergeRemoteScores(key, remote);
			setScores(latest);
			for (const entry of Object.values(latest)) {
				if (!entry?.pending) continue;
				if (!mountedRef.current || store.getState().global.token !== token) return;
				const saved = await UserPreferenceService.saveMinesweeperScore(entry.difficulty, entry.seconds);
				if (!mountedRef.current || store.getState().global.token !== token) return;
				latest = mergeRemoteScores(key, [saved]);
				if (mountedRef.current) setScores(latest);
			}
			latest = readScores(key);
			resync = volatileWinsRef.current.length > 0 || Object.values(latest).some(entry => entry?.pending);
			if (mountedRef.current)
				setScoreStatus(Object.values(latest).some(entry => entry?.pending) ? "有成绩待同步，请重试" : "成绩已同步");
		} catch {
			if (mountedRef.current)
				setScoreStatus(volatileWinsRef.current.length ? "保存失败，成绩暂存在当前页面，请重试且勿关闭" : "同步失败，请重试");
		} finally {
			syncingRef.current = false;
			if (resync && mountedRef.current) void syncScores(key);
		}
	};

	const loadOwner = async () => {
		if (!mountedRef.current || loadingOwnerRef.current) return;
		loadingOwnerRef.current = true;
		setScoreStatus("正在读取账号和成绩…");
		try {
			const { data } = await getUserInfo(true);
			if (!mountedRef.current) return;
			const key = `${data.tenantId}:${data.id}`;
			ownerRef.current = key;
			setOwner(key);
			setScores(readScores(key));
			void syncScores(key);
		} catch {
			if (mountedRef.current) setScoreStatus("账号信息读取失败，可点击重新读取账号重试");
		} finally {
			loadingOwnerRef.current = false;
		}
	};

	useEffect(() => {
		mountedRef.current = true;
		void loadOwner();
		return () => {
			mountedRef.current = false;
			ownerRef.current = "";
		};
	}, []);

	useEffect(() => {
		const retry = () => {
			void syncScores();
		};
		window.addEventListener("online", retry);
		window.addEventListener("focus", retry);
		const updateFromOtherTab = (event: StorageEvent) => {
			if (event.key === `easyadmin:minesweeper:scores:${owner}`) setScores(readScores(owner));
		};
		window.addEventListener("storage", updateFromOtherTab);
		return () => {
			window.removeEventListener("online", retry);
			window.removeEventListener("focus", retry);
			window.removeEventListener("storage", updateFromOtherTab);
		};
	}, [owner]);
	const finished = game.status === "won" || game.status === "lost";
	const flagCount = game.cells.filter(cell => cell.flagged).length;
	const revealedCount = game.cells.filter(cell => cell.revealed && !cell.mine).length;
	const safeCount = game.rows * game.columns - game.mines;

	useEffect(() => {
		if (game.status !== "playing") return undefined;
		const intervalId = window.setInterval(() => {
			setElapsedSeconds(Math.floor((Date.now() - (startedAtRef.current ?? Date.now())) / 1000));
		}, 250);
		return () => window.clearInterval(intervalId);
	}, [game.status]);

	const resetGame = (nextDifficulty: Difficulty = difficulty) => {
		setDifficulty(nextDifficulty);
		setGame(createGame(difficulties[nextDifficulty]));
		setElapsedSeconds(0);
		setFlagMode(false);
		setFocusIndex(0);
		startedAtRef.current = null;
	};

	const actOnCell = (index: number, flag: boolean) => {
		if (!owner) return;
		const next = flag ? toggleFlag(game, index) : revealCell(game, index);
		if (next === game) return;
		if (game.status === "ready" && next.status !== "ready") startedAtRef.current = Date.now();
		if (next.status === "won" || next.status === "lost") {
			setElapsedSeconds(Math.floor((Date.now() - (startedAtRef.current ?? Date.now())) / 1000));
		}
		setGame(next);
		if (next.status === "won" && game.status !== "won") {
			const seconds = Math.floor((Date.now() - (startedAtRef.current ?? Date.now())) / 1000);
			try {
				setScores(saveLocalScore(owner, { difficulty, seconds, achievedAt: new Date().toISOString() }));
				void syncScores(owner);
			} catch {
				setScoreStatus("浏览器存储不可用，正在直接保存到后端…");
				const win: MinesweeperScore = { difficulty, seconds, achievedAt: new Date().toISOString() };
				volatileWinsRef.current.push(win);
				setScores(previous => {
					const local = previous[difficulty];
					return { ...previous, [difficulty]: !local || seconds < local.seconds ? { ...win, pending: true } : local };
				});
				void syncScores(owner);
			}
		}
	};

	const handleCellKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
		if (event.key.toLowerCase() === "f") {
			event.preventDefault();
			actOnCell(index, true);
			return;
		}
		const row = Math.floor(index / game.columns);
		const column = index % game.columns;
		let target = index;
		if (event.key === "ArrowUp") target = Math.max(0, row - 1) * game.columns + column;
		else if (event.key === "ArrowDown") target = Math.min(game.rows - 1, row + 1) * game.columns + column;
		else if (event.key === "ArrowLeft") target = row * game.columns + Math.max(0, column - 1);
		else if (event.key === "ArrowRight") target = row * game.columns + Math.min(game.columns - 1, column + 1);
		else if (event.key === "Home") target = row * game.columns;
		else if (event.key === "End") target = row * game.columns + game.columns - 1;
		else return;
		event.preventDefault();
		event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(".minesweeper-cell")[target]?.focus();
	};

	const statusText =
		game.status === "won"
			? `排雷成功！你用 ${elapsedSeconds} 秒找出了全部安全格`
			: game.status === "lost"
			? "踩到地雷了，调整思路再来一局吧"
			: game.status === "ready"
			? "点击任意格子开始，第一步一定安全"
			: "慢慢观察，每个数字都是一条线索";

	return (
		<div className={`minesweeper-page logic-game-page${isDark ? " minesweeper-dark logic-game-dark" : ""}`}>
			<div className="logic-game-heading">
				<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
					返回百宝箱
				</Button>
				<div>
					<Typography.Title level={2}>扫雷</Typography.Title>
					<Typography.Text type="secondary">在数字之间，找一点专注的乐趣</Typography.Text>
				</div>
				<Tag icon={<SafetyCertificateOutlined />} color="green">
					首击安全
				</Tag>
			</div>
			<div className="logic-game-layout">
				<Card className="minesweeper-card logic-game-card">
					<div className="minesweeper-toolbar">
						<Space size="middle" wrap>
							<Segmented
								aria-label="游戏难度"
								value={difficulty}
								options={Object.entries(difficulties).map(([value, config]) => ({ label: config.label, value }))}
								onChange={value => resetGame(value as Difficulty)}
							/>
							<Typography.Text type="secondary">
								{game.rows} × {game.columns} · {game.mines} 颗雷
							</Typography.Text>
						</Space>
						<Button icon={<ReloadOutlined />} onClick={() => resetGame()}>
							重新开始
						</Button>
					</div>
					<div className="minesweeper-stats">
						<div className="minesweeper-stat">
							<span className="minesweeper-stat-label">
								<FlagFilled /> 剩余标记
							</span>
							<strong>{String(game.mines - flagCount).padStart(2, "0")}</strong>
						</div>
						<div className={`minesweeper-status-icon minesweeper-status-${game.status}`} aria-hidden="true">
							{game.status === "won" ? <TrophyOutlined /> : game.status === "lost" ? "✹" : <SmileOutlined />}
						</div>
						<div className="minesweeper-stat">
							<span className="minesweeper-stat-label">
								<ClockCircleOutlined /> 用时（秒）
							</span>
							<strong>{String(elapsedSeconds).padStart(3, "0")}</strong>
						</div>
					</div>
					<div className={`minesweeper-status minesweeper-status-${game.status}`} role="status">
						{statusText}
					</div>
					<div className="minesweeper-record">
						<Space wrap size="small">
							<TrophyOutlined />
							<Typography.Text strong>本难度最佳：{bestScore ? `${bestScore.seconds} 秒` : "暂无成绩"}</Typography.Text>
							{bestScore && (
								<Typography.Text type="secondary">{dayjs(bestScore.achievedAt).format("YYYY-MM-DD HH:mm")}</Typography.Text>
							)}
							{bestScore?.pending && <Tag color="orange">待同步</Tag>}
						</Space>
						<div>
							<Typography.Text type="secondary">{scoreStatus}</Typography.Text>
							<Button type="link" size="small" onClick={() => void syncScores()}>
								{owner ? "同步成绩" : "重新读取账号"}
							</Button>
						</div>
					</div>
					<div className="minesweeper-board-scroll">
						<div
							className={`minesweeper-board${difficulty === "beginner" ? " is-beginner" : ""}`}
							role="group"
							aria-label={`${game.rows} 行 ${game.columns} 列扫雷棋盘`}
							style={{
								gridTemplateColumns: `repeat(${game.columns}, minmax(0, 1fr))`,
								width: `calc(${game.columns} * var(--mine-cell-size) + ${(game.columns - 1) * 3 + 22}px)`
							}}
						>
							{game.cells.map((cell, index) => {
								const showMine = cell.mine && (cell.revealed || game.status === "lost");
								const wrongFlag = game.status === "lost" && cell.flagged && !cell.mine;
								const showFlag = cell.flagged && !showMine;
								const label = showMine
									? "地雷"
									: wrongFlag
									? "错误标记"
									: showFlag
									? "已插旗"
									: cell.revealed
									? cell.adjacent > 0
										? `周围 ${cell.adjacent} 颗雷`
										: "空白"
									: "未翻开";
								return (
									<button
										key={index}
										type="button"
										className={[
											"minesweeper-cell",
											cell.revealed || showMine ? "is-revealed" : "",
											index === game.explodedIndex ? "is-exploded" : "",
											wrongFlag ? "is-wrong-flag" : ""
										]
											.filter(Boolean)
											.join(" ")}
										data-number={cell.revealed && !cell.mine ? cell.adjacent : undefined}
										aria-label={`第 ${Math.floor(index / game.columns) + 1} 行第 ${(index % game.columns) + 1} 列，${label}`}
										aria-disabled={finished || !owner}
										tabIndex={focusIndex === index ? 0 : -1}
										onFocus={() => setFocusIndex(index)}
										onKeyDown={event => handleCellKeyDown(event, index)}
										onClick={() => actOnCell(index, flagMode)}
										onContextMenu={event => {
											event.preventDefault();
											actOnCell(index, true);
										}}
									>
										{showMine ? (
											"✹"
										) : wrongFlag ? (
											"×"
										) : showFlag ? (
											<FlagFilled />
										) : cell.revealed && cell.adjacent > 0 ? (
											cell.adjacent
										) : (
											""
										)}
									</button>
								);
							})}
						</div>
					</div>
					<div className="minesweeper-board-footer">
						<Segmented
							aria-label="操作模式"
							value={flagMode ? "flag" : "reveal"}
							options={[
								{ label: "翻开", value: "reveal" },
								{ label: "插旗", value: "flag", icon: <FlagFilled /> }
							]}
							onChange={value => setFlagMode(value === "flag")}
						/>
						<Typography.Text type="secondary">
							已找到 {revealedCount} / {safeCount} 个安全格
						</Typography.Text>
					</div>
				</Card>
				<GameHelp
					rules={[
						"目标：翻开全部安全格即可获胜，踩到地雷则本局结束。第一下翻开的格子及周围八格保证安全。",
						"数字表示周围八格的地雷数量，空白区域会自动展开。结合相邻数字推理地雷位置。",
						"左键翻开，右键插旗或取消旗帜。触屏可使用棋盘下方的翻开／插旗模式。",
						"数字周围的插旗数与数字相同时，再点数字可快速翻开相邻格。旗帜放错也可能踩雷。"
					]}
				>
					键盘：方向键移动，Enter / 空格操作，F 插旗。窄屏下中高级棋盘可横向滑动，切换难度或重新开始会重置本局。
				</GameHelp>
			</div>
		</div>
	);
};

export default Minesweeper;
