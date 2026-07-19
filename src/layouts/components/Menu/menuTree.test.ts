import { describe, expect, it } from "vitest";
import { MenuType, OutLinkOpenType } from "@/enums/menu";
import { findMenuById, getAncestorMenuIds, getMenuAction, getSelectedMenuId, mergeOpenMenuIds } from "./menuTree";

const tree: Menu.MenuOptions[] = [
	{
		id: "1",
		title: "系统",
		type: MenuType.Directory,
		children: [
			{
				id: "5",
				title: "外链",
				type: MenuType.Directory,
				children: [
					{
						id: "12",
						title: "GitHub",
						type: MenuType.External,
						path: "/link/GitHub",
						outLink: "https://github.com",
						outLinkOpenType: OutLinkOpenType.Inline
					}
				]
			}
		]
	}
];

describe("menuTree", () => {
	it("selects a leaf by path and derives its directory ancestors", () => {
		expect(getSelectedMenuId(tree, "/link/GitHub")).toBe("12");
		expect(getSelectedMenuId(tree, "/link/github")).toBeUndefined();
		expect(getAncestorMenuIds(tree, "12")).toEqual(["1", "5"]);
		expect(findMenuById(tree, "12")?.title).toBe("GitHub");
	});

	it("keeps manually opened directories when navigating", () => {
		expect(mergeOpenMenuIds(["8", "9"], ["1", "5"])).toEqual(["8", "9", "1", "5"]);
		expect(mergeOpenMenuIds(["1", "5"], ["1", "5"])).toEqual(["1", "5"]);
	});

	it("returns a navigation action for each menu type", () => {
		expect(getMenuAction(tree[0])).toEqual({ type: "none" });
		expect(getMenuAction({ id: "2", title: "用户", type: MenuType.Internal, path: "/system/user" })).toEqual({
			type: "navigate",
			url: "/system/user"
		});
		expect(getMenuAction(findMenuById(tree, "12")!)).toEqual({ type: "navigate", url: "/link/GitHub" });
		expect(
			getMenuAction({
				id: "13",
				title: "GitHub",
				type: MenuType.External,
				path: "/link/GitHubBlank",
				outLink: "https://github.com",
				outLinkOpenType: OutLinkOpenType.Blank
			})
		).toEqual({ type: "external", url: "https://github.com" });
	});
});
