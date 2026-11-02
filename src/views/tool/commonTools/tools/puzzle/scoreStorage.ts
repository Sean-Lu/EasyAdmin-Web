import type { PuzzleGame, PuzzleScore } from "@/services/user/userPreferenceService";

export interface LocalPuzzleScore extends PuzzleScore {
	pending: boolean;
}
export type PuzzleScores = Record<string, LocalPuzzleScore>;
export const puzzleStorageKey = (owner: string) => `easyadmin:puzzle:scores:${owner}`;
export const puzzleScoreKey = (game: PuzzleGame, level: string) => `${game}:${level}`;
const games: PuzzleGame[] = ["nonogram", "lightUp", "slitherlink"];

function isValid(score: PuzzleScore): boolean {
	if (!score || !games.includes(score.game) || !/^v1-[123]$/.test(score.level)) return false;
	const first = Date.parse(score.firstCompletedAt);
	return (
		Number.isInteger(score.bestSeconds) &&
		score.bestSeconds >= 0 &&
		score.bestSeconds <= 604800 &&
		Number.isInteger(score.bestMoves) &&
		score.bestMoves > 0 &&
		score.bestMoves <= 100000 &&
		Number.isFinite(first) &&
		first > 0 &&
		Date.parse(score.bestSecondsAt) >= first &&
		Date.parse(score.bestMovesAt) >= first
	);
}

/** 每项纪录独立比较，不能让一次更快但步数更多的通关覆盖最少步数 */
export function combinePuzzleScore(previous: PuzzleScore | undefined, incoming: PuzzleScore): PuzzleScore {
	if (!previous) return { ...incoming };
	return {
		game: incoming.game,
		level: incoming.level,
		bestSeconds: Math.min(previous.bestSeconds, incoming.bestSeconds),
		bestMoves: Math.min(previous.bestMoves, incoming.bestMoves),
		bestSecondsAt: incoming.bestSeconds < previous.bestSeconds ? incoming.bestSecondsAt : previous.bestSecondsAt,
		bestMovesAt: incoming.bestMoves < previous.bestMoves ? incoming.bestMovesAt : previous.bestMovesAt,
		firstCompletedAt:
			Date.parse(incoming.firstCompletedAt) < Date.parse(previous.firstCompletedAt)
				? incoming.firstCompletedAt
				: previous.firstCompletedAt
	};
}

/** 只恢复当前租户和账号的有效纪录；退出或认证跳转不会清除未同步成绩 */
export function readPuzzleScores(owner: string): PuzzleScores {
	try {
		const parsed = JSON.parse(localStorage.getItem(puzzleStorageKey(owner)) ?? "{}");
		const scores: PuzzleScores = {};
		for (const [key, value] of Object.entries(parsed ?? {})) {
			const score = value as LocalPuzzleScore;
			if (isValid(score) && typeof score.pending === "boolean" && key === puzzleScoreKey(score.game, score.level))
				scores[key] = score;
		}
		return scores;
	} catch {
		return {};
	}
}

/** 在通关事件内同步落盘，然后才允许提交接口，防止 Token 过期跳转抢先卸载页面 */
export function recordPuzzleWin(owner: string, win: PuzzleScore): PuzzleScores {
	if (!isValid(win)) throw new Error("游戏成绩数据无效");
	const scores = readPuzzleScores(owner);
	const key = puzzleScoreKey(win.game, win.level);
	const previous = scores[key];
	const best = combinePuzzleScore(previous, win);
	const improved =
		!previous ||
		best.bestSeconds < previous.bestSeconds ||
		best.bestMoves < previous.bestMoves ||
		best.firstCompletedAt !== previous.firstCompletedAt;
	scores[key] = { ...best, pending: Boolean(previous?.pending || improved) };
	localStorage.setItem(puzzleStorageKey(owner), JSON.stringify(scores));
	return scores;
}

/** 后端必须确认两项最优纪录和首次通关时间，才清除本地待同步标记 */
export function confirmPuzzleScore(local: LocalPuzzleScore | undefined, score: PuzzleScore): LocalPuzzleScore {
	const pending = Boolean(
		local &&
			(local.bestSeconds < score.bestSeconds ||
				local.bestMoves < score.bestMoves ||
				Date.parse(local.firstCompletedAt) < Date.parse(score.firstCompletedAt))
	);
	const best = combinePuzzleScore(local, score);
	// 同分时以已确认的后端达成时间为准
	if (!local || score.bestSeconds <= local.bestSeconds) best.bestSecondsAt = score.bestSecondsAt;
	if (!local || score.bestMoves <= local.bestMoves) best.bestMovesAt = score.bestMovesAt;
	return { ...best, pending };
}

/** 合并后端确认结果，同时保留尚未确认的新纪录 */
export function mergePuzzleScores(owner: string, remote: PuzzleScore[]): PuzzleScores {
	const scores = readPuzzleScores(owner);
	for (const score of remote) {
		if (!isValid(score)) continue;
		const key = puzzleScoreKey(score.game, score.level);
		scores[key] = confirmPuzzleScore(scores[key], score);
	}
	localStorage.setItem(puzzleStorageKey(owner), JSON.stringify(scores));
	return scores;
}
