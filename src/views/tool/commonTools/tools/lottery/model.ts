import { BackendId } from "@/api/interface";
import {
	CommonState,
	LotteryActivityPayload,
	LotteryParticipant,
	LotteryParticipantPayload,
	LotteryPrizePayload
} from "@/services/tool/lotteryService";

export type ActivityFormValues = LotteryActivityPayload;
export type PrizeFormValues = LotteryPrizePayload;
export type ParticipantFormValues = LotteryParticipantPayload;

export const defaultActivityValues: ActivityFormValues = {
	name: "",
	description: "",
	allowRepeatWinner: false,
	state: CommonState.Enable
};

export const defaultPrizeValues: PrizeFormValues = {
	activityId: "",
	name: "",
	quota: 1,
	description: "",
	state: CommonState.Enable,
	sort: 0
};

export const defaultParticipantValues: ParticipantFormValues = {
	activityId: "",
	name: "",
	code: "",
	description: "",
	state: CommonState.Enable,
	sort: 0
};

export const formatTime = (value?: string) => (value ? value.replace("T", " ").slice(0, 19) : "-");

// 实际可抽数量同时受奖项剩余名额和候选人数限制。
export const getDrawLimit = (quota: number, winnerCount: number, candidateCount: number) => {
	const remainingQuota = Math.max(quota - winnerCount, 0);
	return Math.max(Math.min(remainingQuota, candidateCount), 0);
};

// 输入框允许用户配置抽取数量，这里把输入值收敛到当前奖项可抽范围内。
export const normalizeDrawCount = (count: number | undefined, quota: number, winnerCount: number, candidateCount: number) => {
	const limit = getDrawLimit(quota, winnerCount, candidateCount);
	return Math.min(Math.max(count || 1, 1), Math.max(limit, 1));
};

// 多人开奖时每个槽位错位滚动，避免所有槽位同时显示同一个候选人。
export const createRollingNames = (candidates: LotteryParticipant[], count: number, startIndex: number) => {
	if (candidates.length === 0) {
		return [];
	}

	return Array.from({ length: count }, (_, slotIndex) => {
		const candidateIndex = (startIndex + slotIndex) % candidates.length;
		return candidates[candidateIndex].name;
	});
};

export const idKey = (id: BackendId) => String(id);
