import { describe, expect, test } from "vitest";
import { buildShareClipboardText } from "./shareClipboard";

describe("buildShareClipboardText", () => {
	test("includes the access password when one is configured", () => {
		expect(buildShareClipboardText("https://example.test/#/share/abc", "1234")).toBe(
			"分享链接：https://example.test/#/share/abc\n访问密码：1234"
		);
	});

	test("copies only the link for password-free shares", () => {
		expect(buildShareClipboardText("https://example.test/#/share/abc")).toBe("分享链接：https://example.test/#/share/abc");
	});
});
