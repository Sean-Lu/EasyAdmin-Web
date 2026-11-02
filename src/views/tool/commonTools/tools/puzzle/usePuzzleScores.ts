import { useEffect, useRef, useState } from "react";
import { getUserInfo } from "@/api/modules/login";
import { store } from "@/redux";
import { PuzzleGame, PuzzleScore, UserPreferenceService } from "@/services/user/userPreferenceService";
import {
	combinePuzzleScore,
	confirmPuzzleScore,
	mergePuzzleScores,
	puzzleScoreKey,
	puzzleStorageKey,
	PuzzleScores,
	readPuzzleScores,
	recordPuzzleWin
} from "./scoreStorage";

/** 三款关卡游戏共用的成绩恢复、账号隔离和补传流程 */
export function usePuzzleScores(game: PuzzleGame, level: number) {
	const [owner, setOwner] = useState("");
	const ownerRef = useRef("");
	const [scores, setScores] = useState<PuzzleScores>({});
	const [status, setStatus] = useState("正在读取账号和成绩…");
	const mounted = useRef(false);
	const syncing = useRef(false);
	const loadingOwner = useRef(false);
	const volatileWins = useRef<PuzzleScore[]>([]);
	const levelKey = `v1-${level + 1}`;

	const synchronize = async (key = ownerRef.current) => {
		if (!key) {
			void loadOwner();
			return;
		}
		const token = store.getState().global.token;
		if (!mounted.current || !key || !token || syncing.current) return;
		syncing.current = true;
		let more = false;
		setStatus("正在同步成绩…");
		try {
			// 本地写入被浏览器拒绝时保留内存队列，手动重试必须重新提交这些成绩
			if (volatileWins.current.length) {
				// 存储仍可读取时，也补传之前已经落盘的其他关卡纪录
				const queued = [...Object.values(readPuzzleScores(key)).filter(score => score.pending), ...volatileWins.current];
				for (const entry of queued) {
					if (!mounted.current || store.getState().global.token !== token) return;
					const saved = await UserPreferenceService.savePuzzleScore(entry);
					if (!mounted.current || store.getState().global.token !== token) return;
					volatileWins.current = volatileWins.current.filter(win => win !== entry);
					try {
						mergePuzzleScores(key, [saved]);
					} catch {
						// 后端已确认，浏览器仍拒绝写入时只更新页面；下次恢复可安全重复提交
					}
					const scoreKey = puzzleScoreKey(saved.game, saved.level);
					setScores(previous => ({ ...previous, [scoreKey]: confirmPuzzleScore(previous[scoreKey], saved) }));
				}
				more = volatileWins.current.length > 0;
				setStatus("成绩已保存后端，本地备份不可用");
				return;
			}
			const remote = await UserPreferenceService.getPuzzleScores(game);
			if (!mounted.current || store.getState().global.token !== token) return;
			let latest = mergePuzzleScores(key, remote);
			setScores(latest);
			// 进入任一关卡游戏时，补传该账号所有关卡游戏的待同步纪录
			for (const entry of Object.values(latest).filter(score => score.pending)) {
				if (!mounted.current || store.getState().global.token !== token) return;
				const saved = await UserPreferenceService.savePuzzleScore(entry);
				if (!mounted.current || store.getState().global.token !== token) return;
				latest = mergePuzzleScores(key, [saved]);
				setScores(latest);
			}
			// 请求期间可能产生新纪录，成功后继续补传；网络失败时保留队列，避免无限重试
			more = volatileWins.current.length > 0 || Object.values(readPuzzleScores(key)).some(score => score.pending);
			setStatus(more ? "有成绩待同步" : "成绩已同步");
		} catch {
			if (mounted.current)
				setStatus(volatileWins.current.length ? "保存失败，成绩暂存在当前页面，请重试且勿关闭" : "同步失败，请重试");
		} finally {
			syncing.current = false;
			if (more && mounted.current) void synchronize(key);
		}
	};

	const loadOwner = async () => {
		if (!mounted.current || loadingOwner.current) return;
		loadingOwner.current = true;
		setStatus("正在读取账号和成绩…");
		try {
			const { data } = await getUserInfo(true);
			if (!mounted.current) return;
			const key = `${data.tenantId}:${data.id}`;
			ownerRef.current = key;
			setOwner(key);
			setScores(readPuzzleScores(key));
			void synchronize(key);
		} catch {
			if (mounted.current) setStatus("账号信息读取失败，可点击重新读取账号重试");
		} finally {
			loadingOwner.current = false;
		}
	};

	useEffect(() => {
		mounted.current = true;
		void loadOwner();
		return () => {
			mounted.current = false;
			ownerRef.current = "";
		};
	}, []);

	useEffect(() => {
		const retry = () => {
			void synchronize();
		};
		const refresh = (event: StorageEvent) => {
			if (owner && event.key === puzzleStorageKey(owner)) setScores(readPuzzleScores(owner));
		};
		window.addEventListener("online", retry);
		window.addEventListener("focus", retry);
		window.addEventListener("storage", refresh);
		return () => {
			window.removeEventListener("online", retry);
			window.removeEventListener("focus", retry);
			window.removeEventListener("storage", refresh);
		};
	}, [owner]);

	return {
		ready: Boolean(owner),
		status,
		record: scores[puzzleScoreKey(game, levelKey)],
		completed: (index: number) => Boolean(scores[puzzleScoreKey(game, `v1-${index + 1}`)]),
		retry: () => {
			void synchronize();
		},
		recordWin(seconds: number, moves: number) {
			const key = ownerRef.current;
			if (!key) return;
			const at = new Date().toISOString();
			const win: PuzzleScore = {
				game,
				level: levelKey,
				bestSeconds: seconds,
				bestMoves: moves,
				bestSecondsAt: at,
				bestMovesAt: at,
				firstCompletedAt: at
			};
			try {
				setScores(recordPuzzleWin(key, win));
				setStatus("成绩已保存在本地，等待同步");
				void synchronize(key);
			} catch {
				// 浏览器拒绝持久化时明确提示，并尝试直接保存；不虚报已有本地备份
				setStatus("本地存储不可用，正在直接保存后端…");
				volatileWins.current.push(win);
				setScores(previous => ({
					...previous,
					[puzzleScoreKey(game, levelKey)]: {
						...combinePuzzleScore(previous[puzzleScoreKey(game, levelKey)], win),
						pending: true
					}
				}));
				void synchronize(key);
			}
		}
	};
}
