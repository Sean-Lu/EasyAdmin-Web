import React from "react";
import { describe, expect, it, vi } from "vitest";
import { HomeOutlined, LockOutlined, LogoutOutlined, ProfileOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { buildAvatarMenuItems } from "./avatarMenuItems";

describe("buildAvatarMenuItems", () => {
	it("assigns an icon to every actionable menu item", () => {
		const items = buildAvatarMenuItems({
			t: key => key,
			goHome: vi.fn(),
			showProfile: vi.fn(),
			showPassword: vi.fn(),
			lock: vi.fn(),
			logout: vi.fn()
		});
		const actionable = (items || []).filter(item => item && "key" in item);

		expect(actionable.map(item => item && "icon" in item && (item.icon as React.ReactElement).type)).toEqual([
			HomeOutlined,
			ProfileOutlined,
			SafetyCertificateOutlined,
			LockOutlined,
			LogoutOutlined
		]);
	});

	it("keeps all five actions in order and invokes their exact callbacks", () => {
		const calls: string[] = [];
		const items = buildAvatarMenuItems({
			t: key => key,
			goHome: () => calls.push("home"),
			showProfile: () => calls.push("profile"),
			showPassword: () => calls.push("password"),
			lock: () => calls.push("lock"),
			logout: () => calls.push("logout")
		});
		const actionable = (items || []).filter(item => item && "key" in item);

		actionable.forEach(item => item && "onClick" in item && item.onClick?.({} as never));

		expect(actionable.map(item => item && "key" in item && item.key)).toEqual(["1", "2", "3", "lock", "4"]);
		expect(calls).toEqual(["home", "profile", "password", "lock", "logout"]);
	});
});
