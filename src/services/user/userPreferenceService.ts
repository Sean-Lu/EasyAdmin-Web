import request from "@/api/index";
import { BackendId } from "@/api/interface";

/** 百宝箱工具排序 */
export interface ToolboxToolOrderDto {
	toolIds: BackendId[];
}

/** 扫雷难度 */
export type MinesweeperDifficulty = "beginner" | "intermediate" | "expert";

/** 扫雷最佳成绩 */
export interface MinesweeperScore {
	difficulty: MinesweeperDifficulty;
	seconds: number;
	achievedAt: string;
}

export type PuzzleGame = "nonogram" | "lightUp" | "slitherlink";

/** 关卡最佳成绩；最佳用时与最少步数独立记录，可来自不同次通关 */
export interface PuzzleScore {
	game: PuzzleGame;
	/** 带题目版本的关卡标识，如 v1-1 */
	level: string;
	bestSeconds: number;
	bestMoves: number;
	bestSecondsAt: string;
	bestMovesAt: string;
	firstCompletedAt: string;
}

/** 用户偏好与个人游戏成绩接口 */
export class UserPreferenceService {
	/** 读取指定游戏的关卡最佳成绩 */
	static async getPuzzleScores(game: PuzzleGame) {
		return (await request.get<PuzzleScore[]>("/UserPreference/GetPuzzleScores", { game }, { headers: { noLoading: true } }))
			.data!;
	}

	/** 提交关卡成绩并返回合并后的最佳成绩 */
	static async savePuzzleScore(score: PuzzleScore) {
		return (await request.post<PuzzleScore>("/UserPreference/SavePuzzleScore", score, { headers: { noLoading: true } })).data!;
	}
	/** 读取扫雷各难度的最佳成绩 */
	static async getMinesweeperScores() {
		return (
			await request.get<MinesweeperScore[]>("/UserPreference/GetMinesweeperScores", undefined, { headers: { noLoading: true } })
		).data!;
	}

	/** 提交扫雷获胜用时并返回最佳成绩 */
	static async saveMinesweeperScore(difficulty: MinesweeperDifficulty, seconds: number) {
		return (
			await request.post<MinesweeperScore>(
				"/UserPreference/SaveMinesweeperScore",
				{ difficulty, seconds },
				{ headers: { noLoading: true } }
			)
		).data!;
	}

	/** 读取个人工具排序 */
	static async getToolboxToolOrder() {
		return (await request.get<ToolboxToolOrderDto>("/UserPreference/GetToolboxToolOrder")).data!;
	}

	/** 保存百宝箱全部工具的排序 */
	static async updateToolboxToolOrder(toolIds: BackendId[]) {
		return (await request.post<ToolboxToolOrderDto>("/UserPreference/UpdateToolboxToolOrder", { toolIds })).data!;
	}
}
