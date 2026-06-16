import request from "@/api/index";
import { BackendIdInput } from "@/api/interface";

/**
 * 待办事项分类服务
 */
export class TodoCategoryService {
	/**
	 * 获取分类列表
	 */
	static async getCategoryList() {
		return request.get<Array<any>>(`/TodoCategory/List`);
	}

	/**
	 * 添加分类
	 * @param data 分类数据
	 */
	static async addCategory(data: { name: string; sortOrder: number }) {
		return request.post<boolean>(`/TodoCategory/Add`, data);
	}

	/**
	 * 删除分类
	 * @param id 分类ID
	 */
	static async deleteCategory(id: BackendIdInput) {
		return request.post<boolean>(`/TodoCategory/Delete`, { id });
	}

	/**
	 * 更新分类
	 * @param data 分类数据
	 */
	static async updateCategory(data: { id: BackendIdInput; name: string; sortOrder: number }) {
		return request.post<boolean>(`/TodoCategory/Update`, data);
	}
}
