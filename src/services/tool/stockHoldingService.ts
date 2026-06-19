import request from "@/api/index";
import { BackendId, BackendIdInput, DtoBase } from "@/api/interface";

/**
 * 股票持仓记录。
 * 基础持仓字段由用户维护，成本金额、市值和盈亏字段由后端按统一公式计算后返回。
 */
export interface StockHolding extends DtoBase {
	/** 持仓归属用户，后端按当前登录用户隔离数据。 */
	userId: BackendId;
	/** 股票名称，例如“平安银行”。 */
	name: string;
	/** 股票代码，例如“000001”或“600036”。 */
	code: string;
	/** 单股持仓成本价。 */
	costPrice: number;
	/** 当前持仓数量。 */
	quantity: number;
	/** 用户手动维护的当前价格，盈亏计算以该字段为准。 */
	currentPrice: number;
	/** 持仓成本总额，公式：持仓成本 × 持仓数量。 */
	costAmount: number;
	/** 当前持仓市值，公式：当前价格 × 持仓数量。 */
	marketValue: number;
	/** 盈亏金额，公式：（当前价格 - 持仓成本）× 持仓数量。 */
	profitAmount: number;
	/** 盈亏比例，公式：（当前价格 - 持仓成本）/ 持仓成本 × 100。 */
	profitRatio: number;
}

/**
 * 创建/编辑股票持仓的请求体。
 * 新增时不传 id；编辑时由 update 方法显式要求 id。
 */
export interface StockHoldingPayload {
	/** 持仓记录 ID，新增时为空。 */
	id?: BackendIdInput;
	/** 股票名称。 */
	name: string;
	/** 股票代码。 */
	code: string;
	/** 单股持仓成本价。 */
	costPrice: number;
	/** 持仓数量。 */
	quantity: number;
	/** 当前价格。 */
	currentPrice: number;
}

/**
 * 股票持仓统计概览。
 * 后端基于当前用户筛选后的持仓列表计算，保证列表和概览口径一致。
 */
export interface StockHoldingSummary {
	/** 总持仓数量。 */
	totalQuantity: number;
	/** 总成本金额。 */
	totalCostAmount: number;
	/** 总持仓市值。 */
	totalMarketValue: number;
	/** 总盈亏金额。 */
	totalProfitAmount: number;
	/** 总盈亏比例，按总盈亏金额 / 总成本金额计算。 */
	totalProfitRatio: number;
}

/** 股票持仓列表接口返回值，包含明细和统计概览。 */
export interface StockHoldingList {
	/** 当前用户的持仓明细。 */
	list: StockHolding[];
	/** 当前列表对应的统计概览。 */
	summary: StockHoldingSummary;
}

/**
 * 股票持仓管理 API 封装。
 * 页面只处理交互状态，持仓持久化、用户隔离和盈亏计算都交给后端。
 */
export class StockHoldingService {
	/** 获取当前用户持仓列表；keyword 会按股票名称/代码筛选。 */
	static async getList(keyword?: string) {
		return request.get<StockHoldingList>(`/StockHolding/List`, { keyword });
	}

	/** 新增一条持仓记录。 */
	static async add(data: StockHoldingPayload) {
		return request.post<boolean>(`/StockHolding/Add`, data);
	}

	/** 更新持仓基础信息，包括名称、代码、成本、数量和当前价。 */
	static async update(data: StockHoldingPayload & { id: BackendIdInput }) {
		return request.post<boolean>(`/StockHolding/Update`, data);
	}

	/** 删除持仓记录；后端执行逻辑删除。 */
	static async delete(id: BackendIdInput) {
		return request.post<boolean>(`/StockHolding/Delete`, { id });
	}

	/** 快速更新当前价格，用于表格内直接录入最新价格后刷新盈亏。 */
	static async updateCurrentPrice(id: BackendIdInput, currentPrice: number) {
		return request.post<boolean>(`/StockHolding/UpdateCurrentPrice`, { id, currentPrice });
	}
}
