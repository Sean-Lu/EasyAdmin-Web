import type { MinesweeperDifficulty, MinesweeperScore } from "@/services/user/userPreferenceService";

export interface LocalScore extends MinesweeperScore {
	pending: boolean;
}

export type Scores = Partial<Record<MinesweeperDifficulty, LocalScore>>;
const difficulties: MinesweeperDifficulty[] = ["beginner", "intermediate", "expert"];
const storageKey = (owner: string) => `easyadmin:minesweeper:scores:${owner}`;

/** 按租户与账号恢复成绩，忽略损坏或过期格式的数据，不在退出登录时清除待同步内容 */
export function readScores(owner: string): Scores {
	try {
		const parsed = JSON.parse(localStorage.getItem(storageKey(owner)) ?? "{}");
		const scores: Scores = {};
		for (const difficulty of difficulties) {
			const score = parsed?.[difficulty];
			if (
				score?.difficulty === difficulty &&
				Number.isInteger(score.seconds) &&
				score.seconds >= 0 &&
				score.seconds <= 604800 &&
				typeof score.achievedAt === "string" &&
				Number.isFinite(Date.parse(score.achievedAt)) &&
				typeof score.pending === "boolean"
			)
				scores[difficulty] = score;
		}
		return scores;
	} catch {
		return {};
	}
}

/** 先同步写入最佳成绩，再由页面发起网络请求，避免认证跳转中断时丢失纪录 */
export function saveLocalScore(owner: string, score: MinesweeperScore): Scores {
	const scores = readScores(owner);
	const best = scores[score.difficulty];
	if (!best || score.seconds < best.seconds) {
		scores[score.difficulty] = { ...score, pending: true };
		// 必须同步落盘，再允许调用接口；登录过期的跳转不会丢失待同步成绩
		localStorage.setItem(storageKey(owner), JSON.stringify(scores));
	}
	return scores;
}

/** 后端确认同等或更快成绩后才清除 pending，保留请求期间新产生的更快成绩 */
export function mergeRemoteScores(owner: string, remote: MinesweeperScore[]): Scores {
	const scores = readScores(owner);
	for (const score of remote) {
		const local = scores[score.difficulty];
		// 请求期间产生了更快成绩时，保留其待同步状态
		if (!local || score.seconds <= local.seconds) scores[score.difficulty] = { ...score, pending: false };
	}
	localStorage.setItem(storageKey(owner), JSON.stringify(scores));
	return scores;
}
