import { describe, expect, it } from "vitest";
import { buildOnlineUserQuery, getOnlineUserDisplayName, resetOnlineUserQuery, shouldLogoutAfterKick } from "./onlineUsersUtils";

describe("online users helpers", () => {
	it("shows nickname and username together", () => {
		expect(getOnlineUserDisplayName({ nickName: "Alice", userName: "alice" })).toBe("Alice（alice）");
		expect(getOnlineUserDisplayName({ nickName: "", userName: "alice" })).toBe("alice");
	});

	it("detects when the kicked user is the current user", () => {
		expect(shouldLogoutAfterKick("7", "7")).toBe(true);
		expect(shouldLogoutAfterKick("7", "8")).toBe(false);
	});

	it("builds query values only from submitted filters", () => {
		expect(buildOnlineUserQuery(" Alice ", " 10.0.0.1 ")).toEqual({ userName: "Alice", ipAddress: "10.0.0.1" });
	});

	it("reset clears all online user query values", () => {
		expect(resetOnlineUserQuery()).toEqual({ userName: undefined, ipAddress: undefined });
	});
});
