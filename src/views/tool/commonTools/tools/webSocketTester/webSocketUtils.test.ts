import { describe, expect, it } from "vitest";
import {
	appendMessageRecord,
	createMessageRecord,
	formatMessageContent,
	validateWebSocketUrl,
	type WebSocketMessageRecord
} from "./webSocketUtils";

describe("validateWebSocketUrl", () => {
	it.each(["ws://localhost:8080", "wss://example.com/socket?token=1"])("accepts %s", url => {
		expect(validateWebSocketUrl(url)).toBeNull();
	});

	it.each([
		["", "请输入 WebSocket 服务地址"],
		["https://example.com", "服务地址仅支持 ws:// 或 wss:// 协议"],
		["not-a-url", "请输入有效的 WebSocket 服务地址"]
	])("rejects %s", (url, message) => {
		expect(validateWebSocketUrl(url)).toBe(message);
	});
});

describe("formatMessageContent", () => {
	it("formats valid JSON when enabled", () => {
		expect(formatMessageContent('{"name":"EasyAdmin","ok":true}', true)).toBe('{\n  "name": "EasyAdmin",\n  "ok": true\n}');
	});

	it("keeps plain text and disabled JSON unchanged", () => {
		expect(formatMessageContent("hello", true)).toBe("hello");
		expect(formatMessageContent('{"ok":true}', false)).toBe('{"ok":true}');
	});
});

describe("message history", () => {
	it("creates a timestamped typed record", () => {
		const record = createMessageRecord("sent", "hello", 1710000000123);

		expect(record).toMatchObject({ kind: "sent", content: "hello", timestamp: 1710000000123 });
		expect(record.id).toContain("1710000000123");
	});

	it("retains only the newest 500 records", () => {
		const records = Array.from({ length: 500 }, (_, index) => ({
			id: String(index),
			kind: "system",
			content: String(index),
			timestamp: index
		})) as WebSocketMessageRecord[];
		const next = appendMessageRecord(records, createMessageRecord("received", "new", 501));

		expect(next).toHaveLength(500);
		expect(next[0].content).toBe("1");
		expect(next[499].content).toBe("new");
	});
});
