import request from "@/api";
import { PageRes, PageReqBase } from "@/api/interface";
import {
	AiConnectionTestResult,
	AiConversation,
	AiConversationPageRequest,
	AiDraft,
	AiDraftConfirmResult,
	AiDraftUpdateRequest,
	AiMessage,
	AiMessagePageRequest,
	AiModelConfig,
	AiTenantSetting,
	AiUsage,
	BackendIdInput
} from "./aiTypes";

const quiet = { headers: { noLoading: true } };

/** AI 接口服务 */
export const aiService = {
	/** 新建会话 */
	createConversation: async () => (await request.post<AiConversation>("/AiChat/CreateConversation")).data!,
	/** 分页查询会话 */
	conversationPage: async (params: AiConversationPageRequest, noLoading = false) =>
		(await request.post<PageRes<AiConversation>>("/AiChat/ConversationPage", params, noLoading ? quiet : {})).data!,
	/** 重命名会话 */
	renameConversation: async (id: BackendIdInput, title: string) =>
		(await request.post<AiConversation>("/AiChat/RenameConversation", { id, title })).data!,
	/** 删除会话 */
	deleteConversation: (id: BackendIdInput) => request.post("/AiChat/DeleteConversation", { id }),
	/** 分页查询会话消息 */
	messagePage: async (params: AiMessagePageRequest, noLoading = false) =>
		(await request.post<PageRes<AiMessage>>("/AiChat/MessagePage", params, noLoading ? quiet : {})).data!,
	/** 解析引用来源的访问路径 */
	resolveSource: async (sourceType: number, sourceId: BackendIdInput) =>
		(await request.post<{ route: string }>("/AiChat/ResolveSource", { sourceType, sourceId })).data!,
	/** 取消会话生成 */
	cancel: (conversationId: BackendIdInput) => request.post("/AiChat/Cancel", { conversationId }),
	/** 查询当前租户的 AI 可用状态 */
	availability: async () => (await request.get<boolean>("/AiChat/Availability", undefined, quiet)).data!,
	/** 获取草稿详情 */
	draftDetail: async (id: BackendIdInput) => (await request.get<AiDraft>("/AiDraft/Detail", { id })).data!,
	/** 更新草稿 */
	updateDraft: async (params: AiDraftUpdateRequest) => (await request.post<AiDraft>("/AiDraft/Update", params)).data!,
	/** 删除草稿 */
	deleteDraft: (id: BackendIdInput) => request.post("/AiDraft/Delete", undefined, { params: { id } }),
	/** 确认草稿并创建业务数据 */
	confirmDraft: async (id: BackendIdInput) =>
		(await request.post<AiDraftConfirmResult>("/AiDraft/Confirm", undefined, { params: { id } })).data!,
	/** 获取模型配置 */
	getModelConfig: async () => (await request.get<AiModelConfig>("/AiAdmin/ModelConfig")).data!,
	/** 更新模型配置 */
	updateModelConfig: async (params: Partial<AiModelConfig> & { apiKey?: string }) =>
		(await request.post<AiModelConfig>("/AiAdmin/UpdateModelConfig", params)).data!,
	/** 获取租户 AI 设置 */
	getTenantSetting: async (tenantId: BackendIdInput) =>
		(await request.get<AiTenantSetting>("/AiAdmin/TenantSetting", { tenantId })).data!,
	/** 更新租户 AI 设置 */
	updateTenantSetting: async (params: { tenantId: BackendIdInput; enabled: boolean; dailyRequestLimit: number }) =>
		(await request.post<AiTenantSetting>("/AiAdmin/UpdateTenantSetting", params)).data!,
	/** 测试模型连接 */
	testConnection: async () => (await request.post<AiConnectionTestResult>("/AiAdmin/TestConnection")).data!,
	/** 分页查询 AI 用量 */
	usagePage: async (params: PageReqBase & Record<string, unknown>) =>
		(await request.post<PageRes<AiUsage>>("/AiAdmin/UsagePage", params)).data!
};

export * from "./aiTypes";
