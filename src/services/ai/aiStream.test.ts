import { beforeEach, describe, expect, it, vi } from "vitest";
import { streamAiMessage } from "./aiStream";

vi.mock("@/redux", () => ({
	store: { getState: () => ({ global: { token: "Bearer test" } }) }
}));
vi.mock("@/api/authExpiry", () => ({ handleTokenExpired: vi.fn() }));

function responseFromChunks(chunks: Uint8Array[], status = 200) {
	return new Response(
		new ReadableStream({
			start(controller) {
				chunks.forEach(chunk => controller.enqueue(chunk));
				controller.close();
			}
		}),
		{ status, headers: { "content-type": "text/event-stream" } }
	);
}

describe("streamAiMessage", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("parses split UTF-8, split lines, multiple events, and final event without blank line", async () => {
		const encoder = new TextEncoder();
		const payload =
			'event: message_started\ndata: {"messageId":"9"}\n\n' +
			'event: text_delta\ndata: {"text":"你好"}\n\n' +
			'event: message_completed\ndata: {"messageId":"9"}';
		const bytes = encoder.encode(payload);
		const chineseStart = payload.indexOf("你");
		const prefixBytes = encoder.encode(payload.slice(0, chineseStart)).length;
		const chunks = [
			bytes.slice(0, 4),
			bytes.slice(4, prefixBytes + 1),
			bytes.slice(prefixBytes + 1, prefixBytes + 4),
			bytes.slice(prefixBytes + 4)
		];
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(responseFromChunks(chunks)));
		const started = vi.fn();
		const delta = vi.fn();
		const completed = vi.fn();

		await streamAiMessage(
			{ conversationId: "5", prompt: "测试" },
			{ message_started: started, text_delta: delta, message_completed: completed },
			new AbortController().signal
		);

		expect(started).toHaveBeenCalledWith({ messageId: "9" });
		expect(delta).toHaveBeenCalledWith({ text: "你好" });
		expect(completed).toHaveBeenCalledWith({ messageId: "9" });
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining("/AiChat/Stream"),
			expect.objectContaining({
				headers: expect.objectContaining({ authorization: "Bearer test" })
			})
		);
		expect(String((fetch as any).mock.calls[0][0])).not.toContain("Bearer");
	});

	it("dispatches and rejects a server error event", async () => {
		const error = vi.fn();
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					responseFromChunks([
						new TextEncoder().encode('event: error\ndata: {"errorType":"ai_timeout","message":"稍后重试"}\n\n')
					])
				)
		);

		await expect(
			streamAiMessage({ conversationId: "5", prompt: "test" }, { error }, new AbortController().signal)
		).rejects.toThrow("稍后重试");
		expect(error).toHaveBeenCalledOnce();
	});

	it("rejects a business error returned as HTTP 200 JSON", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ success: false, code: 500, msg: "会话不存在或无权访问" }), {
					status: 200,
					headers: { "content-type": "application/json" }
				})
			)
		);

		await expect(streamAiMessage({ conversationId: "5", prompt: "test" }, {}, new AbortController().signal)).rejects.toThrow(
			"会话不存在或无权访问"
		);
	});

	it("preserves abort errors without emitting a generic stream error", async () => {
		const aborted = new DOMException("Aborted", "AbortError");
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(aborted));
		const error = vi.fn();
		const controller = new AbortController();
		controller.abort();

		await expect(streamAiMessage({ conversationId: "5", prompt: "test" }, { error }, controller.signal)).rejects.toBe(aborted);
		expect(error).not.toHaveBeenCalled();
	});
});
