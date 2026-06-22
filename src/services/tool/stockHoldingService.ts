import request from "@/api/index";
import { BackendId, BackendIdInput, DtoBase } from "@/api/interface";

/**
 * 股票持仓记录
 */
export interface StockHolding extends DtoBase {
	/** 用户ID */
	userId: BackendId;
	/** 所属股票账户ID */
	accountId: BackendId;
	/** 股票名称 */
	name: string;
	/** 股票代码 */
	code: string;
	/** 持仓成本 */
	costPrice: number;
	/** 持仓数量 */
	quantity: number;
	/** 当前价格 */
	currentPrice: number;
	/** 是否启用 */
	isEnabled: boolean;
	/** 成本金额，公式：持仓成本 × 持仓数量 */
	costAmount: number;
	/** 持仓市值，公式：当前价格 × 持仓数量 */
	marketValue: number;
	/** 盈亏金额，公式：（当前价格 - 持仓成本）× 持仓数量 */
	profitAmount: number;
	/** 盈亏比例，公式：（当前价格 - 持仓成本）/ 持仓成本 × 100 */
	profitRatio: number;
}

/** 创建/编辑股票持仓 */
export interface StockHoldingPayload {
	/** 持仓记录ID */
	id?: BackendIdInput;
	/** 所属股票账户ID */
	accountId: BackendIdInput;
	/** 股票名称 */
	name: string;
	/** 股票代码 */
	code: string;
	/** 持仓成本 */
	costPrice: number;
	/** 持仓数量 */
	quantity: number;
	/** 当前价格 */
	currentPrice: number;
	/** 是否启用 */
	isEnabled: boolean;
}

/**
 * 股票持仓统计概览
 */
export interface StockHoldingSummary {
	/** 总持仓数量 */
	totalQuantity: number;
	/** 总成本金额 */
	totalCostAmount: number;
	/** 总持仓市值 */
	totalMarketValue: number;
	/** 总盈亏金额 */
	totalProfitAmount: number;
	/** 总盈亏比例，按总盈亏金额 / 总成本金额计算 */
	totalProfitRatio: number;
}

/** 股票持仓列表 */
export interface StockHoldingList {
	/** 持仓列表 */
	list: StockHolding[];
	/** 持仓统计 */
	summary: StockHoldingSummary;
}

/**
 * 股票持仓管理 API
 */
export class StockHoldingService {
	/** 获取账户持仓列表 */
	static async getList(accountId: BackendIdInput, keyword?: string) {
		return request.get<StockHoldingList>(`/StockHolding/List`, { accountId, keyword });
	}

	/** 新增持仓 */
	static async add(data: StockHoldingPayload) {
		return request.post<boolean>(`/StockHolding/Add`, data);
	}

	/** 更新持仓 */
	static async update(data: StockHoldingPayload & { id: BackendIdInput }) {
		return request.post<boolean>(`/StockHolding/Update`, data);
	}

	/** 删除持仓 */
	static async delete(accountId: BackendIdInput, id: BackendIdInput) {
		return request.post<boolean>(`/StockHolding/Delete`, { accountId, id });
	}

	/** 更新当前价格 */
	static async updateCurrentPrice(accountId: BackendIdInput, id: BackendIdInput, currentPrice: number) {
		return request.post<boolean>(`/StockHolding/UpdateCurrentPrice`, { accountId, id, currentPrice });
	}

	/** 更新启用状态 */
	static async updateIsEnabled(accountId: BackendIdInput, id: BackendIdInput, isEnabled: boolean) {
		return request.post<boolean>(`/StockHolding/UpdateIsEnabled`, { accountId, id, isEnabled });
	}
}
