import { BackendId, BackendIdInput, PageReqBase } from "@/api/interface";

export type { BackendId, BackendIdInput };

/** AI 消息角色 */
export enum AiMessageRole {
	/** 用户 */
	User,
	/** 助手 */
	Assistant,
	/** 工具 */
	Tool
}

/** AI 消息状态 */
export enum AiMessageStatus {
	/** 生成中 */
	Pending,
	/** 已完成 */
	Completed,
	/** 失败 */
	Failed,
	/** 已取消 */
	Cancelled
}

/** AI 草稿类型 */
export enum AiDraftType {
	Note,
	Todo,
	DayReport,
	WeekReport,
	MonthReport
}

/** AI 草稿状态 */
export enum AiDraftStatus {
	Pending,
	Confirming,
	Confirmed,
	Expired,
	Deleted
}

/** AI 会话 */
export interface AiConversation {
	/** 会话 ID */
	id: BackendId;
	/** 标题 */
	title: string;
	/** 摘要 */
	summary?: string;
	/** 创建时间 */
	createTime?: string;
	/** 更新时间 */
	updateTime?: string;
}

/** AI 引用来源 */
export interface AiSource {
	/** 记录 ID */
	id?: BackendId;
	/** 引用序号 */
	number?: number;
	/** 来源类型 */
	sourceType: number;
	/** 来源 ID */
	sourceId: BackendId;
	/** 标题 */
	title?: string;
	/** 来源日期 */
	date?: string;
	/** 内容摘录 */
	excerpt?: string;
	/** 打开路径 */
	route?: string;
}

/** AI 消息 */
export interface AiMessage {
	/** 消息 ID */
	id: BackendId;
	/** 会话 ID */
	conversationId: BackendId;
	/** 消息顺序 */
	sequence: number;
	/** 消息角色 */
	role: AiMessageRole;
	/** 消息状态 */
	status: AiMessageStatus;
	/** 消息内容 */
	content: string;
	/** 模型名称 */
	model?: string;
	/** 错误类型 */
	errorType?: string;
	/** 引用来源 */
	sources: AiSource[];
	/** 业务草稿 */
	drafts?: AiDraft[];
	/** 创建时间 */
	createTime?: string;
}

/** AI 业务草稿 */
export interface AiDraft {
	/** 草稿 ID */
	id: BackendId;
	/** 会话 ID */
	conversationId: BackendId;
	/** 消息 ID */
	messageId: BackendId;
	/** 草稿类型 */
	draftType: AiDraftType;
	/** 草稿内容 */
	contentJson: string;
	/** 过期时间 */
	expiresAt?: string;
	/** 确认开始时间 */
	confirmationStartedAt?: string;
	/** 已创建业务数据 ID */
	confirmedTargetId?: BackendId;
	/** 草稿状态 */
	status: AiDraftStatus;
}

/** AI 聊天请求 */
export interface AiChatRequest {
	/** 会话 ID */
	conversationId: BackendIdInput;
	/** 用户输入 */
	prompt: string;
}

/** AI 草稿更新请求 */
export interface AiDraftUpdateRequest {
	/** 草稿 ID */
	id: BackendIdInput;
	/** 草稿内容 */
	contentJson: string;
}

/** AI 草稿确认结果 */
export interface AiDraftConfirmResult {
	/** 草稿 ID */
	draftId: BackendId;
	/** 草稿类型 */
	draftType: AiDraftType;
	/** 已创建业务数据 ID */
	confirmedTargetId: BackendId;
}

/** AI 会话分页参数 */
export interface AiConversationPageRequest extends PageReqBase {
	/** 关键词 */
	keyword?: string;
}

/** AI 消息分页参数 */
export interface AiMessagePageRequest extends PageReqBase {
	/** 会话 ID */
	conversationId: BackendIdInput;
}

/** AI 模型配置 */
export interface AiModelConfig {
	/** 服务地址 */
	baseUrl: string;
	/** 模型名称 */
	model: string;
	/** 是否已配置接口密钥 */
	hasApiKey: boolean;
	/** 脱敏接口密钥 */
	maskedApiKey: string;
	/** 超时秒数 */
	timeoutSeconds: number;
	/** 最大输出令牌 */
	maxOutputTokens: number;
	/** 生成温度 */
	temperature: number;
}

/** AI 租户设置 */
export interface AiTenantSetting {
	/** 租户 ID */
	tenantId: BackendId;
	/** 是否启用 */
	enabled: boolean;
	/** 每日请求上限 */
	dailyRequestLimit: number;
}

/** AI 用量记录 */
export interface AiUsage {
	/** 记录 ID */
	id: BackendId;
	/** 租户 ID */
	tenantId: BackendId;
	/** 用户 ID */
	userId: BackendId;
	/** 会话 ID */
	conversationId: BackendId;
	/** 消息 ID */
	messageId: BackendId;
	/** 模型名称 */
	model: string;
	/** 输入令牌数 */
	inputTokens: number;
	/** 输出令牌数 */
	outputTokens: number;
	/** 总令牌数 */
	totalTokens: number;
	/** 耗时毫秒数 */
	durationMs: number;
	/** 请求状态 */
	status: number;
	/** 错误类型 */
	errorType?: string;
	/** 创建时间 */
	createTime?: string;
}

/** AI 连接测试结果 */
export interface AiConnectionTestResult {
	/** 是否成功 */
	success: boolean;
	/** 测试结果 */
	result: string;
	/** 延迟毫秒数 */
	latencyMs: number;
	/** 错误类型 */
	errorType?: string;
}

/** AI 流事件 */
export type AiStreamEvent =
	| { type: "message_started"; data: { messageId: BackendId } }
	| { type: "text_delta"; data: { text: string } }
	| { type: "sources"; data: AiSource[] | { sources: AiSource[] } }
	| { type: "draft"; data: { draft: AiDraft } }
	| { type: "message_completed"; data: { messageId?: BackendId; content?: string; message?: AiMessage } }
	| { type: "error"; data: { errorType?: string; message: string } };

/** AI 流事件处理器 */
export type AiStreamHandlers = {
	[K in AiStreamEvent["type"]]?: (data: Extract<AiStreamEvent, { type: K }>["data"]) => void;
};
