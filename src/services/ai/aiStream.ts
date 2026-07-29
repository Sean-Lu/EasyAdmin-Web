import { store } from "@/redux";
import { handleTokenExpired } from "@/api/authExpiry";
import { AiChatRequest, AiStreamEvent, AiStreamHandlers } from "./aiTypes";

/** 发起 AI 流式请求并分发服务端事件 */
export async function streamAiMessage(request: AiChatRequest, handlers: AiStreamHandlers, signal: AbortSignal): Promise<void> {
	const baseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
	const response = await fetch(`${baseUrl}/AiChat/Stream`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			authorization: store.getState().global.token
		},
		body: JSON.stringify(request),
		signal
	});

	if (response.status === 401) {
		handleTokenExpired();
		throw new Error("登录已过期");
	}
	const contentType = response.headers.get("content-type") ?? "";
	if (!response.ok || !contentType.includes("text/event-stream")) {
		const body = contentType.includes("application/json") ? await response.json().catch(() => null) : null;
		throw new Error(body?.msg || (!response.ok ? `AI 请求失败 (${response.status})` : "AI 服务返回了无效响应"));
	}
	if (!response.body) throw new Error("AI 流式响应不可用");

	const reader = response.body.getReader();
	const decoder = new TextDecoder("utf-8");
	let buffer = "";
	let streamDone = false;
	try {
		while (!streamDone) {
			const { done, value } = await reader.read();
			streamDone = done;
			buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
			let boundary = buffer.indexOf("\n\n");
			while (boundary >= 0) {
				dispatchBlock(buffer.slice(0, boundary), handlers);
				buffer = buffer.slice(boundary + 2);
				boundary = buffer.indexOf("\n\n");
			}
		}
		if (buffer.trim()) dispatchBlock(buffer, handlers);
	} finally {
		reader.releaseLock();
	}
}

function dispatchBlock(block: string, handlers: AiStreamHandlers) {
	let eventType = "";
	const dataLines: string[] = [];
	for (const line of block.split("\n")) {
		if (line.startsWith("event:")) eventType = line.slice(6).trim();
		else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
	}
	if (!eventType || dataLines.length === 0) return;

	const event = {
		type: eventType,
		data: JSON.parse(dataLines.join("\n"))
	} as AiStreamEvent;
	const handler = handlers[event.type] as ((data: AiStreamEvent["data"]) => void) | undefined;
	handler?.(event.data);
	if (event.type === "error") throw new Error(event.data.message);
}
