import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import UserAvatar from "./UserAvatar";

describe("UserAvatar", () => {
	it("forwards its ref so dropdown menus can anchor to the avatar", () => {
		expect((UserAvatar as any).$$typeof).toBe(Symbol.for("react.forward_ref"));
	});

	it("shows the default user icon instead of nickname initials without an uploaded avatar", () => {
		const html = renderToStaticMarkup(<UserAvatar src="">管</UserAvatar>);

		expect(html).toContain("anticon-user");
		expect(html).not.toContain(">管<");
	});

	it("renders the uploaded avatar source when available", () => {
		const html = renderToStaticMarkup(<UserAvatar src="blob:uploaded-avatar">管</UserAvatar>);

		expect(html).toContain("blob:uploaded-avatar");
	});
});
