import { describe, expect, test, vi } from "vitest";
import clipboardUtil from "./clipboardUtil";

const mocks = vi.hoisted(() => ({
	copy: vi.fn(),
	success: vi.fn()
}));

vi.mock("antd", () => ({ message: { success: mocks.success } }));
vi.mock("copy-to-clipboard", () => ({ default: mocks.copy }));

describe("clipboardUtil.copyString", () => {
	test("supports a custom success message while keeping the default message", () => {
		clipboardUtil.copyString("text");
		clipboardUtil.copyString("text", "分享链接已复制");

		expect(mocks.copy).toHaveBeenNthCalledWith(1, "text");
		expect(mocks.copy).toHaveBeenNthCalledWith(2, "text");
		expect(mocks.success).toHaveBeenNthCalledWith(1, "复制成功");
		expect(mocks.success).toHaveBeenNthCalledWith(2, "分享链接已复制");
	});
});
