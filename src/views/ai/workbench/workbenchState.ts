import { AiDraft, AiMessage, AiMessageRole, AiMessageStatus, AiSource, BackendId } from "@/services/ai/aiTypes";

/** 工作台消息 */
export interface WorkbenchMessage extends AiMessage {
	/** 是否正在流式生成 */
	streaming?: boolean;
	/** 关联草稿 */
	drafts?: AiDraft[];
}

/** 工作台状态 */
export interface WorkbenchState {
	/** 消息列表 */
	messages: WorkbenchMessage[];
	/** 当前错误 */
	error?: string;
}

/** 工作台状态操作 */
export type WorkbenchAction =
	| { type: "load"; messages: AiMessage[] }
	| { type: "prepend"; messages: AiMessage[] }
	| { type: "userMessageQueued"; messageId: BackendId; conversationId: BackendId; content: string }
	| { type: "messageStarted"; messageId: BackendId; conversationId: BackendId }
	| { type: "textDelta"; text: string }
	| { type: "sourcesReceived"; sources: AiSource[] }
	| { type: "draftReceived"; draft: AiDraft }
	| { type: "completed"; message?: AiMessage }
	| { type: "failed"; message: string }
	| { type: "cancelled" };

/** 工作台初始状态 */
export const initialWorkbenchState: WorkbenchState = { messages: [] };

/** 合并流事件与分页消息到工作台状态 */
export function workbenchReducer(state: WorkbenchState, action: WorkbenchAction): WorkbenchState {
	if (action.type === "load") return { messages: action.messages };
	if (action.type === "prepend") {
		const existingIds = new Set(state.messages.map(item => item.id));
		return {
			...state,
			messages: [...action.messages.filter(item => !existingIds.has(item.id)), ...state.messages]
		};
	}
	if (action.type === "userMessageQueued") {
		return {
			...state,
			messages: [
				...state.messages,
				{
					id: action.messageId,
					conversationId: action.conversationId,
					sequence: state.messages.length + 1,
					role: AiMessageRole.User,
					status: AiMessageStatus.Completed,
					content: action.content,
					sources: []
				}
			]
		};
	}
	if (action.type === "messageStarted") {
		return {
			messages: [
				...state.messages,
				{
					id: action.messageId,
					conversationId: action.conversationId,
					sequence: state.messages.length + 1,
					role: AiMessageRole.Assistant,
					status: AiMessageStatus.Pending,
					content: "",
					sources: [],
					streaming: true
				}
			]
		};
	}
	const index = [...state.messages].reverse().findIndex(message => message.streaming);
	if (index < 0) return action.type === "failed" ? { ...state, error: action.message } : state;
	const actualIndex = state.messages.length - index - 1;
	const current = state.messages[actualIndex];
	let updated: WorkbenchMessage = current;
	switch (action.type) {
		case "textDelta":
			updated = { ...current, content: current.content + action.text };
			break;
		case "sourcesReceived":
			updated = { ...current, sources: action.sources };
			break;
		case "draftReceived":
			updated = { ...current, drafts: [...(current.drafts ?? []), action.draft] };
			break;
		case "completed":
			updated = action.message
				? { ...action.message, streaming: false, drafts: current.drafts }
				: { ...current, status: AiMessageStatus.Completed, streaming: false };
			break;
		case "failed":
			updated = { ...current, status: AiMessageStatus.Failed, streaming: false, errorType: action.message };
			break;
		case "cancelled":
			updated = { ...current, status: AiMessageStatus.Cancelled, streaming: false };
			break;
	}
	const messages = [...state.messages];
	messages[actualIndex] = updated;
	return { messages, error: action.type === "failed" ? action.message : undefined };
}
