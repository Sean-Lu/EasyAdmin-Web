import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePuzzleScores } from "./usePuzzleScores";
import { readPuzzleScores, recordPuzzleWin } from "./scoreStorage";
import Minesweeper from "../minesweeper";
import { readScores, saveLocalScore } from "../minesweeper/scoreStorage";
import * as mineGame from "../minesweeper/game";
import type { PuzzleScore } from "@/services/user/userPreferenceService";

const api = vi.hoisted(() => ({
	user: vi.fn(),
	puzzleGet: vi.fn(),
	puzzleSave: vi.fn(),
	mineGet: vi.fn(),
	mineSave: vi.fn(),
	token: "session-a"
}));
vi.mock("@/api/modules/login", () => ({ getUserInfo: api.user }));
vi.mock("@/redux", () => ({ store: { getState: () => ({ global: { token: api.token } }) } }));
vi.mock("react-redux", () => ({ useSelector: () => false }));
vi.mock("@/services/user/userPreferenceService", () => ({
	UserPreferenceService: {
		getPuzzleScores: api.puzzleGet,
		savePuzzleScore: api.puzzleSave,
		getMinesweeperScores: api.mineGet,
		saveMinesweeperScore: api.mineSave
	}
}));
// 只替换视觉组件，游戏事件、React 状态和成绩持久化均运行真实实现
vi.mock("antd", () => ({
	Button: "button",
	Card: "section",
	Segmented: "select",
	Space: "div",
	Tag: "span",
	Typography: { Title: "h2", Text: "span" }
}));
vi.mock("@ant-design/icons", () => ({
	ArrowLeftOutlined: "i",
	ClockCircleOutlined: "i",
	FlagFilled: "i",
	ReloadOutlined: "i",
	SafetyCertificateOutlined: "i",
	SmileOutlined: "i",
	TrophyOutlined: "i"
}));

const at = "2026-10-29T01:00:00Z";
const puzzleScore: PuzzleScore = {
	game: "nonogram",
	level: "v1-1",
	bestSeconds: 20,
	bestMoves: 17,
	bestSecondsAt: at,
	bestMovesAt: at,
	firstCompletedAt: at
};
let renderer: ReactTestRenderer | undefined;
let current: ReturnType<typeof usePuzzleScores>;
let storageBlocked: boolean;

function Probe() {
	current = usePuzzleScores("nonogram", 0);
	return null;
}
async function flush(action: () => void = () => {}) {
	await act(async () => {
		action();
	});
}
const adapters = [
	{
		name: "关卡游戏",
		mount: () => (renderer = create(<Probe />)),
		win: () => current.recordWin(20, 17),
		retry: () => current.retry(),
		pending: (owner = "1:10") => readPuzzleScores(owner)["nonogram:v1-1"]?.pending,
		ready: () => current.ready,
		status: () => current.status,
		save: api.puzzleSave,
		get: api.puzzleGet,
		seedOther: () => recordPuzzleWin("1:10", { ...puzzleScore, game: "lightUp" }),
		otherSubmitted: () => api.puzzleSave.mock.calls.some(([score]) => score.game === "lightUp")
	},
	{
		name: "扫雷",
		mount: () => (renderer = create(<Minesweeper onBack={() => {}} />)),
		win: () => renderer!.root.findByProps({ "aria-label": "第 1 行第 1 列，未翻开" }).props.onClick(),
		retry: () =>
			renderer!.root
				.findAllByType("button")
				.find(button => ["同步成绩", "重新读取账号"].includes(button.props.children))!
				.props.onClick(),
		pending: (owner = "1:10") => readScores(owner).beginner?.pending,
		ready: () => !renderer!.root.findByProps({ "aria-label": "第 1 行第 1 列，未翻开" }).props["aria-disabled"],
		status: () =>
			renderer!.root
				.findAllByType("span")
				.map(node => node.props.children)
				.join(" "),
		save: api.mineSave,
		get: api.mineGet,
		seedOther: () => saveLocalScore("1:10", { difficulty: "expert", seconds: 40, achievedAt: at }),
		otherSubmitted: () => api.mineSave.mock.calls.some(([difficulty]) => difficulty === "expert")
	}
];

beforeEach(() => {
	vi.resetAllMocks();
	api.token = "session-a";
	storageBlocked = false;
	const values = new Map<string, string>();
	vi.stubGlobal("localStorage", {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => {
			if (storageBlocked) throw new Error("storage unavailable");
			values.set(key, value);
		}
	});
	vi.stubGlobal("window", { addEventListener: vi.fn(), removeEventListener: vi.fn() });
	api.user.mockResolvedValue({ data: { tenantId: "1", id: "10" } });
	api.puzzleGet.mockResolvedValue([]);
	api.mineGet.mockResolvedValue([]);
	api.puzzleSave.mockImplementation(async score => score);
	api.mineSave.mockImplementation(async (difficulty, seconds) => ({ difficulty, seconds, achievedAt: at }));
	// 固定获胜事件，排雷规则由 game.test.ts 验证，本文件专门验证事件之后的保存链路
	vi.spyOn(mineGame, "revealCell").mockImplementation(game => ({ ...game, status: "won" }));
});
afterEach(async () => {
	await flush(() => renderer?.unmount());
	renderer = undefined;
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe.each(adapters)("$name 成绩恢复", adapter => {
	it("登录过期卸载前已落盘，重新登录后自动补传", async () => {
		await flush(adapter.mount);
		let persistedBeforeRequest = false;
		adapter.save.mockImplementation(() => {
			// 模拟认证拦截器清空 Token 并返回不再结束的请求；此时成绩必须已经落盘
			persistedBeforeRequest = adapter.pending() === true;
			api.token = "";
			return new Promise(() => {});
		});
		await flush(adapter.win);
		expect(persistedBeforeRequest).toBe(true);
		expect(adapter.pending()).toBe(true);
		expect(adapter.save).toHaveBeenCalledTimes(1);
		await flush(() => renderer!.unmount());
		api.token = "session-b";
		adapter.save.mockImplementation(async (...args: any[]) =>
			adapter.name === "扫雷" ? { difficulty: args[0], seconds: args[1], achievedAt: at } : args[0]
		);
		await flush(adapter.mount);
		expect(adapter.save).toHaveBeenCalledTimes(2);
		expect(adapter.pending()).toBe(false);
	});
	it("切换账号后不补传原账号成绩，也不接收原请求的迟到响应", async () => {
		await flush(adapter.mount);
		let finish = () => {};
		adapter.save.mockImplementationOnce(
			(...args: any[]) =>
				new Promise(resolve => {
					finish = () => resolve(adapter.name === "扫雷" ? { difficulty: args[0], seconds: args[1], achievedAt: at } : args[0]);
				})
		);
		await flush(adapter.win);
		await flush(() => renderer!.unmount());
		api.token = "session-b";
		api.user.mockResolvedValue({ data: { tenantId: "2", id: "10" } });
		adapter.save.mockClear();
		await flush(adapter.mount);
		expect(adapter.save).not.toHaveBeenCalled();
		await flush(finish);
		expect(adapter.pending()).toBe(true);
		expect(adapter.pending("2:10")).toBeUndefined();
	});
	it("本地写入失败且后端失败时，手动重试会重新提交内存成绩", async () => {
		await flush(adapter.mount);
		storageBlocked = true;
		adapter.save.mockRejectedValueOnce(new Error("offline"));
		await flush(adapter.win);
		expect(adapter.status()).toContain("成绩暂存在当前页面");
		expect(adapter.pending()).toBeUndefined();
		await flush(adapter.retry);
		expect(adapter.save).toHaveBeenCalledTimes(2);
		expect(adapter.status()).toContain("成绩已保存后端");
	});
	it("账号初始化失败后可以重新读取并恢复游戏", async () => {
		api.user.mockRejectedValueOnce(new Error("offline"));
		await flush(adapter.mount);
		expect(adapter.ready()).toBe(false);
		await flush(adapter.retry);
		expect(adapter.ready()).toBe(true);
	});
	it("内存成绩补传时也处理之前落盘的其他关卡或难度成绩", async () => {
		adapter.seedOther();
		adapter.get.mockRejectedValueOnce(new Error("offline"));
		await flush(adapter.mount);
		storageBlocked = true;
		adapter.save.mockRejectedValueOnce(new Error("offline"));
		await flush(adapter.win);
		await flush(adapter.retry);
		expect(adapter.otherSubmitted()).toBe(true);
		expect(adapter.save).toHaveBeenCalledTimes(3);
		expect(adapter.status()).toContain("成绩已保存后端");
	});
});
