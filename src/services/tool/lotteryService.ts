import request from "@/api/index";
import { BackendId, BackendIdInput, CommonState, DtoBase } from "@/api/interface";

/**抽奖活动 */
export interface LotteryActivity extends DtoBase {
	/** 活动创建人ID */
	userId: BackendId;
	/** 活动名称 */
	name: string;
	/** 活动说明 */
	description?: string;
	/** 是否允许同一个参与人在不同奖项中重复中奖 */
	allowRepeatWinner: boolean;
	/** 状态 */
	state: CommonState;
}

/**活动奖项 */
export interface LotteryPrize extends DtoBase {
	/** 所属抽奖活动ID */
	activityId: BackendId;
	/** 奖项名称 */
	name: string;
	/** 该奖项总中奖名额 */
	quota: number;
	/** 奖项说明 */
	description?: string;
	/** 状态 */
	state: CommonState;
	/** 排序 */
	sort: number;
	/** 当前奖项已产生的中奖人数 */
	winnerCount: number;
}

/**抽奖参与人 */
export interface LotteryParticipant extends DtoBase {
	/** 所属抽奖活动ID */
	activityId: BackendId;
	/** 参与人姓名 */
	name: string;
	/** 可选编号，例如手机号、工号或外部系统标识 */
	code?: string;
	/** 备注信息 */
	description?: string;
	/** 状态 */
	state: CommonState;
	/** 排序 */
	sort: number;
}

/**中奖记录 */
export interface LotteryWinner extends DtoBase {
	/** 所属抽奖活动ID */
	activityId: BackendId;
	/** 中奖奖项ID */
	prizeId: BackendId;
	/** 中奖参与人ID */
	participantId: BackendId;
	/** 批次号 */
	batchNo: string;
	/** 中奖人姓名快照 */
	winnerNameSnapshot: string;
	/** 奖项名称快照 */
	prizeNameSnapshot: string;
}

/**抽奖活动详情页数据，包含活动、奖项、参与人、中奖记录 */
export interface LotteryActivityDetail {
	activity?: LotteryActivity;
	prizes: LotteryPrize[];
	participants: LotteryParticipant[];
	winners: LotteryWinner[];
}

/** 创建/编辑抽奖活动的请求体 */
export interface LotteryActivityPayload {
	id?: BackendIdInput;
	name: string;
	description?: string;
	allowRepeatWinner: boolean;
	state: CommonState;
}

/** 创建/编辑奖项的请求体 */
export interface LotteryPrizePayload {
	id?: BackendIdInput;
	activityId: BackendIdInput;
	name: string;
	quota: number;
	description?: string;
	state: CommonState;
	sort: number;
}

/** 创建/编辑参与人的请求体 */
export interface LotteryParticipantPayload {
	id?: BackendIdInput;
	activityId: BackendIdInput;
	name: string;
	code?: string;
	description?: string;
	state: CommonState;
	sort: number;
}

/**抽奖工具 API 封装 */
export class LotteryService {
	/** 获取当前用户的抽奖活动列表 */
	static async getActivityList() {
		return request.get<LotteryActivity[]>(`/Lottery/ActivityList`);
	}

	/** 获取活动详情，包括奖项、参与人、中奖记录 */
	static async getActivityDetail(activityId: BackendIdInput) {
		return request.get<LotteryActivityDetail>(`/Lottery/ActivityDetail?activityId=${activityId}`);
	}

	/** 新建抽奖活动 */
	static async addActivity(data: LotteryActivityPayload) {
		return request.post<boolean>(`/Lottery/ActivityAdd`, data);
	}

	/** 更新抽奖活动，包含重复中奖规则和启用状态 */
	static async updateActivity(data: LotteryActivityPayload & { id: BackendIdInput }) {
		return request.post<boolean>(`/Lottery/ActivityUpdate`, data);
	}

	/** 删除活动 */
	static async deleteActivity(id: BackendIdInput) {
		return request.post<boolean>(`/Lottery/ActivityDelete`, { id });
	}

	/** 获取指定活动下的奖项列表 */
	static async getPrizeList(activityId: BackendIdInput) {
		return request.get<LotteryPrize[]>(`/Lottery/PrizeList?activityId=${activityId}`);
	}

	/** 新增奖项 */
	static async addPrize(data: LotteryPrizePayload) {
		return request.post<boolean>(`/Lottery/PrizeAdd`, data);
	}

	/** 更新奖项信息、名额、排序和启用状态 */
	static async updatePrize(data: LotteryPrizePayload & { id: BackendIdInput }) {
		return request.post<boolean>(`/Lottery/PrizeUpdate`, data);
	}

	/** 删除奖项 */
	static async deletePrize(id: BackendIdInput) {
		return request.post<boolean>(`/Lottery/PrizeDelete`, { id });
	}

	/** 获取指定活动下的参与人列表 */
	static async getParticipantList(activityId: BackendIdInput) {
		return request.get<LotteryParticipant[]>(`/Lottery/ParticipantList?activityId=${activityId}`);
	}

	/** 新增单个参与人 */
	static async addParticipant(data: LotteryParticipantPayload) {
		return request.post<boolean>(`/Lottery/ParticipantAdd`, data);
	}

	/** 更新参与人信息、排序和启用状态 */
	static async updateParticipant(data: LotteryParticipantPayload & { id: BackendIdInput }) {
		return request.post<boolean>(`/Lottery/ParticipantUpdate`, data);
	}

	/** 删除单个参与人，历史中奖记录仍保留中奖人名称快照 */
	static async deleteParticipant(id: BackendIdInput) {
		return request.post<boolean>(`/Lottery/ParticipantDelete`, { id });
	}

	/** 批量导入参与人 */
	static async importParticipants(activityId: BackendIdInput, content: string) {
		return request.post<number>(`/Lottery/ParticipantImport`, { activityId, content });
	}

	/**停止现场抽奖并生成中奖记录 */
	static async draw(activityId: BackendIdInput, prizeId: BackendIdInput, count: number) {
		return request.post<LotteryWinner[]>(`/Lottery/Draw`, { activityId, prizeId, count });
	}

	/** 获取指定活动下的中奖记录 */
	static async getWinnerList(activityId: BackendIdInput) {
		return request.get<LotteryWinner[]>(`/Lottery/WinnerList?activityId=${activityId}`);
	}

	/** 删除单条中奖记录，用于人工回退某次结果 */
	static async deleteWinner(id: BackendIdInput) {
		return request.post<boolean>(`/Lottery/WinnerDelete`, { id });
	}

	/** 清空指定活动的所有中奖记录 */
	static async clearWinners(activityId: BackendIdInput) {
		return request.post<boolean>(`/Lottery/ClearWinners`, { activityId });
	}
}
