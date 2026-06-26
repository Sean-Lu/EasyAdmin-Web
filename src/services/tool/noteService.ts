import request from "@/api/index";
import { BackendId, BackendIdInput, PageReqBase, PageRes } from "@/api/interface";

/** 笔记标签，列表和详情都会返回 */
export interface NoteTagDto {
	/** 标签ID */
	id: BackendId;
	/** 标签名称 */
	name: string;
	/** 被笔记引用次数 */
	useCount: number;
}

/** 笔记分类，左侧分类树使用 */
export interface NoteCategoryDto {
	/** 分类ID */
	id: BackendId;
	/** 分类名称 */
	name: string;
	/** 分类排序值 */
	sortOrder: number;
	/** 分类下笔记数量 */
	noteCount: number;
}

/** 笔记列表项和详情数据 */
export interface NoteDto {
	/** 笔记ID */
	id: BackendId;
	/** 所属分类ID */
	categoryId: BackendIdInput;
	/** 标题 */
	title: string;
	/** 富文本内容，列表接口不返回 */
	contentHtml?: string;
	/** 纯文本内容，主要用于搜索和摘要 */
	contentText?: string;
	/** 列表摘要 */
	summary?: string;
	/** 是否置顶 */
	isTop: boolean;
	/** 是否需要笔记密码打开 */
	isProtected: boolean;
	/** 创建时间 */
	createTime?: string;
	/** 更新时间 */
	updateTime?: string;
	/** 分类名称 */
	categoryName?: string;
	/** 关联标签 */
	tags: NoteTagDto[];
}

/** 笔记分页查询条件 */
export interface NotePageReqDto extends PageReqBase {
	/** 关键字，匹配标题、正文和摘要 */
	keyword?: string;
	/** 分类ID，为空时查询全部分类 */
	categoryId?: BackendIdInput;
	/** 标签ID集合，多个标签按同时命中查询 */
	tagIds?: BackendIdInput[];
	/** 是否只查受保护笔记 */
	isProtected?: boolean;
	/** 是否只查置顶笔记 */
	isTop?: boolean;
	/** 创建时间开始 */
	startTime?: string;
	/** 创建时间结束 */
	endTime?: string;
}

/** 新建或编辑笔记的提交数据 */
export interface NoteUpdateDto {
	/** 笔记ID，新建时为空 */
	id?: BackendIdInput;
	/** 分类ID，后端会兜底到默认分类 */
	categoryId?: BackendIdInput;
	/** 标题 */
	title: string;
	/** 富文本 HTML 内容 */
	contentHtml?: string;
	/** 是否置顶 */
	isTop: boolean;
	/** 是否需要笔记密码打开 */
	isProtected: boolean;
	/** 标签名称集合，后端按名称自动创建或复用标签 */
	tags: string[];
}

/** 笔记主体接口 */
export class NoteService {
	/** 分页查询笔记，列表接口不会返回完整富文本内容 */
	static async page(params: NotePageReqDto) {
		const response = await request.post<PageRes<NoteDto>>("/Note/Page", params);
		return response.data;
	}

	/** 获取笔记详情，受保护笔记需要传入解锁令牌 */
	static async detail(id: BackendIdInput, unlockToken?: string) {
		const response = await request.get<NoteDto>("/Note/Detail", { id, unlockToken });
		return response.data;
	}

	/** 新建笔记 */
	static async add(data: NoteUpdateDto) {
		return request.post<boolean>("/Note/Add", data);
	}

	/** 更新笔记 */
	static async update(data: NoteUpdateDto) {
		return request.post<boolean>("/Note/Update", data);
	}

	/** 删除单条笔记 */
	static async delete(id: BackendIdInput) {
		return request.post<boolean>("/Note/Delete", { id });
	}

	/** 删除未被笔记正文引用的图片文件 */
	static async deleteImageFile(id: BackendIdInput) {
		return request.delete<boolean>("/Note/DeleteImageFile", { id });
	}

	/** 批量删除笔记 */
	static async batchDelete(ids: BackendIdInput[]) {
		return request.post<boolean>("/Note/BatchDelete", { ids });
	}

	/** 更新置顶状态 */
	static async updateTop(id: BackendIdInput, isTop: boolean) {
		return request.post<boolean>("/Note/UpdateTop", { id, isTop });
	}

	/** 移动笔记到指定分类 */
	static async moveCategory(id: BackendIdInput, categoryId: BackendIdInput) {
		return request.post<boolean>("/Note/MoveCategory", { id, categoryId });
	}

	/** 导出笔记文件，返回 Blob 响应 */
	static async export(id: BackendIdInput, exportType: "html" | "doc", unlockToken?: string) {
		return request.download("/Note/Export", { id, exportType, unlockToken });
	}
}

/** 笔记分类接口 */
export class NoteCategoryService {
	/** 获取当前用户的全部笔记分类 */
	static async list() {
		const response = await request.get<NoteCategoryDto[]>("/NoteCategory/List");
		return response.data || [];
	}

	/** 新增分类 */
	static async add(data: { name: string; sortOrder?: number }) {
		return request.post<boolean>("/NoteCategory/Add", data);
	}

	/** 更新分类名称和排序 */
	static async update(data: { id: BackendIdInput; name: string; sortOrder?: number }) {
		return request.post<boolean>("/NoteCategory/Update", data);
	}

	/** 删除分类，后端会把分类下笔记移动到默认分类 */
	static async delete(id: BackendIdInput) {
		return request.post<boolean>("/NoteCategory/Delete", { id });
	}
}

/** 笔记标签接口 */
export class NoteTagService {
	/** 获取当前用户的全部标签 */
	static async list() {
		const response = await request.get<NoteTagDto[]>("/NoteTag/List");
		return response.data || [];
	}

	/** 按关键字获取标签建议 */
	static async suggest(keyword = "") {
		const response = await request.get<NoteTagDto[]>("/NoteTag/Suggest", { keyword });
		return response.data || [];
	}

	/** 删除标签 */
	static async delete(id: BackendIdInput) {
		return request.post<boolean>("/NoteTag/Delete", { id });
	}

	/** 清理未使用标签 */
	static async deleteUnused() {
		return request.post<boolean>("/NoteTag/DeleteUnused");
	}
}

/** 笔记密码接口，密码用于打开受保护笔记，不加密正文内容 */
export class NotePasswordService {
	/** 查询当前用户是否已设置笔记密码 */
	static async status() {
		const response = await request.get<{ hasPassword: boolean }>("/NotePassword/Status");
		return response.data;
	}

	/** 首次设置笔记密码 */
	static async set(password: string) {
		return request.post<boolean>("/NotePassword/Set", { password });
	}

	/** 修改笔记密码 */
	static async change(oldPassword: string, newPassword: string) {
		return request.post<boolean>("/NotePassword/Change", { oldPassword, newPassword });
	}

	/** 校验笔记密码，成功后返回短期解锁令牌 */
	static async verify(password: string) {
		const response = await request.post<{ unlockToken: string; expireMinutes: number }>("/NotePassword/Verify", { password });
		return response.data;
	}

	/** 删除笔记密码设置 */
	static async reset(password: string) {
		return request.post<boolean>("/NotePassword/Reset", { password });
	}
}
