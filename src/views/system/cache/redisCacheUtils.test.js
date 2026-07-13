import { describe, expect, it } from "vitest";
import { buildKeyTree, getAllExpandableKeys, resolveRefreshPage } from "./redisCacheUtils";

describe("buildKeyTree", () => {
	it("creates non-expandable leaf nodes with only the final key segment", () => {
		const [root] = buildKeyTree([{ key: "EasyAdmin:TenantAccessStatus:1", type: "string", ttlSeconds: 13 }]);
		const [group] = root.children;
		const [leaf] = group.children;

		expect(root.title).toBe("EasyAdmin");
		expect(group.title).toBe("TenantAccessStatus");
		expect(leaf.title).toBe("1");
		expect(leaf.key).toBe("EasyAdmin:TenantAccessStatus:1");
		expect(leaf.isLeaf).toBe(true);
		expect(leaf).not.toHaveProperty("children");
	});
});

describe("getAllExpandableKeys", () => {
	it("returns only nodes that have children", () => {
		const tree = buildKeyTree([{ key: "EasyAdmin:TenantAccessStatus:1", type: "string", ttlSeconds: 13 }]);

		expect(getAllExpandableKeys(tree)).toEqual(["EasyAdmin", "EasyAdmin:TenantAccessStatus"]);
	});
});

describe("resolveRefreshPage", () => {
	it("ignores a button click event and falls back to the first page", () => {
		expect(resolveRefreshPage({ type: "click" })).toBe(1);
		expect(resolveRefreshPage(2)).toBe(2);
	});
});
