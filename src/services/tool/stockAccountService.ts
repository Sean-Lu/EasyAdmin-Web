import request from "@/api/index";
import { BackendId, BackendIdInput, DtoBase } from "@/api/interface";

/**
 * 股票账户
 */
export interface StockAccount extends DtoBase {
	/** 用户ID */
	userId: BackendId;
	/** 券商名称 */
	brokerName: string;
	/** 初始资产 */
	initialAsset?: number;
	/** 现资产 */
	currentAsset?: number;
	/** 备注 */
	remark?: string;
	/** 账户资产盈亏金额 */
	assetProfitAmount: number;
	/** 账户资产盈亏比例 */
	assetProfitRatio: number;
}

/** 创建/编辑股票账户 */
export interface StockAccountPayload {
	/** 账户ID */
	id?: BackendIdInput;
	/** 券商名称 */
	brokerName: string;
	/** 初始资产 */
	initialAsset?: number;
	/** 现资产 */
	currentAsset?: number;
	/** 备注 */
	remark?: string;
}

/**
 * 股票账户管理 API
 */
export class StockAccountService {
	/** 获取股票账户列表 */
	static async getList() {
		return request.get<StockAccount[]>(`/StockAccount/List`);
	}

	/** 新增股票账户 */
	static async add(data: StockAccountPayload) {
		return request.post<boolean>(`/StockAccount/Add`, data);
	}

	/** 更新股票账户 */
	static async update(data: StockAccountPayload & { id: BackendIdInput }) {
		return request.post<boolean>(`/StockAccount/Update`, data);
	}

	/** 删除股票账户 */
	static async delete(id: BackendIdInput) {
		return request.post<boolean>(`/StockAccount/Delete`, { id });
	}
}
