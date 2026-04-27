import request from "@/api/index";
import { ApiResult } from "@/api/interface";

/**
 * 待办事项服务
 */
export class TodoItemService {
	/**
	 * 获取待办事项列表
	 * @param categoryId 分类ID（可选）
	 */
	static async getTodoList(categoryId?: number) {
		if (categoryId) {
			return request.get<Array<any>>(`/TodoItem/List?categoryId=${categoryId}`);
		}
		return request.get<Array<any>>(`/TodoItem/List`);
	}

	/**
	 * 添加待办事项
	 * @param data 待办事项数据
	 */
	static async addTodoItem(data: { name: string; done: boolean; priority?: number; categoryId?: number }) {
		return request.post<boolean>(`/TodoItem/Add`, data);
	}

	/**
	 * 更新待办事项状态
	 * @param data 状态数据
	 */
	static async updateTodoStatus(data: { id: number; done: boolean }) {
		return request.post<boolean>(`/TodoItem/UpdateStatus`, data);
	}

	/**
	 * 批量更新待办事项状态
	 * @param data 批量状态数据
	 */
	static async batchUpdateTodoStatus(data: { ids: number[]; done: boolean }) {
		return request.post<boolean>(`/TodoItem/BatchUpdateStatus`, data);
	}

	/**
	 * 更新待办事项优先级
	 * @param data 优先级数据
	 */
	static async updateTodoPriority(data: { id: number; priority: number }) {
		return request.post<boolean>(`/TodoItem/UpdatePriority`, data);
	}

	/**
	 * 更新待办事项内容
	 * @param data 内容数据
	 */
	static async updateTodoName(data: { id: number; name: string }) {
		return request.post<boolean>(`/TodoItem/UpdateName`, data);
	}

	/**
	 * 更新待办事项排序顺序
	 * @param data 排序顺序数据
	 */
	static async updateTodoSortOrder(data: { id: number; sortOrder: number }) {
		return request.post<boolean>(`/TodoItem/UpdateSortOrder`, data);
	}

	/**
	 * 删除待办事项
	 * @param id 待办事项ID
	 */
	static async deleteTodoItem(id: number) {
		return request.post<boolean>(`/TodoItem/Delete`, { id });
	}

	/**
	 * 清除已完成的待办事项
	 * @param categoryId 分类ID（可选）
	 */
	static async clearCompleted(categoryId?: number) {
		if (categoryId) {
			return request.post<boolean>(`/TodoItem/ClearCompleted?categoryId=${categoryId}`);
		}
		return request.post<boolean>(`/TodoItem/ClearCompleted`);
	}

	/**
	 * 更新待办事项分类
	 * @param data 分类更新数据
	 */
	static async updateTodoCategory(data: { id: number; categoryId: number }) {
		return request.post<boolean>(`/TodoItem/UpdateCategory`, data);
	}
}
