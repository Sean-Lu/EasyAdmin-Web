export type MessageKind = "system" | "sent" | "received" | "error" | "closed" | "binary";

export interface WebSocketMessageRecord {
	id: string;
	kind: MessageKind;
	content: string;
	timestamp: number;
}

let recordSequence = 0;

export const validateWebSocketUrl = (value: string): string | null => {
	const trimmed = value.trim();
	if (!trimmed) return "请输入 WebSocket 服务地址";

	let url: URL;
	try {
		url = new URL(trimmed);
	} catch {
		return "请输入有效的 WebSocket 服务地址";
	}

	if (url.protocol !== "ws:" && url.protocol !== "wss:") {
		return "服务地址仅支持 ws:// 或 wss:// 协议";
	}

	return null;
};

export const formatMessageContent = (content: string, formatJson: boolean): string => {
	if (!formatJson) return content;

	try {
		return JSON.stringify(JSON.parse(content), null, 2);
	} catch {
		return content;
	}
};

export const createMessageRecord = (
	kind: MessageKind,
	content: string,
	timestamp: number = Date.now()
): WebSocketMessageRecord => ({
	id: `${timestamp}-${recordSequence++}`,
	kind,
	content,
	timestamp
});

export const appendMessageRecord = (
	history: WebSocketMessageRecord[],
	record: WebSocketMessageRecord,
	limit = 500
): WebSocketMessageRecord[] => [...history, record].slice(-limit);
