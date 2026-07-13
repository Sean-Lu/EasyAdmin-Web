import { describe, expect, it } from "vitest";
import { getOnlineUserDisplayName, shouldLogoutAfterKick } from "./onlineUsersUtils";

describe("online users helpers", () => {
	it("prefers nickname and falls back to username", () => {
		expect(getOnlineUserDisplayName({ nickName: "Alice", userName: "alice" })).toBe("Alice");
		expect(getOnlineUserDisplayName({ nickName: "", userName: "alice" })).toBe("alice");
	});

	it("detects when the kicked user is the current user", () => {
		expect(shouldLogoutAfterKick("7", "7")).toBe(true);
		expect(shouldLogoutAfterKick("7", "8")).toBe(false);
	});
});
