import request from "@/api/index";
import { BackendId, BackendIdInput, DtoBase } from "@/api/interface";

/**
 * 后端通用启用状态。
 * 抽奖活动、奖项、参与人都使用该状态控制是否参与现场抽奖。
 */
export enum CommonState {
	Disable = 0,
	Enable = 1
}

/**
 * 抽奖活动。
 * 一个活动包含多组奖项、参与人和中奖记录；数据归属于当前登录用户。
 */
export interface LotteryActivity extends DtoBase {
	/** 活动创建人，后端按当前用户隔离活动数据。 */
	userId: BackendId;
	/** 活动名称，列表和抽奖现场标题都会使用。 */
	name: string;
	/** 活动说明，可用于记录现场规则或备注。 */
	description?: string;
	/**
	 * 是否允许同一个参与人在不同奖项中重复中奖。
	 * 允许重复时，同一奖项内仍不会重复抽到同一个人。
	 */
	allowRepeatWinner: boolean;
	/** 活动是否启用，禁用后后端不会执行开奖。 */
	state: CommonState;
}

/**
 * 活动奖项。
 * 每个奖项独立配置名额和排序，现场抽奖时按奖项启动/停止。
 */
export interface LotteryPrize extends DtoBase {
	/** 所属抽奖活动 ID。 */
	activityId: BackendId;
	/** 奖项名称，例如“一等奖”。 */
	name: string;
	/** 该奖项总中奖名额。 */
	quota: number;
	/** 奖项说明，可记录奖品或开奖规则。 */
	description?: string;
	/** 奖项是否启用，禁用奖项不能开奖。 */
	state: CommonState;
	/** 奖项展示顺序，数值越小越靠前。 */
	sort: number;
	/** 当前奖项已产生的中奖人数，由后端统计返回。 */
	winnerCount: number;
}

/**
 * 抽奖参与人。
 * 只有启用状态的参与人才会进入候选名单。
 */
export interface LotteryParticipant extends DtoBase {
	/** 所属抽奖活动 ID。 */
	activityId: BackendId;
	/** 参与人姓名，滚动动画和中奖快照都基于该字段。 */
	name: string;
	/** 可选编号，例如手机号、工号或外部系统标识。 */
	code?: string;
	/** 备注信息，可记录部门、来源等。 */
	description?: string;
	/** 参与人是否启用，禁用后不参与抽奖。 */
	state: CommonState;
	/** 参与人展示顺序，数值越小越靠前。 */
	sort: number;
}

/**
 * 中奖记录。
 * 记录保存奖项和中奖人的名称快照，避免后续修改名称影响历史结果。
 */
export interface LotteryWinner extends DtoBase {
	/** 所属活动 ID。 */
	activityId: BackendId;
	/** 中奖奖项 ID。 */
	prizeId: BackendId;
	/** 中奖参与人 ID。 */
	participantId: BackendId;
	/** 同一次停止抽奖生成的中奖记录共用同一个批次号。 */
	batchNo: string;
	/** 中奖人姓名快照。 */
	winnerNameSnapshot: string;
	/** 奖项名称快照。 */
	prizeNameSnapshot: string;
}

/**
 * 活动详情页一次性需要的全部数据。
 * 前端进入活动详情时使用该接口减少多次请求和状态同步成本。
 */
export interface LotteryActivityDetail {
	activity?: LotteryActivity;
	prizes: LotteryPrize[];
	participants: LotteryParticipant[];
	winners: LotteryWinner[];
}

/** 创建/编辑抽奖活动的请求体。 */
export interface LotteryActivityPayload {
	id?: BackendIdInput;
	name: string;
	description?: string;
	allowRepeatWinner: boolean;
	state: CommonState;
}

/** 创建/编辑奖项的请求体。 */
export interface LotteryPrizePayload {
	id?: BackendIdInput;
	activityId: BackendIdInput;
	name: string;
	quota: number;
	description?: string;
	state: CommonState;
	sort: number;
}

/** 创建/编辑参与人的请求体。 */
export interface LotteryParticipantPayload {
	id?: BackendIdInput;
	activityId: BackendIdInput;
	name: string;
	code?: string;
	description?: string;
	state: CommonState;
	sort: number;
}

/**
 * 抽奖工具 API 封装。
 * 该文件只负责后端契约和请求路径，现场滚动动画等 UI 状态放在页面组件内处理。
 */
export class LotteryService {
	/** 获取当前用户的抽奖活动列表。 */
	static async getActivityList() {
		return request.get<LotteryActivity[]>(`/Lottery/ActivityList`);
	}

	/** 获取活动详情，包括奖项、参与人、中奖记录。 */
	static async getActivityDetail(activityId: BackendIdInput) {
		return request.get<LotteryActivityDetail>(`/Lottery/ActivityDetail?activityId=${activityId}`);
	}

	/** 新建抽奖活动。 */
	static async addActivity(data: LotteryActivityPayload) {
		return request.post<boolean>(`/Lottery/ActivityAdd`, data);
	}

	/** 更新抽奖活动，包含重复中奖规则和启用状态。 */
	static async updateActivity(data: LotteryActivityPayload & { id: BackendIdInput }) {
		return request.post<boolean>(`/Lottery/ActivityUpdate`, data);
	}

	/** 删除活动；后端会同步逻辑删除活动下的奖项、参与人和中奖记录。 */
	static async deleteActivity(id: BackendIdInput) {
		return request.post<boolean>(`/Lottery/ActivityDelete`, { id });
	}

	/** 获取指定活动下的奖项列表。 */
	static async getPrizeList(activityId: BackendIdInput) {
		return request.get<LotteryPrize[]>(`/Lottery/PrizeList?activityId=${activityId}`);
	}

	/** 新增奖项。 */
	static async addPrize(data: LotteryPrizePayload) {
		return request.post<boolean>(`/Lottery/PrizeAdd`, data);
	}

	/** 更新奖项信息、名额、排序和启用状态。 */
	static async updatePrize(data: LotteryPrizePayload & { id: BackendIdInput }) {
		return request.post<boolean>(`/Lottery/PrizeUpdate`, data);
	}

	/** 删除奖项；后端会同步逻辑删除该奖项的中奖记录。 */
	static async deletePrize(id: BackendIdInput) {
		return request.post<boolean>(`/Lottery/PrizeDelete`, { id });
	}

	/** 获取指定活动下的参与人列表。 */
	static async getParticipantList(activityId: BackendIdInput) {
		return request.get<LotteryParticipant[]>(`/Lottery/ParticipantList?activityId=${activityId}`);
	}

	/** 新增单个参与人。 */
	static async addParticipant(data: LotteryParticipantPayload) {
		return request.post<boolean>(`/Lottery/ParticipantAdd`, data);
	}

	/** 更新参与人信息、排序和启用状态。 */
	static async updateParticipant(data: LotteryParticipantPayload & { id: BackendIdInput }) {
		return request.post<boolean>(`/Lottery/ParticipantUpdate`, data);
	}

	/** 删除单个参与人，历史中奖记录仍保留中奖人名称快照。 */
	static async deleteParticipant(id: BackendIdInput) {
		return request.post<boolean>(`/Lottery/ParticipantDelete`, { id });
	}

	/**
	 * 批量导入参与人。
	 * content 为多行文本，后端按“每行一个姓名”解析并忽略空行。
	 */
	static async importParticipants(activityId: BackendIdInput, content: string) {
		return request.post<number>(`/Lottery/ParticipantImport`, { activityId, content });
	}

	/**
	 * 停止现场抽奖并生成中奖记录。
	 * 前端“开始抽奖”只做滚动动画；只有调用该接口时，后端才会按候选规则抽取并落库。
	 */
	static async draw(activityId: BackendIdInput, prizeId: BackendIdInput, count: number) {
		return request.post<LotteryWinner[]>(`/Lottery/Draw`, { activityId, prizeId, count });
	}

	/** 获取指定活动下的中奖记录。 */
	static async getWinnerList(activityId: BackendIdInput) {
		return request.get<LotteryWinner[]>(`/Lottery/WinnerList?activityId=${activityId}`);
	}

	/** 删除单条中奖记录，用于人工回退某次结果。 */
	static async deleteWinner(id: BackendIdInput) {
		return request.post<boolean>(`/Lottery/WinnerDelete`, { id });
	}

	/** 清空指定活动的所有中奖记录。 */
	static async clearWinners(activityId: BackendIdInput) {
		return request.post<boolean>(`/Lottery/ClearWinners`, { activityId });
	}
}
