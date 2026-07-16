import { describe, expect, it } from "vitest";
import { upsertTab } from "./tabUtils";

describe("upsertTab", () => {
	it("fills metadata when the menu arrives after the tab was created", () => {
		const tabs = [{ title: "首页", path: "/home/index" }];

		const result = upsertTab(tabs, {
			title: "首页",
			path: "/home/index",
			icon: "HomeOutlined",
			fullPath: "/home/index"
		});

		expect(result).toEqual([
			{
				title: "首页",
				path: "/home/index",
				icon: "HomeOutlined",
				fullPath: "/home/index"
			}
		]);
		expect(result).not.toBe(tabs);
	});
});
