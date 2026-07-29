import { describe, expect, it } from "vitest";
import { deriveDrawerPageContext } from "./drawerContext";

describe("deriveDrawerPageContext", () => {
	it("returns only safe matched-route metadata", () => {
		const result = deriveDrawerPageContext(
			{
				pathname: "/user/note"
			},
			{ key: "user-note", title: "我的笔记" }
		);

		expect(result).toEqual({
			pathname: "/user/note",
			routeKey: "user-note",
			routeTitle: "我的笔记"
		});
		expect(JSON.stringify(result)).not.toContain("secret");
		expect(Object.keys(result)).toEqual(["pathname", "routeKey", "routeTitle"]);
	});

	it("does not accept query, DOM, form, table, or component state", () => {
		const unsafe = {
			pathname: "/system/user",
			search: "?token=secret",
			hash: "#password",
			dom: "<input value='secret' />",
			formValues: { password: "secret" },
			tableRows: [{ phone: "secret" }],
			componentState: { apiKey: "secret" }
		};
		const result = deriveDrawerPageContext(unsafe, { key: "users", title: "用户管理" });
		expect(JSON.stringify(result)).not.toContain("secret");
	});
});
