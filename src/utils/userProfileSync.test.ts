import { describe, expect, it, vi } from "vitest";
import type { UserInfo } from "@/api/modules/login";
import { publishUserProfileUpdate, subscribeUserProfileUpdate } from "./userProfileSync";

const updatedUser = { id: 7, nickName: "管理员", avatarFileId: 22 } as unknown as UserInfo;

describe("user profile synchronization", () => {
	it("delivers a saved profile update to active subscribers", () => {
		const listener = vi.fn();
		const unsubscribe = subscribeUserProfileUpdate(listener);

		publishUserProfileUpdate({ userInfo: updatedUser, avatarSrc: "blob:updated-avatar" });

		expect(listener).toHaveBeenCalledWith({ userInfo: updatedUser, avatarSrc: "blob:updated-avatar" });
		unsubscribe();
	});

	it("stops delivering updates after unsubscribe", () => {
		const listener = vi.fn();
		const unsubscribe = subscribeUserProfileUpdate(listener);
		unsubscribe();

		publishUserProfileUpdate({ userInfo: updatedUser });

		expect(listener).not.toHaveBeenCalled();
	});
});
