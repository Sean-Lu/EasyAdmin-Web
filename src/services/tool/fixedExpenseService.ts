import request from "@/api/index";
import { BackendIdInput, DtoBase } from "@/api/interface";

/**
 * 固定支出计费周期
 * @description：0-按月 1-按天 2-按周 3-按年
 */
export enum FixedExpenseCycle {
	Monthly = 0,
	Daily = 1,
	Weekly = 2,
	Yearly = 3
}

/**
 * 固定支出项记录
 */
export interface FixedExpenseItem extends DtoBase {
	/** 用户ID */
	userId: BackendIdInput;
	/** 支出名称 */
	name: string;
	/** 支出金额 */
	amount: number;
	/** 计费周期 */
	cycle: FixedExpenseCycle;
	/** 是否启用 */
	isEnabled: boolean;
}

/** 创建/编辑固定支出项 */
export interface FixedExpenseItemPayload {
	/** 支出项ID */
	id?: BackendIdInput;
	/** 支出名称 */
	name: string;
	/** 支出金额 */
	amount: number;
	/** 计费周期 */
	cycle: FixedExpenseCycle;
	/** 是否启用 */
	isEnabled: boolean;
}

/**
 * 固定支出项管理 API
 */
export class FixedExpenseItemService {
	/** 获取支出项列表 */
	static async getList() {
		return request.get<FixedExpenseItem[]>("/FixedExpense/List");
	}

	/** 新增支出项 */
	static async add(data: FixedExpenseItemPayload) {
		return request.post<boolean>("/FixedExpense/Add", data);
	}

	/** 更新支出项 */
	static async update(data: FixedExpenseItemPayload & { id: BackendIdInput }) {
		return request.post<boolean>("/FixedExpense/Update", data);
	}

	/** 删除支出项 */
	static async delete(id: BackendIdInput) {
		return request.post<boolean>("/FixedExpense/Delete", { id });
	}

	/** 更新启用状态 */
	static async updateIsEnabled(id: BackendIdInput, isEnabled: boolean) {
		return request.post<boolean>("/FixedExpense/UpdateIsEnabled", { id, isEnabled });
	}
}
