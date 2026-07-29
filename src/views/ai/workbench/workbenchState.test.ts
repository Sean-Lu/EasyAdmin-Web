import { describe, expect, it } from "vitest";
import { AiDraftStatus, AiDraftType, AiMessageRole, AiMessageStatus } from "@/services/ai/aiTypes";
import { initialWorkbenchState, workbenchReducer } from "./workbenchState";

describe("workbenchReducer", () => {
	it("applies the complete streaming lifecycle while preserving server IDs", () => {
		let state = workbenchReducer(initialWorkbenchState, {
			type: "userMessageQueued",
			messageId: "local-1",
			conversationId: "5",
			content: "你好"
		});
		state = workbenchReducer(state, {
			type: "messageStarted",
			messageId: "101",
			conversationId: "5"
		});
		state = workbenchReducer(state, { type: "textDelta", text: "你" });
		state = workbenchReducer(state, { type: "textDelta", text: "好" });
		state = workbenchReducer(state, {
			type: "sourcesReceived",
			sources: [{ sourceType: 0, sourceId: "41", title: "笔记" }]
		});
		state = workbenchReducer(state, {
			type: "draftReceived",
			draft: {
				id: "201",
				conversationId: "5",
				messageId: "101",
				draftType: AiDraftType.Note,
				contentJson: "{}",
				status: AiDraftStatus.Pending
			}
		});
		state = workbenchReducer(state, { type: "completed" });

		expect(state.messages[0]).toMatchObject({
			id: "local-1",
			role: AiMessageRole.User,
			content: "你好"
		});
		expect(state.messages[1]).toMatchObject({
			id: "101",
			content: "你好",
			status: AiMessageStatus.Completed,
			streaming: false
		});
		expect(state.messages[1].sources[0].sourceId).toBe("41");
		expect(state.messages[1].drafts?.[0].id).toBe("201");
	});

	it("loads, replaces completed messages, and handles failure and cancellation", () => {
		const loaded = workbenchReducer(initialWorkbenchState, {
			type: "load",
			messages: [
				{
					id: "1",
					conversationId: "5",
					sequence: 1,
					role: AiMessageRole.User,
					status: AiMessageStatus.Completed,
					content: "hello",
					sources: []
				}
			]
		});
		const started = workbenchReducer(loaded, {
			type: "messageStarted",
			messageId: "2",
			conversationId: "5"
		});
		const replaced = workbenchReducer(started, {
			type: "completed",
			message: {
				id: "2",
				conversationId: "5",
				sequence: 2,
				role: AiMessageRole.Assistant,
				status: AiMessageStatus.Completed,
				content: "answer",
				sources: []
			}
		});
		expect(replaced.messages[1].id).toBe("2");

		const failed = workbenchReducer(workbenchReducer(loaded, { type: "messageStarted", messageId: "3", conversationId: "5" }), {
			type: "failed",
			message: "timeout"
		});
		expect(failed.messages[1].status).toBe(AiMessageStatus.Failed);
		const cancelled = workbenchReducer(
			workbenchReducer(loaded, { type: "messageStarted", messageId: "4", conversationId: "5" }),
			{ type: "cancelled" }
		);
		expect(cancelled.messages[1].status).toBe(AiMessageStatus.Cancelled);
	});

	it("prepends older messages without duplicating existing messages", () => {
		const current = workbenchReducer(initialWorkbenchState, {
			type: "load",
			messages: [
				{
					id: "2",
					conversationId: "5",
					sequence: 2,
					role: AiMessageRole.Assistant,
					status: AiMessageStatus.Completed,
					content: "new",
					sources: []
				}
			]
		});

		const result = workbenchReducer(current, {
			type: "prepend",
			messages: [
				{
					id: "1",
					conversationId: "5",
					sequence: 1,
					role: AiMessageRole.User,
					status: AiMessageStatus.Completed,
					content: "old",
					sources: []
				},
				current.messages[0]
			]
		});

		expect(result.messages.map(item => item.id)).toEqual(["1", "2"]);
	});
});
